import { db } from './db';

const FREE_PLAN_LIMIT = 50;
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 emails per minute

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

export async function checkEmailLimit(userId: string): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  try {
    // Get user settings
    const result = await db.execute({
      sql: `SELECT is_premium, emails_sent_this_month, last_reset_date FROM user_settings WHERE user_id = ?`,
      args: [userId]
    });

    let settings = result.rows[0];
    
    // Create settings if not exist
    if (!settings) {
      await db.execute({
        sql: `INSERT INTO user_settings (user_id, emails_sent_this_month, last_reset_date) VALUES (?, 0, ?)`,
        args: [userId, Date.now()]
      });
      settings = { is_premium: 0, emails_sent_this_month: 0, last_reset_date: Date.now() } as any;
    }

    const isPremium = settings.is_premium === 1;
    const emailsSent = Number(settings.emails_sent_this_month || 0);
    const lastReset = Number(settings.last_reset_date || 0);

    // Reset counter if new month
    const now = Date.now();
    const lastResetDate = new Date(lastReset);
    const currentDate = new Date(now);
    
    if (lastResetDate.getMonth() !== currentDate.getMonth() || 
        lastResetDate.getFullYear() !== currentDate.getFullYear()) {
      await db.execute({
        sql: `UPDATE user_settings SET emails_sent_this_month = 0, last_reset_date = ? WHERE user_id = ?`,
        args: [now, userId]
      });
      return { allowed: true, remaining: isPremium ? -1 : FREE_PLAN_LIMIT, limit: isPremium ? -1 : FREE_PLAN_LIMIT };
    }

    // Premium users have unlimited
    if (isPremium) {
      return { allowed: true, remaining: -1, limit: -1 };
    }

    // Check free plan limit
    if (emailsSent >= FREE_PLAN_LIMIT) {
      return { allowed: false, remaining: 0, limit: FREE_PLAN_LIMIT };
    }

    return { allowed: true, remaining: FREE_PLAN_LIMIT - emailsSent, limit: FREE_PLAN_LIMIT };
  } catch (error) {
    console.error('Error checking email limit:', error);
    // Fail open - allow sending if check fails
    return { allowed: true, remaining: -1, limit: -1 };
  }
}

export async function incrementEmailCount(userId: string): Promise<void> {
  try {
    await db.execute({
      sql: `UPDATE user_settings SET emails_sent_this_month = emails_sent_this_month + 1 WHERE user_id = ?`,
      args: [userId]
    });
  } catch (error) {
    console.error('Error incrementing email count:', error);
  }
}

export function checkRateLimit(userId: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetAt) {
    // New window
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return { allowed: true };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.count++;
  return { allowed: true };
}

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [userId, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(userId);
    }
  }
}, 5 * 60 * 1000);
