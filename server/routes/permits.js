const express = require('express');
const { body, validationResult } = require('express-validator');
const permitService = require('../services/permitService');
const projectService = require('../services/projectService');
const notificationService = require('../services/notificationService');
const userService = require('../services/userService');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Test route to verify permits route is working
router.get('/test', (req, res) => {
  res.json({ message: 'Permits route is working', timestamp: new Date().toISOString() });
});

// @route   GET /api/permits
// @desc    Get all permits for user or reviewer
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    console.log('[GET /api/permits] Request received from user:', req.user?.id, 'role:', req.user?.role);
    
    const { status, permitType, all } = req.query;
    const filters = {};

    if (status) filters.status = status;
    if (permitType) filters.permitType = permitType;

    let permits = [];

    try {
      if (req.user.role === 'user') {
        console.log('[GET /api/permits] Fetching permits for user:', req.user.id);
        permits = await permitService.findByApplicant(req.user.id, filters);
      } else if (req.user.role === 'reviewer') {
        if (all === 'true') {
          console.log('[GET /api/permits] Fetching all permits for reviewer');
          // Get all permits
          permits = await permitService.findAll(filters);
        } else {
          console.log('[GET /api/permits] Fetching assigned and pending permits for reviewer');
          // Get assigned permits and pending permits
          const assignedPermits = await permitService.findByReviewer(req.user.id, filters);
          const pendingPermits = await permitService.findByStatus(['submitted', 'under_review'], filters);
          
          const allPermitIds = new Set();
          permits = [];
          
          for (const permit of assignedPermits) {
            if (!allPermitIds.has(permit.id)) {
              allPermitIds.add(permit.id);
              permits.push(permit);
            }
          }
          
          for (const permit of pendingPermits) {
            if (!allPermitIds.has(permit.id)) {
              allPermitIds.add(permit.id);
              permits.push(permit);
            }
          }
          
          permits.sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
            return dateB - dateA;
          });
        }
      } else {
        console.log('[GET /api/permits] Fetching all permits for admin');
        // Admin can see all
        permits = await permitService.findAll(filters);
      }
      
      console.log('[GET /api/permits] Found', permits.length, 'permits');
    } catch (serviceError) {
      console.error('Error fetching permits from service:', serviceError);
      console.error('Service error stack:', serviceError.stack);
      // Return empty array instead of crashing
      permits = [];
    }

    // Populate applicant and reviewer info
    for (let permit of permits) {
      try {
        if (permit.applicant) {
          const applicant = await userService.findById(permit.applicant);
          permit.applicant = applicant ? {
            id: applicant.id,
            name: applicant.name,
            email: applicant.email,
            phone: applicant.phone || null
          } : { id: permit.applicant, name: 'Unknown', email: null };
        }

        if (permit.reviewer) {
          const reviewer = await userService.findById(permit.reviewer);
          permit.reviewer = reviewer ? {
            id: reviewer.id,
            name: reviewer.name,
            email: reviewer.email
          } : { id: permit.reviewer, name: 'Unknown', email: null };
        }
      } catch (error) {
        console.error('Error populating user info:', error);
      }
    }

    console.log('[GET /api/permits] Sending response with', permits.length, 'permits');
    res.json({
      permits,
      total: permits.length
    });
  } catch (error) {
    console.error('Get permits error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/permits/:id
// @desc    Get permit by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const permit = await permitService.findById(req.params.id);

    if (!permit) {
      return res.status(404).json({ message: 'Permit not found' });
    }

    // Check permissions
    if (req.user.role === 'user' && permit.applicant !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Populate applicant and reviewer info
    if (permit.applicant) {
      try {
        const applicant = await userService.findById(permit.applicant);
        permit.applicant = applicant ? {
          id: applicant.id,
          name: applicant.name,
          email: applicant.email,
          phone: applicant.phone || null
        } : { id: permit.applicant, name: 'Unknown', email: null };
      } catch (error) {
        console.error('Error populating applicant:', error);
      }
    }

    if (permit.reviewer) {
      try {
        const reviewer = await userService.findById(permit.reviewer);
        permit.reviewer = reviewer ? {
          id: reviewer.id,
          name: reviewer.name,
          email: reviewer.email
        } : { id: permit.reviewer, name: 'Unknown', email: null };
      } catch (error) {
        console.error('Error populating reviewer:', error);
      }
    }

    res.json({ permit });
  } catch (error) {
    console.error('Get permit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/permits
// @desc    Create new permit application
// @access  Private (User)
router.post('/', auth, authorize('user'), [
  body('projectId').notEmpty().withMessage('Project ID is required'),
  body('permitType').isIn(['building', 'electric', 'plumber', 'demolition']).withMessage('Invalid permit type'),
  body('permitDescription').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { projectId, permitType, permitDescription, selectedDocuments, address } = req.body;

    // Get project details
    const project = await projectService.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user owns the project
    const applicantId = typeof project.applicant === 'string' 
      ? project.applicant 
      : project.applicant?.id || project.applicant;
    
    if (applicantId !== req.user.id) {
      return res.status(403).json({ message: 'You can only create permits for your own projects' });
    }

    // Create permit
    const permitData = {
      projectId: project.id,
      projectName: project.title,
      applicant: req.user.id,
      permitType,
      permitDescription: permitDescription || '',
      location: project.location || {},
      address: address || {},
      projectDocuments: project.documents || [],
      selectedDocuments: selectedDocuments || [],
      status: 'submitted'
    };

    const permit = await permitService.create(permitData);

    // Create notification for reviewers
    try {
      const io = req.app.get('io');
      if (io) {
        io.emit('new_permit_submitted', {
          permitId: permit.id,
          projectName: permit.projectName,
          permitType: permit.permitType,
          applicant: req.user.name || req.user.email
        });
      }
    } catch (notifError) {
      console.error('Error creating notification:', notifError);
    }

    res.status(201).json({
      message: 'Permit application submitted successfully',
      permit
    });
  } catch (error) {
    console.error('Create permit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/permits/:id/comment
// @desc    Add comment to permit
// @access  Private
router.post('/:id/comment', auth, [
  body('comment').trim().isLength({ min: 1 }).withMessage('Comment is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const permit = await permitService.findById(req.params.id);
    if (!permit) {
      return res.status(404).json({ message: 'Permit not found' });
    }

    // Check permissions
    const isApplicant = permit.applicant === req.user.id;
    const isReviewer = permit.reviewer === req.user.id || req.user.role === 'reviewer' || req.user.role === 'admin';
    
    if (!isApplicant && !isReviewer) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { comment } = req.body;

    // Add comment
    const commentData = {
      user: req.user.id,
      userName: req.user.name || req.user.email,
      userRole: req.user.role,
      comment
    };

    const newComment = await permitService.addComment(req.params.id, commentData);

    // Create notification for the other party
    try {
      const notificationTarget = isApplicant ? permit.reviewer : permit.applicant;
      if (notificationTarget) {
        await notificationService.create({
          user: notificationTarget,
          type: 'comment',
          title: 'New Comment on Permit',
          message: `${req.user.name || req.user.email} added a comment on permit application: ${permit.projectName}`,
          metadata: { permitId: permit.id }
        });

        const io = req.app.get('io');
        if (io) {
          io.to(notificationTarget).emit('notification', {
            type: 'comment',
            title: 'New Comment on Permit',
            message: `A new comment has been added to permit application: ${permit.projectName}`
          });
        }
      }
    } catch (notifError) {
      console.error('Error creating notification:', notifError);
    }

    res.json({
      message: 'Comment added successfully',
      comment: newComment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/permits/:id/action
// @desc    Perform action on permit (request more docs, approve, reject)
// @access  Private (Reviewer/Admin)
router.put('/:id/action', auth, authorize('reviewer', 'admin'), [
  body('action').isIn(['request_more_docs', 'approve', 'reject']).withMessage('Invalid action'),
  body('comment').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const permit = await permitService.findById(req.params.id);
    if (!permit) {
      return res.status(404).json({ message: 'Permit not found' });
    }

    // Check if reviewer has permission (must be assigned reviewer or admin)
    const reviewerId = typeof permit.reviewer === 'string' 
      ? permit.reviewer 
      : permit.reviewer?.id || permit.reviewer;
    
    if (req.user.role === 'reviewer' && reviewerId && reviewerId !== req.user.id) {
      return res.status(403).json({ message: 'You can only perform actions on permits assigned to you' });
    }

    const { action, comment, requestedDocuments } = req.body;

    let newStatus;
    if (action === 'request_more_docs') {
      newStatus = 'request_more_docs';
    } else if (action === 'approve') {
      newStatus = 'approved';
    } else if (action === 'reject') {
      newStatus = 'rejected';
    }

    // Update permit status
    const actionData = {
      reviewer: req.user.id,
      comment: comment || '',
      requestedDocuments: requestedDocuments || []
    };

    const updatedPermit = await permitService.updateStatus(req.params.id, newStatus, actionData);

    // Create notification for applicant
    try {
      await notificationService.create({
        user: permit.applicant,
        type: 'status_change',
        title: `Permit ${action === 'approve' ? 'Approved' : action === 'reject' ? 'Rejected' : 'Action Required'}`,
        message: `Your permit application for "${permit.projectName}" has been ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'requires more documents'}. ${comment ? `Comment: ${comment}` : ''}`,
        metadata: { permitId: permit.id }
      });

      const io = req.app.get('io');
      if (io) {
        io.to(permit.applicant).emit('notification', {
          type: 'status_change',
          title: `Permit ${action === 'approve' ? 'Approved' : action === 'reject' ? 'Rejected' : 'Action Required'}`,
          message: `Your permit application status has been updated`
        });

        io.emit('permit_updated', {
          permitId: permit.id,
          action,
          status: newStatus
        });
      }
    } catch (notifError) {
      console.error('Error creating notification:', notifError);
    }

    res.json({
      message: `Permit ${action} successfully`,
      permit: updatedPermit
    });
  } catch (error) {
    console.error('Permit action error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/permits/:id/assign
// @desc    Assign permit to reviewer
// @access  Private (Reviewer/Admin)
router.put('/:id/assign', auth, authorize('reviewer', 'admin'), async (req, res) => {
  try {
    const permit = await permitService.findById(req.params.id);
    if (!permit) {
      return res.status(404).json({ message: 'Permit not found' });
    }

    const reviewerId = req.body.reviewerId || req.user.id;

    await permitService.update(req.params.id, {
      reviewer: reviewerId,
      status: 'under_review'
    });

    const updatedPermit = await permitService.findById(req.params.id);

    // Create notification
    try {
      await notificationService.create({
        user: permit.applicant,
        type: 'status_change',
        title: 'Permit Under Review',
        message: `Your permit application for "${permit.projectName}" is now under review`,
        metadata: { permitId: permit.id }
      });

      const io = req.app.get('io');
      if (io) {
        io.to(permit.applicant).emit('notification', {
          type: 'status_change',
          title: 'Permit Under Review',
          message: `Your permit application is now under review`
        });
      }
    } catch (notifError) {
      console.error('Error creating notification:', notifError);
    }

    res.json({
      message: 'Permit assigned successfully',
      permit: updatedPermit
    });
  } catch (error) {
    console.error('Assign permit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Error handling middleware for this router
router.use((err, req, res, next) => {
  console.error('Permits route error:', err);
  if (!res.headersSent) {
    res.status(500).json({ message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
  }
});

module.exports = router;

