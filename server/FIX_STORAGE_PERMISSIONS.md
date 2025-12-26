# Fix Google Cloud Storage Upload Permissions

## Error Message
```
firestore-data@permiso-467316.iam.gserviceaccount.com does not have storage.objects.create access to the Google Cloud Storage object. Permission 'storage.objects.create' denied on resource (or it may not exist).
```

## Your Service Account
- **Email**: `firestore-data@permiso-467316.iam.gserviceaccount.com`
- **Project**: `permiso-467316`
- **Bucket**: `permiso_data`

---

## ✅ Quick Fix (2 minutes)

### Step 1: Open IAM Console
Click this link to go directly to your project's IAM page:
👉 **[Open IAM Console](https://console.cloud.google.com/iam-admin/iam?project=permiso-467316)**

### Step 2: Find Your Service Account
1. In the IAM page, look for: `firestore-data@permiso-467316.iam.gserviceaccount.com`
2. If you don't see it, click the filter/search box and type: `firestore-data`

### Step 3: Grant Storage Permissions
1. Click the **Edit** (pencil icon) ✏️ next to the service account
2. Click **Add Another Role** button
3. Select one of these roles:
   - **Storage Object Creator** (recommended - can create/delete objects)
   - **Storage Admin** (full access - can manage buckets and objects)
   - **Storage Object Admin** (can manage objects but not buckets)
4. Click **Save**

### Step 4: Wait & Test
1. Wait 1-2 minutes for permissions to propagate
2. Try uploading a document again

---

## ✅ Alternative: Grant Bucket-Level Permissions

If you prefer to grant permissions at the bucket level:

1. Go to [Cloud Storage Console](https://console.cloud.google.com/storage/browser?project=permiso-467316)
2. Click on your bucket: `permiso_data`
3. Click on the **Permissions** tab
4. Click **Grant Access**
5. In "New principals", enter: `firestore-data@permiso-467316.iam.gserviceaccount.com`
6. Select role: **Storage Object Creator** or **Storage Admin**
7. Click **Save**

---

## ✅ Verify Bucket Exists

Make sure the bucket `permiso_data` exists:

1. Go to [Cloud Storage Console](https://console.cloud.google.com/storage/browser?project=permiso-467316)
2. If the bucket doesn't exist, create it:
   - Click **Create Bucket**
   - Name: `permiso_data`
   - Choose a location
   - Click **Create**

---

## ✅ Verify Service Account Key

Make sure your `.env` file has the correct service account key:

```env
GCP_SERVICE_ACCOUNT_KEY=server/config/permiso-467316-f2f4ccf62d8a.json
GCP_STORAGE_BUCKET=permiso_data
```

The service account in the key file should match: `firestore-data@permiso-467316.iam.gserviceaccount.com`

---

## 📋 Required Permissions

The service account needs these permissions for file uploads:

### Minimum Required:
- `storage.objects.create` - Create/upload files
- `storage.objects.delete` - Delete files (if needed)
- `storage.objects.get` - Read/download files

### Recommended Role:
**Storage Object Creator** - Provides:
- `storage.objects.create`
- `storage.objects.delete`
- `storage.objects.get`
- `storage.objects.list`

### Full Access Role:
**Storage Admin** - Provides all storage permissions (use with caution)

---

## 🔍 Verify It Works

After granting permissions:

1. Wait 1-2 minutes for changes to propagate
2. Restart your server
3. Try uploading a document
4. Check server logs for any errors

---

## 🆘 Still Not Working?

### Check 1: Verify Service Account Email
Make sure the service account email in your key file matches:
```json
{
  "client_email": "firestore-data@permiso-467316.iam.gserviceaccount.com"
}
```

### Check 2: Verify Bucket Name
Make sure `GCP_STORAGE_BUCKET` in `.env` matches the actual bucket name:
```env
GCP_STORAGE_BUCKET=permiso_data
```

### Check 3: Check Bucket Permissions
1. Go to [Cloud Storage Console](https://console.cloud.google.com/storage/browser?project=permiso-467316)
2. Click on `permiso_data` bucket
3. Go to **Permissions** tab
4. Verify the service account is listed with proper role

### Check 4: Try Different Service Account
If nothing works, you can use the same service account key that works for Firestore:
- The key file: `server/config/permiso-467316-f2f4ccf62d8a.json`
- Service account: `firestore-service@permiso-467316.iam.gserviceaccount.com`

Just make sure that service account also has Storage permissions.

---

## 📞 Quick Links

- **IAM Console**: https://console.cloud.google.com/iam-admin/iam?project=permiso-467316
- **Cloud Storage**: https://console.cloud.google.com/storage/browser?project=permiso-467316
- **Service Accounts**: https://console.cloud.google.com/iam-admin/serviceaccounts?project=permiso-467316

---

## 💡 Alternative: Use Cloudinary

If GCS continues to have issues, the application also supports Cloudinary as a fallback. Just configure:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

The upload route will automatically use Cloudinary if GCS fails.

