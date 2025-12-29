/**
 * Vercel Serverless Function - Catch-all API Route
 * Handles all /api/* requests
 */

const app = require('../server/index');

// Export the Express app as a Vercel serverless function handler
// Vercel will automatically handle the request/response conversion
module.exports = app;

