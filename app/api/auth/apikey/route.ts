import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const result = await db.execute({
            sql: 'SELECT key, created_at FROM api_keys WHERE user_id = ?',
            args: [userId]
        });

        if (result.rows.length > 0) {
            return NextResponse.json(result.rows[0]);
        }

        return NextResponse.json({ key: null });
    } catch (error) {
        console.error('Failed to fetch API key:', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        // Generate a random 32-char hex string as the key
        const newKey = 'mt_' + crypto.randomBytes(16).toString('hex');
        const id = uuidv4();
        const now = Date.now();

        // Upsert logic (replace if exists)
        // First delete existing key for user
        await db.execute({
            sql: 'DELETE FROM api_keys WHERE user_id = ?',
            args: [userId]
        });

        // Insert new key
        await db.execute({
            sql: 'INSERT INTO api_keys (id, user_id, key, created_at) VALUES (?, ?, ?, ?)',
            args: [id, userId, newKey, now]
        });

        return NextResponse.json({ key: newKey, created_at: now });
    } catch (error) {
        console.error('Failed to generate API key:', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
