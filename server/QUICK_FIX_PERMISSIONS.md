# Quick Fix: Firestore Permission Denied

## Your Service Account
- **Email**: `firestore-service@permiso-467316.iam.gserviceaccount.com`
- **Project**: `permiso-467316`

## Quick Fix (2 minutes)

### Step 1: Open IAM Console
Click this link to go directly to your project's IAM page:
👉 **[Open IAM Console](https://console.cloud.google.com/iam-admin/iam?project=permiso-467316)**

### Step 2: Find Your Service Account
1. In the IAM page, look for: `firestore-service@permiso-467316.iam.gserviceaccount.com`
2. If you don't see it, click the filter/search box and type: `firestore-service`

### Step 3: Grant Permissions
1. Click the **Edit** (pencil icon) next to the service account
2. Click **Add Another Role**
3. Select one of these roles:
   - **Cloud Datastore User** (recommended)
   - **Cloud Firestore User** (alternative)
   - **Owner** (full access - only for testing)
4. Click **Save**

### Step 4: Wait & Restart
1. Wait 1-2 minutes for permissions to propagate
2. Restart your server: `npm start` (in the `server` directory)

## Verify It Works

Run the diagnostic script:
```bash
node scripts/testFirestoreConnection.js
```

You should see all ✅ checkmarks if permissions are correct.

## Still Not Working?

1. **Check Firestore Security Rules**:
   - Go to [Firestore Console](https://console.cloud.google.com/firestore?project=permiso-467316)
   - Click **Rules** tab
   - For development, temporarily use:
     ```javascript
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /{document=**} {
           allow read, write: if true;
         }
       }
     }
     ```
   - Click **Publish**

2. **Verify API is Enabled**:
   - Go to [APIs & Services](https://console.cloud.google.com/apis/library?project=permiso-467316)
   - Search for "Cloud Firestore API"
   - Make sure it's **Enabled**

3. **Run Diagnostic**:
   ```bash
   node scripts/testFirestoreConnection.js
   ```

## Need More Help?

See `server/FIRESTORE_PERMISSIONS_FIX.md` for detailed troubleshooting.

