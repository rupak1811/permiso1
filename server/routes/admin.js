const express = require('express');
const { body, validationResult } = require('express-validator');
const userService = require('../services/userService');
const projectService = require('../services/projectService');
const notificationService = require('../services/notificationService');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin)
router.get('/dashboard', auth, authorize('admin'), async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get all users and projects
    const [allUsers, allProjects] = await Promise.all([
      userService.findAll(),
      projectService.findAll()
    ]);

    // Calculate statistics
    const totalUsers = allUsers.length;
    const activeUsers = allUsers.filter(u => u.isActive !== false).length;
    const totalProjects = allProjects.length;
    
    // Filter projects by period
    const projectsThisPeriod = allProjects.filter(p => {
      const createdAt = p.createdAt?.toDate ? p.createdAt.toDate() : new Date(p.createdAt);
      return createdAt >= startDate;
    }).length;

    // Calculate revenue
    const revenueThisPeriod = allProjects
      .filter(p => {
        const updatedAt = p.updatedAt?.toDate ? p.updatedAt.toDate() : new Date(p.updatedAt);
        return p.paymentStatus === 'paid' && updatedAt >= startDate;
      })
      .reduce((sum, p) => sum + (p.actualCost || 0), 0);

    // Status breakdown
    const statusBreakdown = allProjects.reduce((acc, p) => {
      const status = p.status || 'draft';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // User growth (grouped by day)
    const userGrowthMap = {};
    allUsers
      .filter(u => {
        const createdAt = u.createdAt?.toDate ? u.createdAt.toDate() : new Date(u.createdAt);
        return createdAt >= startDate;
      })
      .forEach(u => {
        const createdAt = u.createdAt?.toDate ? u.createdAt.toDate() : new Date(u.createdAt);
        const key = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}-${String(createdAt.getDate()).padStart(2, '0')}`;
        userGrowthMap[key] = (userGrowthMap[key] || 0) + 1;
      });
    const userGrowth = Object.entries(userGrowthMap)
      .map(([date, count]) => {
        const [year, month, day] = date.split('-');
        return {
          _id: { year: parseInt(year), month: parseInt(month), day: parseInt(day) },
          count
        };
      })
      .sort((a, b) => {
        if (a._id.year !== b._id.year) return a._id.year - b._id.year;
        if (a._id.month !== b._id.month) return a._id.month - b._id.month;
        return a._id.day - b._id.day;
      });

    // Project growth (grouped by day)
    const projectGrowthMap = {};
    allProjects
      .filter(p => {
        const createdAt = p.createdAt?.toDate ? p.createdAt.toDate() : new Date(p.createdAt);
        return createdAt >= startDate;
      })
      .forEach(p => {
        const createdAt = p.createdAt?.toDate ? p.createdAt.toDate() : new Date(p.createdAt);
        const key = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}-${String(createdAt.getDate()).padStart(2, '0')}`;
        projectGrowthMap[key] = (projectGrowthMap[key] || 0) + 1;
      });
    const projectGrowth = Object.entries(projectGrowthMap)
      .map(([date, count]) => {
        const [year, month, day] = date.split('-');
        return {
          _id: { year: parseInt(year), month: parseInt(month), day: parseInt(day) },
          count
        };
      })
      .sort((a, b) => {
        if (a._id.year !== b._id.year) return a._id.year - b._id.year;
        if (a._id.month !== b._id.month) return a._id.month - b._id.month;
        return a._id.day - b._id.day;
      });

    res.json({
      overview: {
        totalUsers,
        activeUsers,
        totalProjects,
        projectsThisPeriod,
        revenueThisPeriod
      },
      statusBreakdown: Object.entries(statusBreakdown).map(([status, count]) => ({
        _id: status,
        count
      })),
      userGrowth,
      projectGrowth,
      period
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination
// @access  Private (Admin)
router.get('/users', auth, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    
    const filters = {};
    if (role) filters.role = role;

    let users = await userService.findAll(filters);

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(u => 
        u.name?.toLowerCase().includes(searchLower) || 
        u.email?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by createdAt descending
    users.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateB - dateA;
    });

    // Pagination
    const total = users.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedUsers = users.slice(startIndex, endIndex);

    res.json({
      users: paginatedUsers,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Private (Admin)
router.put('/users/:id/role', auth, authorize('admin'), [
  body('role').isIn(['user', 'reviewer', 'admin']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { role } = req.body;
    const user = await userService.update(req.params.id, { role });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/projects
// @desc    Get all projects with filters
// @access  Private (Admin)
router.get('/projects', auth, authorize('admin'), async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      type, 
      reviewer,
      startDate,
      endDate 
    } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (type) filters.type = type;

    let projects = await projectService.findAll(filters);

    // Apply additional filters
    if (reviewer) {
      projects = projects.filter(p => p.reviewer === reviewer);
    }
    if (startDate || endDate) {
      projects = projects.filter(p => {
        const createdAt = p.createdAt?.toDate ? p.createdAt.toDate() : new Date(p.createdAt);
        if (startDate && createdAt < new Date(startDate)) return false;
        if (endDate && createdAt > new Date(endDate)) return false;
        return true;
      });
    }

    // Populate applicant and reviewer info
    for (let project of projects) {
      if (project.applicant) {
        const applicant = await userService.findById(project.applicant);
        project.applicant = applicant ? { id: applicant.id, name: applicant.name, email: applicant.email } : null;
      }
      if (project.reviewer) {
        const reviewer = await userService.findById(project.reviewer);
        project.reviewer = reviewer ? { id: reviewer.id, name: reviewer.name, email: reviewer.email } : null;
      }
    }

    // Sort by createdAt descending
    projects.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
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
    console.error('Get admin projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get detailed analytics
// @access  Private (Admin)
router.get('/analytics', auth, authorize('admin'), async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Revenue analytics
    const revenueData = await Project.aggregate([
      { $match: { paymentStatus: 'paid', updatedAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$updatedAt' },
            month: { $month: '$updatedAt' },
            day: { $dayOfMonth: '$updatedAt' }
          },
          revenue: { $sum: '$actualCost' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Project type distribution
    const projectTypeDistribution = await Project.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // Average processing time
    const processingTimeData = await Project.aggregate([
      { 
        $match: { 
          status: { $in: ['approved', 'rejected'] },
          submittedAt: { $exists: true }
        } 
      },
      {
        $project: {
          processingTime: {
            $divide: [
              { $subtract: ['$updatedAt', '$submittedAt'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          },
          status: 1
        }
      },
      {
        $group: {
          _id: '$status',
          avgProcessingTime: { $avg: '$processingTime' }
        }
      }
    ]);

    res.json({
      revenueData,
      projectTypeDistribution,
      processingTimeData,
      period
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/audit
// @desc    Get audit trail
// @access  Private (Admin)
router.get('/audit', auth, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 50, action, userId, startDate, endDate } = req.query;
    
    const query = {};
    if (action) query.type = action;
    if (userId) query.user = userId;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const notifications = await Notification.find(query)
      .populate('user', 'name email role')
      .populate('project', 'title type')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);

    res.json({
      auditTrail: notifications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get audit trail error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/cleanup/all
// @desc    Delete all users and projects from database
// @access  Private (Admin)
router.delete('/cleanup/all', auth, authorize('admin'), async (req, res) => {
  try {
    const { getDb } = require('../config/firestore');
    const db = getDb();
    
    if (!db) {
      return res.status(500).json({ message: 'Database not initialized' });
    }

    const collections = ['users', 'projects', 'notifications'];
    let totalDeleted = 0;
    const batchSize = 500;

    for (const collectionId of collections) {
      try {
        const collection = db.collection(collectionId);
        const snapshot = await collection.get();
        
        if (snapshot.empty) {
          continue;
        }

        let batch = db.batch();
        let batchCount = 0;
        let deleted = 0;

        for (const doc of snapshot.docs) {
          batch.delete(doc.ref);
          batchCount++;
          deleted++;

          if (batchCount >= batchSize) {
            await batch.commit();
            batch = db.batch();
            batchCount = 0;
          }
        }

        if (batchCount > 0) {
          await batch.commit();
        }

        totalDeleted += deleted;
        console.log(`Deleted ${deleted} documents from ${collectionId}`);
      } catch (error) {
        console.error(`Error deleting ${collectionId}:`, error);
        // Continue with other collections
      }
    }

    res.json({
      message: 'All users and projects deleted successfully',
      totalDeleted,
      success: true
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ 
      message: 'Error during cleanup',
      error: error.message 
    });
  }
});

module.exports = router;
