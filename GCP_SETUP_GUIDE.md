# Google Cloud Platform (GCP) Setup Guide

This guide will help you migrate your Permiso platform to use GCP for all data storage.

## 🎯 What We'll Set Up

1. **MongoDB Atlas on GCP** - For user credentials, profiles, and projects
2. **Cloud Storage** - For file uploads (documents, images)
3. **GCP Authentication** - For secure access
4. **Environment Configuration** - Proper setup

---

## 📋 Step 1: Set Up MongoDB Atlas on GCP

### 1.1 Create MongoDB Atlas Account
1. Go to: https://www.mongodb.com/cloud/atlas
2. Sign up or log in
3. Click **"Build a Database"**

### 1.2 Choose GCP as Cloud Provider
1. Select **"Google Cloud Platform"** as your cloud provider
2. Choose a region close to you (e.g., `us-central1`, `us-east1`)
3. Select **"M0 Free"** tier (free forever, good for development)
4. Click **"Create"**

### 1.3 Configure Database Access
1. Go to **"Database Access"** (left menu)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Enter username and password (save these!)
5. Set privileges to **"Atlas admin"** or **"Read and write to any database"**
6. Click **"Add User"**

### 1.4 Configure Network Access
1. Go to **"Network Access"** (left menu)
2. Click **"Add IP Address"**
3. For development: Click **"Add Current IP Address"**
4. For production: Add **"0.0.0.0/0"** (allow all - you can restrict later)
5. Click **"Confirm"**

### 1.5 Get Connection String
1. Go to **"Database"** (left menu)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string
   - It looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
5. Replace `<password>` with your actual password
6. Add database name: `mongodb+srv://...mongodb.net/permiso?retryWrites=true&w=majority`

---

## 📦 Step 2: Set Up Google Cloud Storage

### 2.1 Enable Cloud Storage API
1. Go to: https://console.cloud.google.com/
2. Select your project
3. Go to **"APIs & Services"** > **"Library"**
4. Search for **"Cloud Storage API"**
5. Click **"Enable"**

### 2.2 Create Storage Bucket
1. Go to **"Cloud Storage"** > **"Buckets"**
2. Click **"Create Bucket"**
3. Enter bucket name (e.g., `permiso-platform-files`)
4. Choose location type: **"Region"**
5. Select region (same as your MongoDB region)
6. Choose storage class: **"Standard"**
7. Access control: **"Uniform"**
8. Click **"Create"**

### 2.3 Set Bucket Permissions
1. Click on your bucket
2. Go to **"Permissions"** tab
3. Click **"Grant Access"**
4. Add principal: `allUsers` (for public access to files)
   - Or create a service account for better security
5. Role: **"Storage Object Viewer"**
6. Click **"Save"**

### 2.4 Create Service Account (Recommended)
1. Go to **"IAM & Admin"** > **"Service Accounts"**
2. Click **"Create Service Account"**
3. Name: `permiso-storage-service`
4. Description: `Service account for Permiso file uploads`
5. Click **"Create and Continue"**
6. Role: **"Storage Object Admin"**
7. Click **"Continue"** > **"Done"**

### 2.5 Create Service Account Key
1. Click on your service account
2. Go to **"Keys"** tab
3. Click **"Add Key"** > **"Create new key"**
4. Choose **"JSON"**
5. Download the key file (save it securely!)
6. This file contains your credentials

---

## 🔐 Step 3: Configure Environment Variables

### 3.1 Update Server .env File
Create or update `server/.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# MongoDB Atlas (GCP)
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/permiso?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here_change_this

# Google Cloud Storage
GCP_PROJECT_ID=your-gcp-project-id
GCP_STORAGE_BUCKET=permiso-platform-files
GCP_SERVICE_ACCOUNT_KEY=./config/gcp-service-account-key.json
# OR use environment variable (more secure):
# GOOGLE_APPLICATION_CREDENTIALS=./config/gcp-service-account-key.json

# OpenAI (if using)
OPENAI_API_KEY=your_openai_api_key

# Stripe (if using)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Email (if using)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

### 3.2 Update Client .env File
Update `client/.env`:

```env
# Google Maps API
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# API Base URL
REACT_APP_API_URL=http://localhost:5000
```

---

## 📁 Step 4: Install Required Packages

Run these commands in the `server` directory:

```bash
cd server
npm install @google-cloud/storage
```

---

## ✅ Step 5: Verify Setup

1. **Test MongoDB Connection:**
   ```bash
   cd server
   npm start
   ```
   Should see: "MongoDB connected"

2. **Test Cloud Storage:**
   - Try uploading a file through your application
   - Check Cloud Storage bucket to see if file appears

---

## 🔒 Security Best Practices

1. **Never commit .env files** - Already in .gitignore
2. **Use Service Account Keys** - More secure than API keys
3. **Restrict IP Access** - Limit MongoDB Atlas network access
4. **Use Environment Variables** - For production deployments
5. **Enable Bucket Versioning** - For file recovery
6. **Set up Lifecycle Rules** - Auto-delete old files

---

## 📊 Data Structure in GCP

### MongoDB Atlas Collections:
- **users** - User credentials and profiles
- **projects** - All project data
- **notifications** - User notifications

### Cloud Storage Structure:
```
permiso-platform-files/
├── users/
│   └── {userId}/
│       └── avatars/
├── projects/
│   └── {projectId}/
│       └── documents/
└── temp/
    └── uploads/
```

---

## 🚀 Next Steps

After setup:
1. Run migration script (if migrating from local MongoDB)
2. Test file uploads
3. Verify data is being stored correctly
4. Set up monitoring and alerts

---

## 🆘 Troubleshooting

**MongoDB Connection Failed:**
- Check connection string format
- Verify IP is whitelisted
- Check username/password

**Cloud Storage Upload Failed:**
- Verify service account key path
- Check bucket permissions
- Ensure Cloud Storage API is enabled

**Files Not Accessible:**
- Check bucket permissions
- Verify CORS configuration
- Check file URLs

---

## 📚 Additional Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Google Cloud Storage Documentation](https://cloud.google.com/storage/docs)
- [GCP Free Tier](https://cloud.google.com/free)

