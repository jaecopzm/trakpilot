import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const result = await db.execute({
            sql: 'SELECT * FROM templates WHERE user_id = ? ORDER BY created_at DESC',
            args: [userId]
        });
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching templates:', error);
        return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { id, name, subject, body: templateBody } = body;

        if (!name || !templateBody) {
            return NextResponse.json({ error: 'Name and body are required' }, { status: 400 });
        }

        const now = Date.now();

        if (id) {
            // Update existing
            await db.execute({
                sql: `UPDATE templates SET name = ?, subject = ?, body = ? WHERE id = ? AND user_id = ?`,
                args: [name, subject || '', templateBody, id, userId]
            });
            return NextResponse.json({ id, name, subject, body: templateBody });
        } else {
            // Create new
            const newId = uuidv4();
            await db.execute({
                sql: `INSERT INTO templates (id, user_id, name, subject, body, created_at)
                      VALUES (?, ?, ?, ?, ?, ?)`,
                args: [newId, userId, name, subject || '', templateBody, now]
            });
            return NextResponse.json({ id: newId, name, subject, body: templateBody, created_at: now });
        }
    } catch (error) {
        console.error('Error saving template:', error);
        return NextResponse.json({ error: 'Failed to save template' }, { status: 500 });
    }
}
