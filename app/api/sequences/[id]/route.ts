import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    try {
        // 1. Get Sequence
        const sequenceResult = await db.execute({
            sql: 'SELECT * FROM sequences WHERE id = ? AND user_id = ?',
            args: [id, userId]
        });

        if (sequenceResult.rows.length === 0) {
            return NextResponse.json({ error: 'Sequence not found' }, { status: 404 });
        }

        // 2. Get Steps
        const stepsResult = await db.execute({
            sql: 'SELECT * FROM sequence_steps WHERE sequence_id = ? ORDER BY step_order ASC',
            args: [id]
        });

        return NextResponse.json({
            sequence: sequenceResult.rows[0],
            steps: stepsResult.rows
        });

    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch sequence details' }, { status: 500 });
    }
}
