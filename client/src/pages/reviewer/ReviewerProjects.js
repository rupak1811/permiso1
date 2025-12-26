import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import axios from 'axios';
import { 
  FileText,
  Calendar,
  Filter,
  Search,
  DollarSign,
  X,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const ReviewerProjects = () => {
  useLanguage();
  const { user } = useAuth();
  const { socket, on, off } = useSocket();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [allProjects, setAllProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPrice, setFilterPrice] = useState('');
  const [filterScheduleDays, setFilterScheduleDays] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch all projects for reviewer (use all=true to get all projects regardless of status)
      const projectsResponse = await axios.get('/api/projects', {
        params: {
          all: true,
          limit: 1000 // Get all projects, not just paginated
        }
      });
      
      const projectsData = projectsResponse.data.projects || [];
      
      // Sort by timeline (newest first - by createdAt)
      projectsData.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA; // Newest first
      });
      
      setAllProjects(projectsData);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setAllProjects([]);
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
      console.log('[ReviewerProjects] Project updated, refreshing data...');
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

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let filtered = [...allProjects];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(project => 
        project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.applicant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.applicant?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Price filter
    if (filterPrice) {
      const priceValue = parseFloat(filterPrice);
      if (!isNaN(priceValue)) {
        filtered = filtered.filter(project => 
          (project.estimatedCost || 0) <= priceValue
        );
      }
    }

    // Schedule days filter
    if (filterScheduleDays) {
      const daysValue = parseInt(filterScheduleDays);
      if (!isNaN(daysValue)) {
        filtered = filtered.filter(project => 
          (project.estimatedTimeline || 0) <= daysValue
        );
      }
    }

    // Date filter
    if (filterDate) {
      const filterDateObj = new Date(filterDate);
      filtered = filtered.filter(project => {
        const projectDate = project.submittedAt?.toDate ? 
          project.submittedAt.toDate() : 
          new Date(project.submittedAt || project.createdAt);
        return projectDate.toDateString() === filterDateObj.toDateString();
      });
    }

    return filtered;
  }, [allProjects, searchTerm, filterPrice, filterScheduleDays, filterDate, statusFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterPrice('');
    setFilterScheduleDays('');
    setFilterDate('');
    setStatusFilter('all');
  };

  const hasActiveFilters = searchTerm || filterPrice || filterScheduleDays || filterDate || statusFilter !== 'all';

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'submitted':
      case 'under_review':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      default:
        return <FileText className="w-4 h-4 text-blue-400" />;
    }
  };

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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">All Projects</h1>
            <p className="text-gray-300">View and manage all permit applications</p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md rounded-lg border border-white/10 px-3 py-2">
                <Search className="text-gray-400 w-4 h-4 flex-shrink-0" />
                <div className="w-px h-5 bg-white/20"></div>
                <input
                  type="text"
                  placeholder="Search by project title, user name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-0 outline-0 text-white placeholder-gray-400 flex-1 text-sm focus:ring-0"
                />
              </div>
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`glass-button border-2 border-white/30 hover:bg-white/10 flex items-center justify-center ${
                showFilters ? 'bg-white/10' : ''
              }`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                  {[searchTerm, filterPrice, filterScheduleDays, filterDate, statusFilter !== 'all' ? statusFilter : ''].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card p-4 space-y-3"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium">Filter Projects</h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Clear All
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="glass-input w-full"
                  >
                    <option value="all">All Status</option>
                    <option value="submitted">Submitted</option>
                    <option value="under_review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Max Price ($)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 100000"
                    value={filterPrice}
                    onChange={(e) => setFilterPrice(e.target.value)}
                    className="glass-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Max Schedule Days
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 90"
                    value={filterScheduleDays}
                    onChange={(e) => setFilterScheduleDays(e.target.value)}
                    className="glass-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Submitted Date
                  </label>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="glass-input w-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Projects List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="glass-card p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h2 className="text-xl font-semibold text-white text-center sm:text-left">
            Projects ({filteredProjects.length})
          </h2>
          <p className="text-sm text-gray-400 text-center sm:text-right">
            Sorted by newest first
          </p>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
              <p>Loading projects...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">
                {hasActiveFilters ? 'No projects match your filters' : 'No projects found'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-2 text-blue-400 hover:text-blue-300 text-sm"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            filteredProjects.map((project) => {
              const submittedDate = project.submittedAt?.toDate ? 
                project.submittedAt.toDate() : 
                new Date(project.submittedAt || project.createdAt);
              
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                  className="glass-card p-4 hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => navigate(`/reviewer/projects/${project.id}`)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-blue-400">
                        {getStatusIcon(project.status)}
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{project.title || project.name || 'Untitled Project'}</h3>
                        <div className="text-gray-400 text-sm space-y-1">
                          <p>by {project.applicant?.name || project.applicant || 'Unknown'}</p>
                          {project.applicant?.id && (
                            <p className="text-xs text-gray-500">User ID: {project.applicant.id}</p>
                          )}
                          {project.applicant?.email && (
                            <p className="text-xs text-gray-500">{project.applicant.email}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)} text-center`}>
                        {project.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-400">
                      {project.documents && project.documents.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <FileText className="w-4 h-4" />
                          <span>{project.documents.length} document{project.documents.length !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                      {project.submittedAt && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {submittedDate.toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4" />
                        <span>${(project.estimatedCost || project.cost || 0).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/reviewer/projects/${project.id}`);
                        }}
                        className="glass-button bg-gradient-to-r from-blue-500 to-purple-600 text-sm px-4 py-2"
                      >
                        <Eye className="w-4 h-4 inline mr-2" />
                        View
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ReviewerProjects;

