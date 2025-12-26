/**
 * Diagnostic script to test Firestore connection and permissions
 * 
 * This script will:
 * 1. Verify service account key is loaded
 * 2. Test basic Firestore read/write operations
 * 3. Identify permission issues
 * 
 * Usage: node scripts/testFirestoreConnection.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { initFirestore, getDb } = require('../config/firestore');
const fs = require('fs');
const path = require('path');

const testFirestoreConnection = async () => {
  console.log('🔍 Firestore Connection Diagnostic Tool\n');
  console.log('=' .repeat(60));

  // Step 1: Check environment variables
  console.log('\n📋 Step 1: Checking Environment Variables');
  const projectId = process.env.GCP_PROJECT_ID;
  const serviceAccountKey = process.env.GCP_SERVICE_ACCOUNT_KEY;
  const googleAppCreds = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  console.log(`   GCP_PROJECT_ID: ${projectId || '❌ NOT SET'}`);
  console.log(`   GCP_SERVICE_ACCOUNT_KEY: ${serviceAccountKey ? '✅ SET' : '❌ NOT SET'}`);
  console.log(`   GOOGLE_APPLICATION_CREDENTIALS: ${googleAppCreds || '❌ NOT SET'}`);

  if (!projectId) {
    console.error('\n❌ GCP_PROJECT_ID is not set in .env file!');
    console.error('   Please add: GCP_PROJECT_ID=your-project-id');
    process.exit(1);
  }

  // Step 2: Check service account key file
  console.log('\n📋 Step 2: Checking Service Account Key');
  let keyPath = null;
  let keyContent = null;

  if (serviceAccountKey) {
    try {
      // Try to parse as JSON
      keyContent = JSON.parse(serviceAccountKey);
      console.log('   ✅ GCP_SERVICE_ACCOUNT_KEY is a JSON string');
      console.log(`   Service Account Email: ${keyContent.client_email || 'N/A'}`);
      console.log(`   Project ID in key: ${keyContent.project_id || 'N/A'}`);
      
      if (keyContent.project_id !== projectId) {
        console.warn(`   ⚠️  WARNING: Project ID mismatch!`);
        console.warn(`      .env GCP_PROJECT_ID: ${projectId}`);
        console.warn(`      Key file project_id: ${keyContent.project_id}`);
      }
    } catch (e) {
      // Not JSON, treat as file path
      keyPath = path.resolve(serviceAccountKey);
      console.log(`   📁 GCP_SERVICE_ACCOUNT_KEY is a file path: ${keyPath}`);
    }
  } else if (googleAppCreds) {
    keyPath = path.resolve(googleAppCreds);
    console.log(`   📁 Using GOOGLE_APPLICATION_CREDENTIALS: ${keyPath}`);
  } else {
    // Try default location
    keyPath = path.join(__dirname, '../config/permiso-467316-d136b462a194.json');
    console.log(`   📁 Trying default location: ${keyPath}`);
  }

  if (keyPath && !keyContent) {
    if (fs.existsSync(keyPath)) {
      console.log(`   ✅ Key file exists`);
      try {
        keyContent = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
        console.log(`   Service Account Email: ${keyContent.client_email || 'N/A'}`);
        console.log(`   Project ID in key: ${keyContent.project_id || 'N/A'}`);
        
        if (keyContent.project_id !== projectId) {
          console.warn(`   ⚠️  WARNING: Project ID mismatch!`);
          console.warn(`      .env GCP_PROJECT_ID: ${projectId}`);
          console.warn(`      Key file project_id: ${keyContent.project_id}`);
        }
      } catch (error) {
        console.error(`   ❌ Error reading key file: ${error.message}`);
        process.exit(1);
      }
    } else {
      console.error(`   ❌ Key file not found: ${keyPath}`);
      console.error('   Please set GCP_SERVICE_ACCOUNT_KEY in .env file');
      process.exit(1);
    }
  }

  // Step 3: Initialize Firestore
  console.log('\n📋 Step 3: Initializing Firestore');
  try {
    const db = initFirestore();
    if (!db) {
      console.error('   ❌ Firestore initialization failed');
      process.exit(1);
    }
    console.log('   ✅ Firestore client created');
  } catch (error) {
    console.error(`   ❌ Error initializing Firestore: ${error.message}`);
    process.exit(1);
  }

  // Step 4: Test read operation
  console.log('\n📋 Step 4: Testing Read Operation');
  try {
    const db = getDb();
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const testCollection = db.collection('_test_connection');
    const snapshot = await testCollection.limit(1).get();
    console.log('   ✅ Read operation successful');
  } catch (error) {
    if (error.code === 7 || error.message?.includes('PERMISSION_DENIED')) {
      console.error('   ❌ PERMISSION DENIED on read operation');
      console.error('\n   🔧 To fix this:');
      console.error('   1. Go to https://console.cloud.google.com/iam-admin/iam');
      console.error(`   2. Find service account: ${keyContent?.client_email || 'N/A'}`);
      console.error('   3. Click Edit (pencil icon)');
      console.error('   4. Add role: "Cloud Datastore User" or "Cloud Firestore User"');
      console.error('   5. Save and wait a few minutes for changes to propagate');
    } else {
      console.error(`   ❌ Error: ${error.message}`);
    }
  }

  // Step 5: Test write operation
  console.log('\n📋 Step 5: Testing Write Operation');
  try {
    const db = getDb();
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const testCollection = db.collection('_test_connection');
    const testDoc = testCollection.doc('test-' + Date.now());
    await testDoc.set({
      test: true,
      timestamp: new Date(),
      message: 'Connection test'
    });
    console.log('   ✅ Write operation successful');

    // Clean up
    await testDoc.delete();
    console.log('   ✅ Test document cleaned up');
  } catch (error) {
    if (error.code === 7 || error.message?.includes('PERMISSION_DENIED')) {
      console.error('   ❌ PERMISSION DENIED on write operation');
      console.error('\n   🔧 To fix this:');
      console.error('   1. Go to https://console.cloud.google.com/iam-admin/iam');
      console.error(`   2. Find service account: ${keyContent?.client_email || 'N/A'}`);
      console.error('   3. Click Edit (pencil icon)');
      console.error('   4. Add role: "Cloud Datastore User" or "Cloud Firestore User"');
      console.error('   5. Save and wait a few minutes for changes to propagate');
    } else {
      console.error(`   ❌ Error: ${error.message}`);
    }
  }

  // Step 6: Test query operation (like findByEmail)
  console.log('\n📋 Step 6: Testing Query Operation (like findByEmail)');
  try {
    const db = getDb();
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const testCollection = db.collection('_test_connection');
    const snapshot = await testCollection
      .where('test', '==', true)
      .limit(1)
      .get();
    console.log('   ✅ Query operation successful');
  } catch (error) {
    if (error.code === 7 || error.message?.includes('PERMISSION_DENIED')) {
      console.error('   ❌ PERMISSION DENIED on query operation');
      console.error('\n   🔧 This is the same error you\'re seeing during registration!');
      console.error('   The service account needs IAM permissions to query Firestore.');
      console.error('\n   Quick fix:');
      console.error(`   1. Open: https://console.cloud.google.com/iam-admin/iam?project=${projectId}`);
      console.error(`   2. Find: ${keyContent?.client_email || 'your-service-account@...'}`);
      console.error('   3. Click Edit → Add Role → "Cloud Datastore User"');
      console.error('   4. Save and restart your server');
    } else {
      console.error(`   ❌ Error: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✨ Diagnostic complete!');
  console.log('\n📝 Summary:');
  console.log('   If you see PERMISSION_DENIED errors, the service account needs IAM roles.');
  console.log('   See server/FIRESTORE_PERMISSIONS_FIX.md for detailed instructions.\n');
};

// Run the diagnostic
if (require.main === module) {
  testFirestoreConnection()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Diagnostic failed:', error);
      process.exit(1);
    });
}

module.exports = { testFirestoreConnection };

