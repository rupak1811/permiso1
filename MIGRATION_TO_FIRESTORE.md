# Migration from MongoDB to Firestore - Summary

## ✅ Completed Changes

### 1. **Firestore Configuration**
- ✅ Created `server/config/firestore.js` - Firestore initialization
- ✅ Updated `server/index.js` - Removed MongoDB connection, added Firestore init

### 2. **Service Layer**
- ✅ Created `server/services/userService.js` - User CRUD operations
- ✅ Created `server/services/projectService.js` - Project CRUD operations
- ✅ Created `server/services/notificationService.js` - Notification CRUD operations

### 3. **Routes Updated**
- ✅ `server/routes/auth.js` - Uses `userService`
- ✅ `server/routes/projects.js` - Uses `projectService` and `notificationService`
- ✅ `server/routes/admin.js` - Uses all services, updated dashboard stats
- ✅ `server/routes/notifications.js` - Uses `notificationService`
- ✅ `server/routes/uploads.js` - Uses `projectService`
- ✅ `server/routes/reviews.js` - Uses `projectService` and `notificationService`
- ✅ `server/routes/payments.js` - Uses `projectService` and `userService`
- ✅ `server/routes/ai.js` - Uses `projectService`

### 4. **Middleware Updated**
- ✅ `server/middleware/auth.js` - Uses `userService` instead of MongoDB User model

## 📝 Key Differences: MongoDB vs Firestore

### Data Structure
- **MongoDB:** Uses `_id` (ObjectId)
- **Firestore:** Uses `id` (string) as document ID

### Queries
- **MongoDB:** Uses Mongoose queries with `.find()`, `.findOne()`, etc.
- **Firestore:** Uses collection queries with `.where()`, `.get()`, etc.

### Relationships
- **MongoDB:** Uses `.populate()` for references
- **Firestore:** Manual population by fetching related documents

### Aggregations
- **MongoDB:** Uses `.aggregate()` pipeline
- **Firestore:** Manual calculations in JavaScript (as implemented in admin dashboard)

## 🔄 Data Migration Notes

### User Collection
- Field `_id` → `id`
- Password hashing remains the same (bcrypt)
- Timestamps: `createdAt`, `updatedAt` (Firestore Timestamp)

### Project Collection
- Field `_id` → `id`
- References: `applicant` and `reviewer` store user IDs (strings)
- Arrays: `documents`, `forms`, `reviewComments` remain as arrays
- Timestamps: `createdAt`, `updatedAt`, `submittedAt`, etc.

### Notification Collection
- Field `_id` → `id`
- Reference: `user` stores user ID (string)
- Reference: `project` stores project ID (string)

## ⚠️ Important Notes

### Old Files (No Longer Used)
These files are kept for reference but are **NOT** used by the application:
- `server/models/User.js`
- `server/models/Project.js`
- `server/models/Notification.js`
- `server/config/database.js`

### Dependencies
- `mongoose` is still in `package.json` but not used
- You can remove it: `npm uninstall mongoose`
- `@google-cloud/firestore` is installed and used

## 🚀 Setup Required

1. **Enable Firestore API** in Google Cloud Console
2. **Create Firestore Database** (Native mode)
3. **Create Service Account** with Firestore permissions
4. **Download Service Account Key** (JSON file)
5. **Set Environment Variables:**
   ```env
   GCP_PROJECT_ID=your-project-id
   GOOGLE_APPLICATION_CREDENTIALS=./config/gcp-service-account-key.json
   ```

See `FIRESTORE_SETUP_GUIDE.md` for detailed setup instructions.

## 🧪 Testing Checklist

- [ ] User registration
- [ ] User login
- [ ] Profile update
- [ ] Project creation
- [ ] Project listing (with filters)
- [ ] Project update
- [ ] Document upload
- [ ] Review assignment
- [ ] Review approval/rejection
- [ ] Notification creation
- [ ] Notification reading
- [ ] Admin dashboard stats
- [ ] Payment processing
- [ ] AI analysis

## 📊 Performance Considerations

### Firestore Limitations
- **Query limitations:** Can only filter on one field at a time (unless using composite indexes)
- **No joins:** Must manually fetch related documents
- **Pagination:** Implemented client-side for now

### Optimizations Made
- Manual population of related documents
- Client-side filtering and sorting
- Efficient batch operations where possible

### Future Improvements
- Add composite indexes for complex queries
- Implement server-side pagination with cursors
- Cache frequently accessed data
- Use Firestore transactions for critical operations

## 🔐 Security

- Service account key should be kept secure
- Add `server/config/gcp-service-account-key.json` to `.gitignore`
- Use environment variables for sensitive data
- Consider using Secret Manager for production

## 📚 Documentation

- **Firestore Setup:** `FIRESTORE_SETUP_GUIDE.md`
- **GCP Storage Setup:** `GCP_SETUP_GUIDE.md`
- **API Key Setup:** `client/API_KEY_SETUP_GUIDE.md`

## 🆘 Troubleshooting

### Common Issues

1. **"Firestore not initialized"**
   - Check `GCP_PROJECT_ID` environment variable
   - Verify service account key file exists
   - Ensure Firestore API is enabled

2. **"Permission denied"**
   - Check service account has "Cloud Datastore User" role
   - Verify API is enabled in GCP Console

3. **"Database not found"**
   - Ensure Firestore database is created
   - Check project ID matches

4. **Query errors**
   - Some queries may need composite indexes
   - Check Firestore console for index creation prompts

## ✅ Next Steps

1. Test all functionality with Firestore
2. Monitor Firestore usage and costs
3. Set up alerts for quota limits
4. Consider data migration if you have existing MongoDB data
5. Remove unused MongoDB dependencies
6. Update deployment documentation

