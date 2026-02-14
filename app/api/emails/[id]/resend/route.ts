import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 1. Get original email details
        const emailResult = await db.execute({
            sql: 'SELECT * FROM emails WHERE id = ? AND user_id = ?',
            args: [id, userId]
        });

        if (emailResult.rows.length === 0) {
            return NextResponse.json({ error: 'Email not found' }, { status: 404 });
        }

        const originalEmail = emailResult.rows[0];

        // 2. Prepare new email data
        const newId = uuidv4();
        const now = Date.now();
        const originalSubject = originalEmail.subject as string;

        // Tweaked subject line for follow-up
        let newSubject = originalSubject;
        if (!originalSubject.toLowerCase().startsWith('following up:')) {
            newSubject = `Following up: ${originalSubject}`;
        }

        // 3. Create new email record (pending status)
        await db.execute({
            sql: `
                INSERT INTO emails (id, user_id, recipient, subject, body, created_at, opened_at, open_count, source, status, scheduled_at, heat_score)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            args: [
                newId,
                userId,
                originalEmail.recipient,
                newSubject,
                originalEmail.body,
                now,
                null,
                0,
                'manual',
                'pending',
                now, // Send immediately (next cron run)
                0
            ]
        });

        return NextResponse.json({
            success: true,
            id: newId,
            message: 'Follow-up email queued successfully'
        });

    } catch (error) {
        console.error('Error in smart resend:', error);
        return NextResponse.json({ error: 'Failed to queue follow-up' }, { status: 500 });
    }
}
