const { Firestore } = require('@google-cloud/firestore');
const path = require('path');
const fs = require('fs');

let db = null;

const initFirestore = () => {
  try {
    const projectId = process.env.GCP_PROJECT_ID;

    if (!projectId) {
      console.warn('⚠️  GCP_PROJECT_ID not set. Firestore will not be available.');
      return null;
    }

    let firestoreConfig = { projectId };

    // Check if service account key is provided
    if (process.env.GCP_SERVICE_ACCOUNT_KEY) {
      try {
        // Try to parse as JSON string first
        const keyContent = process.env.GCP_SERVICE_ACCOUNT_KEY;
        let credentials;
        
        try {
          credentials = JSON.parse(keyContent);
          // It's a JSON string, use it directly
          firestoreConfig.credentials = credentials;
          console.log('✅ Using service account key from GCP_SERVICE_ACCOUNT_KEY (JSON string)');
        } catch (parseError) {
          // Not a JSON string, treat as file path
          const keyPath = path.resolve(keyContent);
          if (fs.existsSync(keyPath)) {
            firestoreConfig.keyFilename = keyPath;
            console.log(`✅ Using service account key from file: ${keyPath}`);
          } else {
            // Try default location
            const defaultPath = path.join(__dirname, '../config/permiso-467316-d136b462a194.json');
            if (fs.existsSync(defaultPath)) {
              firestoreConfig.keyFilename = defaultPath;
              console.log(`✅ Using service account key from default location: ${defaultPath}`);
            } else {
              throw new Error(`Service account key file not found: ${keyPath}`);
            }
          }
        }
      } catch (keyError) {
        console.error('❌ Error loading service account key:', keyError.message);
        throw keyError;
      }
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Use GOOGLE_APPLICATION_CREDENTIALS environment variable
      const keyPath = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS);
      if (fs.existsSync(keyPath)) {
        firestoreConfig.keyFilename = keyPath;
        console.log(`✅ Using service account key from GOOGLE_APPLICATION_CREDENTIALS: ${keyPath}`);
      } else {
        throw new Error(`Service account key file not found: ${keyPath}`);
      }
    } else {
      // Try default location
      const defaultPath = path.join(__dirname, '../config/permiso-467316-d136b462a194.json');
      if (fs.existsSync(defaultPath)) {
        firestoreConfig.keyFilename = defaultPath;
        console.log(`✅ Using service account key from default location: ${defaultPath}`);
      } else {
        // Try to use default credentials (for GCP environments like Cloud Run, GCE)
        console.log('⚠️  No service account key found. Attempting to use default credentials...');
        console.log('   (This will work if running on GCP or if default credentials are configured)');
      }
    }

    // Initialize Firestore client with Admin SDK privileges
    // When using service account credentials, this automatically uses Admin SDK
    // which bypasses security rules but still requires IAM permissions
    firestoreConfig.databaseId = '(default)'; // Use default database
    db = new Firestore(firestoreConfig);
    
    // Test connection with a simple operation
    console.log(`✅ Firestore client created for project: ${projectId}`);
    console.log('   Using Admin SDK (service account credentials)');
    console.log('   Note: Admin SDK bypasses security rules but requires IAM permissions');
    
    // Note: We don't actually make a query here to avoid permission errors during init
    // The connection will be tested on first actual query
    
    return db;
  } catch (error) {
    console.error('❌ Failed to initialize Firestore:', error.message);
    console.error('   Error details:', error);
    console.warn('⚠️  Database operations will not work. Please configure Firestore.');
    console.warn('   Make sure:');
    console.warn('   1. GCP_PROJECT_ID is set in .env');
    console.warn('   2. GCP_SERVICE_ACCOUNT_KEY points to a valid JSON key file or contains JSON string');
    console.warn('   3. The service account has Firestore permissions');
    return null;
  }
};

// Helper function to convert Firestore timestamp to Date
const toDate = (timestamp) => {
  if (!timestamp) return null;
  if (timestamp.toDate) return timestamp.toDate();
  if (timestamp instanceof Date) return timestamp;
  return new Date(timestamp);
};

// Helper function to convert Date to Firestore timestamp
const toTimestamp = (date) => {
  if (!date) return null;
  if (date instanceof Date) return date;
  return new Date(date);
};

module.exports = {
  initFirestore,
  getDb: () => db,
  toDate,
  toTimestamp
};

