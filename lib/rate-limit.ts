import { db } from './db';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export async function checkRateLimit(
  userId: string,
  limit: number = 50, // emails per hour
  windowMs: number = 3600000 // 1 hour
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Count emails sent in the window
  const result = await db.execute({
    sql: `SELECT COUNT(*) as count FROM emails 
          WHERE user_id = ? AND created_at > ? AND status = 'sent'`,
    args: [userId, windowStart]
  });

  const count = Number(result.rows[0]?.count || 0);
  const remaining = Math.max(0, limit - count);
  const allowed = count < limit;
  const resetAt = now + windowMs;

  return { allowed, remaining, resetAt };
}

export async function enforceRateLimit(userId: string): Promise<void> {
  const result = await checkRateLimit(userId);
  
  if (!result.allowed) {
    const resetIn = Math.ceil((result.resetAt - Date.now()) / 60000);
    throw new Error(`Rate limit exceeded. Try again in ${resetIn} minutes.`);
  }
}
