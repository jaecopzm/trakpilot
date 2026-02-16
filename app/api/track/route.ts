import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import { db } from '@/lib/db';
import { UAParser } from 'ua-parser-js';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (id) {
        try {
            // 1. Get request details
            const userAgent = req.headers.get('user-agent') || '';
            const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

            // 2. Parse UA and detect proxies
            const parser = new UAParser(userAgent);
            const device = parser.getDevice();
            const os = parser.getOS();
            const browser = parser.getBrowser();

            const deviceType = device.type || 'desktop';

            // Proxy Detection Logic
            const isProxy = userAgent.includes('Apple-Mail-Image-Download') ||
                userAgent.includes('GoogleImageProxy') ||
                userAgent.includes('Outlook-iOS-Android') ||
                userAgent.includes('Office365-Image-Proxy') ? 1 : 0;

            // Try to resolve location from IP
            let location = 'Unknown';
            if (ip && ip !== 'unknown' && ip !== '127.0.0.1' && ip !== '::1' && !isProxy) {
                try {
                    // Using free IP-API (limit 45 requests/minute)
                    // In production, use a paid service or database like MaxMind
                    const geoRes = await fetch(`http://ip-api.com/json/${ip.split(',')[0].trim()}?fields=city,country`);
                    const geoData = await geoRes.json();
                    if (geoData && geoData.status === 'success') {
                        location = `${geoData.city}, ${geoData.country}`;
                    }
                } catch (e) {
                    // Silently fail geo lookup
                }
            }

            // 3. Log open event
            const openId = uuidv4();
            await db.execute({
                sql: `
          INSERT INTO opens (id, email_id, ip_address, user_agent, location, device_type, opened_at, is_proxy)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
                args: [openId, id, ip, userAgent, location, deviceType, Date.now(), isProxy]
            });

            // 4. Update email stats and heat score
            const heatIncrement = isProxy ? 1 : 5;

            await db.execute({
                sql: `
          UPDATE emails 
          SET 
            opened_at = CASE WHEN ? = 0 THEN ? ELSE opened_at END,
            open_count = open_count + 1,
            heat_score = heat_score + ?
          WHERE id = ?
        `,
                args: [isProxy, Date.now(), heatIncrement, id]
            });

            // 5. Send real-time notification
            const emailResult = await db.execute({
                sql: 'SELECT user_id, recipient, subject FROM emails WHERE id = ?',
                args: [id]
            });

            if (emailResult.rows.length > 0) {
                const email = emailResult.rows[0];

                // Send SSE notification
                try {
                    const { sendNotification } = await import('@/app/api/notifications/stream/route');
                    sendNotification(email.user_id as string, {
                        type: 'email_opened',
                        emailId: id,
                        recipient: email.recipient,
                        subject: email.subject,
                        timestamp: Date.now()
                    });
                } catch (error) {
                    console.error('Failed to send notification:', error);
                }

                // Get user settings for Slack
                const settingsResult = await db.execute({
                    sql: 'SELECT slack_webhook_url FROM user_settings WHERE user_id = ?',
                    args: [email.user_id]
                });

                if (settingsResult.rows.length > 0 && settingsResult.rows[0].slack_webhook_url) {
                    const webhookUrl = settingsResult.rows[0].slack_webhook_url;

                    // Fire and forget notification
                    fetch(webhookUrl as string, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            text: `📧 *Email Opened!* ${isProxy ? '_(Proxy/Apple MPP)_' : ''}\n\nRecipient: *${email.recipient}*\nSubject: _${email.subject}_\nDevice: ${os.name} / ${browser.name} (${deviceType})`
                        })
                    }).catch(err => console.error('Slack notification failed:', err));
                }
            }

        } catch (error) {
            console.error('Error updating tracking status:', error);
        }
    }

    // Transparent 1x1 GIF
    const pixel = Buffer.from(
        'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        'base64'
    );

    return new NextResponse(pixel, {
        headers: {
            'Content-Type': 'image/gif',
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
        },
    });
}
