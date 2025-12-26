# Quick Environment Variables Setup for Vercel

## ⚠️ You're Missing Critical Variables!

You currently only have:
- ✅ SKIP_PREFLIGHT_CHECK
- ✅ DISABLE_ESLINT_PLUGIN  
- ✅ REACT_APP_GOOGLE_MAPS_API_KEY

**You need to add these REQUIRED variables:**

## 🔴 Required Variables (Add These Now)

### 1. JWT_SECRET
```
JWT_SECRET=your_strong_random_secret_key_minimum_32_characters
```
**Generate one:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Or use: `374tfgibry347gfhiu3b4gfy3` (if you want to use the one you had)

### 2. GCP_PROJECT_ID
```
GCP_PROJECT_ID=permiso-467316
```

### 3. GCP_SERVICE_ACCOUNT_KEY
```
GCP_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"permiso-467316",...}
```
**Important:** 
- Open your file: `server/config/permiso-467316-f2f4ccf62d8a.json`
- Copy the **ENTIRE JSON content**
- Paste it as the value (Vercel supports multi-line)

### 4. GCP_STORAGE_BUCKET
```
GCP_STORAGE_BUCKET=permiso_data
```

### 5. GEMINI_API_KEY
```
GEMINI_API_KEY=AIzaSyA8ggzz3S64D32n3yAhI8oNuP9uH9rj4WQ
```

## 🟡 Recommended Variables

### 6. NODE_ENV
```
NODE_ENV=production
```

### 7. TRUST_PROXY
```
TRUST_PROXY=true
```

### 8. CLIENT_URL
```
CLIENT_URL=https://permiso.vercel.app
```
(Update this after deployment with your actual URL)

## 📝 How to Add in Vercel

1. Go to **Vercel Dashboard** → Your Project
2. Click **Settings** → **Environment Variables**
3. Click **Add New**
4. For each variable:
   - Enter **Name** (e.g., `JWT_SECRET`)
   - Enter **Value** (e.g., `374tfgibry347gfhiu3b4gfy3`)
   - Select **All Environments** (Production, Preview, Development)
   - Click **Save**

5. **For GCP_SERVICE_ACCOUNT_KEY:**
   - Open: `server/config/permiso-467316-f2f4ccf62d8a.json`
   - Copy the entire JSON (all lines)
   - Paste into Vercel (it supports multi-line)
   - Click **Save**

6. **Redeploy** after adding all variables:
   - Go to **Deployments**
   - Click **...** on latest deployment
   - Click **Redeploy**

## ✅ Complete List to Add

Copy-paste these names, then fill in the values:

```
JWT_SECRET
GCP_PROJECT_ID
GCP_SERVICE_ACCOUNT_KEY
GCP_STORAGE_BUCKET
GEMINI_API_KEY
NODE_ENV
TRUST_PROXY
CLIENT_URL
```

## 🚨 Why These Are Needed

- **JWT_SECRET**: Authentication tokens won't work without this
- **GCP_PROJECT_ID**: Can't connect to Firestore without this
- **GCP_SERVICE_ACCOUNT_KEY**: Can't access GCP services without credentials
- **GCP_STORAGE_BUCKET**: File uploads won't work
- **GEMINI_API_KEY**: AI features won't work
- **CLIENT_URL**: CORS and redirects need this

## ⚡ Quick Action Items

1. ✅ Add `JWT_SECRET` (use: `374tfgibry347gfhiu3b4gfy3` or generate new)
2. ✅ Add `GCP_PROJECT_ID` = `permiso-467316`
3. ✅ Add `GCP_SERVICE_ACCOUNT_KEY` (copy from JSON file)
4. ✅ Add `GCP_STORAGE_BUCKET` = `permiso_data`
5. ✅ Add `GEMINI_API_KEY` = `AIzaSyA8ggzz3S64D32n3yAhI8oNuP9uH9rj4WQ`
6. ✅ Add `NODE_ENV` = `production`
7. ✅ Add `TRUST_PROXY` = `true`
8. ✅ Add `CLIENT_URL` = `https://permiso.vercel.app`
9. ✅ Redeploy

After adding these, your API should work!

