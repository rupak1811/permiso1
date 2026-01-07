import React, { useMemo, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useSocket } from '../../context/SocketContext';
import axios from 'axios';
import { 
  Home, 
  FileText, 
  Upload, 
  Bot, 
  Calculator, 
  FolderOpen,
  Eye,
  Settings,
  BarChart3,
  Users,
  Shield,
  Menu,
  X,
  Clock,
  CheckCircle2
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const { socket, on, off } = useSocket();
  const { t, currentLanguage } = useLanguage();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeProjectsCount, setActiveProjectsCount] = useState(0);
  const [pendingReviewsCount, setPendingReviewsCount] = useState(0);
  const [completedReviewsCount, setCompletedReviewsCount] = useState(0);

  // Fetch stats for users and reviewers
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      try {
        if (user.role === 'user') {
          const response = await axios.get('/api/projects?limit=1000');
          const projects = response.data.projects || [];
          
          // Count active projects (not draft, not withdrawn, not rejected)
          const activeProjects = projects.filter(p => 
            p.status !== 'draft' && 
            p.status !== 'withdrawn' && 
            p.status !== 'rejected'
          );
          
          // Count pending reviews
          const pendingReviews = projects.filter(p => 
            p.status === 'submitted' || p.status === 'under_review'
          );
          
          setActiveProjectsCount(activeProjects.length);
          setPendingReviewsCount(pendingReviews.length);
        } else if (user.role === 'reviewer') {
          const response = await axios.get('/api/projects?all=true&limit=1000');
          const projects = response.data.projects || [];
          
          // Count pending reviews (submitted and under_review)
          const pendingReviews = projects.filter(p => 
            p.status === 'submitted' || p.status === 'under_review'
          );
          
          // Count completed reviews (approved and rejected)
          const completedReviews = projects.filter(p => 
            p.status === 'approved' || p.status === 'rejected'
          );
          
          setPendingReviewsCount(pendingReviews.length);
          setCompletedReviewsCount(completedReviews.length);
        }
      } catch (error) {
        console.error('Error fetching project stats:', error);
        setActiveProjectsCount(0);
        setPendingReviewsCount(0);
        setCompletedReviewsCount(0);
      }
    };

    fetchStats();
    
    // Refresh stats every 15 seconds for better synchronization
    const interval = setInterval(fetchStats, 15000);
    
    // Listen for project updates via Socket.IO
    const handleProjectUpdate = () => {
      console.log('[Sidebar] Project updated, refreshing stats...');
      fetchStats();
    };
    
    // Listen for notifications (for users)
    const handleNotification = () => {
      console.log('[Sidebar] New notification received, refreshing stats...');
      fetchStats();
    };
    
    if (socket) {
      on('project_updated', handleProjectUpdate);
      on('notification', handleNotification);
    }
    
    return () => {
      clearInterval(interval);
      if (socket) {
        off('project_updated', handleProjectUpdate);
        off('notification', handleNotification);
      }
    };
  }, [user, socket]);

  const navigationItems = useMemo(() => {
    const baseItems = [
      {
        name: t('dashboard'),
        path: '/dashboard',
        icon: Home,
        roles: ['user', 'admin']
      },
      {
        name: t('projects'),
        path: '/projects',
        icon: FileText,
        roles: ['user']
      },
      {
        name: t('upload'),
        path: '/projects/upload',
        icon: Upload,
        roles: ['user']
      },
      {
        name: t('aiAssistant'),
        path: '/ai-assistant',
        icon: Bot,
        roles: ['user', 'admin']
      },
      {
        name: t('costEstimator'),
        path: '/cost-estimator',
        icon: Calculator,
        roles: ['user']
      },
      {
        name: t('documents'),
        path: '/documents',
        icon: FolderOpen,
        roles: ['user']
      },
      {
        name: 'Apply for Permits',
        path: '/apply-for-permits',
        icon: FileText,
        roles: ['user']
      },
      {
        name: 'Permits',
        path: '/permits',
        icon: FileText,
        roles: ['user']
      }
    ];

    // Reviewer-specific navigation
    if (user?.role === 'reviewer') {
      return [
        {
          name: 'Dashboard',
          path: '/reviewer/dashboard',
          icon: Home,
          roles: ['reviewer']
        },
        {
          name: 'Projects',
          path: '/reviewer/projects',
          icon: FileText,
          roles: ['reviewer']
        },
        {
          name: 'AI Analysis',
          path: '/reviewer/ai-analysis',
          icon: Bot,
          roles: ['reviewer']
        },
        {
          name: 'Pending Reviews',
          path: '/reviewer/pending',
          icon: Clock,
          roles: ['reviewer']
        },
        {
          name: 'Completed Reviews',
          path: '/reviewer/completed',
          icon: CheckCircle2,
          roles: ['reviewer']
        },
        {
          name: 'Permits',
          path: '/reviewer/permits',
          icon: FileText,
          roles: ['reviewer']
        }
      ];
    }

    if (user?.role === 'admin') {
      baseItems.push(
        {
          name: t('reviews'),
          path: '/reviewer/dashboard',
          icon: Eye,
          roles: ['admin']
        },
        {
          name: t('workflow'),
          path: '/reviewer/workflow',
          icon: BarChart3,
          roles: ['admin']
        }
      );
    }

    if (user?.role === 'admin') {
      baseItems.push(
        {
          name: t('admin'),
          path: '/admin/dashboard',
          icon: Shield,
          roles: ['admin']
        },
        {
          name: t('userManagement'),
          path: '/admin/users',
          icon: Users,
          roles: ['admin']
        },
        {
          name: t('projectManagement'),
          path: '/admin/projects',
          icon: FileText,
          roles: ['admin']
        },
        {
          name: t('analytics'),
          path: '/admin/analytics',
          icon: BarChart3,
          roles: ['admin']
        }
      );
    }

    return baseItems.filter(item => item.roles.includes(user?.role));
  }, [user?.role, t, currentLanguage]);

  const renderSidebarContent = () => (
    <>
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4 sm:mb-0">
          <h2 className="text-lg font-semibold text-white">{t('navigation')}</h2>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="sm:hidden p-2 text-gray-300 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <nav className="space-y-2">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
              </motion.div>
              <span className="font-medium">{item.name}</span>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-2 h-2 bg-blue-400 rounded-full"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="mt-6 sm:mt-8 pt-6 border-t border-white/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {user?.name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-white font-medium text-sm">{user?.name}</p>
            <p className="text-gray-400 text-xs capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {user?.role === 'user' && (
        <div className="mt-6 space-y-3">
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">{t('activeProjects')}</span>
              <span className="text-white font-bold">{activeProjectsCount}</span>
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">{t('pendingReviews')}</span>
              <span className="text-yellow-400 font-bold">{pendingReviewsCount}</span>
            </div>
          </div>
        </div>
      )}

      {user?.role === 'reviewer' && (
        <div className="mt-6 space-y-3">
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Pending Reviews</span>
              <span className="text-yellow-400 font-bold">{pendingReviewsCount}</span>
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Completed Reviews</span>
              <span className="text-green-400 font-bold">{completedReviewsCount}</span>
            </div>
          </div>
        </div>
      )}

      {user?.role === 'admin' && (
        <div className="mt-6 space-y-3">
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">{t('totalUsers')}</span>
              <span className="text-white font-bold">1,234</span>
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">{t('revenue')}</span>
              <span className="text-green-400 font-bold">$45K</span>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden sm:block w-64 glass border-r border-white/20 min-h-screen flex-shrink-0">
        <div className="p-4 sm:p-6">
          {renderSidebarContent()}
        </div>
      </aside>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="sm:hidden fixed bottom-4 right-4 z-50 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
        aria-label="Toggle navigation menu"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Mobile Bottom Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="sm:hidden fixed inset-0 bg-black/50 z-40"
            />
            
            {/* Sidebar Panel */}
            <motion.aside
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="sm:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/20 max-h-[80vh] overflow-y-auto"
            >
              <div className="p-4">
                {renderSidebarContent()}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
