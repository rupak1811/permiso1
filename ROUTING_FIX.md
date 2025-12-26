# Fixing 404 Error on Website URL

## ✅ Solution Applied

The issue was with the routing configuration. I've updated `vercel.json` to:

1. **Add API route to builds** - Ensures API serverless function is built
2. **Fix static file paths** - Removed `/client/build` prefix (Vercel serves from outputDirectory)
3. **Add build command** - Explicitly builds the client
4. **Simplify routes** - Routes now work relative to outputDirectory

## 🔧 Changes Made

### Updated `vercel.json`:

1. **Added API to builds:**
   ```json
   {
     "src": "api/[...path].js",
     "use": "@vercel/node"
   }
   ```

2. **Added build command:**
   ```json
   "buildCommand": "cd client && npm run build"
   ```

3. **Fixed route paths:**
   - Static files: `/static/$1` (not `/client/build/static/$1`)
   - Assets: `/$1` (not `/client/build/$1`)
   - React app: `/index.html` (not `/client/build/index.html`)

   This works because `outputDirectory` is set to `client/build`, so Vercel automatically serves files from there.

## 📋 How It Works Now

1. **API Routes** (`/api/*`):
   - Routes to `api/[...path].js` serverless function
   - Handles all backend API calls

2. **Static Assets** (`/static/*`, `/*.js`, `/*.css`, etc.):
   - Served from `client/build` directory
   - Automatically handled by Vercel

3. **React App Routes** (everything else):
   - Serves `client/build/index.html`
   - React Router handles client-side routing

## 🚀 Next Steps

1. **Commit and push:**
   ```bash
   git add vercel.json
   git commit -m "Fix routing - add API build and fix static paths"
   git push
   ```

2. **Vercel will automatically redeploy**

3. **Test:**
   - Visit: `https://permiso.vercel.app`
   - Should load the React app (landing page)
   - API: `https://permiso.vercel.app/api/auth/me` should work

## ✅ Expected Behavior

After deployment:
- ✅ Root URL (`/`) → React app loads
- ✅ Any route (`/dashboard`, `/login`, etc.) → React app handles routing
- ✅ API routes (`/api/*`) → Serverless function handles
- ✅ Static files → Served correctly

## 🐛 If Still Getting 404

1. **Check build logs:**
   - Ensure client build completed successfully
   - Check for errors in build process

2. **Verify outputDirectory:**
   - Should be `client/build`
   - Check that `index.html` exists in build output

3. **Check API function:**
   - Verify `api/[...path].js` exists
   - Check function logs in Vercel dashboard

4. **Test directly:**
   - Try: `https://permiso.vercel.app/index.html`
   - Should serve the React app

