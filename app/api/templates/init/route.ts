import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { v4 as uuidv4 } from 'uuid';
import { defaultTemplates } from '@/lib/default-templates';

export async function POST() {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Check if user already has templates
        const existing = await db.execute({
            sql: 'SELECT COUNT(*) as count FROM templates WHERE user_id = ?',
            args: [userId]
        });

        const count = existing.rows[0].count as number;

        if (count > 0) {
            return NextResponse.json({ message: 'Templates already exist', count });
        }

        // Add default templates
        const now = Date.now();
        for (const template of defaultTemplates) {
            await db.execute({
                sql: 'INSERT INTO templates (id, user_id, name, subject, body, created_at) VALUES (?, ?, ?, ?, ?, ?)',
                args: [uuidv4(), userId, template.name, template.subject, template.body, now]
            });
        }

        return NextResponse.json({ 
            success: true, 
            message: `Added ${defaultTemplates.length} default templates` 
        });
    } catch (error) {
        console.error('Error initializing templates:', error);
        return NextResponse.json({ error: 'Failed to initialize templates' }, { status: 500 });
    }
}
