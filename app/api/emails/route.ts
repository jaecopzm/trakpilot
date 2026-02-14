import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const result = await db.execute({
            sql: `
                SELECT e.*, 
                (SELECT COUNT(*) FROM link_clicks lc JOIN links l ON lc.link_id = l.id WHERE l.email_id = e.id AND lc.is_proxy = 0) as click_count,
                (
                    SELECT CAST(strftime('%H', datetime(opened_at / 1000, 'unixepoch')) AS INTEGER)
                    FROM opens 
                    WHERE email_id IN (SELECT id FROM emails WHERE recipient = e.recipient)
                    AND is_proxy = 0
                    GROUP BY strftime('%H', datetime(opened_at / 1000, 'unixepoch'))
                    ORDER BY COUNT(*) DESC
                    LIMIT 1
                ) as best_time
                FROM emails e 
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT 50
            `,
            args: [userId]
        });
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching emails:', error);
        return NextResponse.json({ error: 'Failed to fetch emails' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { recipient, subject } = body;

        if (!recipient) {
            return NextResponse.json({ error: 'Recipient is required' }, { status: 400 });
        }

        const id = uuidv4();
        const now = Date.now();

        await db.execute({
            sql: `
        INSERT INTO emails (id, user_id, recipient, subject, created_at, opened_at, open_count, source, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
            args: [id, userId, recipient, subject || 'No Subject', now, null, 0, 'manual', 'sent']
        });

        return NextResponse.json({
            id,
            recipient,
            subject,
            tracking_url: `https://mailtrackr.zedbeatz.com/api/track?id=${id}`
        });
    } catch (error) {
        console.error('Error creating tracked email:', error);
        return NextResponse.json({ error: 'Failed to create tracked email' }, { status: 500 });
    }
}
