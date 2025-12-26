# Fixing Firestore Permission Errors

If you're seeing `PERMISSION_DENIED` errors when trying to use Firestore, follow these steps:

## Error Message
```
Error: 7 PERMISSION_DENIED: Missing or insufficient permissions.
```

## Solution Steps

### 1. Verify Service Account Key File

Make sure your service account key file exists and is accessible:
- Default location: `server/config/permiso-467316-d136b462a194.json`
- Or set `GCP_SERVICE_ACCOUNT_KEY` in your `.env` file to point to the key file path

### 2. Grant IAM Permissions to Service Account

The service account needs the following IAM roles in your GCP project:

**Required Roles:**
- `Cloud Datastore User` (for Firestore in Datastore mode)
- OR `Cloud Firestore User` (for Firestore in Native mode)

**To grant permissions:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **IAM & Admin** > **IAM**
3. Find your service account (the email from your service account key file)
4. Click **Edit** (pencil icon)
5. Click **Add Another Role**
6. Add one of these roles:
   - `Cloud Datastore User`
   - `Cloud Firestore User`
   - `Owner` (for full access - not recommended for production)

### 3. Check Firestore Security Rules

If you're using Firestore security rules, make sure they allow access:

1. Go to [Firestore Console](https://console.cloud.google.com/firestore)
2. Click on **Rules** tab
3. For development, you can temporarily use:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true; // WARNING: Only for development!
       }
     }
   }
   ```
4. Click **Publish**

**⚠️ WARNING:** The above rules allow full access. For production, use proper authentication-based rules.

### 4. Verify Project ID

Make sure `GCP_PROJECT_ID` in your `.env` file matches the project ID in your service account key file:

```env
GCP_PROJECT_ID=permiso-467316
```

The project ID should match the `project_id` field in your service account JSON file.

### 5. Verify Service Account Key Format

Your service account key should be a valid JSON file with these fields:
- `type`: "service_account"
- `project_id`: Your GCP project ID
- `private_key_id`: Service account key ID
- `private_key`: Private key (starts with "-----BEGIN PRIVATE KEY-----")
- `client_email`: Service account email
- `client_id`: Client ID
- `auth_uri`: "https://accounts.google.com/o/oauth2/auth"
- `token_uri`: "https://oauth2.googleapis.com/token"

### 6. Test Connection

After making changes, restart your server and try registering a user again.

## Quick Checklist

- [ ] Service account key file exists and is readable
- [ ] Service account has `Cloud Datastore User` or `Cloud Firestore User` role
- [ ] `GCP_PROJECT_ID` in `.env` matches the project in service account key
- [ ] Firestore security rules allow access (if using rules)
- [ ] Server has been restarted after configuration changes

## Alternative: Use Service Account Key as JSON String

If you prefer to store the key as an environment variable (not recommended for local development):

1. Read your service account key file
2. Convert it to a single-line JSON string
3. Set in `.env`:
   ```env
   GCP_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"permiso-467316",...}'
   ```

The server will automatically detect if `GCP_SERVICE_ACCOUNT_KEY` is a JSON string or file path.

## Still Having Issues?

1. Check the server logs for more detailed error messages
2. Verify the service account email in the key file
3. Try creating a new service account with proper permissions
4. Check if Firestore API is enabled in your GCP project:
   - Go to [APIs & Services](https://console.cloud.google.com/apis/library)
   - Search for "Cloud Firestore API"
   - Make sure it's enabled

