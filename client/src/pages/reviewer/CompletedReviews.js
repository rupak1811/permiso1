import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import axios from 'axios';
import { 
  CheckCircle, 
  AlertCircle,
  FileText,
  Calendar,
  Filter,
  Search,
  DollarSign,
  X,
  Eye,
  User,
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Clock,
  Download
} from 'lucide-react';
import LocationMap from '../../components/maps/LocationMap';

const CompletedReviews = () => {
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
  const [statusFilter, setStatusFilter] = useState('all'); // all, approved, rejected
  const [showFilters, setShowFilters] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch projects - API automatically returns assigned + submitted/under_review projects for reviewers
      const projectsResponse = await axios.get('/api/projects?all=true&limit=1000');
      const projectsData = projectsResponse.data.projects || [];
      
      // Filter to show only completed reviews (approved and rejected)
      const completedProjects = projectsData.filter(p => 
        p.status === 'approved' || p.status === 'rejected'
      );
      
      // Sort by timeline (newest first - by createdAt or approvedAt/rejectedAt)
      completedProjects.sort((a, b) => {
        const dateA = a.approvedAt?.toDate ? a.approvedAt.toDate() : 
                      a.rejectedAt?.toDate ? a.rejectedAt.toDate() :
                      a.createdAt?.toDate ? a.createdAt.toDate() : 
                      new Date(a.createdAt || 0);
        const dateB = b.approvedAt?.toDate ? b.approvedAt.toDate() : 
                      b.rejectedAt?.toDate ? b.rejectedAt.toDate() :
                      b.createdAt?.toDate ? b.createdAt.toDate() : 
                      new Date(b.createdAt || 0);
        return dateB - dateA; // Newest first
      });
      
      setAllProjects(completedProjects);
    } catch (error) {
      console.error('Error fetching completed reviews:', error);
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
      console.log('[CompletedReviews] Project updated, refreshing data...');
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
        const projectDate = project.approvedAt?.toDate ? 
          project.approvedAt.toDate() :
          project.rejectedAt?.toDate ? 
          project.rejectedAt.toDate() :
          project.submittedAt?.toDate ? 
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
            <h1 className="text-2xl md:text-3xl font-bold text-white">Completed Reviews</h1>
            <p className="text-gray-300">View all approved and rejected permit applications</p>
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
                    Completion Date
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
            Completed Reviews ({filteredProjects.length})
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
              <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">
                {hasActiveFilters ? 'No projects match your filters' : 'No completed reviews'}
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
              const completionDate = project.approvedAt?.toDate ? 
                project.approvedAt.toDate() :
                project.rejectedAt?.toDate ? 
                project.rejectedAt.toDate() :
                project.submittedAt?.toDate ? 
                project.submittedAt.toDate() : 
                new Date(project.submittedAt || project.createdAt);
              
              const applicant = project.applicant || {};
              const location = project.location || {};
              const documents = project.documents || [];
              const reviewComments = project.reviewComments || [];
              
              const formatDate = (date) => {
                if (!date) return 'N/A';
                if (date.toDate) return date.toDate().toLocaleDateString();
                return new Date(date).toLocaleDateString();
              };
              
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="glass-card p-6 space-y-6"
                >
                  {/* Project Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/10">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{project.title || 'Untitled Project'}</h3>
                      <p className="text-gray-400 text-sm">Project ID: #{project.id}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(project.status)}`}>
                      {project.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                    </span>
                  </div>

                  {/* Project Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-white font-medium">${(project.estimatedCost || 0).toLocaleString()}</p>
                        <p className="text-gray-400 text-sm">Estimated Cost</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-orange-400" />
                      <div>
                        <p className="text-white font-medium">{project.estimatedTimeline || 0} days</p>
                        <p className="text-gray-400 text-sm">Timeline</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-green-400" />
                      <div>
                        <p className="text-white font-medium">{formatDate(completionDate)}</p>
                        <p className="text-gray-400 text-sm">
                          {project.status === 'approved' ? 'Approved' : project.status === 'rejected' ? 'Rejected' : 'Completed'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* User Details */}
                  <div className="border-t border-white/10 pt-4">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      User Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm mb-1">Name</p>
                        <p className="text-white font-medium">{applicant.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm mb-1">User ID</p>
                        <p className="text-white font-medium">{applicant.id || project.applicant || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm mb-1">Email</p>
                        <p className="text-white font-medium flex items-center">
                          <Mail className="w-4 h-4 mr-2" />
                          {applicant.email || 'N/A'}
                        </p>
                      </div>
                      {applicant.phone && (
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Phone</p>
                          <p className="text-white font-medium flex items-center">
                            <Phone className="w-4 h-4 mr-2" />
                            {applicant.phone}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Map Location */}
                  {location.coordinates && (
                    <div className="border-t border-white/10 pt-4">
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <MapPin className="w-5 h-5 mr-2" />
                        Project Location
                      </h4>
                      <div className="mb-4">
                        <LocationMap
                          selectedLocation={location.coordinates?.lat && location.coordinates?.lng ? 
                            { lat: location.coordinates.lat, lng: location.coordinates.lng } : null}
                          readOnly={true}
                          markerColor="green"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Address</p>
                          <p className="text-white">{location.address || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm mb-1">City, State, ZIP</p>
                          <p className="text-white">
                            {location.city || ''}{location.city && location.state ? ', ' : ''}
                            {location.state || ''} {location.zipCode || ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Documents */}
                  {documents.length > 0 && (
                    <div className="border-t border-white/10 pt-4">
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <FileText className="w-5 h-5 mr-2" />
                        Documents ({documents.length})
                      </h4>
                      <div className="space-y-2">
                        {documents.map((doc, idx) => (
                          <div key={doc.id || idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div className="flex items-center space-x-3 flex-1">
                              <FileText className="w-5 h-5 text-blue-400" />
                              <div className="flex-1">
                                <p className="text-white font-medium">{doc.name || 'Document'}</p>
                                {doc.size && (
                                  <p className="text-gray-400 text-sm">
                                    {doc.size > 1024 * 1024 
                                      ? `${(doc.size / (1024 * 1024)).toFixed(2)} MB`
                                      : `${(doc.size / 1024).toFixed(2)} KB`}
                                  </p>
                                )}
                              </div>
                            </div>
                            {doc.url && (
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-gray-400 hover:text-white transition-colors"
                                title="View/Download"
                              >
                                <Download className="w-5 h-5" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Review Comments */}
                  {reviewComments.length > 0 && (
                    <div className="border-t border-white/10 pt-4">
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Review Comments ({reviewComments.length})
                      </h4>
                      <div className="space-y-3">
                        {reviewComments.map((comment, idx) => (
                          <div key={comment.id || idx} className="p-4 bg-white/5 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <MessageCircle className="w-4 h-4 text-blue-400" />
                                <span className="text-white font-medium">
                                  {comment.reviewer?.name || 'Reviewer'}
                                </span>
                              </div>
                              <span className="text-gray-400 text-sm">
                                {formatDate(comment.timestamp || comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-gray-300">{comment.comment}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CompletedReviews;

