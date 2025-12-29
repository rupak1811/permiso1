# Vercel Environment Variables Setup Guide

This guide lists all environment variables you need to set in your Vercel project dashboard.

## 📍 How to Add Variables in Vercel

1. Go to **Vercel Dashboard** → Your Project
2. Click **Settings** → **Environment Variables**
3. Click **Add New**
4. Enter **Name** and **Value**
5. Select **All Environments** (Production, Preview, Development) or specific environment
6. Click **Save**
7. **Redeploy** your application after adding variables

---

## 🔴 REQUIRED Variables (Critical - App Won't Work Without These)

### 1. **JWT_SECRET**
```
Name: JWT_SECRET
Value: [Generate a strong random string, minimum 32 characters]
```
**Generate one:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
**Example:** `374tfgibry347gfhiu3b4gfy3a8f9h2j4k5l6m7n8p9q0r1s2t3u4v5w6x7y8z9`

**Why:** Used for signing and verifying JWT authentication tokens. Without this, users cannot log in.

---

### 2. **GCP_PROJECT_ID**
```
Name: GCP_PROJECT_ID
Value: permiso-467316
```
**Why:** Required to connect to Google Cloud Firestore database.

---

### 3. **GCP_SERVICE_ACCOUNT_KEY**
```
Name: GCP_SERVICE_ACCOUNT_KEY
Value: [Entire JSON content from service account key file]
```
**How to get the value:**
1. Open `server/config/permiso-467316-f2f4ccf62d8a.json`
2. Copy the **ENTIRE JSON content** (all lines, including braces)
3. Paste it as the value in Vercel (Vercel supports multi-line JSON)

**Example format:**
```json
{"type":"service_account","project_id":"permiso-467316","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
```

**Why:** Required for authentication with Google Cloud services (Firestore and Storage).

---

## 🟡 RECOMMENDED Variables (Production Best Practices)

### 4. **NODE_ENV**
```
Name: NODE_ENV
Value: production
```
**Why:** Tells Node.js to run in production mode (optimizations, error handling).

---

### 5. **TRUST_PROXY**
```
Name: TRUST_PROXY
Value: true
```
**Why:** Required for Vercel's reverse proxy to work correctly with rate limiting and IP detection.

---

### 6. **CLIENT_URL**
```
Name: CLIENT_URL
Value: https://your-project-name.vercel.app
```
**Note:** Replace `your-project-name` with your actual Vercel project name. You can update this after deployment.

**Why:** Used for CORS configuration and redirects.

---

## 🟢 OPTIONAL Variables (For Specific Features)

### 7. **GCP_STORAGE_BUCKET** (For File Uploads)
```
Name: GCP_STORAGE_BUCKET
Value: permiso_data
```
**Why:** Required if you want file uploads to work. Without this, file uploads will fail (unless Cloudinary is configured).

---

### 8. **GEMINI_API_KEY** (For AI Features)
```
Name: GEMINI_API_KEY
Value: AIzaSyA8ggzz3S64D32n3yAhI8oNuP9uH9rj4WQ
```
**Why:** Required for AI chat assistant and document analysis features. Without this, AI features won't work.

**Get your own key:** https://aistudio.google.com/app/apikey

---

### 9. **CLOUDINARY_CLOUD_NAME** (Alternative File Storage)
```
Name: CLOUDINARY_CLOUD_NAME
Value: your-cloudinary-cloud-name
```
**Why:** Alternative to GCP Storage for file uploads. Only needed if you're not using GCP Storage.

---

### 10. **CLOUDINARY_API_KEY** (Alternative File Storage)
```
Name: CLOUDINARY_API_KEY
Value: your-cloudinary-api-key
```
**Why:** Required if using Cloudinary instead of GCP Storage.

---

### 11. **CLOUDINARY_API_SECRET** (Alternative File Storage)
```
Name: CLOUDINARY_API_SECRET
Value: your-cloudinary-api-secret
```
**Why:** Required if using Cloudinary instead of GCP Storage.

---

### 12. **STRIPE_SECRET_KEY** (For Payments)
```
Name: STRIPE_SECRET_KEY
Value: sk_live_your-stripe-secret-key
```
**Why:** Required for payment processing features. Use `sk_test_...` for testing, `sk_live_...` for production.

---

### 13. **STRIPE_WEBHOOK_SECRET** (For Payments)
```
Name: STRIPE_WEBHOOK_SECRET
Value: whsec_your-stripe-webhook-secret
```
**Why:** Required for verifying Stripe webhook events.

---

## 🎨 FRONTEND Variables (React App)

### 14. **REACT_APP_GOOGLE_MAPS_API_KEY** (For Maps)
```
Name: REACT_APP_GOOGLE_MAPS_API_KEY
Value: your-google-maps-api-key
```
**Why:** Required for map features, location selection, and geocoding.

**Get your key:** https://console.cloud.google.com/apis/credentials

**Note:** Make sure to restrict this key to your Vercel domain in Google Cloud Console.

---

### 15. **REACT_APP_API_URL** (Optional - Usually Not Needed)
```
Name: REACT_APP_API_URL
Value: [Leave empty or don't set]
```
**Why:** For Vercel deployment, leave this empty so the app uses relative `/api` paths. Only set if you need to override the default behavior.

---

## ✅ Quick Checklist

Copy this checklist and check off as you add each variable:

- [ ] **JWT_SECRET** - Generate a strong random string
- [ ] **GCP_PROJECT_ID** - Set to `permiso-467316`
- [ ] **GCP_SERVICE_ACCOUNT_KEY** - Copy entire JSON from key file
- [ ] **NODE_ENV** - Set to `production`
- [ ] **TRUST_PROXY** - Set to `true`
- [ ] **CLIENT_URL** - Set to your Vercel URL (update after deployment)
- [ ] **GCP_STORAGE_BUCKET** - Set to `permiso_data` (if using file uploads)
- [ ] **GEMINI_API_KEY** - Set your Gemini API key (if using AI features)
- [ ] **REACT_APP_GOOGLE_MAPS_API_KEY** - Set your Google Maps API key (if using maps)

---

## 🚀 After Adding Variables

1. **Redeploy** your application:
   - Go to **Deployments** tab
   - Click **...** on the latest deployment
   - Click **Redeploy**

2. **Verify** the deployment:
   - Check the build logs for any errors
   - Test API endpoints
   - Test authentication (login/register)
   - Test file uploads (if configured)
   - Test AI features (if configured)

---

## 🔒 Security Best Practices

1. **Never commit** environment variables to Git
2. **Use different keys** for production vs development
3. **Restrict API keys** in Google Cloud Console:
   - Google Maps API: Restrict to your Vercel domain
   - Gemini API: Restrict to your server IPs (if possible)
4. **Rotate secrets** periodically
5. **Use Vercel's environment variable encryption** (automatic)

---

## 🆘 Troubleshooting

### "Firestore not initialized"
- Check `GCP_PROJECT_ID` is set correctly
- Verify `GCP_SERVICE_ACCOUNT_KEY` contains valid JSON
- Check service account has Firestore permissions

### "GCP Storage not initialized"
- Set `GCP_STORAGE_BUCKET` variable
- Or configure Cloudinary as alternative

### "JWT authentication failing"
- Verify `JWT_SECRET` is set and matches between deployments
- Check token expiration settings

### "CORS errors"
- Verify `CLIENT_URL` matches your actual Vercel domain
- Check `TRUST_PROXY` is set to `true`

### "Maps not loading"
- Verify `REACT_APP_GOOGLE_MAPS_API_KEY` is set
- Check API key restrictions in Google Cloud Console
- Ensure Maps JavaScript API is enabled

---

## 📝 Notes

- **Vercel automatically sets** `VERCEL=1` and `VERCEL_ENV` - you don't need to set these
- **All variables are encrypted** by Vercel automatically
- **Variables are available** in both serverless functions and build process
- **React variables** must start with `REACT_APP_` to be available in the browser
- **Server variables** (without `REACT_APP_`) are only available in serverless functions

---

## 🔗 Related Documentation

- [Vercel Environment Variables Docs](https://vercel.com/docs/concepts/projects/environment-variables)
- [Server ENV Setup](./server/ENV_SETUP.md)
- [Client ENV Setup](./client/ENV_SETUP.md)
