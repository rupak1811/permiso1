# 🔧 Fix Firestore Permissions - Step by Step

## ⚠️ IMPORTANT: You're using Admin SDK
When using the Admin SDK (server-side), **Firestore Security Rules are bypassed**. The issue is **IAM permissions only**.

## Your Service Account Details
- **Email**: `firestore-service@permiso-467316.iam.gserviceaccount.com`
- **Project**: `permiso-467316`

---

## ✅ Solution 1: Grant IAM Role (Most Common Fix)

### Option A: Using Google Cloud Console (Recommended)

1. **Open IAM Console**:
   - Direct link: https://console.cloud.google.com/iam-admin/iam?project=permiso-467316

2. **Find Service Account**:
   - In the search box, type: `firestore-service`
   - OR scroll to find: `firestore-service@permiso-467316.iam.gserviceaccount.com`

3. **Edit Permissions**:
   - Click the **Edit** (pencil icon) ✏️ next to the service account
   - Click **Add Another Role** button
   - In the role dropdown, type and select: **`Cloud Datastore User`**
   - Click **Save**

4. **Wait 2-3 minutes** for permissions to propagate

5. **Restart your server**:
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart:
   npm start
   ```

### Option B: Using gcloud CLI (If you have it installed)

```bash
gcloud projects add-iam-policy-binding permiso-467316 \
  --member="serviceAccount:firestore-service@permiso-467316.iam.gserviceaccount.com" \
  --role="roles/datastore.user"
```

---

## ✅ Solution 2: Check Firestore Mode

Your project might be using **Firestore Native mode** instead of **Datastore mode**. Try this role instead:

1. Go to: https://console.cloud.google.com/iam-admin/iam?project=permiso-467316
2. Edit the service account
3. Add role: **`Cloud Firestore User`** (instead of Cloud Datastore User)
4. Save and wait 2-3 minutes
5. Restart server

---

## ✅ Solution 3: Grant Owner Role (For Testing Only)

If you need to test quickly and don't care about least privilege:

1. Go to: https://console.cloud.google.com/iam-admin/iam?project=permiso-467316
2. Edit the service account
3. Add role: **`Owner`**
4. Save and wait 2-3 minutes
5. Restart server

⚠️ **Warning**: Owner role gives full access. Remove it after testing and use a more specific role.

---

## ✅ Solution 4: Verify Firestore API is Enabled

1. Go to: https://console.cloud.google.com/apis/library?project=permiso-467316
2. Search for: **"Cloud Firestore API"**
3. If it shows **"API Enabled"**, you're good
4. If it shows **"Enable"**, click it and wait for it to enable

---

## ✅ Solution 5: Check Database Location

1. Go to: https://console.cloud.google.com/firestore?project=permiso-467316
2. Check if a database exists
3. If no database exists, create one:
   - Click **Create Database**
   - Choose **Native mode** (recommended) or **Datastore mode**
   - Select a location
   - Click **Create**

---

## 🔍 Verify the Fix

After making changes, run the diagnostic:

```bash
cd server
node scripts/testFirestoreConnection.js
```

You should see all ✅ checkmarks.

---

## 📋 Checklist

Before reporting it's still not working, verify:

- [ ] Service account has **Cloud Datastore User** OR **Cloud Firestore User** role
- [ ] Waited 2-3 minutes after adding the role
- [ ] Restarted the server after adding the role
- [ ] Firestore API is enabled
- [ ] Database exists in Firestore console
- [ ] `GCP_PROJECT_ID=permiso-467316` in `.env` file
- [ ] Service account key file exists and is readable

---

## 🆘 Still Not Working?

If you've tried all the above:

1. **Check the exact error** in the diagnostic output
2. **Verify the service account email** matches what's in your key file
3. **Try creating a new service account** with proper permissions from the start:
   - Go to: https://console.cloud.google.com/iam-admin/serviceaccounts?project=permiso-467316
   - Create new service account
   - Grant it **Cloud Datastore User** role during creation
   - Download the key and update your `.env` file

---

## 📞 Quick Links

- **IAM Console**: https://console.cloud.google.com/iam-admin/iam?project=permiso-467316
- **Firestore Console**: https://console.cloud.google.com/firestore?project=permiso-467316
- **APIs & Services**: https://console.cloud.google.com/apis/library?project=permiso-467316
- **Service Accounts**: https://console.cloud.google.com/iam-admin/serviceaccounts?project=permiso-467316

