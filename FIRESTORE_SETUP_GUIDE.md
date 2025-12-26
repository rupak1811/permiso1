# Firestore Setup Guide

This guide will help you set up Google Cloud Firestore to replace MongoDB in your Permiso application.

## Overview

Firestore is Google Cloud's NoSQL document database. It provides:
- Real-time synchronization
- Automatic scaling
- Strong consistency
- Offline support
- Multi-region replication

## Prerequisites

1. A Google Cloud Platform (GCP) account
2. A GCP project created
3. Billing enabled on your GCP project

## Step 1: Enable Firestore API

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** > **Library**
4. Search for "Cloud Firestore API"
5. Click **Enable**

## Step 2: Create Firestore Database

1. Go to [Firestore Console](https://console.cloud.google.com/firestore)
2. Click **Create Database**
3. Choose **Native mode** (recommended for new projects)
4. Select a location (choose closest to your users)
   - For North America: `us-central`, `us-east1`, `us-west1`
   - For Europe: `europe-west1`, `europe-west2`
   - For Asia: `asia-south1`, `asia-northeast1`
5. Click **Create**

**Note:** Location cannot be changed after creation!

## Step 3: Set Up Service Account

1. Go to **IAM & Admin** > **Service Accounts**
2. Click **Create Service Account**
3. Enter a name (e.g., `firestore-service`)
4. Click **Create and Continue**
5. Grant role: **Cloud Datastore User** (or **Firestore User**)
6. Click **Continue** > **Done**
7. Click on the created service account
8. Go to **Keys** tab
9. Click **Add Key** > **Create new key**
10. Choose **JSON** format
11. Download the key file

## Step 4: Configure Environment Variables

1. Place the downloaded JSON key file in `server/config/gcp-service-account-key.json`
   - **OR** set the path in your environment variable

2. Add to your `server/.env` file:

```env
# GCP Configuration
GCP_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./config/gcp-service-account-key.json
# OR
# GCP_SERVICE_ACCOUNT_KEY=./config/gcp-service-account-key.json
```

## Step 5: Install Dependencies

The Firestore SDK is already installed. If you need to reinstall:

```bash
cd server
npm install @google-cloud/firestore
```

## Step 6: Verify Setup

1. Start your server:
```bash
cd server
npm start
```

2. Check the console for:
```
✅ Firestore initialized: your-project-id
```

3. If you see an error, check:
   - Service account key file path is correct
   - GCP_PROJECT_ID is set correctly
   - Firestore API is enabled
   - Service account has proper permissions

## Data Migration (Optional)

If you have existing MongoDB data, you'll need to migrate it:

1. Export data from MongoDB
2. Transform data format (Firestore uses different structure)
3. Import to Firestore using the Admin SDK or console

**Note:** The application will automatically create collections when you start using it.

## Firestore Collections

The application uses these collections:
- `users` - User accounts and profiles
- `projects` - Project applications
- `notifications` - User notifications

## Security Rules (For Client-Side Access)

If you plan to access Firestore directly from the client, set up security rules:

1. Go to **Firestore** > **Rules**
2. Add rules like:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Projects - users can read their own, reviewers can read assigned
    match /projects/{projectId} {
      allow read: if request.auth != null && 
        (resource.data.applicant == request.auth.uid || 
         resource.data.reviewer == request.auth.uid);
      allow write: if request.auth != null && 
        resource.data.applicant == request.auth.uid;
    }
    
    // Notifications - users can only access their own
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null && 
        resource.data.user == request.auth.uid;
    }
  }
}
```

## Troubleshooting

### Error: "Firestore not initialized"
- Check `GCP_PROJECT_ID` is set
- Verify service account key file exists
- Check file permissions

### Error: "Permission denied"
- Ensure service account has **Cloud Datastore User** role
- Check API is enabled

### Error: "Database not found"
- Verify database was created in the correct project
- Check location matches your selection

### Performance Issues
- Add composite indexes for complex queries
- Use pagination for large datasets
- Consider caching frequently accessed data

## Cost Considerations

Firestore pricing:
- **Free tier:** 50K reads, 20K writes, 20K deletes per day
- **Paid:** $0.06 per 100K document reads, $0.18 per 100K writes

Monitor usage in [GCP Console](https://console.cloud.google.com/firestore/usage)

## Next Steps

1. Test the application with Firestore
2. Monitor Firestore usage in GCP Console
3. Set up alerts for quota limits
4. Configure backup strategy (Firestore has automatic backups)

## Support

- [Firestore Documentation](https://cloud.google.com/firestore/docs)
- [Node.js Client Library](https://cloud.google.com/nodejs/docs/reference/firestore/latest)
- [Firestore Best Practices](https://cloud.google.com/firestore/docs/best-practices)

