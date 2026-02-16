import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    try {
        // Get email details
        const emailResult = await db.execute({
            sql: 'SELECT * FROM emails WHERE id = ? AND user_id = ?',
            args: [id, userId],
        });

        if (emailResult.rows.length === 0) {
            return NextResponse.json({ error: 'Email not found' }, { status: 404 });
        }

        const email = emailResult.rows[0];

        // Get opens
        const opensResult = await db.execute({
            sql: 'SELECT * FROM opens WHERE email_id = ? ORDER BY opened_at DESC',
            args: [id],
        });

        // Get link clicks
        const clicksResult = await db.execute({
            sql: `SELECT lc.*, l.original_url 
                  FROM link_clicks lc
                  JOIN links l ON lc.link_id = l.id
                  WHERE l.email_id = ?
                  ORDER BY lc.clicked_at DESC`,
            args: [id],
        });

        return NextResponse.json({
            ...email,
            opens: opensResult.rows,
            clicks: clicksResult.rows,
        });
    } catch (error) {
        console.error('Error fetching email details:', error);
        return NextResponse.json({ error: 'Failed to fetch email details' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    try {
        // Only allow deleting emails that belong to the current user
        const result = await db.execute({
            sql: 'DELETE FROM emails WHERE id = ? AND user_id = ?',
            args: [id, userId],
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting email:', error);
        return NextResponse.json({ error: 'Failed to delete email' }, { status: 500 });
    }
}
