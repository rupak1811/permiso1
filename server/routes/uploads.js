const express = require('express');
const multer = require('multer');
const { auth } = require('../middleware/auth');
const projectService = require('../services/projectService');
const { uploadFile, deleteFile, initGCPStorage } = require('../config/gcpStorage');

const router = express.Router();

// Initialize GCP Storage
const gcpStorage = initGCPStorage();

// Fallback to Cloudinary if GCP Storage is not configured
let cloudinary = null;
if (!gcpStorage && process.env.CLOUDINARY_CLOUD_NAME) {
  try {
    cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    console.log('⚠️  Using Cloudinary as fallback (GCP Storage not configured)');
  } catch (error) {
    console.warn('Cloudinary not available');
  }
}

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 30 * 1024 * 1024 // 30MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|dwg|dxf/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and CAD files are allowed'));
    }
  }
});

// @route   POST /api/uploads
// @desc    Upload file to GCP Storage (or Cloudinary fallback)
// @access  Private
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let fileData;

    // Try GCP Storage first
    if (gcpStorage) {
      try {
        const folderPath = `uploads/${req.user.id || req.user._id}`;
        const result = await uploadFile(req.file, folderPath);
        
        fileData = {
          name: req.file.originalname,
          url: result.url,
          fileName: result.fileName,
          type: req.file.mimetype,
          size: req.file.size,
          storage: 'gcp'
        };
      } catch (gcpError) {
        console.error('GCP upload error:', gcpError);
        console.error('GCP upload error details:', {
          message: gcpError.message,
          stack: gcpError.stack,
          user: req.user?.id
        });
        // Fall through to Cloudinary if GCP fails
        if (!cloudinary) {
          throw gcpError;
        }
      }
    }

    // Fallback to Cloudinary if GCP not available or failed
    if (!fileData && cloudinary) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'auto',
            folder: 'permiso-documents'
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(req.file.buffer);
      });

      fileData = {
        name: req.file.originalname,
        url: result.secure_url,
        publicId: result.public_id,
        type: req.file.mimetype,
        size: req.file.size,
        storage: 'cloudinary'
      };
    }

    if (!fileData) {
      return res.status(500).json({ message: 'No storage service configured' });
    }

    res.json({
      message: 'File uploaded successfully',
      file: fileData
    });
  } catch (error) {
    console.error('Upload error:', error);
    console.error('Upload error details:', {
      message: error.message,
      stack: error.stack,
      hasFile: !!req.file,
      hasUser: !!req.user,
      gcpStorage: !!gcpStorage,
      cloudinary: !!cloudinary
    });
    res.status(500).json({ 
      message: 'File upload failed', 
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message 
    });
  }
});

// @route   POST /api/uploads/project/:projectId
// @desc    Upload file and attach to project
// @access  Private
router.post('/project/:projectId', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const project = await projectService.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check permissions
    if (req.user.role === 'user' && project.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    let fileData;

    // Try GCP Storage first
    if (gcpStorage) {
      try {
        const folderPath = `projects/${req.params.projectId}/documents`;
        const result = await uploadFile(req.file, folderPath);
        
        fileData = {
          name: req.file.originalname,
          url: result.url,
          fileName: result.fileName,
          type: req.file.mimetype,
          size: req.file.size
        };
      } catch (gcpError) {
        console.error('GCP upload error:', gcpError);
        if (!cloudinary) {
          throw gcpError;
        }
      }
    }

    // Fallback to Cloudinary
    if (!fileData && cloudinary) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'auto',
            folder: 'permiso-documents'
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(req.file.buffer);
      });

      fileData = {
        name: req.file.originalname,
        url: result.secure_url,
        publicId: result.public_id,
        type: req.file.mimetype,
        size: req.file.size
      };
    }

    if (!fileData) {
      return res.status(500).json({ message: 'No storage service configured' });
    }

    // Add document to project
    const document = {
      name: fileData.name,
      url: fileData.url,
      type: fileData.type,
      size: fileData.size,
      fileName: fileData.fileName || fileData.publicId, // Store reference for deletion
      uploadedAt: new Date()
    };

    await projectService.addDocument(req.params.projectId, document);

    res.json({
      message: 'File uploaded and attached to project successfully',
      document
    });
  } catch (error) {
    console.error('Upload to project error:', error);
    res.status(500).json({ message: 'File upload failed' });
  }
});

// @route   DELETE /api/uploads/project/:projectId/:documentId
// @desc    Delete document from project
// @access  Private
router.delete('/project/:projectId/:documentId', auth, async (req, res) => {
  try {
    const project = await projectService.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check permissions
    if (req.user.role === 'user' && project.applicant !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const documents = project.documents || [];
    const documentIndex = documents.findIndex(doc => doc.id === req.params.documentId || doc.fileName === req.params.documentId);
    
    if (documentIndex === -1) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const document = documents[documentIndex];

    // Delete from storage
    try {
      if (document.fileName) {
        // GCP Storage
        await deleteFile(document.fileName);
      } else if (document.publicId && cloudinary) {
        // Cloudinary
        await cloudinary.uploader.destroy(document.publicId);
      }
    } catch (error) {
      console.error('File deletion error:', error);
      // Continue even if deletion fails
    }

    // Remove from project
    await projectService.removeDocument(req.params.projectId, documentIndex);

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
