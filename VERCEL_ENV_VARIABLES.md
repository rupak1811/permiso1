# Vercel Environment Variables Reference

Complete list of all environment variables needed for Vercel deployment.

## 📋 Quick Copy-Paste List

Copy these into Vercel Project Settings → Environment Variables:

### 🔴 Required Variables (Core Functionality)

```env
# Authentication
JWT_SECRET=your_strong_random_secret_key_minimum_32_characters

# Google Cloud Platform
GCP_PROJECT_ID=permiso-467316
GCP_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"permiso-467316",...}

# Google Cloud Storage
GCP_STORAGE_BUCKET=your-bucket-name

# AI Integration
GEMINI_API_KEY=your_gemini_api_key

# Frontend
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 🟡 Optional but Recommended

```env
# Server Configuration
NODE_ENV=production
TRUST_PROXY=true
VERCEL=1

# Client URL (Update after first deployment)
CLIENT_URL=https://your-project.vercel.app
```

### 🟢 Optional (Feature-Specific)

```env
# Stripe Payments (if using payments)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudinary (alternative to GCP Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (if using nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Socket.IO (if using separate server)
REACT_APP_SOCKET_URL=https://your-socket-server.com
```

---

## 📝 Detailed Variable Descriptions

### 🔴 Required Variables

#### `JWT_SECRET` ⚠️ **REQUIRED**
- **Description:** Secret key for signing and verifying JWT tokens
- **Type:** String
- **Format:** Random string, minimum 32 characters
- **Example:** `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0`
- **How to generate:**
  ```bash
  # Using Node.js
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  
  # Using OpenSSL
  openssl rand -hex 32
  ```
- **Security:** Keep this secret! Never commit to Git.

#### `GCP_PROJECT_ID` ⚠️ **REQUIRED**
- **Description:** Your Google Cloud Platform project ID
- **Type:** String
- **Example:** `permiso-467316`
- **Where to find:** Google Cloud Console → Project Settings

#### `GCP_SERVICE_ACCOUNT_KEY` ⚠️ **REQUIRED**
- **Description:** Service account credentials for GCP (Firestore & Storage)
- **Type:** JSON String (multi-line supported in Vercel)
- **Format:** Complete JSON object as string
- **Example:**
  ```json
  {
    "type": "service_account",
    "project_id": "permiso-467316",
    "private_key_id": "...",
    "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
    "client_email": "...",
    "client_id": "...",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "..."
  }
  ```
- **How to get:**
  1. Go to GCP Console → IAM & Admin → Service Accounts
  2. Create or select service account
  3. Create JSON key
  4. Copy entire JSON content
  5. Paste into Vercel (supports multi-line)
- **Alternative:** Base64 encode the JSON file:
  ```bash
  cat service-account.json | base64
  ```
  Then decode in code (not recommended, use JSON directly)

#### `GCP_STORAGE_BUCKET` ⚠️ **REQUIRED**
- **Description:** Google Cloud Storage bucket name for file uploads
- **Type:** String
- **Example:** `permiso-uploads` or `permiso-467316.appspot.com`
- **Where to find:** GCP Console → Cloud Storage → Buckets
- **Note:** Ensure bucket has proper CORS configuration

#### `GEMINI_API_KEY` ⚠️ **REQUIRED**
- **Description:** Google Gemini API key for AI features
- **Type:** String
- **Example:** `AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz`
- **How to get:**
  1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
  2. Create API key
  3. Copy the key
- **Note:** Enable Gemini API in GCP Console

#### `REACT_APP_GOOGLE_MAPS_API_KEY` ⚠️ **REQUIRED**
- **Description:** Google Maps API key for map features
- **Type:** String
- **Example:** `AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz`
- **How to get:**
  1. Go to [Google Cloud Console](https://console.cloud.google.com/)
  2. APIs & Services → Credentials
  3. Create API Key
  4. Restrict key to Maps JavaScript API
- **Note:** Enable Maps JavaScript API, Geocoding API, Places API

---

### 🟡 Optional but Recommended

#### `NODE_ENV`
- **Description:** Node.js environment
- **Type:** String
- **Value:** `production`
- **Default:** `production` (Vercel sets this automatically)
- **Note:** Can be left empty, Vercel sets it

#### `TRUST_PROXY`
- **Description:** Trust proxy headers (required for rate limiting behind Vercel)
- **Type:** String (boolean)
- **Value:** `true`
- **Default:** Automatically set by code if Vercel detected
- **Note:** Code auto-detects Vercel, but explicit is better

#### `VERCEL`
- **Description:** Vercel environment indicator
- **Type:** String
- **Value:** `1`
- **Default:** Automatically set by Vercel
- **Note:** Can be left empty, Vercel sets this automatically

#### `CLIENT_URL`
- **Description:** Frontend URL (for CORS and redirects)
- **Type:** String (URL)
- **Example:** `https://your-project.vercel.app`
- **When to set:** After first deployment, update with actual URL
- **Note:** Used for CORS configuration and email links

---

### 🟢 Optional (Feature-Specific)

#### Stripe Payment Variables

##### `STRIPE_SECRET_KEY`
- **Description:** Stripe secret key for server-side operations
- **Type:** String
- **Format:** `sk_live_...` or `sk_test_...`
- **When needed:** If using payment features
- **How to get:** Stripe Dashboard → Developers → API keys

##### `STRIPE_PUBLISHABLE_KEY`
- **Description:** Stripe publishable key for client-side
- **Type:** String
- **Format:** `pk_live_...` or `pk_test_...`
- **When needed:** If using payment features
- **Note:** Can be used in frontend if needed

##### `STRIPE_WEBHOOK_SECRET`
- **Description:** Stripe webhook signing secret
- **Type:** String
- **Format:** `whsec_...`
- **When needed:** If using Stripe webhooks
- **How to get:** Stripe Dashboard → Developers → Webhooks → Add endpoint → Copy signing secret

#### Cloudinary Variables (Alternative to GCP Storage)

##### `CLOUDINARY_CLOUD_NAME`
- **Description:** Cloudinary cloud name
- **Type:** String
- **When needed:** If using Cloudinary instead of GCP Storage
- **How to get:** Cloudinary Dashboard

##### `CLOUDINARY_API_KEY`
- **Description:** Cloudinary API key
- **Type:** String
- **When needed:** If using Cloudinary

##### `CLOUDINARY_API_SECRET`
- **Description:** Cloudinary API secret
- **Type:** String
- **When needed:** If using Cloudinary

#### Email Configuration (Nodemailer)

##### `SMTP_HOST`
- **Description:** SMTP server hostname
- **Type:** String
- **Example:** `smtp.gmail.com`
- **When needed:** If sending emails
- **Common values:**
  - Gmail: `smtp.gmail.com`
  - Outlook: `smtp-mail.outlook.com`
  - Custom: Your SMTP server

##### `SMTP_PORT`
- **Description:** SMTP server port
- **Type:** Number (as string)
- **Example:** `587` (TLS) or `465` (SSL)
- **When needed:** If sending emails
- **Common values:** `587`, `465`, `25`

##### `SMTP_USER`
- **Description:** SMTP username/email
- **Type:** String (email)
- **Example:** `your-email@gmail.com`
- **When needed:** If sending emails

##### `SMTP_PASS`
- **Description:** SMTP password or app password
- **Type:** String
- **When needed:** If sending emails
- **Note:** For Gmail, use App Password (not regular password)

#### Socket.IO (Separate Server)

##### `REACT_APP_SOCKET_URL`
- **Description:** Socket.IO server URL (if using separate server)
- **Type:** String (URL)
- **Example:** `https://socket-server.railway.app`
- **When needed:** If using separate Socket.IO server
- **Note:** Socket.IO doesn't work with Vercel serverless functions
- **Default:** Uses `REACT_APP_API_URL` or relative path

---

## 🔧 Frontend Environment Variables

### `REACT_APP_API_URL`
- **Description:** Backend API base URL
- **Type:** String (URL) or empty
- **Recommended:** Leave **empty** for Vercel
- **Why:** Relative paths (`/api/*`) work automatically on same domain
- **Alternative:** If backend is separate, use full URL: `https://api.yourdomain.com`

### `REACT_APP_ENV`
- **Description:** Frontend environment indicator
- **Type:** String
- **Value:** `production`
- **Note:** Optional, mainly for debugging

---

## 📦 How to Add in Vercel

1. **Go to Vercel Dashboard**
   - Select your project
   - Go to **Settings** → **Environment Variables**

2. **Add Variables**
   - Click **Add New**
   - Enter **Name** and **Value**
   - Select environments: **Production**, **Preview**, **Development**
   - Click **Save**

3. **For Multi-line Values** (like `GCP_SERVICE_ACCOUNT_KEY`)
   - Vercel supports multi-line values
   - Paste the entire JSON
   - Click **Save**

4. **Redeploy**
   - After adding variables, redeploy
   - Go to **Deployments** → Click **...** → **Redeploy**

---

## ✅ Verification Checklist

After adding variables, verify:

- [ ] `JWT_SECRET` is set (minimum 32 characters)
- [ ] `GCP_PROJECT_ID` matches your GCP project
- [ ] `GCP_SERVICE_ACCOUNT_KEY` is valid JSON
- [ ] `GCP_STORAGE_BUCKET` exists and has CORS configured
- [ ] `GEMINI_API_KEY` is valid and API is enabled
- [ ] `REACT_APP_GOOGLE_MAPS_API_KEY` is valid and APIs are enabled
- [ ] `CLIENT_URL` is updated with actual Vercel URL (after deployment)
- [ ] All variables are added to **Production**, **Preview**, and **Development** environments

---

## 🔒 Security Best Practices

1. **Never commit** `.env` files to Git
2. **Use strong secrets** for `JWT_SECRET` (32+ characters)
3. **Restrict API keys** in Google Cloud Console
4. **Rotate keys** periodically
5. **Use different keys** for development and production
6. **Review access** to environment variables regularly

---

## 🆘 Troubleshooting

### Variable Not Loading
- **Check:** Variable name is exact (case-sensitive)
- **Check:** Variable is added to correct environment
- **Solution:** Redeploy after adding variables

### GCP Connection Fails
- **Check:** `GCP_SERVICE_ACCOUNT_KEY` is valid JSON
- **Check:** Service account has proper IAM roles
- **Check:** `GCP_PROJECT_ID` is correct

### API Keys Not Working
- **Check:** API is enabled in Google Cloud Console
- **Check:** API key restrictions allow Vercel domain
- **Check:** Billing is enabled (for some APIs)

---

## 📚 Additional Resources

- [Vercel Environment Variables Docs](https://vercel.com/docs/concepts/projects/environment-variables)
- [Google Cloud IAM Roles](https://cloud.google.com/iam/docs/understanding-roles)
- [Google Maps API Setup](https://developers.google.com/maps/documentation/javascript/get-api-key)
- [Gemini API Setup](https://ai.google.dev/docs)

