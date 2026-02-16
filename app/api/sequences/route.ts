import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { v4 as uuidv4 } from 'uuid';

// GET: List sequences
export async function GET() {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const result = await db.execute({
            sql: 'SELECT * FROM sequences WHERE user_id = ? ORDER BY created_at DESC',
            args: [userId]
        });
        return NextResponse.json(result.rows);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch sequences' }, { status: 500 });
    }
}

// POST: Create a new sequence
export async function POST(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { name, steps } = await req.json();

        if (!name || !steps || !Array.isArray(steps)) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        const sequenceId = uuidv4();
        const now = Date.now();

        // Transactionish (LibSQL doesn't support full transactions in HTTP mode usually, but we do our best)

        // 1. Create Sequence
        await db.execute({
            sql: `INSERT INTO sequences (id, user_id, name, status, created_at, updated_at)
                  VALUES (?, ?, ?, 'active', ?, ?)`,
            args: [sequenceId, userId, name, now, now]
        });

        // 2. Create Steps
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            await db.execute({
                sql: `INSERT INTO sequence_steps (id, sequence_id, step_order, day_delay, subject, body, created_at)
                      VALUES (?, ?, ?, ?, ?, ?, ?)`,
                args: [uuidv4(), sequenceId, i + 1, step.day_delay || 1, step.subject, step.body, now]
            });
        }

        return NextResponse.json({ id: sequenceId, name, steps_count: steps.length });

    } catch (error) {
        console.error('Create sequence error:', error);
        return NextResponse.json({ error: 'Failed to create sequence' }, { status: 500 });
    }
}
