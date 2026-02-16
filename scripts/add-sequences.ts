import { createClient } from '@libsql/client';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
    console.error('Missing TURSO_DATABASE_URL');
    process.exit(1);
}

const db = createClient({ url, authToken });

async function main() {
    console.log('Adding Sequences tables...');

    try {
        // 1. Sequences Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS sequences (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                name TEXT NOT NULL,
                status TEXT DEFAULT 'active', -- active, paused, archived
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            );
        `);
        console.log('Created sequences table');

        // 2. Sequence Steps Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS sequence_steps (
                id TEXT PRIMARY KEY,
                sequence_id TEXT NOT NULL,
                step_order INTEGER NOT NULL,
                day_delay INTEGER NOT NULL, -- Days after previous step (or enrollment if step 1)
                subject TEXT,
                body TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                FOREIGN KEY(sequence_id) REFERENCES sequences(id) ON DELETE CASCADE
            );
        `);
        console.log('Created sequence_steps table');

        // 3. Sequence Enrollments
        // Tracks a specific recipient's journey through a sequence
        await db.execute(`
            CREATE TABLE IF NOT EXISTS sequence_enrollments (
                id TEXT PRIMARY KEY,
                sequence_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                recipient_email TEXT NOT NULL,
                status TEXT DEFAULT 'active', -- active, completed, cancelled, replied
                current_step INTEGER DEFAULT 0, -- 0 = Not started, 1 = Step 1 sent, etc.
                next_step_due INTEGER, -- Timestamp when next step should run
                last_email_id TEXT, -- tracking the last email sent for reply checks
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                FOREIGN KEY(sequence_id) REFERENCES sequences(id) ON DELETE CASCADE
            );
        `);
        console.log('Created sequence_enrollments table');

        // Add index for the cron job to find due steps quickly
        await db.execute(`CREATE INDEX IF NOT EXISTS idx_enrollments_due ON sequence_enrollments(status, next_step_due)`);
        console.log('Created index on enrollments');

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

main();
