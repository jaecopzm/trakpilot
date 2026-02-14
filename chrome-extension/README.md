# MailTrackr Chrome Extension

Email tracking extension for Gmail that integrates with the MailTrackr platform.

## Features

- 📧 **One-Click Tracking** - Add tracking pixels to emails with a single click
- 📊 **Real-Time Analytics** - See opens, device info, and location data
- 🔄 **Auto-Sync** - Syncs tracked emails with your MailTrackr dashboard
- ⚙️ **Auto-Track Mode** - Automatically enable tracking for all emails
- 🎨 **Clean UI** - Beautiful, non-intrusive interface in Gmail

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file:

```env
PLASMO_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key_here
```

### 3. Run Development Server

```bash
npm run dev
```

### 4. Load Extension in Chrome

1. Open `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select `build/chrome-mv3-dev` directory

### 5. Sign In

1. Click the extension icon
2. Click "Open Dashboard" or go to extension options
3. Sign in with your MailTrackr account
4. The extension will now sync with your account

## Usage

### Track an Email

1. Open Gmail and compose a new email
2. Look for the "Track Email" button in the compose toolbar
3. Click to enable tracking (button turns blue)
4. Send your email normally
5. View tracking data in the extension popup or dashboard

### View Tracked Emails

- Click the extension icon to see recent tracked emails
- Click "Sync" to refresh data from server
- Click "View Full Dashboard" for detailed analytics

### Settings

Right-click extension icon → Options to configure:

- **API Endpoint** - Your MailTrackr server URL
- **Auto-Track** - Enable tracking by default for all emails

## Building for Production

```bash
npm run build
```

The production build will be in `build/chrome-mv3-prod`.

### Package for Distribution

```bash
npm run package
```

Creates a `.zip` file ready for Chrome Web Store submission.

## Architecture

- **Content Script** (`content.tsx`) - Injects tracking button into Gmail compose windows
- **Background Worker** (`background.ts`) - Handles API calls and data storage
- **Popup** (`popup.tsx`) - Shows tracked emails list
- **Options Page** (`options.tsx`) - Extension settings and configuration

## API Integration

The extension communicates with the MailTrackr API:

- `POST /api/emails` - Create tracking pixel
- `GET /api/emails` - Fetch tracked emails
- `GET /api/track?id=xxx` - Tracking pixel endpoint

Authentication is handled via Clerk session cookies.

## Development

Built with:
- [Plasmo](https://docs.plasmo.com/) - Browser extension framework
- React + TypeScript
- Tailwind CSS
- Plasmo Storage API
- Lucide React Icons

## Troubleshooting

**Extension not loading?**
- Make sure dev server is running (`npm run dev`)
- Reload extension in `chrome://extensions/`

**Tracking not working?**
- Check that you're signed in to MailTrackr
- Verify API URL in extension options
- Check browser console for errors

**Styles not applying?**
- Tailwind uses `plasmo-` prefix for all classes
- Rebuild extension after style changes

## License

MIT
