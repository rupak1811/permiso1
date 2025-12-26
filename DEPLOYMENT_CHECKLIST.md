# Vercel Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Code Preparation
- [ ] All code is committed to Git
- [ ] No hardcoded localhost URLs (use environment variables)
- [ ] All dependencies are in package.json files
- [ ] Build scripts are configured correctly

### 2. Environment Variables Preparation
- [ ] JWT_SECRET - Generate a strong random string
- [ ] GCP_PROJECT_ID - Your Google Cloud Project ID
- [ ] GCP_SERVICE_ACCOUNT_KEY - Base64 encoded service account JSON
- [ ] GEMINI_API_KEY - Google Gemini API key
- [ ] REACT_APP_GOOGLE_MAPS_API_KEY - Google Maps API key
- [ ] GCP_STORAGE_BUCKET_NAME - Your GCP Storage bucket name
- [ ] CLIENT_URL - Will be set after deployment (your Vercel URL)

### 3. GCP Service Account Setup
- [ ] Service account JSON file ready
- [ ] Convert to base64: `cat service-account.json | base64`
- [ ] Or use the JSON content directly as environment variable
- [ ] Verify IAM permissions are set correctly

### 4. Vercel Account Setup
- [ ] Vercel account created
- [ ] Vercel CLI installed (optional, for CLI deployment)
- [ ] GitHub/GitLab/Bitbucket repository connected

## 🚀 Deployment Steps

### Step 1: Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your repository
4. Select the repository

### Step 2: Configure Build Settings
- **Framework Preset:** Other
- **Root Directory:** `./`
- **Build Command:** `npm run vercel-build`
- **Output Directory:** `client/build`
- **Install Command:** `npm install && cd server && npm install && cd ../client && npm install`

### Step 3: Add Environment Variables
Add all environment variables from the "Environment Variables" section in VERCEL_DEPLOYMENT.md

**Important:** 
- Add variables for both "Production", "Preview", and "Development" environments
- Use the same values for all environments initially

### Step 4: Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Note your deployment URL

### Step 5: Update Environment Variables
1. Go to Project Settings → Environment Variables
2. Update `CLIENT_URL` with your actual Vercel URL
3. Redeploy if necessary

## 🔍 Post-Deployment Verification

### Test Frontend
- [ ] Visit deployment URL
- [ ] Check if React app loads
- [ ] Verify no console errors
- [ ] Test theme switching
- [ ] Test language switching

### Test Backend API
- [ ] Test `/api/auth/login` endpoint
- [ ] Test `/api/auth/register` endpoint
- [ ] Test `/api/projects` endpoint (after login)
- [ ] Check Vercel function logs for errors

### Test Features
- [ ] User registration
- [ ] User login
- [ ] Project creation
- [ ] File upload
- [ ] AI analysis
- [ ] Map integration

## 🐛 Common Issues & Solutions

### Issue: Build Fails
**Solution:**
- Check build logs in Vercel dashboard
- Verify all dependencies are in package.json
- Check Node.js version compatibility

### Issue: API Routes Return 404
**Solution:**
- Verify `vercel.json` routing configuration
- Check that `api/index.js` exists
- Verify routes are correctly configured

### Issue: Environment Variables Not Loading
**Solution:**
- Redeploy after adding variables
- Check variable names (case-sensitive)
- Verify no typos in values

### Issue: GCP/Firestore Connection Fails
**Solution:**
- Verify service account key is correctly formatted
- Check IAM permissions in GCP Console
- Verify GCP_PROJECT_ID matches your project

### Issue: Socket.IO Not Working
**Solution:**
- This is expected - Socket.IO doesn't work with serverless functions
- The app will gracefully degrade to polling
- Consider using a separate Socket.IO server if real-time is critical

## 📝 Notes

- Socket.IO is automatically disabled in Vercel environment
- File uploads require GCP Storage bucket configuration
- All API routes are serverless functions
- Environment variables are encrypted in Vercel

## 🔄 Updating Deployment

After making changes:
```bash
git add .
git commit -m "Your changes"
git push
```

Vercel will automatically redeploy on push to main branch.

For manual deployment:
```bash
vercel --prod
```

