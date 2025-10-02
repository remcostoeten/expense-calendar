# Testing Guide for External Calendar Integration

## Prerequisites

1. Set up your OAuth credentials in `.env.local` (see OAUTH_SETUP.md)
2. Make sure your database is running
3. Start the development server: `npm run dev`

## Basic Functionality Test

### 1. Access the Calendar
- Navigate to `http://localhost:3000/dashboard/calendar`
- You should see the calendar interface

### 2. Connect External Calendars
- In the sidebar, look for "External Calendars" section
- Click the "+" button next to "External Calendars"
- Click "Connect" for Google Calendar
- This will open Google's OAuth consent screen
- Authorize the application
- You should be redirected back to the calendar with a success message

### 3. Toggle External Calendar Visibility
- In the sidebar, under "External Calendars", you should see "Google Calendar"
- It should show as "Connected" with a checkbox
- Click the checkbox to toggle visibility on/off
- When enabled, Google Calendar events should appear in the calendar view

### 4. Create Events and Sync
- Create a new event in your local calendar
- The event should automatically sync to your connected Google Calendar
- Check your Google Calendar to verify the event appears there

## Manual Testing Commands

### Test Database Connection
```bash
npm run db:studio  # Opens Drizzle Studio to view database
```

### Test Provider Connection Status
```bash
# Check if providers are connected in the UI
# Look for the "External Calendars" section in the sidebar
```

### Test Event Creation and Sync
```bash
# 1. Create an event through the UI
# 2. Check if it appears in your external calendar
# 3. Verify the sync worked by checking the logs
```

## Troubleshooting

### OAuth Issues
- Make sure your redirect URIs match exactly in both your OAuth app settings and the code
- Check browser console for OAuth-related errors
- Verify environment variables are loaded

### Sync Issues
- Check the terminal logs for sync-related errors
- Make sure the user has the correct ID (currently hardcoded as 1)
- Verify database connections are working

### UI Issues
- Check browser console for React errors
- Verify all components are rendering correctly
- Test on different screen sizes

## Environment Variables Check

Make sure these are set in `.env.local`:

```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
OUTLOOK_CLIENT_ID=your-outlook-client-id
OUTLOOK_CLIENT_SECRET=your-outlook-client-secret
DATABASE_URL=your-database-url
NEXTAUTH_URL=http://localhost:3000
```

## Success Indicators

✅ Sidebar shows "External Calendars" section
✅ Google Calendar appears as "Connected" when OAuth is completed
✅ Toggle checkbox works for external calendar visibility
✅ Events created locally sync to external calendars
✅ Toast notifications appear for success/error states
✅ No console errors in browser or terminal

## Next Steps

1. Set up real OAuth credentials for Google and Outlook
2. Test with multiple users
3. Add more advanced features like calendar selection
4. Implement real-time sync with webhooks
5. Add comprehensive error handling

