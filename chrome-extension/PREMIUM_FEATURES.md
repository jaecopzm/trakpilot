# MailTrackr Premium Features

## Overview
Premium features added to the Chrome extension to provide advanced email tracking and sending capabilities.

## Premium Features

### 1. **Send Emails from Extension** 📧
- Compose and send emails directly from the extension
- Automatic tracking pixel insertion
- Full HTML email support
- Accessible via `compose.html` page
- **API Endpoint**: `POST /api/emails/send`

### 2. **Email Templates** 📝
- Create, edit, and delete email templates
- Quick-use templates for common emails
- Stored locally using Plasmo Storage
- Accessible via `templates.html` page
- Templates can be used in compose window

### 3. **Custom SMTP Configuration** ⚙️
- Use your own SMTP server
- Configure in user settings
- Falls back to default SMTP if not configured
- Secure credential storage in database

### 4. **Premium Badge & UI** 👑
- Crown icon for premium users
- Premium-only buttons in popup
- Upgrade prompts for free users
- Gradient premium styling

## Database Schema Updates

```sql
ALTER TABLE user_settings 
ADD COLUMN is_premium INTEGER DEFAULT 0,
ADD COLUMN smtp_host TEXT,
ADD COLUMN smtp_port INTEGER,
ADD COLUMN smtp_user TEXT,
ADD COLUMN smtp_pass TEXT,
ADD COLUMN from_email TEXT;
```

Run migration:
```bash
npm run tsx scripts/migrate-premium.ts
```

## API Endpoints

### Send Email (Premium)
```
POST /api/emails/send
```

**Request Body:**
```json
{
  "to": "recipient@example.com",
  "subject": "Email subject",
  "body": "<p>HTML email body</p>",
  "track": true
}
```

**Response:**
```json
{
  "success": true,
  "trackingId": "uuid",
  "message": "Email sent successfully"
}
```

### Check Premium Status
```
GET /api/settings
```

**Response:**
```json
{
  "is_premium": true,
  "smtp_host": "smtp.gmail.com",
  ...
}
```

## Extension Pages

### 1. Compose Page (`compose.tsx`)
- Full email composer
- To, Subject, Body fields
- Track email checkbox
- Send button with loading states
- Error handling

### 2. Templates Page (`templates.tsx`)
- Template CRUD operations
- Grid layout of saved templates
- Use, Edit, Delete actions
- Local storage persistence

### 3. Enhanced Popup (`popup.tsx`)
- Premium status indicator
- Quick access buttons (Compose, Templates)
- Upgrade prompt for free users
- Premium badge display

## Environment Variables

Add to `.env.local`:
```env
# Default SMTP (if user doesn't configure custom)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
```

## Usage Flow

### For Premium Users:
1. Click extension icon
2. See "Compose" and "Templates" buttons
3. Click "Compose" to send email directly
4. Click "Templates" to manage templates
5. Use templates in compose window

### For Free Users:
1. Click extension icon
2. See upgrade prompt
3. Click "View Plans" to upgrade
4. After upgrade, premium features unlock

## Testing Premium Features

1. **Enable Premium for Test User:**
```sql
UPDATE user_settings 
SET is_premium = 1 
WHERE user_id = 'your-clerk-user-id';
```

2. **Test Email Sending:**
- Open extension popup
- Click "Compose"
- Fill in email details
- Click "Send Email"

3. **Test Templates:**
- Click "Templates" in popup
- Create a new template
- Use template in compose window

## Security Considerations

- SMTP credentials encrypted in database
- Premium status checked server-side
- Email sending rate-limited per user
- Tracking pixels use secure UUIDs
- All API calls require authentication

## Future Premium Features (Ideas)

- 📊 Advanced analytics dashboard
- 📅 Email scheduling
- 🔄 Email sequences/drip campaigns
- 📎 File attachments
- 👥 Contact management
- 📈 A/B testing for emails
- 🔔 Real-time open notifications
- 🎨 Email template marketplace
- 📧 Bulk email sending
- 🤖 AI-powered email suggestions

## Pricing Tiers (Suggested)

**Free Tier:**
- Basic email tracking
- Up to 50 tracked emails/month
- Gmail integration

**Premium Tier ($9.99/month):**
- Unlimited tracking
- Send emails from extension
- Email templates
- Custom SMTP
- Priority support

**Pro Tier ($29.99/month):**
- Everything in Premium
- Email scheduling
- Advanced analytics
- Team collaboration
- API access
