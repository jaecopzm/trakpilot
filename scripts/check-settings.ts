import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const db = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN
});

async function main() {
    const result = await db.execute('SELECT user_id, display_name, reply_to_email FROM user_settings');
    console.log('Current settings:', result.rows);
}

main().catch(console.error);
