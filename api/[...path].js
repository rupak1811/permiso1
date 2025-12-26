/**
 * Vercel Serverless Function - Catch-all API Route
 * Handles all /api/* requests
 */

const app = require('../server/index');

// Export the Express app for Vercel
// Vercel will route /api/* requests to this function
module.exports = app;

