import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, withRetry } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || '30d';
    
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const since = Date.now() - (days * 24 * 60 * 60 * 1000);

    // Get all emails in period
    const emailsResult = await withRetry(() => db.execute({
      sql: `SELECT id, recipient, subject, created_at, opened_at, open_count, status
            FROM emails 
            WHERE user_id = ? AND created_at >= ?
            ORDER BY created_at DESC`,
      args: [userId, since]
    }));

    // Get link clicks
    const clicksResult = await withRetry(() => db.execute({
      sql: `SELECT l.email_id, COUNT(*) as click_count
            FROM links l
            JOIN link_clicks lc ON l.id = lc.link_id
            JOIN emails e ON l.email_id = e.id
            WHERE e.user_id = ? AND e.created_at >= ?
            GROUP BY l.email_id`,
      args: [userId, since]
    }));

    const emails = emailsResult.rows;
    const totalSent = emails.length;
    const totalOpened = emails.filter(e => e.opened_at).length;
    const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;

    // Calculate clicks
    const clicksByEmail = new Map(clicksResult.rows.map(r => [r.email_id, Number(r.click_count)]));
    const totalClicks = Array.from(clicksByEmail.values()).reduce((sum, count) => sum + count, 0);
    const clickRate = totalSent > 0 ? (totalClicks / totalSent) * 100 : 0;

    // Calculate avg time to open
    const openTimes = emails
      .filter(e => e.opened_at && e.created_at)
      .map(e => (Number(e.opened_at) - Number(e.created_at)) / (1000 * 60 * 60)); // hours
    const avgTimeToOpen = openTimes.length > 0 
      ? openTimes.reduce((sum, time) => sum + time, 0) / openTimes.length 
      : 0;

    // Group by day of week
    const byDay = new Map<string, { sent: number; opened: number; clicks: number }>();
    const days_names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    emails.forEach(email => {
      const date = new Date(Number(email.created_at));
      const dayName = days_names[date.getDay()];
      const current = byDay.get(dayName) || { sent: 0, opened: 0, clicks: 0 };
      current.sent++;
      if (email.opened_at) current.opened++;
      current.clicks += clicksByEmail.get(email.id as string) || 0;
      byDay.set(dayName, current);
    });

    // Find best day
    let bestDay = 'Monday';
    let bestDayRate = 0;
    byDay.forEach((stats, day) => {
      const rate = stats.sent > 0 ? stats.opened / stats.sent : 0;
      if (rate > bestDayRate) {
        bestDayRate = rate;
        bestDay = day;
      }
    });

    // Group by hour
    const byHour = new Map<number, number>();
    emails.filter(e => e.opened_at).forEach(email => {
      const hour = new Date(Number(email.opened_at)).getHours();
      byHour.set(hour, (byHour.get(hour) || 0) + 1);
    });

    // Find best hour
    let bestHour = 9;
    let bestHourCount = 0;
    byHour.forEach((count, hour) => {
      if (count > bestHourCount) {
        bestHourCount = count;
        bestHour = hour;
      }
    });
    const bestTime = `${bestHour}:00 - ${bestHour + 1}:00`;

    // Top recipients
    const recipientStats = new Map<string, { opens: number; clicks: number }>();
    emails.forEach(email => {
      const recipient = email.recipient as string;
      const current = recipientStats.get(recipient) || { opens: 0, clicks: 0 };
      if (email.opened_at) current.opens++;
      current.clicks += clicksByEmail.get(email.id as string) || 0;
      recipientStats.set(recipient, current);
    });

    const topRecipients = Array.from(recipientStats.entries())
      .map(([email, stats]) => ({ email, ...stats }))
      .sort((a, b) => (b.opens + b.clicks) - (a.opens + a.clicks))
      .slice(0, 5);

    // Determine trend
    const recentEmails = emails.slice(0, Math.floor(emails.length / 2));
    const olderEmails = emails.slice(Math.floor(emails.length / 2));
    const recentOpenRate = recentEmails.length > 0 
      ? (recentEmails.filter(e => e.opened_at).length / recentEmails.length) * 100 
      : 0;
    const olderOpenRate = olderEmails.length > 0 
      ? (olderEmails.filter(e => e.opened_at).length / olderEmails.length) * 100 
      : 0;
    
    let recentTrend: 'up' | 'down' | 'stable' = 'stable';
    if (recentOpenRate > olderOpenRate + 5) recentTrend = 'up';
    else if (recentOpenRate < olderOpenRate - 5) recentTrend = 'down';

    return NextResponse.json({
      totalSent,
      totalOpened,
      totalClicks,
      openRate,
      clickRate,
      avgTimeToOpen,
      bestDay,
      bestTime,
      recentTrend,
      byDay: days_names.map(day => ({
        day,
        ...(byDay.get(day) || { sent: 0, opened: 0, clicks: 0 })
      })),
      byHour: Array.from({ length: 24 }, (_, hour) => ({
        hour,
        opens: byHour.get(hour) || 0
      })),
      topRecipients
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
