const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Initialize GCP Services
const { initFirestore } = require('./config/firestore');
const { initGCPStorage } = require('./config/gcpStorage');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Firestore
const db = initFirestore();
if (!db && process.env.NODE_ENV !== 'production') {
  console.warn('⚠️  Firestore not initialized. Database operations will fail.');
}

// Initialize GCP Storage
const storage = initGCPStorage();
if (!storage && process.env.NODE_ENV !== 'production') {
  console.warn('⚠️  GCP Storage not initialized. File uploads will fail.');
}

// Middleware
app.use(helmet());

// Trust proxy if behind a reverse proxy (for rate limiting)
// Set to true if behind a proxy (e.g., nginx, load balancer, Vercel)
// Vercel automatically sets this, but we enable it explicitly
const isVercelProxy = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
app.set('trust proxy', isVercelProxy || process.env.TRUST_PROXY === 'true');

// CORS configuration - allow same origin (Vercel) and configured origins
app.use(cors({
  origin: process.env.CLIENT_URL || (isVercelProxy ? true : 'http://localhost:3000'),
  credentials: true
}));
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip X-Forwarded-For header check if not behind proxy
  skip: (req) => {
    // Skip if trust proxy is false and X-Forwarded-For is present
    return !app.get('trust proxy') && req.headers['x-forwarded-for'];
  }
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/permits', require('./routes/permits'));
app.use('/api/uploads', require('./routes/uploads'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin', require('./routes/admin'));

// Error handling middleware
app.use((err, req, res, next) => {
  // Only log full stack in development
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  } else {
    console.error('Error:', err.message);
  }
  res.status(err.status || 500).json({ 
    message: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Firestore is initialized above
// No need for MongoDB connection

// Socket.io setup - only in non-serverless environments
let io = null;
let server = null;

// Check if running in Vercel serverless environment
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;

if (!isVercel) {
  // Start server only in non-serverless environments (local development)
  server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Socket.io setup
  io = require('socket.io')(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // Socket.io connection handling
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    socket.on('join-room', (room) => {
      socket.join(room);
      console.log(`User ${socket.id} joined room ${room}`);
    });
    
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  // Make io available to routes
  app.set('io', io);
} else {
  // In Vercel serverless environment, Socket.IO won't work
  // Create a mock io object to prevent errors in routes
  io = {
    to: () => ({ emit: () => {} }),
    emit: () => {}
  };
  app.set('io', io);
  // Don't start a server - Vercel handles requests via serverless functions
}

module.exports = app;
