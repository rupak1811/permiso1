import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { useSocket } from '../../context/SocketContext';
import axios from 'axios';
import { 
  ArrowLeft, 
  Edit, 
  Download, 
  Share, 
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  MessageCircle,
  DollarSign,
  Calendar,
  Upload,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { socket, on, off } = useSocket();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [deletingDoc, setDeletingDoc] = useState(null);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/projects/${id}`);
      setProject(response.data.project);
    } catch (error) {
      console.error('Error fetching project:', error);
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProject();
    }
    
    // Refresh every 15 seconds
    const interval = setInterval(() => {
      if (id) {
        fetchProject();
      }
    }, 15000);
    
    // Listen for project updates via Socket.IO
    const handleProjectUpdate = (data) => {
      if (data.projectId === id) {
        console.log('[ProjectDetails] Project updated, refreshing...', data);
        fetchProject();
      }
    };
    
    // Listen for notifications
    const handleNotification = () => {
      console.log('[ProjectDetails] New notification received, refreshing...');
      fetchProject();
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
  }, [id, socket]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingFile(true);
      const formData = new FormData();
      formData.append('file', file);

      // Upload directly to project endpoint
      await axios.post(`/api/uploads/project/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('File uploaded successfully');
      fetchProject();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploadingFile(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleDeleteDocument = async (docId, index) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      setDeletingDoc(docId);
      await axios.delete(`/api/uploads/project/${id}/${docId}`);
      toast.success('Document deleted successfully');
      fetchProject();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    } finally {
      setDeletingDoc(null);
    }
  };

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
        return <CheckCircle className="w-5 h-5" />;
      case 'rejected':
        return <AlertCircle className="w-5 h-5" />;
      case 'under_review':
        return <Clock className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card text-center p-8">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Project Not Found</h2>
          <p className="text-gray-400 mb-4">The project you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="glass-button bg-gradient-to-r from-blue-500 to-purple-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">{project.title}</h1>
              <p className="text-gray-400">Project ID: #{project.id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => navigate(`/projects/${project.id}/edit`)}
              className="glass-button border-2 border-white/30 hover:bg-white/10"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </button>
            <button className="glass-button border-2 border-white/30 hover:bg-white/10">
              <Share className="w-4 h-4 mr-2" />
              Share
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 ${getStatusColor(project.status)} rounded-lg flex items-center justify-center text-white`}>
              {getStatusIcon(project.status)}
            </div>
            <div>
              <p className="text-white font-medium capitalize">{project.status.replace('_', ' ')}</p>
              <p className="text-gray-400 text-sm">Status</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-white font-medium">${project.estimatedCost.toLocaleString()}</p>
              <p className="text-gray-400 text-sm">Estimated Cost</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-white font-medium">{project.estimatedTimeline} days</p>
              <p className="text-gray-400 text-sm">Timeline</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass-card p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Project Description</h2>
            <p className="text-gray-300 leading-relaxed">{project.description}</p>
          </motion.div>

          {/* Documents */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Documents</h2>
              <label className="glass-button bg-gradient-to-r from-blue-500 to-purple-600 cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                Upload More
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.dwg,.dxf"
                />
              </label>
            </div>
            <div className="space-y-3">
              {project.documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-white font-medium">{doc.name}</p>
                      <p className="text-gray-400 text-sm">
                        {(doc.size / 1024 / 1024).toFixed(2)} MB • {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                    <a
                      href={doc.url}
                      download
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDeleteDocument(doc.id || doc.fileName, index)}
                      disabled={deletingDoc === (doc.id || doc.fileName)}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                    >
                      {deletingDoc === (doc.id || doc.fileName) ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Review Comments */}
          {(project.reviewComments && project.reviewComments.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="glass-card p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-4">Review Comments</h2>
              <div className="space-y-4">
                {project.reviewComments.map((comment, index) => {
                  const formatDate = (date) => {
                    if (!date) return 'N/A';
                    if (date.toDate) return date.toDate().toLocaleDateString();
                    return new Date(date).toLocaleDateString();
                  };
                  
                  return (
                    <div key={comment.id || index} className="p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <MessageCircle className="w-4 h-4 text-blue-400" />
                          <span className="text-white font-medium">
                            {comment.reviewer?.name || comment.reviewer || 'Reviewer'}
                          </span>
                        </div>
                        <span className="text-gray-400 text-sm">
                          {formatDate(comment.timestamp || comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-300">{comment.comment}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Overall Progress</span>
                  <span className="text-white">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Application Submitted</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Initial Review</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-300">Technical Review</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">Final Approval</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Project Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Project Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Type:</span>
                <span className="text-white capitalize">{project.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Priority:</span>
                <span className="text-white capitalize">{project.priority}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Submitted:</span>
                <span className="text-white">{new Date(project.submittedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Location:</span>
                <span className="text-white text-right">
                  {project.location.address}<br />
                  {project.location.city}, {project.location.state} {project.location.zipCode}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
            <div className="space-y-2">
              <button className="w-full glass-button bg-gradient-to-r from-blue-500 to-purple-600">
                Add Comment
              </button>
              <button className="w-full glass-button border-2 border-white/30 hover:bg-white/10">
                Request Update
              </button>
              <button className="w-full glass-button border-2 border-white/30 hover:bg-white/10">
                Download Report
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
