import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import axios from 'axios';
import { 
  FileText, 
  Search, 
  Filter, 
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

const AdminProjects = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/admin/projects');
        setProjects(response.data.projects || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
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

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      urgent: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card p-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Project Management</h1>
            <p className="text-gray-300">Manage and monitor all platform projects</p>
          </div>
          <button className="glass-button bg-gradient-to-r from-blue-500 to-purple-600">
            <FileText className="w-5 h-5 mr-2" />
            Export Data
          </button>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="glass-card p-6"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-input w-full pl-10"
            />
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="glass-input"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="under_review">Under Review</option>
              <option value="rejected">Rejected</option>
              <option value="draft">Draft</option>
            </select>
            <button className="glass-button border-2 border-white/30 hover:bg-white/10">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </button>
          </div>
        </div>
      </motion.div>

      {/* Projects Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="glass-card p-6"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-3 px-4 text-white font-medium">Project</th>
                <th className="text-left py-3 px-4 text-white font-medium">Applicant</th>
                <th className="text-left py-3 px-4 text-white font-medium">Type</th>
                <th className="text-left py-3 px-4 text-white font-medium">Status</th>
                <th className="text-left py-3 px-4 text-white font-medium">Priority</th>
                <th className="text-left py-3 px-4 text-white font-medium">Cost</th>
                <th className="text-left py-3 px-4 text-white font-medium">Submitted</th>
                <th className="text-left py-3 px-4 text-white font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
                    <p>Loading projects...</p>
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No projects found</p>
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                <tr key={project.id} className="border-b border-white/10 hover:bg-white/5">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(project.status)}
                      <div>
                        <p className="text-white font-medium">{project.title || project.name || 'Untitled Project'}</p>
                        <p className="text-gray-400 text-sm">ID: #{project.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-white">{project.applicant?.name || project.applicant || 'Unknown'}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-gray-400 capitalize">{project.type || 'N/A'}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status || 'draft')}`}>
                      {(project.status || 'draft').replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(project.priority || 'medium')}`}>
                      {project.priority || 'medium'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-white">${(project.estimatedCost || project.cost || 0).toLocaleString()}</span>
                  </td>
                  <td className="py-4 px-4">
                    {project.submittedAt ? (
                      <span className="text-gray-400">
                        {project.submittedAt?.toDate ? 
                          project.submittedAt.toDate().toLocaleDateString() : 
                          new Date(project.submittedAt).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-gray-500">Not submitted</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-white transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-white transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminProjects;
