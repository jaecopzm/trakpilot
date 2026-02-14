import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import nodemailer from 'nodemailer';
import { Resend } from 'resend';

export async function GET(req: NextRequest) {
    // Basic security: check for a secret key
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'dev-secret';

    if (authHeader !== `Bearer ${cronSecret}` && req.nextUrl.searchParams.get('key') !== cronSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const now = Date.now();

        // 1. Find pending emails due for sending
        const pendingEmails = await db.execute({
            sql: `SELECT * FROM emails WHERE status = 'pending' AND scheduled_at <= ? LIMIT 10`,
            args: [now]
        });

        if (pendingEmails.rows.length === 0) {
            return NextResponse.json({ message: 'No pending emails found' });
        }

        const results = [];

        for (const email of pendingEmails.rows) {
            try {
                // Get user settings for this email
                const settingsResult = await db.execute({
                    sql: `SELECT display_name, reply_to_email,
                                smtp_host, smtp_port, smtp_user, smtp_pass, from_email
                        FROM user_settings WHERE user_id = ?`,
                    args: [email.user_id]
                });

                const settings = settingsResult.rows.length > 0 ? settingsResult.rows[0] : null;

                let fromEmail: string;
                let replyTo: string | undefined;
                let useResend = false;
                let transporter = null;

                if (settings?.smtp_host) {
                    transporter = nodemailer.createTransport({
                        host: settings.smtp_host as string,
                        port: settings.smtp_port as number,
                        secure: settings.smtp_port === 465,
                        auth: {
                            user: settings.smtp_user as string,
                            pass: settings.smtp_pass as string,
                        },
                    });
                    fromEmail = settings.from_email as string;
                    replyTo = (settings.reply_to_email as string) || undefined;
                } else {
                    useResend = true;
                    const displayName = (settings?.display_name as string) || 'MailTrackr User';
                    const baseFrom = process.env.SMTP_FROM || 'onboarding@resend.dev';
                    fromEmail = `${displayName} via MailTrackr <${baseFrom}>`;
                    replyTo = (settings?.reply_to_email as string) || undefined;
                }

                // Send 
                if (useResend) {
                    if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY missing');
                    const resend = new Resend(process.env.RESEND_API_KEY);
                    const { error } = await resend.emails.send({
                        from: fromEmail,
                        to: email.recipient as string,
                        subject: email.subject as string,
                        html: email.body as string,
                        ...(replyTo ? { replyTo } : {}),
                    });
                    if (error) throw new Error(error.message);
                } else if (transporter) {
                    await transporter.sendMail({
                        from: fromEmail,
                        to: email.recipient as string,
                        subject: email.subject as string,
                        html: email.body as string,
                        ...(replyTo ? { replyTo } : {}),
                    });
                }

                // Update status to sent
                await db.execute({
                    sql: `UPDATE emails SET status = 'sent' WHERE id = ?`,
                    args: [email.id]
                });

                results.push({ id: email.id, status: 'sent' });

            } catch (err) {
                console.error(`Failed to process email ${email.id}:`, err);
                const errorMessage = (err as Error).message;

                // Update status to failed
                await db.execute({
                    sql: `UPDATE emails SET status = 'failed', error_message = ? WHERE id = ?`,
                    args: [errorMessage, email.id]
                });

                results.push({ id: email.id, status: 'failed', error: errorMessage });
            }
        }

        return NextResponse.json({ processed: results.length, results });

    } catch (error) {
        console.error('Queue processing error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
