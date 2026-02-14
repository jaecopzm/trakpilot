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
  console.log('Migrating database...');

  await db.execute(`
    CREATE TABLE IF NOT EXISTS emails (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL, 
      recipient TEXT NOT NULL,
      subject TEXT,
      created_at INTEGER NOT NULL,
      opened_at INTEGER,
      open_count INTEGER DEFAULT 0
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS opens (
      id TEXT PRIMARY KEY,
      email_id TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      location TEXT,
      device_type TEXT,
      opened_at INTEGER
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS user_settings (
      user_id TEXT PRIMARY KEY,
      slack_webhook_url TEXT,
      is_premium INTEGER DEFAULT 0,
      smtp_host TEXT,
      smtp_port INTEGER,
      smtp_user TEXT,
      smtp_pass TEXT,
      from_email TEXT
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      key TEXT NOT NULL UNIQUE,
      created_at INTEGER
    );
  `);

  console.log('Migration complete!');
}

main().catch(console.error);
