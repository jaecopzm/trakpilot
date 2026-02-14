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
        // First verify the email belongs to the user
        const emailCheck = await db.execute({
            sql: 'SELECT id FROM emails WHERE id = ? AND user_id = ?',
            args: [id, userId]
        });

        if (emailCheck.rows.length === 0) {
            return NextResponse.json({ error: 'Unauthorized or not found' }, { status: 404 });
        }

        // Fetch opens
        const opens = await db.execute({
            sql: 'SELECT * FROM opens WHERE email_id = ? ORDER BY opened_at DESC',
            args: [id]
        });

        return NextResponse.json(opens.rows);
    } catch (error) {
        console.error('Error fetching opens:', error);
        return NextResponse.json({ error: 'Failed to fetch opens' }, { status: 500 });
    }
}
