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
    console.log('Adding source column to emails table...');

    try {
        await db.execute("ALTER TABLE emails ADD COLUMN source TEXT DEFAULT 'manual'");
        console.log('Added source column');
    } catch (e) {
        console.log('source column already exists or error:', e);
    }

    console.log('Migration complete!');
}

main().catch(console.error);
