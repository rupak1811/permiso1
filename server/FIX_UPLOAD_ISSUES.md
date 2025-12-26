# Fix Upload Issues - Complete Guide

## Issue 1: Firestore Indexes Missing

### Error
```
Error: 9 FAILED_PRECONDITION: The query requires an index.
```

### ✅ Fix - Create 2 Indexes

You need to create **2 composite indexes**:

#### Index 1: Projects Collection
👉 **[Create Projects Index](https://console.firebase.google.com/v1/r/project/permiso-467316/firestore/indexes?create_composite=Ck9wcm9qZWN0cy9wZXJtaXNvLTQ2NzMxNi9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvcHJvamVjdHMvaW5kZXhlcy9fEAEaDQoJYXBwbGljYW50EAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg)**

**Fields**: `applicant` (Ascending) + `createdAt` (Descending)

#### Index 2: Notifications Collection
👉 **[Create Notifications Index](https://console.firebase.google.com/v1/r/project/permiso-467316/firestore/indexes?create_composite=ClRwcm9qZWN0cy9wZXJtaXNvLTQ2NzMxNi9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvbm90aWZpY2F0aW9ucy9pbmRleGVzL18QARoICgR1c2VyEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg)**

**Fields**: `user` (Ascending) + `createdAt` (Descending)

**Steps**:
1. Click each link above
2. Click **Create Index** on each page
3. Wait 1-5 minutes for indexes to build (status: "Building" → "Enabled")

---

## Issue 2: Storage Upload Error (Uniform Bucket-Level Access)

### Error
```
Cannot insert legacy ACL for an object when uniform bucket-level access is enabled.
```

### ✅ Fix Applied
I've already fixed the code by removing the `public: true` option from uploads. The bucket uses uniform bucket-level access, so ACLs must be set at the bucket level via IAM, not per-object.

### Make Files Public (If Needed)

If you need uploaded files to be publicly accessible:

1. Go to [Cloud Storage Console](https://console.cloud.google.com/storage/browser?project=permiso-467316)
2. Click on bucket: `permiso_data`
3. Click **Permissions** tab
4. Click **Grant Access**
5. Add:
   - **New principals**: `allUsers`
   - **Role**: `Storage Object Viewer`
6. Click **Save**

⚠️ **Warning**: This makes ALL files in the bucket publicly readable. For better security, consider:
- Using signed URLs for temporary access
- Keeping files private and serving through your API
- Using Cloudinary as an alternative

---

## Verify Fixes

1. **Restart your server** after code changes
2. **Wait for Firestore index** to finish building (check status in console)
3. **Try uploading a file** again

---

## Alternative: Use Cloudinary

If GCS continues to have issues, configure Cloudinary in `.env`:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

The upload route will automatically fall back to Cloudinary if GCS fails.

---

## Quick Links

- **Firestore Indexes**: https://console.cloud.google.com/firestore/indexes?project=permiso-467316
- **Cloud Storage**: https://console.cloud.google.com/storage/browser?project=permiso-467316
- **IAM Console**: https://console.cloud.google.com/iam-admin/iam?project=permiso-467316

