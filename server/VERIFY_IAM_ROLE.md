# How to Verify IAM Role is Correctly Set

## Quick Verification Steps

### 1. Check Current Roles

1. Go to: https://console.cloud.google.com/iam-admin/iam?project=permiso-467316
2. Find: `firestore-service@permiso-467316.iam.gserviceaccount.com`
3. Look at the **Roles** column
4. You should see one of these:
   - ✅ `Cloud Datastore User` 
   - ✅ `Cloud Firestore User`
   - ✅ `Owner` (too permissive, but works)

### 2. If Role is Missing

1. Click **Edit** (pencil icon) next to the service account
2. Click **Add Another Role**
3. Type: `datastore` or `firestore`
4. Select the appropriate role
5. Click **Save**

### 3. Verify Role Permissions

The role should have these permissions:
- `datastore.entities.create`
- `datastore.entities.get`
- `datastore.entities.list`
- `datastore.entities.update`
- `datastore.entities.delete`

Or for Firestore Native mode:
- `datastore.databases.get`
- `datastore.databases.list`
- `datastore.entities.create`
- `datastore.entities.get`
- `datastore.entities.list`
- `datastore.entities.update`
- `datastore.entities.delete`

### 4. Common Mistakes

❌ **Wrong**: Only `Viewer` or `Editor` roles (these don't grant Firestore access)
❌ **Wrong**: Custom role without Firestore permissions
✅ **Correct**: `Cloud Datastore User` or `Cloud Firestore User`

### 5. After Adding Role

1. **Wait 2-3 minutes** (IAM changes take time to propagate)
2. **Restart your server**
3. **Run diagnostic**: `node scripts/testFirestoreConnection.js`

---

## Still Getting Permission Denied?

### Check 1: Verify Service Account Email

Make sure the email in your key file matches:
```json
{
  "client_email": "firestore-service@permiso-467316.iam.gserviceaccount.com"
}
```

### Check 2: Verify Project ID

Make sure `.env` has:
```env
GCP_PROJECT_ID=permiso-467316
```

And it matches the key file:
```json
{
  "project_id": "permiso-467316"
}
```

### Check 3: Try Different Role

If `Cloud Datastore User` doesn't work, try:
- `Cloud Firestore User`
- `Firestore Admin` (more permissive)
- `Owner` (full access - for testing only)

### Check 4: Create New Service Account

If nothing works, create a fresh service account:

1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts?project=permiso-467316
2. Click **Create Service Account**
3. Name: `firestore-admin`
4. Click **Create and Continue**
5. Grant role: **Cloud Datastore User**
6. Click **Continue** → **Done**
7. Click on the new service account
8. Go to **Keys** tab
9. Click **Add Key** → **Create new key**
10. Choose **JSON**
11. Download and replace your key file
12. Update `.env`:
    ```env
    GCP_SERVICE_ACCOUNT_KEY=server/config/new-key-file.json
    ```

---

## Test Command

After making changes, always test:

```bash
cd server
node scripts/testFirestoreConnection.js
```

Look for all ✅ checkmarks in the output.

