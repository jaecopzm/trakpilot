import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
    console.error('Missing TURSO_DATABASE_URL');
    process.exit(1);
}

const db = createClient({
    url,
    authToken,
});

async function main() {
    console.log('Migrating database for roadmap features...');

    // 1. Create links table
    await db.execute(`
    CREATE TABLE IF NOT EXISTS links (
      id TEXT PRIMARY KEY,
      email_id TEXT NOT NULL,
      original_url TEXT NOT NULL,
      short_code TEXT NOT NULL UNIQUE,
      created_at INTEGER NOT NULL
    );
  `);

    // 2. Create link_clicks table
    await db.execute(`
    CREATE TABLE IF NOT EXISTS link_clicks (
      id TEXT PRIMARY KEY,
      link_id TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      location TEXT,
      clicked_at INTEGER NOT NULL
    );
  `);

    // 3. Create email_templates table
    await db.execute(`
    CREATE TABLE IF NOT EXISTS email_templates (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      subject TEXT,
      body TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);

    // 4. Update emails table
    console.log('Checking for new columns in emails table...');
    const newColumns = [
        { name: 'status', type: 'TEXT DEFAULT "sent"' },
        { name: 'scheduled_at', type: 'INTEGER' },
        { name: 'error_message', type: 'TEXT' }
    ];

    for (const col of newColumns) {
        try {
            await db.execute(`ALTER TABLE emails ADD COLUMN ${col.name} ${col.type}`);
            console.log(`Added ${col.name} column to emails table`);
        } catch (e) {
            console.log(`Column ${col.name} might already exist or error: `, (e as Error).message);
        }
    }

    console.log('Migration complete!');
}

main().catch(console.error).finally(() => db.close());
