import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { checkSpamScore } from './spam-checker';
import { enforceRateLimit } from './rate-limit';

interface SendEmailParams {
    userId: string;
    to: string;
    subject: string;
    body: string;
    track?: boolean;
    source?: string; // 'app', 'sequence', etc.
}

export async function sendEmail({
    userId,
    to,
    subject,
    body,
    track = true,
    source = 'app'
}: SendEmailParams) {
    // 0. Rate limiting
    await enforceRateLimit(userId);

    // 1. Check spam score
    const spamCheck = checkSpamScore(subject, body);
    if (spamCheck.score > 10) {
        console.warn('High spam score:', spamCheck);
    }

    // 2. Get Settings
    const settingsResult = await db.execute({
        sql: `SELECT display_name, reply_to_email,
                     smtp_host, smtp_port, smtp_user, smtp_pass, from_email,
                     custom_domain
              FROM user_settings WHERE user_id = ?`,
        args: [userId]
    });
    const settings = settingsResult.rows.length > 0 ? settingsResult.rows[0] : null;

    // 3. Check Unsubscribes
    const unsubscribeResult = await db.execute({
        sql: `SELECT id FROM unsubscribes WHERE user_id = ? AND email = ?`,
        args: [userId, to]
    });
    if (unsubscribeResult.rows.length > 0) {
        throw new Error('Recipient unsubscribed');
    }

    // 4. Prepare Transporter
    let transporter;
    let fromEmail: string;
    let replyTo: string | undefined;
    let useResend = false;

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
        const baseFrom = process.env.SMTP_FROM || 'noreply@mailtrackr.zedbeatz.com';
        fromEmail = displayName ? `"${displayName}" <${baseFrom}>` : baseFrom;
        replyTo = (settings?.reply_to_email as string) || undefined;
    }

    // 5. Prepare Body (Link Tracking & Pixel)
    const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    const plainText = stripHtml(body);

    // Simple wrapper if not already wrapped
    let finalBody = body;
    if (!body.includes('<!DOCTYPE html>')) {
        finalBody = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>${subject || 'Email'}</title>
<style>
body { 
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6; 
  color: #333;
  margin: 0;
  padding: 20px;
  background-color: #f4f4f4;
}
.container {
  max-width: 600px;
  margin: 0 auto;
  background: #ffffff;
  padding: 20px;
  border-radius: 5px;
}
</style>
</head>
<body>
<div class="container">
${body}
</div>
</body>
</html>`;
    }

    let trackingId = uuidv4(); // Always generate an ID for reference
    const now = Date.now();

    // Helper for short codes
    const generateShortCode = () => Math.random().toString(36).substring(2, 8);

    // Add unsubscribe link first
    const origin = settings?.custom_domain
        ? `https://${settings.custom_domain}`
        : "https://mailtrackr.zedbeatz.com";
    const unsubLink = `${origin}/api/unsubscribe?email=${encodeURIComponent(to)}&userId=${userId}`;
    const unsubHtml = `
<div style="margin-top: 30px; font-size: 12px; color: #666; text-align: center; border-top: 1px solid #eee; padding-top: 10px;">
<p>Sent via MailTrackr • <a href="${unsubLink}" style="color: #666;">Unsubscribe</a></p>
</div>`;

    if (finalBody.includes('</body>')) {
        finalBody = finalBody.replace('</body>', `${unsubHtml}</body>`);
    } else {
        finalBody += unsubHtml;
    }

    if (track) {
        const linkRegex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/gi;
        let match;
        const linkPromises = [];
        const linksFound: { original: string, code: string }[] = [];

        while ((match = linkRegex.exec(finalBody)) !== null) {
            const originalUrl = match[2];
            if (!originalUrl.startsWith('http') || originalUrl.includes('/api/track')) continue;

            const shortCode = generateShortCode();
            linksFound.push({ original: originalUrl, code: shortCode });

            linkPromises.push(db.execute({
                sql: `INSERT INTO links (id, email_id, original_url, short_code, created_at)
                      VALUES (?, ?, ?, ?, ?)`,
                args: [uuidv4(), trackingId, originalUrl, shortCode, now]
            }));
        }

        for (const link of linksFound) {
            const trackedUrl = `${origin}/api/l/${link.code}`;
            // Simple replace, careful with duplicates
            finalBody = finalBody.replace(new RegExp(`href=["']${link.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`, 'g'), `href="${trackedUrl}"`);
        }

        await Promise.all(linkPromises);

        // Tracking Pixel
        const trackingUrl = `${origin}/api/track?id=${trackingId}`;
        finalBody = finalBody.replace('</body>', `<img src="${trackingUrl}" width="1" height="1" style="display:none" alt="" /></body>`);

        // Log to emails table
        await db.execute({
            sql: `INSERT INTO emails (id, user_id, recipient, subject, created_at, opened_at, open_count, source, status, body)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [trackingId, userId, to, subject || 'No Subject', now, null, 0, source, 'sent', finalBody]
        });
    }


    // 6. Send with anti-spam headers
    const messageId = `<${trackingId}@${settings?.custom_domain || 'mailtrackr.zedbeatz.com'}>`;
    const commonHeaders = {
        'X-Entity-Ref-ID': trackingId,
        'List-Unsubscribe': `<${unsubLink}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        'Message-ID': messageId,
        'X-Mailer': 'MailTrackr',
        'Precedence': 'bulk',
        'X-Priority': '3',
    };

    if (useResend) {
        if (!process.env.RESEND_API_KEY) throw new Error('Missing RESEND_API_KEY');
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
            from: fromEmail,
            to,
            subject: subject || '(No Subject)',
            html: finalBody,
            text: plainText,
            ...(replyTo ? { replyTo } : {}),
            headers: commonHeaders
        });
    } else if (transporter) {
        await transporter.sendMail({
            from: fromEmail,
            to,
            subject: subject || '(No Subject)',
            html: finalBody,
            text: plainText,
            replyTo,
            headers: commonHeaders,
            messageId,
        });
    }

    return { trackingId };
}
