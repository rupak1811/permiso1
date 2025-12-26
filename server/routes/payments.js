const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { auth } = require('../middleware/auth');
const projectService = require('../services/projectService');
const userService = require('../services/userService');

const router = express.Router();

// @route   POST /api/payments/create-payment-intent
// @desc    Create Stripe payment intent
// @access  Private
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const { projectId, amount, currency = 'usd' } = req.body;

    if (!projectId || !amount) {
      return res.status(400).json({ message: 'Project ID and amount are required' });
    }

    const project = await projectService.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user owns the project
    if (project.applicant !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get or create Stripe customer
    let customerId = req.user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.name,
        metadata: {
          userId: req.user.id
        }
      });
      customerId = customer.id;
      
      // Save customer ID to user
      await userService.update(req.user.id, { stripeCustomerId: customerId });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      customer: customerId,
      metadata: {
        projectId: projectId,
        userId: req.user.id
      },
      automatic_payment_methods: {
        enabled: true
      }
    });

    // Update project with payment intent ID
    await projectService.update(projectId, { stripePaymentIntentId: paymentIntent.id });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ message: 'Payment processing failed' });
  }
});

// @route   POST /api/payments/confirm
// @desc    Confirm payment and update project status
// @access  Private
router.post('/confirm', auth, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ message: 'Payment intent ID is required' });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    // Find project by payment intent ID
    const allProjects = await projectService.findAll();
    const project = allProjects.find(p => p.stripePaymentIntentId === paymentIntentId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user owns the project
    if (project.applicant !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update project payment status
    await projectService.update(project.id, {
      paymentStatus: 'paid',
      actualCost: paymentIntent.amount / 100 // Convert from cents
    });
    
    const updatedProject = await projectService.findById(project.id);

    res.json({
      message: 'Payment confirmed successfully',
      project: updatedProject
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ message: 'Payment confirmation failed' });
  }
});

// @route   GET /api/payments/history
// @desc    Get payment history for user
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    let projects = await projectService.findByApplicant(req.user.id);
    
    // Filter by payment status
    projects = projects.filter(p => 
      ['paid', 'failed', 'refunded'].includes(p.paymentStatus)
    );

    // Sort by updatedAt descending
    projects.sort((a, b) => {
      const dateA = a.updatedAt?.toDate ? a.updatedAt.toDate() : new Date(a.updatedAt);
      const dateB = b.updatedAt?.toDate ? b.updatedAt.toDate() : new Date(b.updatedAt);
      return dateB - dateA;
    });

    // Pagination
    const total = projects.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedProjects = projects.slice(startIndex, endIndex).map(p => ({
      id: p.id,
      title: p.title,
      type: p.type,
      paymentStatus: p.paymentStatus,
      actualCost: p.actualCost,
      stripePaymentIntentId: p.stripePaymentIntentId,
      updatedAt: p.updatedAt
    }));

    res.json({
      payments: paginatedProjects,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/payments/webhook
// @desc    Stripe webhook handler
// @access  Public
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent succeeded:', paymentIntent.id);
      
      // Find and update project payment status
      const allProjects = await projectService.findAll();
      const project = allProjects.find(p => p.stripePaymentIntentId === paymentIntent.id);
      if (project) {
        await projectService.update(project.id, {
          paymentStatus: 'paid',
          actualCost: paymentIntent.amount / 100
        });
      }
      break;
    
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('PaymentIntent failed:', failedPayment.id);
      
      // Find and update project payment status
      const allProjectsFailed = await projectService.findAll();
      const failedProject = allProjectsFailed.find(p => p.stripePaymentIntentId === failedPayment.id);
      if (failedProject) {
        await projectService.update(failedProject.id, {
          paymentStatus: 'failed'
        });
      }
      break;
    
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

module.exports = router;
