# Vercel Install Command - Correct Format

## ✅ Correct Install Command

In Vercel Project Settings, use this **exact** command (no quotes needed):

```
npm install && cd server && npm install && cd ../client && npm install
```

## 📝 Vercel Configuration

### Option 1: Full Install Command (Recommended)

**Install Command:**
```
npm install && cd server && npm install && cd ../client && npm install
```

**Build Command:**
```
npm run vercel-build
```

**Output Directory:**
```
client/build
```

**Root Directory:**
```
./
```

---

### Option 2: Simplified (Vercel Auto-detects)

If you want Vercel to auto-detect dependencies, you can use:

**Install Command:**
```
npm install
```

**Build Command:**
```
cd client && npm install && npm run build
```

**Output Directory:**
```
client/build
```

---

## ⚠️ Common Mistakes to Avoid

### ❌ Wrong (Mismatched Quotes)
```
'npm install && cd server && npm install && cd ../client && npm install`
```
This has a single quote `'` at the start and a backtick `` ` `` at the end - **WRONG!**

### ❌ Wrong (Extra Quotes)
```
"npm install && cd server && npm install && cd ../client && npm install"
```
Don't wrap the entire command in quotes.

### ✅ Correct
```
npm install && cd server && npm install && cd ../client && npm install
```
No quotes needed - just the command directly.

---

## 🔧 Complete Vercel Settings

Here's the complete configuration for your project:

### Project Settings:
- **Framework Preset:** `Other`
- **Root Directory:** `./`
- **Build Command:** `npm run vercel-build`
- **Output Directory:** `client/build`
- **Install Command:** `npm install && cd server && npm install && cd ../client && npm install`

### Environment Variables:
Make sure these are set correctly:

```
JWT_SECRET=374tfgibry347gfhiu3b4gfy3
GCP_PROJECT_ID=permiso-467316
GCP_SERVICE_ACCOUNT_KEY=<paste entire JSON content here>
GCP_STORAGE_BUCKET=permiso_data
GEMINI_API_KEY=AIzaSyA8ggzz3S64D32n3yAhI8oNuP9uH9rj4WQ
REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSyCJwDj4_C2stL3p9RHV7QvAC4uCJ5LD9KE
REACT_APP_API_URL=
```

**⚠️ Important:** 
- `GCP_SERVICE_ACCOUNT_KEY` should be the **entire JSON content**, not a file path
- `REACT_APP_API_URL` should be **empty** (not `I9JU23NF394R6HH`)

---

## 🚀 Quick Fix Steps

1. **Go to Vercel Project Settings**
2. **General Tab** → Scroll to "Build & Development Settings"
3. **Install Command:** Replace with:
   ```
   npm install && cd server && npm install && cd ../client && npm install
   ```
4. **Build Command:** Set to:
   ```
   npm run vercel-build
   ```
5. **Output Directory:** Set to:
   ```
   client/build
   ```
6. **Save** and **Redeploy**

---

## 📋 Alternative: Use vercel.json

If you prefer, you can also configure this in `vercel.json`:

```json
{
  "version": 2,
  "buildCommand": "npm run vercel-build",
  "installCommand": "npm install && cd server && npm install && cd ../client && npm install",
  "outputDirectory": "client/build",
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    },
    {
      "src": "/static/(.*)",
      "dest": "/client/build/static/$1"
    },
    {
      "src": "/(.*\\.(js|css|ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot))",
      "dest": "/client/build/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/client/build/index.html"
    }
  ]
}
```

This way, Vercel will read the configuration from the file automatically.

