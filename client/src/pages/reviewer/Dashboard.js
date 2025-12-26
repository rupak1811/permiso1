import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import axios from 'axios';
import { 
  Clock, 
  CheckCircle, 
  FileText,
  TrendingUp,
  Eye,
  Bot,
  ArrowRight
} from 'lucide-react';

const ReviewerDashboard = () => {
  useLanguage();
  const { user } = useAuth();
  const { socket, on, off } = useSocket();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    pendingReviews: 0,
    completedReviews: 0,
    approvedProjects: 0,
    rejectedProjects: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch projects - API automatically returns assigned + submitted/under_review projects for reviewers
      const projectsResponse = await axios.get('/api/projects?all=true&limit=1000');
      const projectsData = projectsResponse.data.projects || [];
      
      // Calculate stats
      const pendingProjects = projectsData.filter(p => 
        p.status === 'submitted' || p.status === 'under_review'
      );
      const completedProjects = projectsData.filter(p => 
        p.status === 'approved' || p.status === 'rejected'
      );
      const approvedProjects = projectsData.filter(p => p.status === 'approved');
      const rejectedProjects = projectsData.filter(p => p.status === 'rejected');
      
      setStats({
        totalProjects: projectsData.length,
        pendingReviews: pendingProjects.length,
        completedReviews: completedProjects.length,
        approvedProjects: approvedProjects.length,
        rejectedProjects: rejectedProjects.length
      });
      
      // Get recent projects (last 5)
      const sortedProjects = [...projectsData].sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      setRecentProjects(sortedProjects.slice(0, 5));
    } catch (error) {
      console.error('Error fetching reviewer data:', error);
      setStats({
        totalProjects: 0,
        pendingReviews: 0,
        completedReviews: 0,
        approvedProjects: 0,
        rejectedProjects: 0
      });
      setRecentProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Refresh every 15 seconds
    const interval = setInterval(fetchData, 15000);
    
    // Listen for project updates via Socket.IO
    const handleProjectUpdate = () => {
      console.log('[Dashboard] Project updated, refreshing data...');
      fetchData();
    };
    
    if (socket) {
      on('project_updated', handleProjectUpdate);
    }
    
    return () => {
      clearInterval(interval);
      if (socket) {
        off('project_updated', handleProjectUpdate);
      }
    };
  }, [user, socket]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'submitted':
      case 'under_review':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card p-6"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Reviewer Dashboard</h1>
          <p className="text-gray-300">Overview of your review activities</p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Projects</p>
              <p className="text-2xl font-bold text-white">{stats.totalProjects}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending Reviews</p>
              <p className="text-2xl font-bold text-white">{stats.pendingReviews}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Completed</p>
              <p className="text-2xl font-bold text-white">{stats.completedReviews}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Approved</p>
              <p className="text-2xl font-bold text-white">{stats.approvedProjects}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Rejected</p>
              <p className="text-2xl font-bold text-white">{stats.rejectedProjects}</p>
            </div>
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="glass-card p-6 cursor-pointer hover:bg-white/5 transition-colors"
          onClick={() => navigate('/reviewer/projects')}
        >
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-8 h-8 text-blue-400" />
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="text-white font-semibold mb-2">All Projects</h3>
          <p className="text-gray-400 text-sm">View and manage all projects</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="glass-card p-6 cursor-pointer hover:bg-white/5 transition-colors"
          onClick={() => navigate('/reviewer/pending')}
        >
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-yellow-400" />
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="text-white font-semibold mb-2">Pending Reviews</h3>
          <p className="text-gray-400 text-sm">Review pending applications</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="glass-card p-6 cursor-pointer hover:bg-white/5 transition-colors"
          onClick={() => navigate('/reviewer/completed')}
        >
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="text-white font-semibold mb-2">Completed Reviews</h3>
          <p className="text-gray-400 text-sm">View completed reviews</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="glass-card p-6 cursor-pointer hover:bg-white/5 transition-colors"
          onClick={() => navigate('/reviewer/ai-analysis')}
        >
          <div className="flex items-center justify-between mb-4">
            <Bot className="w-8 h-8 text-purple-400" />
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="text-white font-semibold mb-2">AI Analysis</h3>
          <p className="text-gray-400 text-sm">Use AI for document analysis</p>
        </motion.div>
      </div>

      {/* Recent Projects */}
      {recentProjects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Recent Projects</h2>
            <button
              onClick={() => navigate('/reviewer/projects')}
              className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
            >
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="space-y-3">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                className="p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => navigate(`/reviewer/projects/${project.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Eye className="w-4 h-4 text-blue-400" />
                    <div>
                      <h3 className="text-white font-medium">{project.title || project.name || 'Untitled Project'}</h3>
                      <p className="text-gray-400 text-sm">
                        by {project.applicant?.name || project.applicant || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                    {project.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ReviewerDashboard;
