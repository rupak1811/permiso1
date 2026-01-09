const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const emailService = require('../services/emailService');
const jwt = require('jsonwebtoken');
const userService = require('../services/userService');

// Optional auth middleware - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        const user = await userService.findById(decoded.id);
        
        if (user) {
          req.user = {
            _id: user.id,
            id: user.id,
            ...user
          };
        }
      } catch (error) {
        // Invalid token, but continue without user
        console.log('Optional auth: Invalid token, continuing as guest');
      }
    }
    next();
  } catch (error) {
    // Continue without user if there's an error
    next();
  }
};

// @route   POST /api/contact
// @desc    Send contact form email
// @access  Public (but can use logged-in user's email if authenticated)
router.post('/', optionalAuth, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('subject').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, message, subject } = req.body;

    // If user is logged in, use their email (but still allow them to use a different email if needed)
    const fromEmail = req.user?.email || email;
    const fromName = req.user?.name || name;

    try {
      await emailService.sendContactEmail({
        fromEmail: fromEmail,
        fromName: fromName,
        message: message,
        subject: subject
      });

      res.json({
        success: true,
        message: 'Your message has been sent successfully. We will get back to you soon!'
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      res.status(500).json({
        success: false,
        message: 'Failed to send email. Please try again later or contact us directly at rupakchimakurthi1811@gmail.com'
      });
    }
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

module.exports = router;

