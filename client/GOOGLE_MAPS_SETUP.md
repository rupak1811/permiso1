# Google Maps API Setup

This application uses Google Maps API for location selection in project creation. Follow these steps to set it up:

## Steps to Get Google Maps API Key

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project (or select existing)**
   - Click on the project dropdown at the top
   - Click "New Project"
   - Enter a project name (e.g., "Permiso Platform")
   - Click "Create"

3. **Enable Required APIs**
   - Go to "APIs & Services" > "Library"
   - Search for and enable:
     - **Maps JavaScript API**
     - **Geocoding API**
     - **Places API** (optional, for enhanced features)

4. **Create API Key**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key

5. **Restrict API Key (Recommended for Production)**
   - Click on your API key to edit it
   - Under "Application restrictions", select "HTTP referrers"
   - Add your domain (e.g., `localhost:3000/*`, `yourdomain.com/*`)
   - Under "API restrictions", restrict to:
     - Maps JavaScript API
     - Geocoding API
   - Click "Save"

6. **Add API Key to Environment Variables**
   - Create a `.env` file in the `client` directory (if it doesn't exist)
   - Add the following line:
     ```
     REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here
     ```
   - Replace `your_api_key_here` with your actual API key

7. **Restart Development Server**
   - Stop your development server (Ctrl+C)
   - Run `npm start` again

## Important Notes

- **Free Tier**: Google Maps API offers a free tier with $200 credit per month
- **Billing**: You need to enable billing in Google Cloud Console (free tier still applies)
- **North America Restriction**: The map is configured to only allow location selection within North America bounds
- **Security**: Never commit your `.env` file to version control. It should be in `.gitignore`

## Testing

After setup, when you create a new project:
1. You should see an interactive map
2. Click anywhere on the map to place a marker
3. The address fields should automatically fill with the selected location
4. The map is restricted to North America only

## Troubleshooting

- **Map not loading**: Check that your API key is correct and APIs are enabled
- **Geocoding not working**: Ensure Geocoding API is enabled
- **"Error loading map"**: Verify REACT_APP_GOOGLE_MAPS_API_KEY is set in .env file
- **Location outside bounds**: The map restricts selection to North America only

