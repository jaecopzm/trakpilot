import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { url } = await req.json();

        if (!url || !url.startsWith('http')) {
            return NextResponse.json({ error: 'Valid URL is required' }, { status: 400 });
        }

        const now = Date.now();
        const trackingId = uuidv4();
        const shortCode = Math.random().toString(36).substring(2, 8);
        const origin = "https://mailtrackr.zedbeatz.com";
        const trackedUrl = `${origin}/api/l/${shortCode}`;

        // 1. Create a "link holder" email record so we can track engagement
        // We use source='standalone' to distinguish it in the UI
        await db.execute({
            sql: `INSERT INTO emails (id, user_id, recipient, subject, created_at, opened_at, open_count, source, status, body, heat_score)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [trackingId, userId, '[Standalone]', `Tracking Link: ${url}`, now, null, 0, 'standalone', 'sent', `Standalone tracking for: ${url}`, 0]
        });

        // 2. Insert into links table
        await db.execute({
            sql: `INSERT INTO links (id, email_id, original_url, short_code, created_at)
                  VALUES (?, ?, ?, ?, ?)`,
            args: [uuidv4(), trackingId, url, shortCode, now]
        });

        return NextResponse.json({
            success: true,
            shortCode,
            trackedUrl,
            originalUrl: url
        });

    } catch (error) {
        console.error('Error creating standalone link:', error);
        return NextResponse.json({ error: 'Failed to create tracking link' }, { status: 500 });
    }
}
