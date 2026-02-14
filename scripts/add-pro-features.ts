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
    console.log('Adding Pro features to database...');

    // 1. Add custom_domain to user_settings
    try {
        await db.execute(`ALTER TABLE user_settings ADD COLUMN custom_domain TEXT`);
        console.log('Added custom_domain column to user_settings');
    } catch (e) {
        console.log('custom_domain column might already exist');
    }

    // 2. Create unsubscribes table
    await db.execute(`
    CREATE TABLE IF NOT EXISTS unsubscribes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      email TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      UNIQUE(user_id, email)
    );
  `);
    console.log('Created unsubscribes table');

    console.log('Pro features migration complete!');
}

main().catch(console.error);
