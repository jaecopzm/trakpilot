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
    console.log('Ensuring all columns exist...');

    const columnUpdates = [
        { table: 'emails', name: 'heat_score', type: 'INTEGER DEFAULT 0' },
        { table: 'emails', name: 'summary', type: 'TEXT' },
        { table: 'opens', name: 'is_proxy', type: 'INTEGER DEFAULT 0' },
        { table: 'user_settings', name: 'custom_domain', type: 'TEXT' },
        { table: 'user_settings', name: 'is_premium', type: 'INTEGER DEFAULT 0' },
    ];

    for (const col of columnUpdates) {
        try {
            await db.execute(`ALTER TABLE ${col.table} ADD COLUMN ${col.name} ${col.type}`);
            console.log(`Added ${col.name} column to ${col.table} table`);
        } catch (e) {
            console.log(`Column ${col.name} in ${col.table} might already exist`);
        }
    }

    console.log('Fix complete!');
}

main().catch(console.error).finally(() => db.close());
