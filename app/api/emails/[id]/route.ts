import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

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
