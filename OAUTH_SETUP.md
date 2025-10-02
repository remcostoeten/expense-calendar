# OAuth Setup Guide

## Environment Variables Required

Add these environment variables to your `.env.local` file:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/expense_calendar"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
# Note: GOOGLE_REDIRECT_URI will be auto-configured as http://localhost:3000/api/auth/google/callback

# Outlook/Microsoft OAuth
OUTLOOK_CLIENT_ID="2eecd07c-7f93-400f-8f0e-5ed1fa373355"
OUTLOOK_CLIENT_SECRET="tvc8Q~ZtJjhvP4qB25~R8ua2PBmmDcziwWmwDb.2"
OUTLOOK_REDIRECT_URI="http://localhost:3000/api/auth/outlook/callback"

# Apple Calendar (App-Specific Password)
APPLE_CLIENT_ID="your-apple-id@icloud.com"
APPLE_CLIENT_SECRET="your-app-specific-password"
APPLE_REDIRECT_URI="http://localhost:3000/api/auth/apple/callback"
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Calendar API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure OAuth consent screen
6. Add your redirect URI: `http://localhost:3000/api/auth/google/callback`
7. Copy Client ID and Client Secret to environment variables

## Outlook/Microsoft OAuth Setup

1. Go to [Azure Portal](https://portal.azure.com/)
2. Register a new application
3. Add "Calendars.ReadWrite" permission
4. Add redirect URI: `http://localhost:3000/api/auth/outlook/callback`
5. Copy Application (client) ID and Client Secret

## Apple Calendar Setup

Apple Calendar uses app-specific passwords rather than OAuth:

1. Go to [Apple ID settings](https://appleid.apple.com/)
2. Generate an app-specific password for your application
3. Use your Apple ID email as `APPLE_CLIENT_ID`
4. Use the app-specific password as `APPLE_CLIENT_SECRET`

## Usage

1. Set up your OAuth credentials in `.env.local`
2. Start the development server: `npm run dev`
3. Navigate to `/dashboard/calendar`
4. Click "Connect Calendars" in the sidebar
5. Connect your external calendar providers
6. Toggle visibility of external calendars in the sidebar

## Troubleshooting

- Make sure redirect URIs exactly match what's in your OAuth app settings
- Check browser console for any OAuth-related errors
- Verify that environment variables are loaded correctly
