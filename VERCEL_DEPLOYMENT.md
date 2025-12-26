# Vercel Deployment Guide

This guide will help you deploy both the frontend and backend of the Permiso Platform to Vercel.

## 📋 Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. [Vercel CLI](https://vercel.com/docs/cli) installed (`npm i -g vercel`)
3. All environment variables ready (see below)

## 📦 Quick Start

1. **Install Vercel CLI** (if using CLI method):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

## 🚀 Deployment Options

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Connect your repository to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your Git repository
   - Select the repository

2. **Configure Project Settings:**
   - **Framework Preset:** Other
   - **Root Directory:** `./` (root of the repository)
   - **Build Command:** `npm run vercel-build` (or `cd client && npm install && npm run build`)
   - **Output Directory:** `client/build`
   - **Install Command:** `npm install && cd server && npm install && cd ../client && npm install`
   - **Node.js Version:** 18.x (or latest)

3. **Add Environment Variables:**
   See the "Environment Variables" section below.

4. **Deploy:**
   - Click "Deploy"
   - Wait for the build to complete

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (Select your account)
# - Link to existing project? No (for first deployment)
# - Project name? permiso-platform (or your choice)
# - Directory? ./
# - Override settings? No
```

## 🔐 Environment Variables

Add these environment variables in your Vercel project settings:

### Backend Environment Variables

```env
# Server Configuration
NODE_ENV=production
PORT=5000
TRUST_PROXY=true
VERCEL=1

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Client URL (Your Vercel deployment URL)
CLIENT_URL=https://your-project.vercel.app

# GCP Configuration
GCP_PROJECT_ID=permiso-467316
GOOGLE_APPLICATION_CREDENTIALS=/var/task/config/permiso-467316-f2f4ccf62d8a.json

# Firestore Configuration
FIRESTORE_PROJECT_ID=permiso-467316

# Google Cloud Storage
GCP_STORAGE_BUCKET_NAME=your-bucket-name

# AI Configuration (Google Gemini)
GEMINI_API_KEY=your_gemini_api_key

# Stripe (if using payments)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Email Configuration (if using nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### Frontend Environment Variables

```env
# API Base URL (Leave empty for same-origin requests, or use full URL)
# For Vercel, leave empty to use relative paths which work automatically
REACT_APP_API_URL=

# Google Maps API Key
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Socket.IO URL (if using separate Socket.IO server)
# Note: Socket.IO won't work with Vercel serverless functions
# Leave empty or set to a separate Socket.IO server URL
REACT_APP_SOCKET_URL=

# Environment
REACT_APP_ENV=production
```

**Note:** For Vercel deployments, you can leave `REACT_APP_API_URL` empty since the frontend and backend are on the same domain. The relative paths (`/api/*`) will work automatically.

## 📝 Important Notes

### 1. Service Account Key File

For GCP service account credentials in Vercel:

**Option A: Use Environment Variable (Recommended)**
- Convert your service account JSON to a base64 string
- Add it as an environment variable: `GCP_SERVICE_ACCOUNT_KEY` (base64 encoded)
- Modify `server/config/firestore.js` to decode it

**Option B: Upload as Secret**
- Use Vercel's environment variables for sensitive data
- Store the JSON content as a secret environment variable

**Option C: Use GCP Secret Manager**
- Store credentials in Google Cloud Secret Manager
- Access via GCP SDK in your serverless functions

### 2. Socket.IO Limitations

⚠️ **Important:** Socket.IO requires persistent connections, which don't work well with Vercel's serverless functions. 

**Solutions:**
1. **Disable Socket.IO** (already handled in code - it will gracefully degrade)
2. **Use a separate Socket.IO server** (e.g., Railway, Render, or a dedicated server)
3. **Use Vercel's WebSocket support** (if available in your plan)

The code automatically detects Vercel environment and disables Socket.IO, so real-time features will use polling fallback.

### 3. File Uploads

For file uploads to work:
- Ensure GCP Storage bucket is configured
- Set proper CORS on your GCP Storage bucket
- Add `GCP_STORAGE_BUCKET_NAME` environment variable

### 4. Build Configuration

The `vercel.json` file is configured to:
- Build the React frontend from `client/` directory
- Serve API routes from `server/` directory as serverless functions
- Route `/api/*` requests to the backend
- Serve static files from `client/build`

## 🔧 Post-Deployment Steps

1. **Update API URLs:**
   - Update `REACT_APP_API_URL` in frontend environment variables
   - Update `CLIENT_URL` in backend environment variables

2. **Test the deployment:**
   - Visit your Vercel deployment URL
   - Test login/registration
   - Test API endpoints
   - Test file uploads

3. **Set up custom domain (optional):**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Configure DNS records

## 🐛 Troubleshooting

### Build Fails

1. **Check build logs** in Vercel dashboard
2. **Verify all dependencies** are in `package.json`
3. **Check Node.js version** (Vercel uses Node 18.x by default)
4. **Verify environment variables** are set correctly

### API Routes Not Working

1. **Check `vercel.json`** routing configuration
2. **Verify API routes** are in `server/routes/`
3. **Check server logs** in Vercel dashboard
4. **Test API endpoints** directly: `https://your-project.vercel.app/api/auth/login`

### Environment Variables Not Loading

1. **Redeploy** after adding environment variables
2. **Check variable names** match exactly (case-sensitive)
3. **Verify no typos** in variable values
4. **Check for hidden characters** in values

### GCP/Firestore Connection Issues

1. **Verify service account key** is correctly configured
2. **Check IAM permissions** for the service account
3. **Verify GCP_PROJECT_ID** matches your project
4. **Check Firestore is enabled** in GCP Console

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Environment Variables in Vercel](https://vercel.com/docs/concepts/projects/environment-variables)

## 🔄 Updating Deployment

To update your deployment:

```bash
# Make changes to your code
git add .
git commit -m "Update deployment"
git push

# Vercel will automatically redeploy
# Or manually trigger:
vercel --prod
```

## 📞 Support

If you encounter issues:
1. Check Vercel build logs
2. Check server function logs
3. Review environment variables
4. Verify GCP/Firestore configuration

