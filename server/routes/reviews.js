const express = require('express');
const { body, validationResult } = require('express-validator');
const projectService = require('../services/projectService');
const notificationService = require('../services/notificationService');
const userService = require('../services/userService');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/reviews/pending
// @desc    Get pending reviews for reviewer
// @access  Private (Reviewer)
router.get('/pending', auth, authorize('reviewer', 'admin'), async (req, res) => {
  try {
    const { status = 'submitted', page = 1, limit = 10 } = req.query;
    
    const filters = { status };
    let projects = [];

    if (req.user.role === 'reviewer') {
      projects = await projectService.findByReviewer(req.user.id, filters);
    } else {
      projects = await projectService.findAll(filters);
    }

    // Populate applicant info
    for (let project of projects) {
      if (project.applicant) {
        const applicant = await userService.findById(project.applicant);
        project.applicant = applicant ? { id: applicant.id, name: applicant.name, email: applicant.email, phone: applicant.phone } : null;
      }
    }

    // Sort by submittedAt descending
    projects.sort((a, b) => {
      const dateA = a.submittedAt?.toDate ? a.submittedAt.toDate() : new Date(a.submittedAt || a.createdAt);
      const dateB = b.submittedAt?.toDate ? b.submittedAt.toDate() : new Date(b.submittedAt || b.createdAt);
      return dateB - dateA;
    });

    // Pagination
    const total = projects.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedProjects = projects.slice(startIndex, endIndex);

    res.json({
      projects: paginatedProjects,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get pending reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/reviews/:projectId/approve
// @desc    Approve project
// @access  Private (Reviewer/Admin)
router.post('/:projectId/approve', auth, authorize('reviewer', 'admin'), [
  body('comment').optional().trim(),
  body('conditions').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { comment, conditions = [] } = req.body;
    const project = await projectService.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Get applicant ID - handle both string and object formats
    const applicantId = typeof project.applicant === 'string' 
      ? project.applicant 
      : project.applicant?.id || project.applicant;

    // Check access permissions - Reviewers can approve:
    // 1. Projects assigned to them
    // 2. Projects with status 'submitted' or 'under_review' (for assignment)
    if (req.user.role === 'reviewer') {
      const reviewerId = typeof project.reviewer === 'string' 
        ? project.reviewer 
        : project.reviewer?.id || project.reviewer;
      const isAssigned = reviewerId === req.user.id;
      const isPending = (project.status === 'submitted' || project.status === 'under_review');
      
      if (!isAssigned && !isPending) {
        return res.status(403).json({ message: 'Access denied. You can only approve assigned projects or pending reviews.' });
      }
    }

    // Add review comment
    if (comment) {
      await projectService.addReviewComment(req.params.projectId, {
        reviewer: req.user.id,
        comment
      }, applicantId);
      
      // Create notification for applicant about comment
      try {
        await notificationService.create({
          user: applicantId,
          type: 'comment',
          title: 'Review Comment Added',
          message: `Reviewer added a comment on your project "${project.title}": ${comment}`,
          project: project.id
        });
      } catch (notifError) {
        console.error('Error creating notification:', notifError);
      }
    }

    // Update project status
    const updatedProject = await projectService.update(req.params.projectId, {
      status: 'approved',
      approvedAt: new Date()
    }, applicantId);

    // Create notification for applicant
    try {
      await notificationService.create({
        user: applicantId,
        type: 'status_change',
        title: 'Project Approved',
        message: `Your project "${project.title}" has been approved!`,
        project: project.id,
        priority: 'high'
      });
    } catch (notifError) {
      console.error('Error creating notification:', notifError);
    }

      // Emit real-time notification
      const io = req.app.get('io');
      if (io) {
        io.to(applicantId).emit('notification', {
          type: 'status_change',
          title: 'Project Approved',
          message: `Your project "${project.title}" has been approved!`
        });
        
        // Broadcast to all reviewers that a project was updated
        io.emit('project_updated', {
          projectId: req.params.projectId,
          status: 'approved',
          type: 'status_change'
        });
      }

    res.json({
      message: 'Project approved successfully',
      project: updatedProject
    });
  } catch (error) {
    console.error('Approve project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/reviews/:projectId/reject
// @desc    Reject project
// @access  Private (Reviewer/Admin)
router.post('/:projectId/reject', auth, authorize('reviewer', 'admin'), [
  body('comment').trim().isLength({ min: 10 }).withMessage('Rejection comment must be at least 10 characters'),
  body('reasons').isArray({ min: 1 }).withMessage('At least one rejection reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { comment, reasons } = req.body;
    const project = await projectService.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Get applicant ID - handle both string and object formats
    const applicantId = typeof project.applicant === 'string' 
      ? project.applicant 
      : project.applicant?.id || project.applicant;

    // Check access permissions - Reviewers can reject:
    // 1. Projects assigned to them
    // 2. Projects with status 'submitted' or 'under_review' (for assignment)
    if (req.user.role === 'reviewer') {
      const reviewerId = typeof project.reviewer === 'string' 
        ? project.reviewer 
        : project.reviewer?.id || project.reviewer;
      const isAssigned = reviewerId === req.user.id;
      const isPending = (project.status === 'submitted' || project.status === 'under_review');
      
      if (!isAssigned && !isPending) {
        return res.status(403).json({ message: 'Access denied. You can only reject assigned projects or pending reviews.' });
      }
    }

    // Add review comment
    const rejectionComment = `${comment}\n\nRejection reasons: ${reasons.join(', ')}`;
    await projectService.addReviewComment(req.params.projectId, {
      reviewer: req.user.id,
      comment: rejectionComment
    }, applicantId);

    // Update project status
    const updatedProject = await projectService.update(req.params.projectId, {
      status: 'rejected',
      rejectedAt: new Date()
    }, applicantId);

    // Create notification for applicant
    try {
      await notificationService.create({
        user: applicantId,
        type: 'status_change',
        title: 'Project Rejected',
        message: `Your project "${project.title}" has been rejected. Please review the comments and resubmit.`,
        project: project.id,
        priority: 'high'
      });
    } catch (notifError) {
      console.error('Error creating notification:', notifError);
    }

    // Emit real-time notification
    const io = req.app.get('io');
    if (io) {
      io.to(applicantId).emit('notification', {
        type: 'status_change',
        title: 'Project Rejected',
        message: `Your project "${project.title}" has been rejected. Please review the comments and resubmit.`
      });
      
      // Broadcast to all reviewers that a project was updated
      io.emit('project_updated', {
        projectId: req.params.projectId,
        status: 'rejected',
        type: 'status_change'
      });
    }

    res.json({
      message: 'Project rejected successfully',
      project: updatedProject
    });
  } catch (error) {
    console.error('Reject project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/reviews/:projectId/comment
// @desc    Add review comment
// @access  Private (Reviewer/Admin)
router.post('/:projectId/comment', auth, authorize('reviewer', 'admin'), [
  body('comment').trim().isLength({ min: 5 }).withMessage('Comment must be at least 5 characters'),
  body('isInternal').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { comment, isInternal = false } = req.body;
    const project = await projectService.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Get applicant ID - handle both string and object formats
    const applicantId = typeof project.applicant === 'string' 
      ? project.applicant 
      : project.applicant?.id || project.applicant;
    
    console.log(`[Add Comment] Project ID: ${req.params.projectId}, Applicant ID: ${applicantId}, Reviewer: ${req.user.id}`);
    console.log(`[Add Comment] Project applicant type: ${typeof project.applicant}, value:`, project.applicant);

    if (!applicantId) {
      console.error('[Add Comment] No applicant ID found in project');
      return res.status(400).json({ message: 'Project applicant information is missing' });
    }

    // Check access permissions - Reviewers can comment on:
    // 1. Projects assigned to them
    // 2. Projects with status 'submitted' or 'under_review' (for assignment)
    if (req.user.role === 'reviewer') {
      const reviewerId = typeof project.reviewer === 'string' 
        ? project.reviewer 
        : project.reviewer?.id || project.reviewer;
      const isAssigned = reviewerId === req.user.id;
      const isPending = (project.status === 'submitted' || project.status === 'under_review');
      
      if (!isAssigned && !isPending) {
        return res.status(403).json({ message: 'Access denied. You can only comment on assigned projects or pending reviews.' });
      }
    }

    // Add review comment
    console.log(`[Add Comment] Calling addReviewComment with applicantId: ${applicantId}`);
    await projectService.addReviewComment(req.params.projectId, {
      reviewer: req.user.id,
      comment,
      isInternal
    }, applicantId);

    const updatedProject = await projectService.findById(req.params.projectId, applicantId);

    // Create notification for applicant (only if not internal)
    if (!isInternal) {
      console.log(`[Add Comment] Creating notification for user: ${applicantId}`);
      try {
        await notificationService.create({
          user: applicantId,
          type: 'comment',
          title: 'New Comment on Project',
          message: `Reviewer added a comment on your project "${project.title}": ${comment}`,
          project: project.id
        });
        console.log(`[Add Comment] Notification created successfully`);
      } catch (notifError) {
        console.error('[Add Comment] Error creating notification:', notifError);
        // Don't fail the comment if notification fails
      }

      // Emit real-time notification
      const io = req.app.get('io');
      if (io) {
        io.to(applicantId).emit('notification', {
          type: 'comment',
          title: 'New Comment on Project',
          message: `A new comment has been added to your project "${project.title}"`
        });
        
        // Broadcast to all reviewers that a project was updated
        io.emit('project_updated', {
          projectId: req.params.projectId,
          type: 'comment_added'
        });
      }
    }

    // Get the updated project to return the latest comment
    const finalProject = await projectService.findById(req.params.projectId, applicantId);
    const latestComment = finalProject.reviewComments && finalProject.reviewComments.length > 0
      ? finalProject.reviewComments[finalProject.reviewComments.length - 1]
      : null;

    res.json({
      message: 'Comment added successfully',
      comment: latestComment,
      project: finalProject
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/reviews/:projectId/documents/:documentId/verify
// @desc    Update document verification status
// @access  Private (Reviewer/Admin)
router.put('/:projectId/documents/:documentId/verify', auth, authorize('reviewer', 'admin'), [
  body('isVerified').isBoolean().withMessage('isVerified must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { isVerified } = req.body;
    const project = await projectService.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check access permissions - Reviewers can verify documents on:
    // 1. Projects assigned to them
    // 2. Projects with status 'submitted' or 'under_review' (for assignment)
    if (req.user.role === 'reviewer') {
      const isAssigned = project.reviewer === req.user.id;
      const isPending = (project.status === 'submitted' || project.status === 'under_review');
      
      if (!isAssigned && !isPending) {
        return res.status(403).json({ message: 'Access denied. You can only verify documents on assigned projects or pending reviews.' });
      }
    }

    const documentId = req.params.documentId;
    if (!documentId) {
      return res.status(400).json({ message: 'Document ID is required' });
    }

    // Update document verification status in subcollection
    const documents = await projectService.updateDocumentVerification(
      req.params.projectId,
      documentId,
      isVerified,
      req.user.id,
      project.applicant
    );

    const updatedProject = await projectService.findById(req.params.projectId, applicantId);
    
    // Find the verified document
    const verifiedDoc = documents.find(doc => doc.id === documentId);

    // Create notification for applicant when document verification status changes
    if (verifiedDoc) {
      const notificationMessage = isVerified 
        ? `Document "${verifiedDoc.name}" for project "${project.title}" has been verified by reviewer`
        : `Document "${verifiedDoc.name}" for project "${project.title}" verification status has been updated`;
      
      try {
        await notificationService.create({
          user: applicantId,
          type: 'document_verified',
          title: isVerified ? 'Document Verified' : 'Document Status Updated',
          message: notificationMessage,
          project: project.id
        });
      } catch (notifError) {
        console.error('Error creating notification:', notifError);
      }

      // Emit real-time notification
      const io = req.app.get('io');
      if (io) {
        io.to(applicantId).emit('notification', {
          type: 'document_verified',
          title: isVerified ? 'Document Verified' : 'Document Status Updated',
          message: notificationMessage
        });
        
        // Broadcast to all reviewers that a project was updated
        io.emit('project_updated', {
          projectId: req.params.projectId,
          type: 'document_verified'
        });
      }
    }

    res.json({
      message: 'Document verification status updated successfully',
      project: updatedProject
    });
  } catch (error) {
    console.error('Update document verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reviews/stats
// @desc    Get reviewer statistics
// @access  Private (Reviewer/Admin)
router.get('/stats', auth, authorize('reviewer', 'admin'), async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'reviewer') {
      query.reviewer = req.user._id;
    }

    const stats = await Project.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalProjects = await Project.countDocuments(query);
    const completedThisMonth = await Project.countDocuments({
      ...query,
      approvedAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    });

    res.json({
      statusBreakdown: stats,
      totalProjects,
      completedThisMonth
    });
  } catch (error) {
    console.error('Get review stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
