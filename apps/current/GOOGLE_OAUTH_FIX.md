# 🔧 Google OAuth "Access Blocked" Error Fix

## The Problem

You're getting this error:
> "Access blocked: Authorization Error - You can't sign in to this app because it doesn't comply with Google's OAuth 2.0 policy for keeping apps secure."

## Root Causes & Solutions

### 1. **OAuth Consent Screen Not Configured** ❌➡️✅

**Problem**: Your Google Cloud Console OAuth app doesn't have a properly configured consent screen.

**Solution**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one)
3. Navigate to **APIs & Services** → **OAuth consent screen**
4. Configure the OAuth consent screen:
   - **User Type**: Select "External" (for personal use/testing)
   - **App name**: Your app name (e.g., "Expense Calendar")
   - **User support email**: Your email
   - **Developer contact information**: Your email
   - **Authorized domains**: Add `localhost` (for development)
5. **SAVE** the consent screen

### 2. **App in "Testing" Status** ❌➡️✅

**Problem**: Your OAuth app is in "Testing" status but you haven't added test users.

**Solution**:
1. In Google Cloud Console, go to **APIs & Services** → **OAuth consent screen**
2. Scroll down to **Test users** section
3. Click **+ ADD USERS**
4. Add your email address: `stoetenremco.RS@gmail.com`
5. **SAVE** the changes

### 3. **Incorrect Redirect URIs** ❌➡️✅

**Problem**: The redirect URI in your OAuth app doesn't match exactly what's in your code.

**Solution**:
1. In Google Cloud Console, go to **APIs & Services** → **Credentials**
2. Find your OAuth 2.0 Client ID and click the edit (pencil) icon
3. Under **Authorized redirect URIs**, add:
   ```
   http://localhost:3000/api/auth/google/callback
   ```
4. Make sure there are no extra spaces or trailing slashes
5. **SAVE** the changes

### 4. **Missing Google Calendar API** ❌➡️✅

**Problem**: The Google Calendar API isn't enabled for your project.

**Solution**:
1. In Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for "Google Calendar API"
3. Click **ENABLE**

### 5. **Environment Variables Check** 🔍

Make sure your `.env.local` file has the correct values:

```bash
# Google OAuth
GOOGLE_CLIENT_ID="your-actual-client-id.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-actual-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
```

## Step-by-Step Fix Process

### Step 1: Configure OAuth Consent Screen
```bash
1. Go to https://console.cloud.google.com/
2. APIs & Services → OAuth consent screen
3. Fill out the form (app name, email, etc.)
4. Add your email as a test user
5. Save
```

### Step 2: Enable Google Calendar API
```bash
1. APIs & Services → Library
2. Search: "Google Calendar API"
3. Click "Enable"
```

### Step 3: Configure OAuth Credentials
```bash
1. APIs & Services → Credentials
2. Click your OAuth 2.0 Client ID
3. Add redirect URI: http://localhost:3000/api/auth/google/callback
4. Save
```

### Step 4: Update Environment Variables
```bash
# In your .env.local file:
GOOGLE_CLIENT_ID="YOUR_CLIENT_ID"
GOOGLE_CLIENT_SECRET="YOUR_CLIENT_SECRET"
```

### Step 5: Test Again
```bash
1. Restart your dev server: npm run dev
2. Try connecting Google Calendar again
3. Should work now!
```

## Verification Commands

### Check OAuth App Status
```bash
# In Google Cloud Console:
1. APIs & Services → OAuth consent screen
2. Verify "Testing" status and test users
3. APIs & Services → Credentials
4. Verify redirect URI is correct
```

### Check Environment Variables
```bash
# In your terminal:
echo $GOOGLE_CLIENT_ID  # Should show your client ID
echo $GOOGLE_CLIENT_SECRET  # Should show your client secret
```

## Common Mistakes to Avoid

❌ **Don't use**: `localhost:3000` in redirect URI (should be `http://localhost:3000`)
❌ **Don't forget**: To enable Google Calendar API
❌ **Don't skip**: Adding yourself as a test user
❌ **Don't use**: Production domains in development

## If Still Not Working

1. **Wait 5-10 minutes** - Google sometimes takes time to propagate changes
2. **Double-check** all URLs match exactly (no trailing slashes, correct protocol)
3. **Try a different Google account** to test
4. **Check browser console** for detailed error messages

## Success Indicators

✅ OAuth consent screen shows "Testing" status
✅ Your email is listed as a test user
✅ Google Calendar API is enabled
✅ Redirect URI matches exactly: `http://localhost:3000/api/auth/google/callback`
✅ Environment variables are set correctly

Once you've completed all these steps, the "Access blocked" error should be resolved! 🎉
