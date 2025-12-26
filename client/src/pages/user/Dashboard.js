import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';
import axios from 'axios';
import { 
  Plus, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  DollarSign,
  Calendar,
  Eye,
  Download,
  Upload,
  Calculator
} from 'lucide-react';
import { Sun, Moon } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { socket, on, off } = useSocket();
  useLanguage();
  const [projects, setProjects] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    pendingReviews: 0,
    approvedProjects: 0,
    totalSpent: 0
  });

  // Fetch real data from API
  const fetchData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch projects for the authenticated user only
      const allProjectsResponse = await axios.get('/api/projects?limit=1000');
      const allProjects = allProjectsResponse.data.projects || [];
      
      // Fetch recent projects for display (limit 5)
      const recentProjects = allProjects.slice(0, 5);
      setProjects(recentProjects);

      // Fetch notifications
      const notificationsResponse = await axios.get('/api/notifications?limit=5');
      const notificationsData = notificationsResponse.data.notifications || [];
      
      // Format notifications with relative time
      const formattedNotifications = notificationsData.map(notif => {
        const date = notif.createdAt?.toDate ? notif.createdAt.toDate() : new Date(notif.createdAt);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        let timestamp = 'Just now';
        if (diffMins > 0 && diffMins < 60) {
          timestamp = `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        } else if (diffHours > 0 && diffHours < 24) {
          timestamp = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        } else if (diffDays > 0 && diffDays < 7) {
          timestamp = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        } else {
          timestamp = date.toLocaleDateString();
        }

        return {
          ...notif,
          timestamp,
          title: notif.title || 'Notification',
          message: notif.message || ''
        };
      });
      setNotifications(formattedNotifications);

      // Calculate stats from ALL projects
      const totalProjects = allProjects.length;
      const pendingReviews = allProjects.filter(p => 
        p.status === 'submitted' || p.status === 'under_review'
      ).length;
      const approvedProjects = allProjects.filter(p => p.status === 'approved').length;
      const totalSpent = allProjects.reduce((sum, p) => {
        return sum + (p.estimatedCost || p.cost || 0);
      }, 0);

      setStats({
        totalProjects,
        pendingReviews,
        approvedProjects,
        totalSpent
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set empty data on error
      setProjects([]);
      setNotifications([]);
      setStats({
        totalProjects: 0,
        pendingReviews: 0,
        approvedProjects: 0,
        totalSpent: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Refresh every 15 seconds
    const interval = setInterval(fetchData, 15000);
    
    // Listen for project updates via Socket.IO
    const handleProjectUpdate = (data) => {
      console.log('[User Dashboard] Project updated, refreshing data...', data);
      fetchData();
    };
    
    // Listen for notifications
    const handleNotification = () => {
      console.log('[User Dashboard] New notification received, refreshing...');
      fetchData();
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

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-500',
      submitted: 'bg-blue-500',
      under_review: 'bg-yellow-500',
      approved: 'bg-green-500',
      rejected: 'bg-red-500',
      withdrawn: 'bg-gray-400'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      urgent: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4" />;
      case 'under_review':
        return <Clock className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 px-2 sm:px-0">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card p-4 sm:p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 break-words">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-sm sm:text-base text-gray-300">
              Here's what's happening with your permit applications
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Link
              to="/projects/upload"
              className="glass-button bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 flex items-center justify-center space-x-2 w-full sm:w-auto px-4 py-2.5 sm:py-3 text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>New Project</span>
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2.5 sm:p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/5 transition-colors w-full sm:w-auto flex justify-center items-center min-h-[44px] sm:min-h-0"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass-card p-4 sm:p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-gray-400 text-xs sm:text-sm mb-1">Total Projects</p>
              <p className="text-xl sm:text-2xl font-bold text-white truncate">{stats.totalProjects}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card p-4 sm:p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-gray-400 text-xs sm:text-sm mb-1">Pending Reviews</p>
              <p className="text-xl sm:text-2xl font-bold text-white truncate">{stats.pendingReviews}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="glass-card p-4 sm:p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-gray-400 text-xs sm:text-sm mb-1">Approved</p>
              <p className="text-xl sm:text-2xl font-bold text-white truncate">{stats.approvedProjects}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-card p-4 sm:p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-gray-400 text-xs sm:text-sm mb-1">Total Spent</p>
              <p className="text-xl sm:text-2xl font-bold text-white truncate">${stats.totalSpent.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Recent Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="lg:col-span-2"
        >
          <div className="glass-card p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-white text-center sm:text-left">Recent Projects</h2>
              <Link
                to="/projects"
                className="text-blue-400 hover:text-blue-300 text-xs sm:text-sm font-medium text-center"
              >
                View All
              </Link>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {loading ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
                  <p>Loading projects...</p>
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No projects yet</p>
                  <Link
                    to="/projects/upload"
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium mt-2 inline-block"
                  >
                    Create your first project
                  </Link>
                </div>
              ) : (
                projects.map((project) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                  className="glass-card p-3 sm:p-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 ${getStatusColor(project.status)} rounded-lg flex items-center justify-center text-white flex-shrink-0`}>
                        {getStatusIcon(project.status)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-white font-medium text-sm sm:text-base truncate">{project.title || project.name || 'Untitled Project'}</h3>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(project.priority)} text-center whitespace-nowrap`}>
                        {project.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(project.status)} text-center whitespace-nowrap`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-2 sm:mb-3">
                    <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-2 text-xs sm:text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="whitespace-nowrap">${(project.estimatedCost || project.cost || 0).toLocaleString()}</span>
                      </div>
                      {project.submittedAt && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="whitespace-nowrap">
                            {project.submittedAt?.toDate ? 
                              project.submittedAt.toDate().toLocaleDateString() : 
                              new Date(project.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        to={`/projects/${project.id}`}
                        className="p-2 text-gray-400 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                        aria-label="View project"
                      >
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                      </Link>
                      <button 
                        className="p-2 text-gray-400 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                        aria-label="Download"
                      >
                        <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>

                  {project.status !== 'approved' && project.status !== 'rejected' && project.progress !== undefined && (
                    <div className="w-full bg-gray-700 rounded-full h-1.5 sm:h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress || 0}%` }}
                      />
                    </div>
                  )}
                </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="glass-card p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-white text-center sm:text-left">Notifications</h2>
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full text-center self-center">
                {notifications.filter(n => !n.isRead).length}
              </span>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {loading ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
                  <p>Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                  className={`p-3 sm:p-4 rounded-lg transition-colors ${
                    notification.isRead 
                      ? 'bg-white/5' 
                      : 'bg-blue-500/10 border border-blue-500/20'
                  }`}
                >
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      notification.isRead ? 'bg-gray-400' : 'bg-blue-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium text-xs sm:text-sm break-words">
                        {notification.title}
                      </h4>
                      <p className="text-gray-400 text-xs mt-1 break-words">
                        {notification.message}
                      </p>
                      <p className="text-gray-500 text-xs mt-2">
                        {notification.timestamp}
                      </p>
                    </div>
                  </div>
                </motion.div>
                ))
              )}
            </div>

            <Link
              to="/notifications"
              className="block text-center text-blue-400 hover:text-blue-300 text-xs sm:text-sm font-medium mt-4 py-2"
            >
              View All Notifications
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="glass-card p-4 sm:p-6"
      >
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Link
            to="/projects/upload"
            className="glass-button bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 p-3 sm:p-4 text-center min-h-[100px] sm:min-h-[120px] flex flex-col items-center justify-center"
          >
            <Upload className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 flex-shrink-0" />
            <span className="font-medium text-sm sm:text-base">Upload Project</span>
          </Link>
          <Link
            to="/ai-assistant"
            className="glass-button bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 p-3 sm:p-4 text-center min-h-[100px] sm:min-h-[120px] flex flex-col items-center justify-center"
          >
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 flex-shrink-0" />
            <span className="font-medium text-sm sm:text-base">AI Assistant</span>
          </Link>
          <Link
            to="/cost-estimator"
            className="glass-button bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 p-3 sm:p-4 text-center min-h-[100px] sm:min-h-[120px] flex flex-col items-center justify-center"
          >
            <Calculator className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 flex-shrink-0" />
            <span className="font-medium text-sm sm:text-base">Cost Estimator</span>
          </Link>
          <Link
            to="/documents"
            className="glass-button bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 p-3 sm:p-4 text-center min-h-[100px] sm:min-h-[120px] flex flex-col items-center justify-center"
          >
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 flex-shrink-0" />
            <span className="font-medium text-sm sm:text-base">Documents</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
