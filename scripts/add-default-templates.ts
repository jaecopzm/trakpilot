import 'dotenv/config';
import { db } from '../lib/db';
import { v4 as uuidv4 } from 'uuid';
import { defaultTemplates } from '../lib/default-templates';

async function addDefaultTemplates() {
  try {
    console.log('Adding default templates...');

    // Get current user from Clerk or use a test query
    const emailsResult = await db.execute('SELECT DISTINCT user_id FROM emails LIMIT 1');
    
    let userIds: string[] = [];
    
    if (emailsResult.rows.length > 0) {
      userIds.push(emailsResult.rows[0].user_id as string);
    } else {
      // Try user_settings
      const settingsResult = await db.execute('SELECT DISTINCT user_id FROM user_settings');
      userIds = settingsResult.rows.map(row => row.user_id as string);
    }

    if (userIds.length === 0) {
      console.log('No users found. Templates will be added when users sign up.');
      console.log('You can also manually add your Clerk user ID to test.');
      return;
    }

    for (const userId of userIds) {
      // Check if user already has templates
      const existingTemplates = await db.execute({
        sql: 'SELECT COUNT(*) as count FROM templates WHERE user_id = ?',
        args: [userId]
      });
      
      const count = existingTemplates.rows[0].count as number;
      
      if (count > 0) {
        console.log(`User ${userId} already has ${count} templates, skipping...`);
        continue;
      }

      // Add default templates for this user
      for (const template of defaultTemplates) {
        await db.execute({
          sql: 'INSERT INTO templates (id, user_id, name, subject, body, created_at) VALUES (?, ?, ?, ?, ?, ?)',
          args: [uuidv4(), userId, template.name, template.subject, template.body, Date.now()]
        });
      }
      
      console.log(`✅ Added ${defaultTemplates.length} templates for user ${userId}`);
    }

    console.log('✅ Default templates added successfully!');
  } catch (error) {
    console.error('Error adding default templates:', error);
  }
}

addDefaultTemplates();
