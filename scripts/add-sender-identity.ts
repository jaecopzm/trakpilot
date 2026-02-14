import { createClient } from '@libsql/client';
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
    console.log('Adding sender identity columns...');

    const columns = [
        { name: 'display_name', type: 'TEXT' },
        { name: 'reply_to_email', type: 'TEXT' },
    ];

    for (const col of columns) {
        try {
            await db.execute(`ALTER TABLE user_settings ADD COLUMN ${col.name} ${col.type}`);
            console.log(`Added ${col.name}`);
        } catch (e) {
            console.log(`${col.name} already exists or error:`, e);
        }
    }

    console.log('Migration complete!');
}

main().catch(console.error);
