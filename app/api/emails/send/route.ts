import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import { Resend } from 'resend';

// Simple email validation
function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { to, subject, body: emailBody, track, scheduled_at } = body;

        // Validate inputs
        if (!to || !emailBody) {
            return NextResponse.json(
                { error: 'Recipient and message body are required', code: 'MISSING_FIELDS' },
                { status: 400 }
            );
        }

        if (!isValidEmail(to)) {
            return NextResponse.json(
                { error: 'Please enter a valid email address', code: 'INVALID_EMAIL' },
                { status: 400 }
            );
        }

        const isScheduled = scheduled_at && scheduled_at > Date.now();

        // Get user's full settings (identity + SMTP + Pro features)
        const settingsResult = await db.execute({
            sql: `SELECT display_name, reply_to_email,
                         smtp_host, smtp_port, smtp_user, smtp_pass, from_email,
                         custom_domain, is_premium
                  FROM user_settings WHERE user_id = ?`,
            args: [userId]
        });

        const settings = settingsResult.rows.length > 0 ? settingsResult.rows[0] : null;

        // 1. Check for unsubscribes
        const unsubscribeResult = await db.execute({
            sql: `SELECT id FROM unsubscribes WHERE user_id = ? AND email = ?`,
            args: [userId, to]
        });

        if (unsubscribeResult.rows.length > 0) {
            return NextResponse.json(
                { error: 'This recipient has unsubscribed from your emails.', code: 'UNSUBSCRIBED' },
                { status: 400 }
            );
        }

        let transporter;
        let fromEmail: string;
        let replyTo: string | undefined;
        let useResend = false;

        if (settings?.smtp_host) {
            // Custom SMTP path
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
            // Resend path (default)
            useResend = true;

            const displayName = (settings?.display_name as string) || 'MailTrackr User';
            const baseFrom = process.env.SMTP_FROM || 'noreply@mailtrackr.zedbeatz.com';

            // Format: "John Doe via MailTrackr" <noreply@domain.com>
            fromEmail = `"${displayName} via MailTrackr" <${baseFrom}>`;
            replyTo = (settings?.reply_to_email as string) || undefined;
        }

        // Convert HTML to plain text for multipart
        const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        const plainText = stripHtml(emailBody);

        // Wrap email body in a clean HTML template
        const finalHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background: #f9f9f9; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="container">
    ${emailBody}
  </div>
</body>
</html>`;

        let finalBody = finalHtml;
        let trackingId = null;

        // Helper for short codes
        const generateShortCode = () => Math.random().toString(36).substring(2, 8);

        // Add tracking if requested
        if (track) {
            trackingId = uuidv4();
            const now = Date.now();

            // Track links first so processing is finished before wrapping
            // Use custom domain if configured (Pro feature)
            const origin = settings?.custom_domain
                ? `https://${settings.custom_domain}`
                : "https://mailtrackr.zedbeatz.com";
            const linkRegex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/gi;
            let match;
            const linkPromises = [];
            const linksFound: { original: string, code: string }[] = [];

            while ((match = linkRegex.exec(finalBody)) !== null) {
                const originalUrl = match[2];
                // Skip tracking for non-http(s) links and our own tracking pixels
                if (!originalUrl.startsWith('http') || originalUrl.includes('/api/track')) continue;

                const shortCode = generateShortCode();
                linksFound.push({ original: originalUrl, code: shortCode });

                linkPromises.push(db.execute({
                    sql: `INSERT INTO links (id, email_id, original_url, short_code, created_at)
                          VALUES (?, ?, ?, ?, ?)`,
                    args: [uuidv4(), trackingId, originalUrl, shortCode, now]
                }));
            }

            // Replace URLs in the body
            for (const link of linksFound) {
                const trackedUrl = `${origin}/api/l/${link.code}`;
                // Use a safer replace that only replaces this specific href
                // Note: This is a simple replace, for robust production we'd use a parser
                finalBody = finalBody.split(`href="${link.original}"`).join(`href="${trackedUrl}"`);
                finalBody = finalBody.split(`href='${link.original}'`).join(`href='${trackedUrl}'`);
            }

            await Promise.all(linkPromises);

            // Insert email record with link count tracking potential
            await db.execute({
                sql: `INSERT INTO emails (id, user_id, recipient, subject, created_at, opened_at, open_count, source, status, scheduled_at, body)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [trackingId, userId, to, subject || 'No Subject', now, null, 0, 'app', isScheduled ? 'pending' : 'sent', isScheduled ? scheduled_at : null, finalBody]
            });

            const trackingUrl = `${origin}/api/track?id=${trackingId}`;
            // Insert before </body>
            finalBody = finalBody.replace('</body>', `<img src="${trackingUrl}" width="1" height="1" style="display:none" alt="" /></body>`);
        }

        // 3. Add unsubscribe link and footer (for compliance & deliverability)
        const origin = settings?.custom_domain
            ? `https://${settings.custom_domain}`
            : "https://mailtrackr.zedbeatz.com";
        const unsubLink = `${origin}/api/unsubscribe?email=${encodeURIComponent(to)}&userId=${userId}`;
        const unsubHtml = `
  </div>
  <div style="margin-top: 30px; padding: 20px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #666; text-align: center; font-family: sans-serif;">
    <p style="margin: 0 0 10px;">Sent by ${settings?.display_name || 'MailTrackr User'}</p>
    <p style="margin: 0 0 10px;"><a href="${unsubLink}" style="color: #666; text-decoration: underline;">Unsubscribe</a> from these emails</p>
    <p style="margin: 0; font-size: 11px; color: #999;">Powered by MailTrackr</p>
  </div>`;

        finalBody = finalBody.replace('</div>\n</body>', `${unsubHtml}\n</body>`);

        // If scheduled for later, we are done
        if (isScheduled) {
            return NextResponse.json({
                success: true,
                trackingId,
                status: 'scheduled',
                message: 'Email scheduled for later'
            });
        }

        // Send email
        if (useResend) {
            if (!process.env.RESEND_API_KEY) {
                console.error('Missing RESEND_API_KEY');
                return NextResponse.json(
                    { error: 'Email service not configured. Please add RESEND_API_KEY to your environment.', code: 'MISSING_CONFIG' },
                    { status: 500 }
                );
            }

            const resend = new Resend(process.env.RESEND_API_KEY);

            const { data, error } = await resend.emails.send({
                from: fromEmail,
                to,
                subject: subject || '(No Subject)',
                html: finalBody,
                text: plainText,
                ...(replyTo ? { replyTo } : {}),
                headers: {
                    'X-Entity-Ref-ID': trackingId || uuidv4(),
                    'List-Unsubscribe': `<${unsubLink}>`,
                    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
                }
            });

            if (error) {
                console.error('Resend error:', error);

                // Provide user-friendly error messages
                const friendlyMessage = error.message?.includes('validation')
                    ? 'Email validation failed. Please check the recipient address.'
                    : error.message?.includes('rate')
                        ? 'Too many emails sent. Please wait a moment and try again.'
                        : error.message?.includes('domain')
                            ? 'Sender domain not verified. Please check your Resend configuration.'
                            : `Failed to send: ${error.message}`;

                return NextResponse.json(
                    { error: friendlyMessage, code: 'SEND_FAILED' },
                    { status: 500 }
                );
            }
        } else if (transporter) {
            const mailOptions: Record<string, unknown> = {
                from: fromEmail,
                to,
                subject: subject || '(No Subject)',
                html: finalBody,
                text: plainText,
                headers: {
                    'X-Entity-Ref-ID': trackingId || uuidv4(),
                    'List-Unsubscribe': `<${unsubLink}>`,
                    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
                }
            };
            if (replyTo) mailOptions.replyTo = replyTo;

            await transporter.sendMail(mailOptions);
        }

        return NextResponse.json({
            success: true,
            trackingId,
            message: 'Email sent successfully'
        });
    } catch (error: unknown) {
        console.error('Error sending email:', error);

        const message = error instanceof Error ? error.message : 'An unexpected error occurred';
        return NextResponse.json(
            { error: message, code: 'INTERNAL_ERROR' },
            { status: 500 }
        );
    }
}
