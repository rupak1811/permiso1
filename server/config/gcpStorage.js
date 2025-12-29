const { Storage } = require('@google-cloud/storage');
const path = require('path');

// Initialize Google Cloud Storage
let storage;
let bucket;

const initGCPStorage = () => {
  try {
    const projectId = process.env.GCP_PROJECT_ID;
    const bucketName = process.env.GCP_STORAGE_BUCKET;

    if (!bucketName) {
      console.warn('GCP_STORAGE_BUCKET not set. Cloud Storage will not be available.');
      return null;
    }

    let storageConfig = { projectId };

    // Handle service account credentials
    if (process.env.GCP_SERVICE_ACCOUNT_KEY) {
      try {
        // Try to parse as JSON string first (for Vercel environment variables)
        const keyContent = process.env.GCP_SERVICE_ACCOUNT_KEY;
        let credentials;
        
        try {
          credentials = JSON.parse(keyContent);
          // It's a JSON string, use it directly
          storageConfig.credentials = credentials;
          console.log('✅ Using service account key from GCP_SERVICE_ACCOUNT_KEY (JSON string)');
        } catch (parseError) {
          // Not a JSON string, treat as file path
          const keyPath = path.resolve(keyContent);
          if (require('fs').existsSync(keyPath)) {
            storageConfig.keyFilename = keyPath;
            console.log(`✅ Using service account key from file: ${keyPath}`);
          } else {
            // Try default location
            const defaultPath = path.join(__dirname, '../config/permiso-467316-f2f4ccf62d8a.json');
            if (require('fs').existsSync(defaultPath)) {
              storageConfig.keyFilename = defaultPath;
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
      if (require('fs').existsSync(keyPath)) {
        storageConfig.keyFilename = keyPath;
        console.log(`✅ Using service account key from GOOGLE_APPLICATION_CREDENTIALS: ${keyPath}`);
      } else {
        throw new Error(`Service account key file not found: ${keyPath}`);
      }
    } else {
      // Try default location
      const defaultPath = path.join(__dirname, '../config/permiso-467316-f2f4ccf62d8a.json');
      if (require('fs').existsSync(defaultPath)) {
        storageConfig.keyFilename = defaultPath;
        console.log(`✅ Using service account key from default location: ${defaultPath}`);
      } else {
        // Try to use default credentials (for GCP environments)
        console.log('⚠️  No service account key found. Attempting to use default credentials...');
        console.log('   (This will work if running on GCP or if default credentials are configured)');
      }
    }

    // Initialize storage client
    storage = new Storage(storageConfig);
    bucket = storage.bucket(bucketName);
    
    console.log(`✅ Google Cloud Storage initialized: ${bucketName}`);
    return { storage, bucket };
  } catch (error) {
    console.error('❌ Failed to initialize GCP Storage:', error.message);
    console.warn('⚠️  File uploads will not work. Please configure GCP Storage.');
    return null;
  }
};

// Upload file to Cloud Storage
const uploadFile = async (file, folderPath = '') => {
  if (!bucket) {
    throw new Error('GCP Storage not initialized. Please check configuration.');
  }

  try {
    const fileName = `${folderPath}/${Date.now()}-${file.originalname}`.replace(/^\//, '');
    const fileUpload = bucket.file(fileName);

    // Create write stream
    // Note: If bucket has uniform bucket-level access enabled, we can't set ACLs here
    // Public access should be configured at the bucket level via IAM
    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
        metadata: {
          originalName: file.originalname,
          uploadedAt: new Date().toISOString()
        }
      },
      resumable: false
    });

    return new Promise((resolve, reject) => {
      stream.on('error', (error) => {
        console.error('Upload error:', error);
        reject(error);
      });

      stream.on('finish', () => {
        // Get public URL
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        
        resolve({
          url: publicUrl,
          fileName: fileName,
          bucket: bucket.name,
          size: file.size,
          contentType: file.mimetype
        });
      });

      // Write file buffer to stream
      stream.end(file.buffer);
    });
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
};

// Delete file from Cloud Storage
const deleteFile = async (fileName) => {
  if (!bucket) {
    throw new Error('GCP Storage not initialized.');
  }

  try {
    await bucket.file(fileName).delete();
    console.log(`File deleted: ${fileName}`);
    return true;
  } catch (error) {
    console.error('File deletion error:', error);
    throw error;
  }
};

// Get file URL
const getFileUrl = (fileName) => {
  if (!bucket) {
    return null;
  }
  return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
};

// Check if file exists
const fileExists = async (fileName) => {
  if (!bucket) {
    return false;
  }

  try {
    const [exists] = await bucket.file(fileName).exists();
    return exists;
  } catch (error) {
    return false;
  }
};

module.exports = {
  initGCPStorage,
  uploadFile,
  deleteFile,
  getFileUrl,
  fileExists,
  getBucket: () => bucket,
  getStorage: () => storage
};

