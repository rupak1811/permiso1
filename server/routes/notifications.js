const express = require('express');
const notificationService = require('../services/notificationService');
const projectService = require('../services/projectService');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get user notifications
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    
    const filters = {};
    if (unreadOnly === 'true') {
      filters.isRead = false;
    }

    let notifications = await notificationService.findByUser(req.user.id, filters);

    // Populate project info
    for (let notification of notifications) {
      if (notification.project) {
        const project = await projectService.findById(notification.project);
        notification.project = project ? { id: project.id, title: project.title, type: project.type, status: project.status } : null;
      }
    }

    // Sort by createdAt descending
    notifications.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateB - dateA;
    });

    // Pagination
    const total = notifications.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedNotifications = notifications.slice(startIndex, endIndex);

    const unreadCount = await notificationService.getUnreadCount(req.user.id);

    res.json({
      notifications: paginatedNotifications,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await notificationService.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check ownership
    if (notification.user !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedNotification = await notificationService.markAsRead(req.params.id);

    res.json({
      message: 'Notification marked as read',
      notification: updatedNotification
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', auth, async (req, res) => {
  try {
    const count = await notificationService.markAllAsRead(req.user.id);

    res.json({ 
      message: 'All notifications marked as read',
      count
    });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await notificationService.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check ownership
    if (notification.user !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await notificationService.delete(req.params.id);

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/notifications/clear-all
// @desc    Clear all notifications
// @access  Private
router.delete('/clear-all', auth, async (req, res) => {
  try {
    // Get all user notifications and delete them
    const notifications = await notificationService.findByUser(req.user.id);
    
    for (const notification of notifications) {
      await notificationService.delete(notification.id);
    }

    res.json({ 
      message: 'All notifications cleared',
      count: notifications.length
    });
  } catch (error) {
    console.error('Clear all notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
