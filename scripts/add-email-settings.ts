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
    console.log('Adding email settings columns...');

    try {
        await db.execute("ALTER TABLE user_settings ADD COLUMN is_premium INTEGER DEFAULT 0");
        console.log('Added is_premium');
    } catch (e) {
        console.log('is_premium already exists or error:', e);
    }

    try {
        await db.execute("ALTER TABLE user_settings ADD COLUMN smtp_host TEXT");
        console.log('Added smtp_host');
    } catch (e) {
        console.log('smtp_host already exists or error:', e);
    }

    try {
        await db.execute("ALTER TABLE user_settings ADD COLUMN smtp_port INTEGER");
        console.log('Added smtp_port');
    } catch (e) {
        console.log('smtp_port already exists or error:', e);
    }

    try {
        await db.execute("ALTER TABLE user_settings ADD COLUMN smtp_user TEXT");
        console.log('Added smtp_user');
    } catch (e) {
        console.log('smtp_user already exists or error:', e);
    }

    try {
        await db.execute("ALTER TABLE user_settings ADD COLUMN smtp_pass TEXT");
        console.log('Added smtp_pass');
    } catch (e) {
        console.log('smtp_pass already exists or error:', e);
    }

    try {
        await db.execute("ALTER TABLE user_settings ADD COLUMN from_email TEXT");
        console.log('Added from_email');
    } catch (e) {
        console.log('from_email already exists or error:', e);
    }

    console.log('Migration complete!');
}

main().catch(console.error);
