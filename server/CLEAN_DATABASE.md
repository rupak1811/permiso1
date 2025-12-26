# Clean Database - Delete All Data

## 🗑️ Delete ALL Data from Firestore

This will delete **EVERYTHING** - all users, projects, notifications, and any other data.

### ⚠️ WARNING
- **This is IRREVERSIBLE!**
- All data will be permanently deleted
- Users will need to register again
- All projects will be lost
- All notifications will be deleted

### Quick Start

1. **Make sure your server is stopped** (if running)

2. **Run the cleanup script**:
   ```bash
   cd server
   node scripts/deleteAllData.js
   ```

3. **Wait for confirmation**:
   - The script will show you what will be deleted
   - You have 10 seconds to cancel (Ctrl+C)
   - Then it will proceed with deletion

4. **Verify**:
   - The script will show how many documents were deleted
   - Database will be empty after completion

### What Gets Deleted

- ✅ **All Users** - Every user account
- ✅ **All Projects** - Every project application
- ✅ **All Notifications** - Every notification
- ✅ **Any Other Collections** - Any other data that exists

### After Cleanup

- Database will be completely empty
- Users can register fresh accounts
- Users can create new projects from scratch
- All counters will start at zero

### Alternative: Delete Only Demo Data

If you only want to delete demo/test data (not real user data):

```bash
node scripts/deleteAllDemoData.js
```

This only deletes:
- Users with demo emails (user@permiso.dev, etc.)
- Projects by demo users
- Notifications for demo users

### Troubleshooting

**Permission Denied Error:**
- Make sure service account has proper IAM roles
- See `server/FIX_PERMISSIONS_NOW.md` for help

**Script Hangs:**
- Large datasets may take time
- Be patient, it processes in batches of 500

**Collections Still Show:**
- Collections remain but are empty
- Firestore automatically removes empty collections after 7 days

### Safety Features

- ✅ Shows count before deletion
- ✅ 10-second cancellation window
- ✅ Processes in batches (safe for large datasets)
- ✅ Detailed progress reporting
- ✅ Error handling with helpful messages

