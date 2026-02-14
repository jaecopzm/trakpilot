import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const result = await db.execute({
            sql: `SELECT slack_webhook_url, display_name, reply_to_email,
                         smtp_host, smtp_port, smtp_user, smtp_pass, from_email,
                         custom_domain, is_premium
                  FROM user_settings WHERE user_id = ?`,
            args: [userId]
        });

        if (result.rows.length > 0) {
            const row = result.rows[0];
            return NextResponse.json({
                slack_webhook_url: row.slack_webhook_url || '',
                display_name: row.display_name || '',
                reply_to_email: row.reply_to_email || '',
                smtp_host: row.smtp_host || '',
                smtp_port: row.smtp_port || '',
                smtp_user: row.smtp_user || '',
                smtp_pass: row.smtp_pass ? '••••••••' : '', // Never expose password
                from_email: row.from_email || '',
                has_custom_smtp: !!(row.smtp_host),
                custom_domain: row.custom_domain || '',
                is_premium: !!(row.is_premium),
            });
        }

        return NextResponse.json({
            slack_webhook_url: '',
            display_name: '',
            reply_to_email: '',
            smtp_host: '',
            smtp_port: '',
            smtp_user: '',
            smtp_pass: '',
            from_email: '',
            has_custom_smtp: false,
            custom_domain: '',
            is_premium: false,
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const {
            slack_webhook_url,
            display_name,
            reply_to_email,
            smtp_host,
            smtp_port,
            smtp_user,
            smtp_pass,
            from_email,
            custom_domain,
        } = body;

        // Validate reply_to_email if provided
        if (reply_to_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reply_to_email)) {
            return NextResponse.json({ error: 'Invalid reply-to email address' }, { status: 400 });
        }

        // Validate SMTP port if provided
        if (smtp_port && (isNaN(Number(smtp_port)) || Number(smtp_port) < 1 || Number(smtp_port) > 65535)) {
            return NextResponse.json({ error: 'Invalid SMTP port' }, { status: 400 });
        }

        // Build dynamic upsert — only update smtp_pass if user provided a new one (not masked)
        const shouldUpdatePassword = smtp_pass && smtp_pass !== '••••••••';

        if (shouldUpdatePassword) {
            await db.execute({
                sql: `INSERT INTO user_settings (user_id, slack_webhook_url, display_name, reply_to_email, smtp_host, smtp_port, smtp_user, smtp_pass, from_email, custom_domain)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                      ON CONFLICT(user_id) DO UPDATE SET
                        slack_webhook_url = ?,
                        display_name = ?,
                        reply_to_email = ?,
                        smtp_host = ?,
                        smtp_port = ?,
                        smtp_user = ?,
                        smtp_pass = ?,
                        from_email = ?,
                        custom_domain = ?`,
                args: [
                    userId,
                    slack_webhook_url || '', display_name || '', reply_to_email || '',
                    smtp_host || null, smtp_port ? Number(smtp_port) : null, smtp_user || null, smtp_pass || null, from_email || null, custom_domain || null,
                    slack_webhook_url || '', display_name || '', reply_to_email || '',
                    smtp_host || null, smtp_port ? Number(smtp_port) : null, smtp_user || null, smtp_pass || null, from_email || null, custom_domain || null,
                ]
            });
        } else {
            await db.execute({
                sql: `INSERT INTO user_settings (user_id, slack_webhook_url, display_name, reply_to_email, smtp_host, smtp_port, smtp_user, from_email, custom_domain)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                      ON CONFLICT(user_id) DO UPDATE SET
                        slack_webhook_url = ?,
                        display_name = ?,
                        reply_to_email = ?,
                        smtp_host = ?,
                        smtp_port = ?,
                        smtp_user = ?,
                        from_email = ?,
                        custom_domain = ?`,
                args: [
                    userId,
                    slack_webhook_url || '', display_name || '', reply_to_email || '',
                    smtp_host || null, smtp_port ? Number(smtp_port) : null, smtp_user || null, from_email || null, custom_domain || null,
                    slack_webhook_url || '', display_name || '', reply_to_email || '',
                    smtp_host || null, smtp_port ? Number(smtp_port) : null, smtp_user || null, from_email || null, custom_domain || null,
                ]
            });
        }

        return NextResponse.json({ success: true, message: 'Settings saved' });
    } catch (error) {
        console.error('Error saving settings:', error);
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }
}
