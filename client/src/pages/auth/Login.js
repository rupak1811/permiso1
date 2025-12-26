import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const roleCopy = {
  user: {
    slugLabel: 'Customer Portal',
    title: 'Customer Login',
    subtitle: 'Access your projects, submissions, and AI assistance.',
    allowRegister: true,
    accent: 'from-blue-500 to-purple-600'
  },
  reviewer: {
    slugLabel: 'Reviewer Portal',
    title: 'Reviewer Login',
    subtitle: 'Secure workspace for municipal and agency reviewers.',
    allowRegister: false,
    accent: 'from-emerald-500 to-cyan-500'
  },
  admin: {
    slugLabel: 'Admin Portal',
    title: 'Admin Login',
    subtitle: 'Command center for agency leaders and operations.',
    allowRegister: false,
    accent: 'from-amber-500 to-orange-500'
  }
};

const roleRedirects = {
  user: '/dashboard',
  reviewer: '/reviewer/dashboard',
  admin: '/admin/dashboard'
};

const Login = ({ allowedRole = 'user' }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const { login, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const config = roleCopy[allowedRole] || roleCopy.user;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const result = await login(formData.email, formData.password);
    if (result.success) {
      const role = result.user?.role || allowedRole;
      navigate(roleRedirects[role] || '/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card w-full max-w-md"
      >
        <div className="text-center mb-8">
          <p className="text-sm uppercase tracking-[0.4em] text-white/70 mb-2">{config.slugLabel}</p>
          <h1 className="text-3xl font-bold text-white mb-2">
            {config.title}
          </h1>
          <p className="text-gray-300">
            {config.subtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
              {t('email')}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`glass-input w-full ${errors.email ? 'border-red-400' : ''}`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
              {t('password')}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`glass-input w-full ${errors.password ? 'border-red-400' : ''}`}
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                Remember me
              </label>
            </div>
            <Link
              to="/forgot-password"
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              {t('forgotPassword')}
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full glass-button bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {t('loading')}
              </div>
            ) : (
              t('login')
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-300">
            {config.allowRegister ? (
              <>
                {t('dontHaveAccount')}{' '}
                <Link
                  to="/register"
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  {t('register')}
                </Link>
              </>
            ) : (
              <span className="text-gray-400 text-sm">
                Don’t have access? <Link to="/contact" className="text-blue-400 hover:text-blue-300 transition-colors">Contact sales</Link>
              </span>
            )}
          </p>
        </div>

        {/* Language Switcher */}
        <div className="mt-6 flex justify-center space-x-4">
          <LanguageSwitcher />
        </div>
      </motion.div>
    </div>
  );
};

const LanguageSwitcher = () => {
  const { currentLanguage, changeLanguage } = useLanguage();
  
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' }
  ];

  return (
    <div className="flex space-x-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={`px-3 py-1 rounded-lg text-sm transition-all duration-300 ${
            currentLanguage === lang.code
              ? 'bg-white/20 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          {lang.flag} {lang.name}
        </button>
      ))}
    </div>
  );
};

export default Login;
