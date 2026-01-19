import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useSocket } from '../../context/SocketContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  FileText, 
  Search, 
  Filter, 
  Eye,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  RefreshCw
} from 'lucide-react';

const ProjectsList = () => {
  const { user } = useAuth();
  const { socket, on, off } = useSocket();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const fetchProjects = async (showLoading = false) => {
    if (!user) return;
    
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      const response = await axios.get('/api/projects?limit=1000');
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
      setProjects([]);
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
    fetchProjects(false);
  };

  useEffect(() => {
    // Initial load with loading indicator
    fetchProjects(true);
    
    // Listen for project updates via Socket.IO - update silently without loading indicator
    const handleProjectUpdate = () => {
      console.log('[ProjectsList] Project updated, refreshing silently...');
      fetchProjects(false); // Silent update
    };
    
    // Listen for notifications - update silently
    const handleNotification = () => {
      console.log('[ProjectsList] New notification received, refreshing silently...');
      fetchProjects(false); // Silent update
    };
    
    if (socket) {
      on('project_updated', handleProjectUpdate);
      on('notification', handleNotification);
    }
    
    return () => {
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

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      urgent: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handleDelete = async (projectId, projectTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${projectTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await axios.delete(`/api/projects/${projectId}`);
      toast.success('Project deleted successfully');
      setProjects(projects.filter(p => p.id !== projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    const matchesType = filterType === 'all' || project.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card p-4 sm:p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">My Projects</h1>
            <p className="text-gray-300 text-sm sm:text-base">
              View and manage all your permit applications
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
              aria-label="Refresh"
              title="Refresh projects"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <Link
              to="/projects/upload"
              className="glass-button bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 flex items-center justify-center space-x-2 px-4 py-2.5 sm:py-3"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>New Project</span>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="glass-card p-4 sm:p-6"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-input pl-10 w-full"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="glass-input px-4 py-2 min-w-[150px]"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="glass-input px-4 py-2 min-w-[150px]"
          >
            <option value="all">All Types</option>
            <option value="building">Building</option>
            <option value="renovation">Renovation</option>
            <option value="commercial">Commercial</option>
            <option value="residential">Residential</option>
            <option value="other">Other</option>
          </select>
        </div>
      </motion.div>

      {/* Projects List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="glass-card p-4 sm:p-6"
      >
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4 opacity-50" />
            <p className="text-gray-400 text-lg mb-2">
              {searchTerm || filterStatus !== 'all' || filterType !== 'all' 
                ? 'No projects match your filters' 
                : 'No projects yet'}
            </p>
            {!searchTerm && filterStatus === 'all' && filterType === 'all' && (
              <Link
                to="/projects/upload"
                className="text-blue-400 hover:text-blue-300 text-sm font-medium inline-flex items-center space-x-2 mt-4"
              >
                <Plus className="w-4 h-4" />
                <span>Create your first project</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="glass-card p-4 sm:p-6 hover:bg-white/5 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Project Info */}
                  <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 ${getStatusColor(project.status)} rounded-lg flex items-center justify-center text-white flex-shrink-0`}>
                      {getStatusIcon(project.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-base sm:text-lg mb-1 truncate">
                        {project.title || 'Untitled Project'}
                      </h3>
                      <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                        {project.description || 'No description'}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-400">
                        <span className="capitalize">{project.type}</span>
                        {project.submittedAt && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>
                              {project.submittedAt?.toDate ? 
                                project.submittedAt.toDate().toLocaleDateString() : 
                                new Date(project.submittedAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {project.estimatedCost > 0 && (
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>${project.estimatedCost.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(project.priority)}`}>
                        {project.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(project.status)}`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/projects/${project.id}`}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        aria-label="View project"
                        title="View project"
                      >
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                      </Link>
                      <Link
                        to={`/projects/${project.id}/edit`}
                        className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                        aria-label="Edit project"
                        title="Edit project"
                      >
                        <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                      </Link>
                      {project.status === 'draft' && (
                        <button
                          onClick={() => handleDelete(project.id, project.title)}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                          aria-label="Delete project"
                          title="Delete project"
                        >
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Results Count */}
        {!loading && filteredProjects.length > 0 && (
          <div className="mt-6 pt-4 border-t border-white/20 text-center text-gray-400 text-sm">
            Showing {filteredProjects.length} of {projects.length} project{projects.length !== 1 ? 's' : ''}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ProjectsList;

