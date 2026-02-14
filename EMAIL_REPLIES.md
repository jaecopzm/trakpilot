# Email Reply Handling

## How Replies Work

When recipients reply to emails sent through MailTrackr, the reply goes to the **Reply-To Email** address configured in the user's settings.

### Configuration

1. Go to **Dashboard → Settings**
2. Under **Sender Identity**, set your **Reply-To Email**
3. This email will receive all replies from recipients

### Default Behavior

- If no Reply-To email is set, replies go to the sender's primary email from Clerk
- For Resend emails: From shows as "Your Name via MailTrackr <noreply@mailtrackr.zedbeatz.com>"
- Reply-To header ensures replies reach your actual email

### Custom SMTP

If using custom SMTP settings:
- From email: Your configured `from_email`
- Reply-To: Your configured `reply_to_email`
- Full control over sender identity

## Email Templates

Run this script to add default templates for existing users:

```bash
npx tsx scripts/add-default-templates.ts
```

### Available Templates

1. **Follow-up** - For following up on conversations
2. **Introduction** - For introducing yourself
3. **Meeting Request** - For scheduling meetings
4. **Thank You** - For expressing gratitude
5. **Product Update** - For sharing product news
6. **Cold Outreach** - For initial contact

Users can:
- Apply templates when composing emails
- Save current email as a new template
- Manage templates in the compose dialog

## UI Improvements

✅ Fixed compose dialog height issue
✅ Added max-height to textarea with scroll
✅ Send button now always visible
✅ Better responsive layout
