import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// Session timeout: 10 minutes in milliseconds
const SESSION_TIMEOUT = 10 * 60 * 1000; // 10 minutes

// Helper function to update last activity timestamp
const updateLastActivity = () => {
  if (localStorage.getItem('token')) {
    localStorage.setItem('lastActivity', Date.now().toString());
  }
};

// Helper function to check if session has expired
const isSessionExpired = () => {
  const lastActivity = localStorage.getItem('lastActivity');
  if (!lastActivity) {
    return true; // No activity recorded, consider expired
  }
  const timeSinceLastActivity = Date.now() - parseInt(lastActivity, 10);
  return timeSinceLastActivity > SESSION_TIMEOUT;
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const activityTimeoutRef = useRef(null);

  // Set up axios interceptor for token
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [state.token]);

  // Check if user is logged in on app start and validate session timeout
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        // Check if session has expired
        if (isSessionExpired()) {
          // Session expired, log out user
          localStorage.removeItem('token');
          localStorage.removeItem('lastActivity');
          dispatch({ type: 'LOGOUT' });
          toast.error('Your session has expired. Please login again.');
          return;
        }

        try {
          const response = await axios.get('/api/auth/me');
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: response.data.user,
              token
            }
          });
          // Update last activity on successful auth check
          updateLastActivity();
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('lastActivity');
          dispatch({ type: 'LOGOUT' });
        }
      }
    };
    checkAuth();
  }, []);

  // Set up activity tracking for session timeout
  useEffect(() => {
    if (!state.isAuthenticated) {
      return; // Don't track activity if not authenticated
    }

    // Throttle activity updates to avoid excessive localStorage writes
    const throttledUpdateActivity = () => {
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
      activityTimeoutRef.current = setTimeout(() => {
        updateLastActivity();
      }, 1000); // Update at most once per second
    };

    // Events that indicate user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    // Add event listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, throttledUpdateActivity, { passive: true });
    });

    // Handle visibility change (when user switches tabs/windows or closes/reopens)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Page became visible again, check if session expired since last activity
        // This handles the case when user closes the website and reopens it
        if (isSessionExpired()) {
          localStorage.removeItem('token');
          localStorage.removeItem('lastActivity');
          dispatch({ type: 'LOGOUT' });
          toast.error('Your session has expired. Please login again.');
        } else {
          // Update activity when page becomes visible (user is back)
          updateLastActivity();
        }
      }
      // When page becomes hidden, we don't update activity
      // This allows the 10-minute timeout to work when user closes the website
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial activity update
    updateLastActivity();

    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, throttledUpdateActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
    };
  }, [state.isAuthenticated]);

  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      // Clear any existing token before login
      const oldToken = localStorage.getItem('token');
      if (oldToken) {
        delete axios.defaults.headers.common['Authorization'];
      }

      const response = await axios.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set last activity timestamp on login
      updateLastActivity();
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token }
      });
      
      toast.success('Login successful!');
      return { success: true, user };
    } catch (error) {
      // Clear token and last activity on error
      localStorage.removeItem('token');
      localStorage.removeItem('lastActivity');
      delete axios.defaults.headers.common['Authorization'];
      
      const message = error.response?.data?.message || error.message || 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await axios.post('/api/auth/register', userData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      
      // Set last activity timestamp on registration
      updateLastActivity();
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token }
      });
      
      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('lastActivity');
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/api/auth/profile', profileData);
      dispatch({
        type: 'UPDATE_USER',
        payload: response.data.user
      });
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
