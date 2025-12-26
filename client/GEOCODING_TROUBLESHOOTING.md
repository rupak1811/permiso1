# Geocoding API Troubleshooting Guide

If you're seeing the error: **"Geocoding request denied. Please check API key permissions"**, follow these steps:

## Quick Fix Steps

### 1. Enable Geocoding API in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** > **Library**
4. Search for **"Geocoding API"**
5. Click on **Geocoding API**
6. Click **"Enable"** button
7. Wait a few seconds for it to activate

### 2. Check API Key Restrictions

1. Go to **APIs & Services** > **Credentials**
2. Click on your API key
3. Under **"API restrictions"**, make sure:
   - Either **"Don't restrict key"** is selected, OR
   - **"Restrict key"** is selected AND **Geocoding API** is in the allowed list
4. Click **"Save"**

### 3. Verify Required APIs are Enabled

Make sure these APIs are enabled in your project:
- ✅ **Maps JavaScript API** (for the map display)
- ✅ **Geocoding API** (for address lookup) - **THIS IS THE ONE YOU'RE MISSING**

### 4. Check Billing

- Even with free tier, billing must be enabled in Google Cloud Console
- Go to **Billing** and ensure a billing account is linked (you won't be charged for free tier usage)

### 5. Restart Development Server

After making changes:
1. Stop your development server (Ctrl+C)
2. Run `npm start` again
3. Clear browser cache (Ctrl+Shift+Delete) or use Incognito mode

## Common Issues

### Issue: "REQUEST_DENIED" Error
**Solution**: Enable Geocoding API (see step 1 above)

### Issue: "OVER_QUERY_LIMIT" Error
**Solution**: You've exceeded the free tier quota. Wait 24 hours or upgrade your plan.

### Issue: Map loads but geocoding doesn't work
**Solution**: 
- Check that Geocoding API is enabled (not just Maps JavaScript API)
- Verify API key has access to Geocoding API in restrictions

### Issue: Works in one browser but not another
**Solution**: Clear browser cache or check if browser extensions are blocking requests

## Testing Your Setup

1. Open browser DevTools (F12)
2. Go to Console tab
3. Click on the map
4. Check for any error messages
5. Look for API-related errors

## Manual Entry Fallback

If geocoding continues to fail, you can still:
- Click on the map to set coordinates
- Manually enter address, city, state, zip code, and country in the form fields below
- The coordinates will still be saved with your project

## Still Having Issues?

1. **Double-check API key**: Make sure it's correct in your `.env` file
2. **Check API status**: Go to Google Cloud Console > APIs & Services > Dashboard
3. **Review API usage**: Check if you're hitting any quotas
4. **Try a new API key**: Create a fresh API key with proper permissions

## API Key Setup Reminder

Your `.env` file in the `client` directory should contain:
```
REACT_APP_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

**Important**: Never commit your `.env` file to version control!

