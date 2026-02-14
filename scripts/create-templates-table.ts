import 'dotenv/config';
import { db } from '../lib/db';

async function createTemplatesTable() {
  try {
    console.log('Creating templates table...');
    
    await db.execute(`
      CREATE TABLE IF NOT EXISTS templates (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        subject TEXT,
        body TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )
    `);
    
    console.log('✅ Templates table created successfully!');
  } catch (error) {
    console.error('Error creating templates table:', error);
  }
}

createTemplatesTable();
