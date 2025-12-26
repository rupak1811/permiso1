# Fix Firestore Index Errors

## Error Message
```
Error: 9 FAILED_PRECONDITION: The query requires an index.
```

## Problem
Firestore requires **composite indexes** when you query by one field and order by another field.

## ✅ Required Indexes

You need to create **2 composite indexes**:

### Index 1: Projects Collection
**Collection**: `projects`  
**Fields**:
- `applicant` (Ascending)
- `createdAt` (Descending)

👉 **[Create Projects Index](https://console.firebase.google.com/v1/r/project/permiso-467316/firestore/indexes?create_composite=Ck9wcm9qZWN0cy9wZXJtaXNvLTQ2NzMxNi9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvcHJvamVjdHMvaW5kZXhlcy9fEAEaDQoJYXBwbGljYW50EAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg)**

### Index 2: Notifications Collection
**Collection**: `notifications`  
**Fields**:
- `user` (Ascending)
- `createdAt` (Descending)

👉 **[Create Notifications Index](https://console.firebase.google.com/v1/r/project/permiso-467316/firestore/indexes?create_composite=ClRwcm9qZWN0cy9wZXJtaXNvLTQ2NzMxNi9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvbm90aWZpY2F0aW9ucy9pbmRleGVzL18QARoICgR1c2VyEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg)**

## ✅ Quick Fix (1 click per index!)

Each error message includes a direct link to create the index. Just click the links above:

1. Click the first link → Click **Create Index** → Wait for it to build
2. Click the second link → Click **Create Index** → Wait for it to build

This will:
1. Open the Firestore Console
2. Pre-configure the index
3. You just need to click **Create Index**

## Manual Steps (if link doesn't work)

1. Go to [Firestore Indexes](https://console.cloud.google.com/firestore/indexes?project=permiso-467316)
2. Click **Create Index**
3. Configure:
   - **Collection ID**: `projects`
   - **Fields to index**:
     - Field: `applicant`, Order: `Ascending`
     - Field: `createdAt`, Order: `Descending`
4. Click **Create**

## Wait for Index to Build

- Index creation takes 1-5 minutes
- You'll see status: "Building" → "Enabled"
- Once enabled, the query will work

## Alternative: Simplify Query (Temporary Fix)

If you need a quick workaround, we can modify the query to not require an index (but this is less efficient):

```javascript
// Instead of: query.where('applicant', '==', id).orderBy('createdAt', 'desc')
// Get all and sort in memory:
const snapshot = await query.get();
const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
projects.sort((a, b) => {
  const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
  const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
  return dateB - dateA;
});
```

**Note**: This is only recommended as a temporary fix. Creating the index is the proper solution.

