import 'dotenv/config';
import { db } from '../lib/db';
import { v4 as uuidv4 } from 'uuid';

const defaultTemplates = [
  {
    name: 'Follow-up',
    subject: 'Following up on our conversation',
    body: `<p>Hi there,</p>

<p>I wanted to follow up on our previous conversation. I hope this message finds you well.</p>

<p>I'd love to hear your thoughts on what we discussed. Please let me know if you have any questions or if there's anything I can help clarify.</p>

<p>Looking forward to hearing from you!</p>

<p>Best regards</p>`
  },
  {
    name: 'Introduction',
    subject: 'Nice to meet you!',
    body: `<p>Hello,</p>

<p>I hope this email finds you well. I wanted to reach out and introduce myself.</p>

<p>I'm excited about the possibility of working together and would love to schedule a time to chat further about how we can collaborate.</p>

<p>Would you be available for a quick call this week?</p>

<p>Best regards</p>`
  },
  {
    name: 'Meeting Request',
    subject: 'Let\'s schedule a meeting',
    body: `<p>Hi,</p>

<p>I hope you're doing well. I'd like to schedule a meeting to discuss our upcoming project.</p>

<p>Would any of the following times work for you?</p>
<ul>
  <li>Monday at 2 PM</li>
  <li>Wednesday at 10 AM</li>
  <li>Friday at 3 PM</li>
</ul>

<p>Please let me know what works best for your schedule.</p>

<p>Thanks!</p>`
  },
  {
    name: 'Thank You',
    subject: 'Thank you!',
    body: `<p>Hi,</p>

<p>I wanted to take a moment to thank you for your time and consideration.</p>

<p>I really appreciate the opportunity to connect with you, and I'm excited about the potential to work together.</p>

<p>Please don't hesitate to reach out if you have any questions or need anything from me.</p>

<p>Best regards</p>`
  },
  {
    name: 'Product Update',
    subject: 'Exciting updates from our team',
    body: `<p>Hello,</p>

<p>We're excited to share some updates with you!</p>

<p>We've been working hard on improving our product, and we think you'll love what we've built. Here are some highlights:</p>

<ul>
  <li><b>New Feature:</b> Enhanced analytics dashboard</li>
  <li><b>Improvement:</b> Faster load times</li>
  <li><b>Bug Fix:</b> Resolved email tracking issues</li>
</ul>

<p>Check it out and let us know what you think!</p>

<p>Cheers</p>`
  },
  {
    name: 'Cold Outreach',
    subject: 'Quick question for you',
    body: `<p>Hi,</p>

<p>I came across your profile and was impressed by your work in [industry/field].</p>

<p>I'm reaching out because I think there might be an opportunity for us to collaborate. We're working on [brief description] and I believe your expertise would be valuable.</p>

<p>Would you be open to a brief conversation to explore this further?</p>

<p>Looking forward to connecting!</p>

<p>Best</p>`
  }
];

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
