const express = require('express');
const { body, validationResult } = require('express-validator');
const projectService = require('../services/projectService');
const notificationService = require('../services/notificationService');
const userService = require('../services/userService');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/projects
// @desc    Get all projects for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, type, page = 1, limit = 10, all } = req.query;
    console.log(`[Projects API] Request from ${req.user.role} (${req.user.id}), query params:`, { status, type, page, limit, all });
    
    const filters = {};

    // Additional filters
    if (status) filters.status = status;
    if (type) filters.type = type;

    // Parse 'all' parameter (query params are strings)
    const getAllProjects = all === 'true' || all === true;
    console.log(`[Projects API] getAllProjects: ${getAllProjects}, all param: ${all}, type: ${typeof all}`);

    let projects = [];

    // Filter by user role - RBAC implementation
    if (req.user.role === 'user') {
      // Users can only see their own projects
      projects = await projectService.findByApplicant(req.user.id, filters);
    } else if (req.user.role === 'reviewer') {
      // If 'all' parameter is true, reviewers can see all projects (for Projects page)
      if (getAllProjects) {
        // Reviewers can see all projects when explicitly requested
        console.log(`[Reviewer ${req.user.id}] Requesting all projects with filters:`, filters);
        projects = await projectService.findAll(filters);
        console.log(`[Reviewer ${req.user.id}] Fetched all projects: ${projects.length} projects found`);
      } else {
        // Default behavior: Reviewers can see:
        // 1. Projects assigned to them
        // 2. All submitted/under_review projects (for assignment)
        const assignedProjects = await projectService.findByReviewer(req.user.id, filters);
        const pendingProjects = await projectService.findByStatus(['submitted', 'under_review'], filters);
        
        console.log(`[Reviewer ${req.user.id}] Found ${assignedProjects.length} assigned projects and ${pendingProjects.length} pending projects`);
        
        // Merge and remove duplicates
        const allProjectIds = new Set();
        projects = [];
        
        // Add assigned projects first
        for (const project of assignedProjects) {
          if (!allProjectIds.has(project.id)) {
            allProjectIds.add(project.id);
            projects.push(project);
          }
        }
        
        // Add pending projects that aren't already assigned
        for (const project of pendingProjects) {
          if (!allProjectIds.has(project.id)) {
            allProjectIds.add(project.id);
            projects.push(project);
          }
        }
        
        // Sort by createdAt descending
        projects.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
          return dateB - dateA;
        });
        
        console.log(`[Reviewer ${req.user.id}] Total projects after merge: ${projects.length}`);
      }
    } else {
      // Admin can see all
      projects = await projectService.findAll(filters);
    }

    // Populate applicant and reviewer info
    for (let project of projects) {
      try {
        // Use _applicantId if available (from findByStatus), otherwise use project.applicant
        const applicantId = project._applicantId || project.applicant;
        
        if (applicantId) {
          try {
            const applicant = await userService.findById(applicantId);
            project.applicant = applicant ? { 
              id: applicant.id, 
              name: applicant.name, 
              email: applicant.email,
              phone: applicant.phone || null
            } : { id: applicantId, name: 'Unknown', email: null };
          } catch (userError) {
            console.error(`Error fetching applicant ${applicantId}:`, userError);
            project.applicant = { id: applicantId, name: 'Unknown', email: null };
          }
        }
        
        // Remove internal field
        delete project._applicantId;
        
        if (project.reviewer) {
          try {
            const reviewer = await userService.findById(project.reviewer);
            project.reviewer = reviewer ? { id: reviewer.id, name: reviewer.name, email: reviewer.email } : null;
          } catch (reviewerError) {
            console.error(`Error fetching reviewer ${project.reviewer}:`, reviewerError);
            project.reviewer = null;
          }
        }
      } catch (projectError) {
        console.error(`Error processing project ${project.id}:`, projectError);
        // Continue with next project
      }
    }

    // Pagination - skip if all=true and limit is high enough
    const total = projects.length;
    let paginatedProjects = projects;
    let totalPages = 1;
    
    // Only paginate if not requesting all projects or if limit is reasonable
    if (!(req.user.role === 'reviewer' && getAllProjects && parseInt(limit) >= 1000)) {
      const startIndex = (page - 1) * parseInt(limit);
      const endIndex = startIndex + parseInt(limit);
      paginatedProjects = projects.slice(startIndex, endIndex);
      totalPages = Math.ceil(total / parseInt(limit));
    } else {
      // Return all projects when all=true with high limit
      totalPages = 1;
      console.log(`[Projects API] Returning all ${total} projects (no pagination)`);
    }

    res.json({
      projects: paginatedProjects,
      totalPages: totalPages,
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get projects error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/projects/:id
// @desc    Get single project
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    // Try to find project - if user is the owner, we can optimize by searching their collection first
    let project = null;
    if (req.user.role === 'user') {
      // For users, search in their own collection first
      project = await projectService.findById(req.params.id, req.user.id);
    } else {
      // For reviewers/admins, search across all users
      project = await projectService.findById(req.params.id);
    }

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check access permissions - RBAC
    if (req.user.role === 'user') {
      // Users can only see their own projects
      if (project.applicant !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else if (req.user.role === 'reviewer') {
      // Reviewers can see:
      // 1. Projects assigned to them
      // 2. Projects with status 'submitted' or 'under_review' (for assignment)
      const isAssigned = project.reviewer === req.user.id;
      const isPending = (project.status === 'submitted' || project.status === 'under_review');
      
      if (!isAssigned && !isPending) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    // Admin can see all projects (no check needed)

    // Populate applicant and reviewer info
    if (project.applicant) {
      const applicant = await userService.findById(project.applicant);
      project.applicant = applicant ? { id: applicant.id, name: applicant.name, email: applicant.email, phone: applicant.phone } : null;
    }
    if (project.reviewer) {
      const reviewer = await userService.findById(project.reviewer);
      project.reviewer = reviewer ? { id: reviewer.id, name: reviewer.name, email: reviewer.email } : null;
    }

    // Populate review comments reviewers
    if (project.reviewComments && project.reviewComments.length > 0) {
      for (let comment of project.reviewComments) {
        if (comment.reviewer) {
          const reviewer = await userService.findById(comment.reviewer);
          comment.reviewer = reviewer ? { id: reviewer.id, name: reviewer.name, email: reviewer.email } : null;
        }
      }
    }

    res.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/projects
// @desc    Create new project
// @access  Private
router.post('/', auth, authorize('user'), [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').optional().trim(),
  body('type').isIn(['building', 'renovation', 'commercial', 'residential', 'other']).withMessage('Invalid project type'),
  body('estimatedCost').isFloat({ min: 0.01 }).withMessage('Estimated cost is required and must be greater than 0'),
  body('estimatedTimeline').isInt({ min: 1 }).withMessage('Estimated timeline is required and must be at least 1 day')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, type, location, documents, status, estimatedCost, estimatedTimeline, aiAnalysis } = req.body;

    // Validate required fields
    if (!estimatedCost || estimatedCost <= 0) {
      return res.status(400).json({ message: 'Estimated cost is required and must be greater than 0' });
    }
    if (!estimatedTimeline || estimatedTimeline <= 0) {
      return res.status(400).json({ message: 'Estimated timeline is required and must be greater than 0' });
    }

    // If documents are provided, automatically set status to 'submitted' so it appears in reviewer dashboard
    const projectStatus = status || (documents && documents.length > 0 ? 'submitted' : 'draft');
    const submittedAt = projectStatus === 'submitted' ? new Date() : null;

    console.log(`[Project Creation] Creating project for applicant: ${req.user.id}, User role: ${req.user.role}`);
    
    const project = await projectService.create({
      title,
      description,
      type,
      location,
      documents: documents || [], // Documents will be stored in subcollection
      estimatedCost: parseFloat(estimatedCost),
      estimatedTimeline: parseInt(estimatedTimeline),
      status: projectStatus,
      submittedAt,
      applicant: req.user.id,
      aiAnalysis: aiAnalysis || null
    });

    console.log(`[Project Created] ID: ${project.id}, Status: ${project.status}, Applicant: ${req.user.id}, Location: users/${req.user.id}/projects/${project.id}`);

    // Create notification for reviewers when project is submitted
    if (projectStatus === 'submitted') {
      const notificationService = require('../services/notificationService');
      try {
        // Notify all reviewers about new project (optional - can be enhanced to notify specific reviewers)
        // For now, we'll create a system notification that reviewers can see
        const io = req.app.get('io');
        if (io) {
          io.emit('new_project_submitted', {
            projectId: project.id,
            title: project.title,
            applicant: req.user.name || req.user.email
          });
          
          // Broadcast to all reviewers that a new project was created
          io.emit('project_updated', {
            projectId: project.id,
            type: 'project_created',
            status: 'submitted'
          });
        }
      } catch (notifError) {
        console.error('Error creating notification:', notifError);
        // Don't fail the project creation if notification fails
      }
    }

    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private
router.put('/:id', auth, [
  body('title').optional().trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').optional().trim(),
  body('status').optional().isIn(['draft', 'submitted', 'under_review', 'approved', 'rejected', 'withdrawn'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = await projectService.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check permissions
    if (req.user.role === 'user' && project.applicant !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, description, status, forms, documents, location, estimatedCost, estimatedTimeline } = req.body;
    const updateData = {};

    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status) updateData.status = status;
    if (forms) updateData.forms = forms;
    // Note: documents are now in subcollection, so we don't update them here
    // Use addDocument/removeDocument methods instead
    if (location) updateData.location = location;
    if (estimatedCost !== undefined) updateData.estimatedCost = estimatedCost;
    if (estimatedTimeline !== undefined) updateData.estimatedTimeline = estimatedTimeline;

    // Update timestamps based on status
    if (status === 'submitted' && !project.submittedAt) {
      updateData.submittedAt = new Date();
    }

    const updatedProject = await projectService.update(req.params.id, updateData, project.applicant);

    // Populate applicant info
    if (updatedProject.applicant) {
      const applicant = await userService.findById(updatedProject.applicant);
      updatedProject.applicant = applicant ? { id: applicant.id, name: applicant.name, email: applicant.email } : null;
    }

    // Create notification for status change
    if (status && status !== project.status) {
      await notificationService.create({
        user: project.applicant,
        type: 'status_change',
        title: 'Project Status Updated',
        message: `Your project "${project.title}" status has been updated to ${status.replace('_', ' ')}`,
        project: project.id
      });

      // Emit real-time notification
      const io = req.app.get('io');
      io.to(project.applicant).emit('notification', {
        type: 'status_change',
        title: 'Project Status Updated',
        message: `Your project "${project.title}" status has been updated to ${status.replace('_', ' ')}`
      });
    }

    res.json({
      message: 'Project updated successfully',
      project: updatedProject
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await projectService.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check permissions
    if (req.user.role === 'user' && project.applicant !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await projectService.delete(req.params.id, project.applicant);

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/projects/:id/assign
// @desc    Assign project to reviewer
// @access  Private (Admin/Reviewer)
router.post('/:id/assign', auth, authorize('admin', 'reviewer'), async (req, res) => {
  try {
    const { reviewerId } = req.body;
    const project = await projectService.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const updatedProject = await projectService.update(req.params.id, {
      reviewer: reviewerId,
      status: 'under_review'
    }, project.applicant);

    // Create notification for reviewer
    await notificationService.create({
      user: reviewerId,
      type: 'status_change',
      title: 'New Project Assigned',
      message: `You have been assigned to review project "${project.title}"`,
      project: project.id
    });

    res.json({
      message: 'Project assigned successfully',
      project: updatedProject
    });
  } catch (error) {
    console.error('Assign project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
