import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import { 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Activity,
  Sun,
  Moon,
  RefreshCw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard = () => {
  useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalProjects: 0,
    revenue: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [projectStatusData, setProjectStatusData] = useState([]);

  const fetchDashboardData = async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
        
        // Fetch dashboard stats
        const dashboardResponse = await axios.get('/api/admin/dashboard');
        const dashboardData = dashboardResponse.data;
        
        setStats({
          totalUsers: dashboardData.stats?.totalUsers || 0,
          activeUsers: dashboardData.stats?.activeUsers || 0,
          totalProjects: dashboardData.stats?.totalProjects || 0,
          revenue: dashboardData.stats?.revenue || 0
        });

        // Set recent projects (limit to 5)
        const projects = dashboardData.recentProjects || [];
        setRecentProjects(projects.slice(0, 5));

        // Format user growth data for chart
        const growthData = dashboardData.userGrowth || [];
        const formattedGrowth = growthData.map(item => ({
          month: item.month || `${item._id?.month || 1}/${item._id?.day || 1}`,
          users: item.users || item.count || 0,
          projects: item.projects || 0
        }));
        setUserGrowth(formattedGrowth.length > 0 ? formattedGrowth : []);

        // Format revenue data for chart
        const revenue = dashboardData.revenueData || [];
        const formattedRevenue = revenue.map(item => ({
          month: item.month || `${item._id?.month || 1}/${item._id?.day || 1}`,
          revenue: item.revenue || 0
        }));
        setRevenueData(formattedRevenue.length > 0 ? formattedRevenue : []);

        // Format project status data for pie chart
        const statusData = dashboardData.statusBreakdown || {};
        const formattedStatus = [
          { name: 'Approved', value: statusData.approved || 0, color: '#10B981' },
          { name: 'Under Review', value: statusData.under_review || 0, color: '#F59E0B' },
          { name: 'Rejected', value: statusData.rejected || 0, color: '#EF4444' },
          { name: 'Draft', value: statusData.draft || 0, color: '#6B7280' }
        ].filter(item => item.value > 0);
        setProjectStatusData(formattedStatus);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set empty data on error
        setStats({ totalUsers: 0, activeUsers: 0, totalProjects: 0, revenue: 0 });
        setRecentProjects([]);
        setUserGrowth([]);
        setRevenueData([]);
        setProjectStatusData([]);
      } finally {
        if (showLoading) {
          setLoading(false);
        } else {
          setRefreshing(false);
        }
      }
    };

  // Manual refresh handler
  const handleRefresh = () => {
    fetchDashboardData(false);
  };

  useEffect(() => {
    // Initial load with loading indicator
    fetchDashboardData(true);
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      approved: 'text-green-400 bg-green-500/20',
      under_review: 'text-yellow-400 bg-yellow-500/20',
      rejected: 'text-red-400 bg-red-500/20',
      draft: 'text-gray-400 bg-gray-500/20'
    };
    return colors[status] || 'text-gray-400 bg-gray-500/20';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'under_review':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      default:
        return <FileText className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 px-2 sm:px-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card p-4 sm:p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 break-words">Admin Dashboard</h1>
            <p className="text-sm sm:text-base text-gray-300">Overview of platform performance and management</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2.5 sm:p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/5 transition-colors flex justify-center items-center min-h-[44px] sm:min-h-0 disabled:opacity-50"
              aria-label="Refresh"
              title="Refresh data"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 sm:p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/5 transition-colors flex justify-center items-center min-h-[44px] sm:min-h-0"
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
              <p className="text-gray-400 text-xs sm:text-sm mb-1">Total Users</p>
              <p className="text-xl sm:text-2xl font-bold text-white truncate">{stats.totalUsers.toLocaleString()}</p>
              <p className="text-green-400 text-xs sm:text-sm mt-1">+12% from last month</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
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
              <p className="text-gray-400 text-xs sm:text-sm mb-1">Active Users</p>
              <p className="text-xl sm:text-2xl font-bold text-white truncate">{stats.activeUsers.toLocaleString()}</p>
              <p className="text-green-400 text-xs sm:text-sm mt-1">+8% from last month</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
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
              <p className="text-gray-400 text-xs sm:text-sm mb-1">Total Projects</p>
              <p className="text-xl sm:text-2xl font-bold text-white truncate">{stats.totalProjects.toLocaleString()}</p>
              <p className="text-green-400 text-xs sm:text-sm mt-1">+15% from last month</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
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
              <p className="text-gray-400 text-xs sm:text-sm mb-1">Revenue</p>
              <p className="text-xl sm:text-2xl font-bold text-white truncate">${stats.revenue.toLocaleString()}</p>
              <p className="text-green-400 text-xs sm:text-sm mt-1">+22% from last month</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* User Growth Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="glass-card p-4 sm:p-6"
        >
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">User Growth</h3>
          <div className="h-48 sm:h-56 md:h-64 w-full overflow-x-auto">
            <ResponsiveContainer width="100%" height="100%" minHeight={192}>
              <LineChart data={userGrowth} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="month" 
                  stroke="#9CA3AF" 
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="#9CA3AF" 
                  tick={{ fontSize: 12 }}
                  width={40}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    padding: '8px'
                  }}
                />
                <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="projects" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="glass-card p-4 sm:p-6"
        >
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Revenue Trend</h3>
          <div className="h-48 sm:h-56 md:h-64 w-full overflow-x-auto">
            <ResponsiveContainer width="100%" height="100%" minHeight={192}>
              <BarChart data={revenueData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="month" 
                  stroke="#9CA3AF" 
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="#9CA3AF" 
                  tick={{ fontSize: 12 }}
                  width={40}
                />
                <Tooltip 
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    padding: '8px'
                  }}
                />
                <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Project Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="glass-card p-4 sm:p-6"
        >
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Project Status</h3>
          <div className="h-48 sm:h-56 md:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%" minHeight={192}>
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius="30%"
                  outerRadius="60%"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    padding: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="lg:col-span-2 glass-card p-4 sm:p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
            <h3 className="text-lg sm:text-xl font-semibold text-white text-center sm:text-left">Recent Projects</h3>
            <button className="text-blue-400 hover:text-blue-300 text-xs sm:text-sm font-medium text-center py-1 px-2 min-h-[44px] sm:min-h-0">
              View All
            </button>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {loading ? (
              <div className="text-center py-8 text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
                <p>Loading projects...</p>
              </div>
            ) : recentProjects.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No projects yet</p>
              </div>
            ) : (
              recentProjects.map((project) => (
              <div key={project.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                  <div className="flex-shrink-0">
                    {getStatusIcon(project.status)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-white font-medium text-sm sm:text-base truncate">{project.title || project.name || 'Untitled Project'}</h4>
                    <p className="text-gray-400 text-xs sm:text-sm truncate">by {project.applicant?.name || project.applicant || 'Unknown'}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 sm:justify-end">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)} text-center whitespace-nowrap`}>
                    {project.status.replace('_', ' ')}
                  </span>
                  <span className="text-gray-400 text-xs sm:text-sm whitespace-nowrap">
                    ${(project.estimatedCost || project.cost || 0).toLocaleString()}
                  </span>
                  {project.submittedAt && (
                    <span className="text-gray-400 text-xs sm:text-sm whitespace-nowrap">
                      {project.submittedAt?.toDate ? 
                        project.submittedAt.toDate().toLocaleDateString() : 
                        new Date(project.submittedAt).toLocaleDateString()}
                    </span>
                  )}
                  <button className="p-2 text-gray-400 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="View project">
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.9 }}
        className="glass-card p-4 sm:p-6"
      >
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <button className="glass-button bg-gradient-to-r from-blue-500 to-purple-600 p-3 sm:p-4 text-center min-h-[100px] sm:min-h-[120px] flex flex-col items-center justify-center">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 flex-shrink-0" />
            <span className="font-medium text-sm sm:text-base">Manage Users</span>
          </button>
          <button className="glass-button bg-gradient-to-r from-green-500 to-teal-600 p-3 sm:p-4 text-center min-h-[100px] sm:min-h-[120px] flex flex-col items-center justify-center">
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 flex-shrink-0" />
            <span className="font-medium text-sm sm:text-base">View Projects</span>
          </button>
          <button className="glass-button bg-gradient-to-r from-yellow-500 to-orange-600 p-3 sm:p-4 text-center min-h-[100px] sm:min-h-[120px] flex flex-col items-center justify-center">
            <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 flex-shrink-0" />
            <span className="font-medium text-sm sm:text-base">Analytics</span>
          </button>
          <button className="glass-button bg-gradient-to-r from-purple-500 to-pink-600 p-3 sm:p-4 text-center min-h-[100px] sm:min-h-[120px] flex flex-col items-center justify-center">
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 flex-shrink-0" />
            <span className="font-medium text-sm sm:text-base">Reports</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
