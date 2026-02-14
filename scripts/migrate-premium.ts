import { db } from '../lib/db';

async function migrate() {
  console.log('Running premium features migration...');

  try {
    // Add is_premium column to user_settings
    await db.execute(`
      ALTER TABLE user_settings 
      ADD COLUMN IF NOT EXISTS is_premium INTEGER DEFAULT 0
    `);

    // Add SMTP settings columns
    await db.execute(`
      ALTER TABLE user_settings 
      ADD COLUMN IF NOT EXISTS smtp_host TEXT,
      ADD COLUMN IF NOT EXISTS smtp_port INTEGER,
      ADD COLUMN IF NOT EXISTS smtp_user TEXT,
      ADD COLUMN IF NOT EXISTS smtp_pass TEXT,
      ADD COLUMN IF NOT EXISTS from_email TEXT
    `);

    console.log('✅ Premium features migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

migrate();
