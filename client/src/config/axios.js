/**
 * Axios Configuration
 * Sets up base URL and default headers for API requests
 */

import axios from 'axios';

// Get API URL from environment variable or use relative path
// For Vercel deployment: empty string uses relative paths (works automatically)
// For local development: empty string uses proxy from package.json (http://localhost:5000)
// If REACT_APP_API_URL is set, it will override the proxy
// Note: The proxy in package.json only works in development mode
const API_URL = process.env.REACT_APP_API_URL || '';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/auth/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

