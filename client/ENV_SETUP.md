# Environment Variables Setup Guide

## 📁 Creating Your .env File

### Step 1: Create .env File
1. Navigate to the `client` folder in your project
2. Create a new file named `.env` (with the dot at the beginning)
   - **Windows**: You may need to create it via command line or your code editor
   - **Command line**: `type nul > .env` (Windows) or `touch .env` (Mac/Linux)

### Step 2: Add Environment Variables
Open the `.env` file and add the following variables:

```env
# Google Maps API Key (Required for map features)
# Get your API key from: https://console.cloud.google.com/
# See API_KEY_SETUP_GUIDE.md for detailed instructions
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# API URL (Backend server URL)
# For local development: http://localhost:5000
# For production: your production API URL
REACT_APP_API_URL=http://localhost:5000

# Demo Mode (Optional)
# Set to 'true' to enable demo mode without backend connection
# Set to 'false' or leave empty for normal mode
REACT_APP_DEMO_MODE=false
```

### Step 3: Replace Placeholder Values
Replace the placeholder values with your actual values:

1. **REACT_APP_GOOGLE_MAPS_API_KEY**: 
   - Get from Google Cloud Console
   - See `API_KEY_SETUP_GUIDE.md` for detailed steps
   - Example: `REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

2. **REACT_APP_API_URL**:
   - For local development: `http://localhost:5000`
   - For production: Your production backend URL
   - Example: `REACT_APP_API_URL=https://api.yourdomain.com`

3. **REACT_APP_DEMO_MODE** (Optional):
   - Set to `true` for demo mode
   - Set to `false` for normal mode
   - Example: `REACT_APP_DEMO_MODE=false`

### Step 4: Restart Development Server
**Important**: After creating or modifying the `.env` file:
1. **Stop** your development server (press `Ctrl+C` in the terminal)
2. **Start** it again with `npm start`
3. The environment variables will now be loaded

---

## ✅ Example .env File

Here's a complete example `.env` file:

```env
REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
REACT_APP_API_URL=http://localhost:5000
REACT_APP_DEMO_MODE=false
```

---

## 🔒 Security Notes

1. **Never commit `.env` to Git**
   - The `.env` file is already in `.gitignore`
   - Never share your API keys publicly
   - Never push `.env` to version control

2. **API Key Restrictions**
   - Restrict your Google Maps API key to specific domains
   - Use HTTP referrer restrictions in Google Cloud Console
   - For production, restrict to your domain only

3. **Environment-Specific Files**
   - `.env` - Local development (not committed)
   - `.env.local` - Local overrides (not committed)
   - `.env.production` - Production variables (if needed)

---

## 🧪 Testing Your Setup

After setting up your `.env` file:

1. **Restart your development server**
2. **Check the browser console** (F12) for any errors
3. **Test map functionality**:
   - Go to "Create Project" or "Upload Project" page
   - You should see a map
   - Click on the map - it should place a marker
   - Address fields should auto-fill

---

## 🆘 Troubleshooting

**Problem**: Environment variables not working
- **Solution**: Make sure you restarted the development server after creating/modifying `.env`

**Problem**: API key not found
- **Solution**: Check that the variable name is exactly `REACT_APP_GOOGLE_MAPS_API_KEY` (case-sensitive)

**Problem**: Can't create .env file
- **Solution**: Use command line: `type nul > .env` (Windows) or `touch .env` (Mac/Linux)

**Problem**: Map not loading
- **Solution**: 
  - Verify API key is correct
  - Check browser console for errors
  - Make sure Maps JavaScript API is enabled in Google Cloud Console

---

## 📝 Required vs Optional Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `REACT_APP_GOOGLE_MAPS_API_KEY` | ✅ Yes | For map features and geocoding |
| `REACT_APP_API_URL` | ⚠️ Recommended | Backend API URL (defaults to localhost:5000) |
| `REACT_APP_DEMO_MODE` | ❌ No | Enable demo mode (defaults to false) |

---

## 🔗 Related Documentation

- **Google Maps API Setup**: See `API_KEY_SETUP_GUIDE.md`
- **Geocoding Issues**: See `GEOCODING_TROUBLESHOOTING.md`

