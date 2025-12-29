# Vercel Build Fix - react-scripts not found

## Problem
The build fails with: `react-scripts: command not found`

## Solution Applied

1. **Updated `vercel.json`** to use a custom build script
2. **Updated `package.json`** with a `vercel-build` script that:
   - Installs root dependencies
   - Installs server dependencies  
   - Installs client dependencies
   - Builds the React app

## Important: Fix Your Environment Variables

In your Vercel dashboard, you have a **CRITICAL ERROR**:

### ❌ WRONG:
```
REACT_APP_API_URL = I9JU23NF394R6HH
```

### ✅ CORRECT:
**DELETE** the `REACT_APP_API_URL` variable entirely, or set it to empty string `""`

**Why:** The app uses relative `/api` paths. Setting this to a wrong value breaks all API calls.

## Steps to Fix

1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables

2. **Find `REACT_APP_API_URL`** and either:
   - Delete it completely, OR
   - Set value to empty string `""`

3. **Add missing required variables** (if not already added):
   - `JWT_SECRET` - Generate a strong random string
   - `GCP_PROJECT_ID` = `permiso-467316`
   - `GCP_SERVICE_ACCOUNT_KEY` = (your full JSON)
   - `NODE_ENV` = `production`
   - `TRUST_PROXY` = `true`

4. **Redeploy** your application

## After Fixing

The build should now:
1. Install all dependencies correctly
2. Build the React app successfully
3. Deploy both frontend and backend

## If Build Still Fails

1. Check that `package-lock.json` files exist in:
   - Root directory
   - `server/` directory
   - `client/` directory

2. Clear Vercel build cache:
   - Go to Settings → General
   - Clear build cache
   - Redeploy

3. Check build logs for specific errors

