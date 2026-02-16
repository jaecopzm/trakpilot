import { db } from '../lib/db';

async function addEmailLimits() {
  try {
    console.log('Adding email limit columns...');
    
    await db.execute(`
      ALTER TABLE user_settings 
      ADD COLUMN emails_sent_this_month INTEGER DEFAULT 0
    `);
    
    await db.execute(`
      ALTER TABLE user_settings 
      ADD COLUMN last_reset_date INTEGER DEFAULT 0
    `);
    
    console.log('✅ Email limit columns added successfully');
  } catch (error: any) {
    if (error.message?.includes('duplicate column')) {
      console.log('Columns already exist');
    } else {
      console.error('Error:', error);
    }
  }
}

addEmailLimits();
