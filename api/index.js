/**
 * Vercel Serverless Function Entry Point
 * This file wraps the Express app for Vercel's serverless environment
 */

const app = require('../server/index');

// Export the Express app as a serverless function
module.exports = app;

