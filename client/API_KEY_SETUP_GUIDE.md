# Google Maps API Key Setup - Step by Step Guide

## 📍 Where to Get the API Key

### Step 1: Go to Google Cloud Console
1. Visit: **https://console.cloud.google.com/**
2. Sign in with your Google account

### Step 2: Create or Select a Project
1. Click on the **project dropdown** at the top (next to "Google Cloud")
2. Click **"New Project"**
3. Enter a project name (e.g., "Permiso Platform" or "My Maps Project")
4. Click **"Create"**
5. Wait a few seconds, then select your new project from the dropdown

### Step 3: Enable Billing (Required - But Free Tier Available)
1. Go to **"Billing"** in the left menu
2. Click **"Link a billing account"**
3. Follow the prompts to add a payment method
   - **Don't worry!** Google gives $200 free credit per month
   - You won't be charged unless you exceed the free tier
   - For this project, you'll likely stay within free limits

### Step 4: Enable Required APIs
1. Go to **"APIs & Services"** > **"Library"** (in the left menu)
2. Search for and enable these APIs one by one:

   **a) Maps JavaScript API:**
   - Search: "Maps JavaScript API"
   - Click on it
   - Click the **"Enable"** button
   - Wait for it to activate

   **b) Geocoding API:**
   - Search: "Geocoding API"
   - Click on it
   - Click the **"Enable"** button
   - Wait for it to activate

### Step 5: Create API Key
1. Go to **"APIs & Services"** > **"Credentials"** (in the left menu)
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"API key"**
4. Your API key will be created and displayed
5. **Copy the API key** (it looks like: `AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

### Step 6: (Optional but Recommended) Restrict API Key
1. Click on your newly created API key to edit it
2. Under **"Application restrictions"**:
   - Select **"HTTP referrers (web sites)"**
   - Click **"Add an item"**
   - Add: `localhost:3000/*`
   - Add: `127.0.0.1:3000/*`
   - (For production, add your domain like: `yourdomain.com/*`)
3. Under **"API restrictions"**:
   - Select **"Restrict key"**
   - Check these APIs:
     - ✅ Maps JavaScript API
     - ✅ Geocoding API
4. Click **"Save"**

---

## 📁 Where to Put the API Key

### Step 1: Create .env File
1. Navigate to the `client` folder in your project
2. Create a new file named `.env` (with the dot at the beginning)
   - If you're using Windows and can't create a file starting with a dot:
     - Create a file named `env` first
     - Then rename it to `.env` (you may need to do this in command line or a code editor)

### Step 2: Add Your API Key
1. Open the `.env` file in a text editor
2. Add this line (replace with your actual API key):
   ```
   REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
3. **Important**: 
   - No spaces around the `=` sign
   - No quotes around the API key
   - Replace `AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` with your actual key

### Step 3: Example .env File
Your `.env` file should look like this:
```
REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 4: Restart Development Server
1. **Stop** your development server (press `Ctrl+C` in the terminal)
2. **Start** it again with `npm start`
3. The API key will now be loaded

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Google Cloud project created
- [ ] Billing account linked (even if using free tier)
- [ ] Maps JavaScript API enabled
- [ ] Geocoding API enabled
- [ ] API key created and copied
- [ ] `.env` file created in `client` folder
- [ ] API key added to `.env` file (no quotes, no spaces)
- [ ] Development server restarted

---

## 🧪 Test It

1. Open your project in the browser
2. Go to "Create Project" or "Upload Project" page
3. You should see a map
4. Click on the map - it should place a marker
5. Address fields should auto-fill

---

## ⚠️ Important Notes

1. **Never commit `.env` to Git**
   - The `.env` file should be in `.gitignore`
   - Never share your API key publicly

2. **Free Tier Limits**
   - $200 free credit per month
   - Maps: ~28,000 loads/month free
   - Geocoding: ~40,000 requests/month free
   - For development, you'll likely never exceed this

3. **If Map Doesn't Load**
   - Check browser console (F12) for errors
   - Verify API key is correct
   - Make sure APIs are enabled
   - Restart development server

---

## 🆘 Troubleshooting

**Problem**: Map shows "Error loading map"
- **Solution**: Check that API key is correct and Maps JavaScript API is enabled

**Problem**: "Geocoding request denied"
- **Solution**: Enable Geocoding API in Google Cloud Console

**Problem**: API key not working after adding to .env
- **Solution**: Restart development server (stop and start again)

**Problem**: Can't create .env file
- **Solution**: Use command line: `touch .env` (Mac/Linux) or `type nul > .env` (Windows)

---

## 📞 Need Help?

If you're still having issues:
1. Check browser console (F12) for specific error messages
2. Verify all steps above are completed
3. Make sure you restarted the development server
4. Check that your API key has no extra spaces or quotes

