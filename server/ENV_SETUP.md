# Server Environment Variables Setup Guide

## Complete `.env` File Template

Create a file named `.env` in the `server` directory with the following variables:

```env
# ============================================
# SERVER CONFIGURATION
# ============================================
# Port for the server to run on
PORT=5000

# Client URL for CORS and Socket.io
# For development: http://localhost:3000
# For production: https://yourdomain.com
CLIENT_URL=http://localhost:3000

# ============================================
# JWT AUTHENTICATION (REQUIRED)
# ============================================
# Secret key for JWT token signing
# Generate a strong random string (at least 32 characters)
# You can generate one with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# ============================================
# GOOGLE CLOUD PLATFORM (GCP) - FIRESTORE (REQUIRED)
# ============================================
# Your GCP Project ID (required for Firestore)
# Get this from: https://console.cloud.google.com/
GCP_PROJECT_ID=your-gcp-project-id

# Path to GCP Service Account Key JSON file
# Option 1: Absolute path to the JSON file
# GCP_SERVICE_ACCOUNT_KEY=/path/to/your-service-account-key.json
# Option 2: Use GOOGLE_APPLICATION_CREDENTIALS (alternative)
# GOOGLE_APPLICATION_CREDENTIALS=/path/to/your-service-account-key.json
# Option 3: Place the file at server/config/gcp-service-account-key.json (default location)
# If not set, will look for: server/config/gcp-service-account-key.json

# ============================================
# GOOGLE CLOUD PLATFORM (GCP) - STORAGE (OPTIONAL)
# ============================================
# GCP Storage Bucket name for file uploads
# Create a bucket at: https://console.cloud.google.com/storage
GCP_STORAGE_BUCKET=your-storage-bucket-name

# ============================================
# CLOUDINARY (Alternative File Storage - OPTIONAL)
# ============================================
# If GCP Storage is not configured, Cloudinary will be used as fallback
# Get these from: https://cloudinary.com/console
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# ============================================
# GEMINI API (For AI Features - OPTIONAL)
# ============================================
# Google Gemini API key for AI document analysis and chat
# Get this from: https://makersuite.google.com/app/apikey
# Or: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your-gemini-api-key

# ============================================
# STRIPE (Payment Processing - OPTIONAL)
# ============================================
# Stripe secret key for payment processing
# Get this from: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key

# Stripe webhook secret for verifying webhook events
# Get this from: https://dashboard.stripe.com/webhooks
STRIPE_WEBHOOK_SECRET=whsec_your-stripe-webhook-secret
```

## Minimum Required Variables

To get the server running, you need at least:

```env
PORT=5000
JWT_SECRET=your-secret-key-here
GCP_PROJECT_ID=your-gcp-project-id
```

## Variable Descriptions

### Server Configuration
- **PORT**: Server port (default: 5000)
- **CLIENT_URL**: Frontend URL for CORS and Socket.io connections

### Authentication
- **JWT_SECRET**: Secret key for signing JWT tokens. **Generate a strong random string!**

### Google Cloud Platform (GCP)
- **GCP_PROJECT_ID**: Your GCP project ID (required for Firestore)
- **GCP_SERVICE_ACCOUNT_KEY**: Path to service account JSON key file (optional if using default location)
- **GOOGLE_APPLICATION_CREDENTIALS**: Alternative way to specify service account key path
- **GCP_STORAGE_BUCKET**: GCP Storage bucket name for file uploads

### File Storage (Choose one or both)
- **GCP_STORAGE_BUCKET**: Primary storage option (GCP Cloud Storage)
- **CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET**: Fallback storage option

### AI Features
- **GEMINI_API_KEY**: Google Gemini API key for AI document analysis and chat features

### Payment Processing
- **STRIPE_SECRET_KEY**: Stripe secret key for payment processing
- **STRIPE_WEBHOOK_SECRET**: Stripe webhook secret for verifying webhook events

## Quick Setup Steps

1. **Create the `.env` file**:
   ```bash
   cd server
   touch .env
   ```

2. **Add minimum required variables**:
   ```env
   PORT=5000
   JWT_SECRET=your-generated-secret-key
   GCP_PROJECT_ID=your-gcp-project-id
   ```

3. **Generate a JWT secret**:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. **Set up GCP Service Account**:
   - Place your service account JSON key at: `server/config/gcp-service-account-key.json`
   - Or set `GCP_SERVICE_ACCOUNT_KEY` to the file path

5. **Add optional services as needed**:
   - File storage (GCP Storage or Cloudinary)
   - Gemini API for AI features
   - Stripe for payments

## Notes

- **Never commit `.env` to version control** - it's already in `.gitignore`
- The server will start even without optional services configured
- Database operations require `GCP_PROJECT_ID` to be set
- File uploads require either `GCP_STORAGE_BUCKET` or Cloudinary credentials
- AI features require `GEMINI_API_KEY`
- Payment features require Stripe credentials

## Troubleshooting

- **"Firestore not initialized"**: Set `GCP_PROJECT_ID` and ensure service account key is accessible
- **"GCP Storage not initialized"**: Set `GCP_STORAGE_BUCKET` or configure Cloudinary
- **"JWT_SECRET not set"**: Server will use a fallback secret (not recommended for production)

