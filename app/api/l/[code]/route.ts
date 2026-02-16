import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    const { code } = await params;

    if (!code) {
        return NextResponse.redirect(new URL('/', "https://mailtrackr.zedbeatz.com"));
    }

    try {
        // 1. Lookup the short code
        const linkResult = await db.execute({
            sql: 'SELECT email_id, original_url FROM links WHERE short_code = ?',
            args: [code]
        });

        if (linkResult.rows.length === 0) {
            return NextResponse.redirect(new URL('/', "https://mailtrackr.zedbeatz.com"));
        }

        const link = linkResult.rows[0];
        const originalUrl = link.original_url as string;
        const emailId = link.email_id as string;

        // 2. Log the click (Asynchronous/Fire-and-forget logic to not delay user redirect)
        const userAgent = req.headers.get('user-agent') || '';
        const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

        // Perform logging in the background
        (async () => {
            try {
                // Proxy Detection Logic
                const isProxy = userAgent.includes('Apple-Mail-Image-Download') ||
                    userAgent.includes('GoogleImageProxy') ||
                    userAgent.includes('Outlook-iOS-Android') ||
                    userAgent.includes('Office365-Image-Proxy') ? 1 : 0;

                // Resolve location (same logic as tracking pixel)
                let location = 'Unknown';
                if (ip && ip !== 'unknown' && ip !== '127.0.0.1' && ip !== '::1' && !isProxy) {
                    try {
                        const geoRes = await fetch(`http://ip-api.com/json/${ip.split(',')[0].trim()}?fields=city,country`);
                        const geoData = await geoRes.json();
                        if (geoData && geoData.status === 'success') {
                            location = `${geoData.city}, ${geoData.country}`;
                        }
                    } catch (e) { /* ignore geo error */ }
                }

                // Insert click record
                await db.execute({
                    sql: `INSERT INTO link_clicks (id, link_id, ip_address, user_agent, location, clicked_at, is_proxy)
                          VALUES (?, (SELECT id FROM links WHERE short_code = ?), ?, ?, ?, ?, ?)`,
                    args: [uuidv4(), code, ip, userAgent, location, Date.now(), isProxy]
                });

                // Update heat score
                const heatIncrement = isProxy ? 1 : 15;
                await db.execute({
                    sql: 'UPDATE emails SET heat_score = heat_score + ? WHERE id = ?',
                    args: [heatIncrement, emailId]
                });

                // Update email stats? 
                // We could add a link_click_count to emails table eventually, 
                // but for now we have the links and link_clicks tables for detailed analytics.

                // Optional: Send Slack notification for click?
                const emailResult = await db.execute({
                    sql: 'SELECT user_id, recipient, subject FROM emails WHERE id = ?',
                    args: [emailId]
                });

                if (emailResult.rows.length > 0) {
                    const email = emailResult.rows[0];
                    
                    // Send real-time notification
                    try {
                        const { sendNotification } = await import('@/app/api/notifications/stream/route');
                        sendNotification(email.user_id as string, {
                            type: 'link_clicked',
                            emailId: emailId,
                            recipient: email.recipient,
                            subject: email.subject,
                            linkUrl: originalUrl,
                            timestamp: Date.now()
                        });
                    } catch (error) {
                        console.error('Failed to send notification:', error);
                    }
                    
                    const settingsResult = await db.execute({
                        sql: 'SELECT slack_webhook_url FROM user_settings WHERE user_id = ?',
                        args: [email.user_id]
                    });

                    if (settingsResult.rows.length > 0 && settingsResult.rows[0].slack_webhook_url) {
                        const webhookUrl = settingsResult.rows[0].slack_webhook_url as string;
                        fetch(webhookUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                text: `🔗 *Link Clicked!* ${isProxy ? '_(Proxy/Bot)_' : ''}\n\nRecipient: *${email.recipient}*\nURL: <${originalUrl}|${originalUrl}>\nSubject: _${email.subject}_`
                            })
                        }).catch(err => console.error('Slack click notification failed:', err));
                    }
                }
            } catch (err) {
                console.error('Error logging link click:', err);
            }
        })();

        // 3. Redirect to original URL
        return NextResponse.redirect(new URL(originalUrl));
    } catch (error) {
        console.error('Redirection error:', error);
        return NextResponse.redirect(new URL('/', "https://mailtrackr.zedbeatz.com"));
    }
}
