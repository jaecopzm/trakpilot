import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const email = searchParams.get('email');
    const userId = searchParams.get('userId');

    if (!email || !userId) {
        return new NextResponse("Invalid unsubscribe link.", { status: 400 });
    }

    try {
        await db.execute({
            sql: `INSERT OR IGNORE INTO unsubscribes (id, user_id, email, created_at) VALUES (?, ?, ?, ?)`,
            args: [uuidv4(), userId, email, Date.now()]
        });

        return new NextResponse(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Unsubscribed</title>
                <style>
                    body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f9fafb; }
                    .card { background: white; padding: 2rem; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
                    h1 { color: #111827; margin-bottom: 1rem; }
                    p { color: #4b5563; line-height: 1.5; }
                </style>
            </head>
            <body>
                <div class="card">
                    <h1>Unsubscribed</h1>
                    <p>You have been successfully unsubscribed from emails sent by this user. You will no longer receive communications from them through MailTrackr.</p>
                </div>
            </body>
            </html>
        `, {
            headers: { 'Content-Type': 'text/html' }
        });
    } catch (error) {
        console.error('Unsubscribe error:', error);
        return new NextResponse("An error occurred while unsubscribing.", { status: 500 });
    }
}
