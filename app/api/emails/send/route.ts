import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, withRetry } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { checkEmailLimit, incrementEmailCount, checkRateLimit } from '@/lib/email-limits';
import { wrapEmailContentProfessional } from '@/lib/email-templates';

// Simple email validation
function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check rate limit
    const rateLimit = checkRateLimit(userId);
    if (!rateLimit.allowed) {
        return NextResponse.json(
            { error: `Rate limit exceeded. Try again in ${rateLimit.retryAfter} seconds.`, code: 'RATE_LIMIT' },
            { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } }
        );
    }

    try {
        const contentType = req.headers.get('content-type') || '';
        let to, subject, emailBody, track, scheduled_at;

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            to = formData.get('to') as string;
            subject = formData.get('subject') as string;
            emailBody = formData.get('body') as string;
            track = formData.get('track') === 'true';
            const scheduledFor = formData.get('scheduledFor') as string;
            scheduled_at = scheduledFor ? new Date(scheduledFor).getTime() : undefined;
        } else {
            const body = await req.json();
            to = body.to;
            subject = body.subject;
            emailBody = body.body;
            track = body.track;
            scheduled_at = body.scheduled_at;
        }

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

        // Check email limit
        const limitCheck = await checkEmailLimit(userId);
        if (!limitCheck.allowed) {
            return NextResponse.json(
                { 
                    error: `Monthly email limit reached (${limitCheck.limit} emails). Upgrade to Pro for unlimited emails.`, 
                    code: 'LIMIT_REACHED',
                    limit: limitCheck.limit,
                    remaining: 0
                },
                { status: 403 }
            );
        }

        const isScheduled = scheduled_at && scheduled_at > Date.now();

        // Get user's full settings (identity + SMTP + Pro features) with retry
        const settingsResult = await withRetry(() => db.execute({
            sql: `SELECT display_name, reply_to_email,
                         smtp_host, smtp_port, smtp_user, smtp_pass, from_email,
                         custom_domain, is_premium
                  FROM user_settings WHERE user_id = ?`,
            args: [userId]
        }));

        console.log('🔍 Looking for settings with userId:', userId);
        console.log('🔍 Query returned rows:', settingsResult.rows.length);

        let settings = settingsResult.rows.length > 0 ? settingsResult.rows[0] : null;

        // Auto-create settings if they don't exist
        if (!settings) {
            console.log('⚠️ No settings found, creating default settings...');
            await db.execute({
                sql: `INSERT INTO user_settings (user_id, display_name, reply_to_email, emails_sent_this_month, last_reset_date) VALUES (?, ?, ?, 0, ?)`,
                args: [userId, '', '', Date.now()]
            });
            settings = { display_name: '', reply_to_email: '', is_premium: 0 } as any;
        }

        console.log('📧 Email Settings:', {
            hasSettings: !!settings,
            displayName: settings?.display_name,
            replyTo: settings?.reply_to_email,
            hasCustomSMTP: !!settings?.smtp_host
        });

        // 1. Check for unsubscribes with retry
        const unsubscribeResult = await withRetry(() => db.execute({
            sql: `SELECT id FROM unsubscribes WHERE user_id = ? AND email = ?`,
            args: [userId, to]
        }));

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

            // Use clean sender name without "via MailTrackr" branding
            fromEmail = displayName ? `"${displayName}" <${baseFrom}>` : baseFrom;
            replyTo = (settings?.reply_to_email as string) || undefined;

            console.log('📨 Using Resend with:', { fromEmail, replyTo });
        }

        // Convert HTML to plain text for multipart
        const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        const plainText = stripHtml(emailBody);

        // Check if body is plain text or HTML
        const isPlainText = !emailBody.includes('<') && !emailBody.includes('>');
        
        // Wrap in premium template if plain text, otherwise use as-is
        let finalBody = isPlainText 
            ? wrapEmailContentProfessional(emailBody, subject || '', '#667eea')
            : emailBody;

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
        
        // Only show branding if not premium
        const brandingHtml = settings?.is_premium ? '' : `
  <p style="margin: 10px 0 0; font-size: 11px; color: #999;">
    <a href="https://mailtrackr.zedbeatz.com" style="color: #999; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
        <polyline points="22,6 12,13 2,6"></polyline>
      </svg>
      Sent with MailTrackr
    </a>
  </p>`;
        
        const unsubHtml = `
<div style="margin-top: 30px; padding: 20px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #666; text-align: center; font-family: sans-serif;">
  <p style="margin: 0 0 10px;">Sent by ${settings?.display_name || 'MailTrackr User'}</p>
  <p style="margin: 0 0 10px;"><a href="${unsubLink}" style="color: #666; text-decoration: underline;">Unsubscribe</a> from these emails</p>${brandingHtml}
</div>`;

        // Insert before closing container div or body tag
        if (finalBody.includes('</div>\n</body>')) {
            finalBody = finalBody.replace('</div>\n</body>', `${unsubHtml}\n</div>\n</body>`);
        } else if (finalBody.includes('</body>')) {
            finalBody = finalBody.replace('</body>', `${unsubHtml}\n</body>`);
        } else {
            finalBody += unsubHtml;
        }

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
                    'X-Priority': '3',
                    'Importance': 'Normal',
                    'X-Mailer': 'MailTrackr',
                    'Precedence': 'bulk',
                },
                tags: [
                    { name: 'category', value: 'transactional' }
                ]
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

        // Increment email count after successful send
        await incrementEmailCount(userId);

        return NextResponse.json({
            success: true,
            trackingId,
            message: 'Email sent successfully',
            remaining: limitCheck.remaining - 1
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
