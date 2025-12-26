import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import { 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Globe,
  Search,
  Sun,
  Moon,
  CheckCircle,
  AlertCircle,
  FileText,
  DollarSign,
  Clock
} from 'lucide-react';
import BrandLogo from '../common/BrandLogo';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const { user, logout } = useAuth();
  const { currentLanguage, changeLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      setLoadingNotifications(true);
      const response = await axios.get('/api/notifications', {
        params: {
          limit: 10
        }
      });
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Fetch notifications when dropdown opens and periodically
  useEffect(() => {
    if (!user) return;
    
    // Fetch immediately
    fetchNotifications();
    
    // Set up periodic refresh every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);
    
    // Also fetch when dropdown opens
    if (isNotificationsOpen) {
      fetchNotifications();
    }
    
    return () => clearInterval(interval);
  }, [user, isNotificationsOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isNotificationsOpen && !event.target.closest('.notifications-dropdown')) {
        setIsNotificationsOpen(false);
      }
      if (isProfileOpen && !event.target.closest('.profile-dropdown')) {
        setIsProfileOpen(false);
      }
      if (isLanguageOpen && !event.target.closest('.language-dropdown')) {
        setIsLanguageOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotificationsOpen, isProfileOpen, isLanguageOpen]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'status_change':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'comment':
        return <FileText className="w-4 h-4 text-blue-400" />;
      case 'payment':
        return <DollarSign className="w-4 h-4 text-yellow-400" />;
      case 'reminder':
        return <Clock className="w-4 h-4 text-orange-400" />;
      case 'system':
        return <AlertCircle className="w-4 h-4 text-purple-400" />;
      default:
        return <Bell className="w-4 h-4 text-gray-400" />;
    }
  };

  // Format notification time
  const formatNotificationTime = (date) => {
    if (!date) return '';
    const notificationDate = date?.toDate ? date.toDate() : new Date(date);
    const now = new Date();
    const diffInSeconds = Math.floor((now - notificationDate) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return notificationDate.toLocaleDateString();
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' }
  ];

  // All available routes for search (based on user role)
  const searchableRoutes = useMemo(() => {
    const routes = [];

    // Common routes for all authenticated users
    if (user) {
      routes.push(
        { name: t('dashboard'), path: '/dashboard', icon: '📊', keywords: ['dashboard', 'home', 'main'] },
        { name: t('profile'), path: '/profile', icon: '👤', keywords: ['profile', 'settings', 'account', 'user'] },
        { name: t('aiAssistant'), path: '/ai-assistant', icon: '🤖', keywords: ['ai', 'assistant', 'chat', 'bot', 'help'] }
      );

      // User-specific routes
      if (user.role === 'user') {
        routes.push(
          { name: t('projects'), path: '/projects/upload', icon: '📁', keywords: ['projects', 'upload', 'create', 'new'] },
          { name: t('upload'), path: '/projects/upload', icon: '📤', keywords: ['upload', 'create', 'new project'] },
          { name: t('costEstimator'), path: '/cost-estimator', icon: '💰', keywords: ['cost', 'estimator', 'calculator', 'price', 'budget'] },
          { name: t('documents'), path: '/documents', icon: '📄', keywords: ['documents', 'files', 'manager'] }
        );
      }

      // Reviewer and Admin routes
      if (user.role === 'reviewer' || user.role === 'admin') {
        routes.push(
          { name: t('reviews'), path: '/reviewer/dashboard', icon: '👀', keywords: ['reviews', 'review', 'pending', 'approve'] },
          { name: t('workflow'), path: '/reviewer/workflow', icon: '📋', keywords: ['workflow', 'process', 'review'] }
        );
      }

      // Admin-only routes
      if (user.role === 'admin') {
        routes.push(
          { name: t('admin'), path: '/admin/dashboard', icon: '⚙️', keywords: ['admin', 'administration', 'manage'] },
          { name: 'Admin Users', path: '/admin/users', icon: '👥', keywords: ['users', 'user management', 'people'] },
          { name: 'Admin Projects', path: '/admin/projects', icon: '📊', keywords: ['projects', 'all projects', 'manage projects'] },
          { name: 'Admin Analytics', path: '/admin/analytics', icon: '📈', keywords: ['analytics', 'statistics', 'reports', 'data'] }
        );
      }
    }

    return routes;
  }, [user, t, currentLanguage]);

  // Filter routes based on search query
  const filteredRoutes = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase().trim();
    
    return searchableRoutes.filter(route => {
      const nameMatch = route.name.toLowerCase().includes(query);
      const pathMatch = route.path.toLowerCase().includes(query);
      const keywordMatch = route.keywords?.some(keyword => keyword.toLowerCase().includes(query));
      
      return nameMatch || pathMatch || keywordMatch;
    });
  }, [searchQuery, searchableRoutes]);

  const roleBasedLinks = useMemo(() => {
    // Return empty array for customer role (user) - all navigation is in sidebar
    if (user?.role === 'user') {
      return [];
    }

    const baseLinks = [
      { name: t('dashboard'), path: '/dashboard', icon: '📊' },
      { name: t('projects'), path: '/projects/upload', icon: '📁' },
      { name: t('aiAssistant'), path: '/ai-assistant', icon: '🤖' },
      { name: t('costEstimator'), path: '/cost-estimator', icon: '💰' },
      { name: t('documents'), path: '/documents', icon: '📄' }
    ];

    if (user?.role === 'reviewer' || user?.role === 'admin') {
      baseLinks.push(
        { name: t('reviews'), path: '/reviewer/dashboard', icon: '👀' }
      );
    }

    if (user?.role === 'admin') {
      baseLinks.push(
        { name: t('admin'), path: '/admin/dashboard', icon: '⚙️' }
      );
    }

    return baseLinks;
  }, [user?.role, t, currentLanguage]);

  const handleSearchSelect = (path) => {
    setSearchQuery('');
    setIsSearchFocused(false);
    navigate(path);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && filteredRoutes.length > 0) {
      handleSearchSelect(filteredRoutes[0].path);
    } else if (e.key === 'Escape') {
      setSearchQuery('');
      setIsSearchFocused(false);
    }
  };

  return (
    <nav className="glass border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <BrandLogo />
          </Link>

          {/* Desktop Navigation - only show if there are navigation links and not reviewer */}
          {roleBasedLinks.length > 0 && user?.role !== 'reviewer' && (
            <div className="hidden md:flex items-center space-x-8">
              {roleBasedLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center space-x-1"
                >
                  <span>{link.icon}</span>
                  <span>{link.name}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            {user && (
              <div className="hidden sm:block relative">
                <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md rounded-lg border border-white/10 px-3 py-2">
                  <Search className="text-gray-400 w-4 h-4 flex-shrink-0" />
                  <div className="w-px h-5 bg-white/20"></div>
                  <input
                    type="text"
                    placeholder={t('search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    onKeyDown={handleSearchKeyDown}
                    className="bg-transparent border-0 outline-0 text-white placeholder-gray-400 w-56 text-sm focus:ring-0"
                  />
                </div>
                
                {/* Search Results Dropdown */}
                {isSearchFocused && searchQuery.trim() && filteredRoutes.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-2 w-full max-h-80 overflow-y-auto glass-card rounded-lg shadow-xl z-50"
                  >
                    <div className="py-2">
                      {filteredRoutes.map((route, index) => (
                        <button
                          key={`${route.path}-${index}`}
                          onClick={() => handleSearchSelect(route.path)}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-white/10 transition-colors"
                        >
                          <span className="text-xl">{route.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{route.name}</p>
                            <p className="text-gray-400 text-xs truncate">{route.path}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* No Results Message */}
                {isSearchFocused && searchQuery.trim() && filteredRoutes.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-2 w-full glass-card rounded-lg shadow-xl z-50 p-4"
                  >
                    <p className="text-gray-400 text-sm text-center">No results found</p>
                  </motion.div>
                )}
              </div>
            )}

            {/* Notifications - hide for reviewers */}
            {user && user.role !== 'reviewer' && (
              <div className="relative notifications-dropdown">
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative p-2 text-gray-300 hover:text-white transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {isNotificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-80 sm:w-96 glass-card rounded-lg shadow-xl z-50 max-h-96 overflow-hidden flex flex-col"
                    >
                      {/* Header */}
                      <div className="px-4 py-3 border-b border-white/20 flex items-center justify-between">
                        <h3 className="text-white font-semibold text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={async () => {
                              try {
                                await axios.put('/api/notifications/read-all');
                                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                                setUnreadCount(0);
                              } catch (error) {
                                console.error('Error marking all as read:', error);
                              }
                            }}
                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>

                      {/* Notifications List */}
                      <div className="overflow-y-auto flex-1">
                        {loadingNotifications ? (
                          <div className="p-8 text-center">
                            <p className="text-gray-400 text-sm">Loading...</p>
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="p-8 text-center">
                            <Bell className="w-12 h-12 text-gray-500 mx-auto mb-3 opacity-50" />
                            <p className="text-gray-400 text-sm">No notifications</p>
                          </div>
                        ) : (
                          <div className="py-2">
                            {notifications.map((notification) => (
                              <button
                                key={notification.id}
                                onClick={() => {
                                  if (!notification.isRead) {
                                    markAsRead(notification.id);
                                  }
                                  setIsNotificationsOpen(false);
                                  if (notification.project?.id) {
                                    navigate(`/projects/${notification.project.id}`);
                                  } else if (notification.actionUrl) {
                                    navigate(notification.actionUrl);
                                  }
                                }}
                                className={`w-full flex items-start space-x-3 px-4 py-3 text-left hover:bg-white/10 transition-colors border-l-2 ${
                                  notification.isRead 
                                    ? 'border-transparent' 
                                    : 'border-blue-500 bg-blue-500/5'
                                }`}
                              >
                                <div className="flex-shrink-0 mt-0.5">
                                  {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium ${
                                    notification.isRead ? 'text-gray-300' : 'text-white'
                                  }`}>
                                    {notification.title}
                                  </p>
                                  <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                                    {notification.message}
                                  </p>
                                  <p className="text-gray-500 text-xs mt-1">
                                    {formatNotificationTime(notification.createdAt)}
                                  </p>
                                </div>
                                {!notification.isRead && (
                                  <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2" />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Footer - View All */}
                      {notifications.length > 0 && (
                        <div className="px-4 py-3 border-t border-white/20">
                          <Link
                            to="/dashboard"
                            onClick={() => setIsNotificationsOpen(false)}
                            className="text-center block text-sm text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            View all notifications
                          </Link>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Language Switcher */}
            <div className="relative language-dropdown">
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors p-2"
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm">
                  {languages.find(lang => lang.code === currentLanguage)?.flag}
                </span>
              </button>

              {isLanguageOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 glass-card py-2"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setIsLanguageOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        currentLanguage === lang.code
                          ? 'bg-white/20 text-white'
                          : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {lang.flag} {lang.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative profile-dropdown">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <span className="hidden sm:block text-sm">{user?.name}</span>
              </button>

              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 glass-card py-2"
                >
                  <div className="px-4 py-2 border-b border-white/20">
                    <p className="text-white font-medium">{user?.name}</p>
                    <p className="text-gray-400 text-sm">{user?.email}</p>
                    <p className="text-blue-400 text-xs capitalize">{user?.role}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    <span>{t('profileSettings')}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition-colors w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('logout')}</span>
                  </button>
                </motion.div>
              )}
            </div>

            {/* Mobile menu button - only show if there are navigation links and not reviewer */}
            {roleBasedLinks.length > 0 && user?.role !== 'reviewer' && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation - only show if there are navigation links and not reviewer */}
        {isMenuOpen && roleBasedLinks.length > 0 && user?.role !== 'reviewer' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-white/20"
          >
            <div className="space-y-2">
              {roleBasedLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition-colors rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>{link.icon}</span>
                  <span>{link.name}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* Mobile Search - only show if user is logged in */}
        {user && (
          <div className="sm:hidden py-4 border-t border-white/20">
            <div className="relative">
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md rounded-lg border border-white/10 px-3 py-2">
                <Search className="text-gray-400 w-4 h-4 flex-shrink-0" />
                <div className="w-px h-5 bg-white/20"></div>
                <input
                  type="text"
                  placeholder={t('search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  onKeyDown={handleSearchKeyDown}
                  className="bg-transparent border-0 outline-0 text-white placeholder-gray-400 flex-1 text-sm focus:ring-0"
                />
              </div>
              
              {/* Mobile Search Results Dropdown */}
              {isSearchFocused && searchQuery.trim() && filteredRoutes.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 max-h-80 overflow-y-auto glass-card rounded-lg shadow-xl z-50"
                >
                  <div className="py-2">
                    {filteredRoutes.map((route, index) => (
                      <button
                        key={`${route.path}-${index}`}
                        onClick={() => handleSearchSelect(route.path)}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-white/10 transition-colors"
                      >
                        <span className="text-xl">{route.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{route.name}</p>
                          <p className="text-gray-400 text-xs truncate">{route.path}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Mobile No Results Message */}
              {isSearchFocused && searchQuery.trim() && filteredRoutes.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 glass-card rounded-lg shadow-xl z-50 p-4"
                >
                  <p className="text-gray-400 text-sm text-center">No results found</p>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
