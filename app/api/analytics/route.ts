import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 1. Daily Stats (Last 14 days)
        // Group opens by day
        const dailyOpens = await db.execute({
            sql: `
                SELECT 
                    strftime('%Y-%m-%d', datetime(opened_at / 1000, 'unixepoch')) as date,
                    COUNT(*) as count
                FROM opens o
                JOIN emails e ON o.email_id = e.id
                WHERE e.user_id = ? AND o.opened_at > ?
                GROUP BY date
                ORDER BY date ASC
            `,
            args: [userId, Date.now() - 14 * 24 * 60 * 60 * 1000]
        });

        // Group clicks by day
        const dailyClicks = await db.execute({
            sql: `
                SELECT 
                    strftime('%Y-%m-%d', datetime(clicked_at / 1000, 'unixepoch')) as date,
                    COUNT(*) as count
                FROM link_clicks lc
                JOIN links l ON lc.link_id = l.id
                JOIN emails e ON l.email_id = e.id
                WHERE e.user_id = ? AND lc.clicked_at > ?
                GROUP BY date
                ORDER BY date ASC
            `,
            args: [userId, Date.now() - 14 * 24 * 60 * 60 * 1000]
        });

        // 2. Device Distribution
        const devices = await db.execute({
            sql: `
                SELECT device_type as name, COUNT(*) as value
                FROM opens o
                JOIN emails e ON o.email_id = e.id
                WHERE e.user_id = ?
                GROUP BY device_type
            `,
            args: [userId]
        });

        // 3. Engagement by Hour
        const hourlyEngagement = await db.execute({
            sql: `
                SELECT 
                    strftime('%H', datetime(timestamp / 1000, 'unixepoch')) as hour,
                    COUNT(*) as count
                FROM (
                    SELECT opened_at as timestamp FROM opens o JOIN emails e ON o.email_id = e.id WHERE e.user_id = ?
                    UNION ALL
                    SELECT clicked_at as timestamp FROM link_clicks lc JOIN links l ON lc.link_id = l.id JOIN emails e ON l.email_id = e.id WHERE e.user_id = ?
                )
                GROUP BY hour
                ORDER BY hour ASC
            `,
            args: [userId, userId]
        });

        // Merge daily opens and clicks for the chart
        const dailyMap: Record<string, { date: string, opens: number, clicks: number }> = {};

        // Initialize last 14 days with 0s
        for (let i = 13; i >= 0; i--) {
            const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            dailyMap[date] = { date, opens: 0, clicks: 0 };
        }

        dailyOpens.rows.forEach(row => {
            const date = row.date as string;
            if (dailyMap[date]) dailyMap[date].opens = row.count as number;
        });

        dailyClicks.rows.forEach(row => {
            const date = row.date as string;
            if (dailyMap[date]) dailyMap[date].clicks = row.count as number;
        });

        return NextResponse.json({
            dailyStats: Object.values(dailyMap),
            deviceDistribution: devices.rows,
            hourlyEngagement: hourlyEngagement.rows.map(r => ({
                hour: parseInt(r.hour as string),
                count: r.count
            }))
        });
    } catch (error) {
        console.error('Analytics error:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}
