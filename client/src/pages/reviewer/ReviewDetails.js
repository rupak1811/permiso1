import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import LocationMap from '../../components/maps/LocationMap';
import { 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle,
  Clock,
  FileText,
  User,
  MessageCircle,
  Calendar,
  DollarSign,
  Download,
  Eye,
  Mail,
  Phone,
  MapPin,
  X
} from 'lucide-react';

const ReviewDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewDecision, setReviewDecision] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/projects/${id}`);
        const projectData = response.data.project;
        setProject(projectData);
      } catch (error) {
        console.error('Error fetching project:', error);
        toast.error('Failed to load project details');
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProject();
    }
  }, [id]);

  const handleSubmitReview = async () => {
    if (!reviewComment.trim()) {
      toast.error('Comment is mandatory for status updates');
      return;
    }

    if (!reviewDecision) {
      toast.error('Please select a status (Approve, Reject, or Request Info)');
      return;
    }

    try {
      setSubmitting(true);

      if (reviewDecision === 'approve') {
        await axios.post(`/api/reviews/${id}/approve`, {
          comment: reviewComment
        });
        toast.success('Project approved successfully');
      } else if (reviewDecision === 'reject') {
        await axios.post(`/api/reviews/${id}/reject`, {
          comment: reviewComment,
          reasons: ['Reviewer decision']
        });
        toast.success('Project rejected');
      } else if (reviewDecision === 'request_info') {
        await axios.post(`/api/reviews/${id}/comment`, {
          comment: reviewComment,
          isInternal: false
        });
        toast.success('Comment sent to user');
      }

      // Refresh project data
      const response = await axios.get(`/api/projects/${id}`);
      setProject(response.data.project);
      
      // Reset form
      setReviewComment('');
      setReviewDecision('');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      await axios.post(`/api/reviews/${id}/comment`, {
        comment: newComment,
        isInternal: false
      });
      toast.success('Comment added');
      setNewComment('');
      
      // Refresh project data
      const response = await axios.get(`/api/projects/${id}`);
      setProject(response.data.project);
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error(error.response?.data?.message || 'Failed to add comment');
    }
  };

  const handleDocumentVerification = async (documentId, isVerified) => {
    try {
      await axios.put(`/api/reviews/${id}/documents/${documentId}/verify`, {
        isVerified
      });
      toast.success(`Document ${isVerified ? 'verified' : 'unverified'}`);
      
      // Refresh project data
      const response = await axios.get(`/api/projects/${id}`);
      setProject(response.data.project);
    } catch (error) {
      console.error('Error updating document verification:', error);
      toast.error('Failed to update document verification');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    if (date.toDate) return date.toDate().toLocaleDateString();
    return new Date(date).toLocaleDateString();
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
          <p className="text-gray-400">The project you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/reviewer/dashboard')}
            className="mt-4 glass-button bg-gradient-to-r from-blue-500 to-purple-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const applicant = project.applicant || {};
  const location = project.location || {};
  const documents = project.documents || [];
  const reviewComments = project.reviewComments || [];

  return (
    <div className="space-y-6">
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
              onClick={() => navigate('/reviewer/dashboard')}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">{project.title || 'Untitled Project'}</h1>
              <p className="text-gray-400">Project ID: #{project.id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              project.status === 'approved' ? 'bg-green-500/20 text-green-400' :
              project.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
              'bg-yellow-500/20 text-yellow-400'
            } border border-white/20`}>
              {project.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <p className="text-white font-medium">{formatDate(project.submittedAt || project.createdAt)}</p>
              <p className="text-gray-400 text-sm">Submitted</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* User Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <User className="w-5 h-5 mr-2" />
          User Details
        </h2>
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
      </motion.div>

      {/* Map Location */}
      {location.coordinates && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Project Location
          </h2>
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
        </motion.div>
      )}

      {/* Project Description */}
      {project.description && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="glass-card p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Project Description</h2>
          <p className="text-gray-300 leading-relaxed">{project.description}</p>
        </motion.div>
      )}

      {/* Documents */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Uploaded Documents ({documents.length})
        </h2>
        <div className="space-y-3">
          {documents.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No documents uploaded</p>
          ) : (
            documents.map((doc) => (
              <div key={doc.id || doc.name} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-3 flex-1">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <div className="flex-1">
                    <p className="text-white font-medium">{doc.name || 'Document'}</p>
                    <p className="text-gray-400 text-sm">
                      {formatFileSize(doc.size)} • {formatDate(doc.uploadedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDocumentVerification(doc.id || doc.name, !doc.isVerified)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        doc.isVerified
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      }`}
                    >
                      {doc.isVerified ? (
                        <>
                          <CheckCircle className="w-3 h-3 inline mr-1" />
                          Verified
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 inline mr-1" />
                          Pending
                        </>
                      )}
                    </button>
                  </div>
                  {doc.url && (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                      title="View document"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                  )}
                  {doc.url && (
                    <a
                      href={doc.url}
                      download
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                      title="Download document"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Comments Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <MessageCircle className="w-5 h-5 mr-2" />
          Comments & Communication
        </h2>
        
        {/* Add New Comment */}
        <div className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment to communicate with the user..."
            rows={3}
            className="glass-input w-full resize-none mb-2"
          />
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="glass-button bg-gradient-to-r from-blue-500 to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send Comment
          </button>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {reviewComments.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No comments yet</p>
          ) : (
            reviewComments.map((comment, index) => (
              <div key={comment.id || index} className="p-4 bg-white/5 rounded-lg">
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
            ))
          )}
        </div>
      </motion.div>

      {/* Response Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Response Actions</h2>
        <p className="text-gray-400 text-sm mb-4">Comments are mandatory when updating project status</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Comment <span className="text-red-400">*</span>
            </label>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Enter your comment (required for status updates)..."
              rows={4}
              className="glass-input w-full resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Status <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => setReviewDecision('approve')}
                disabled={submitting}
                className={`p-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center ${
                  reviewDecision === 'approve'
                    ? 'bg-green-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-green-500/20'
                } disabled:opacity-50`}
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Approve
              </button>
              <button
                onClick={() => setReviewDecision('reject')}
                disabled={submitting}
                className={`p-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center ${
                  reviewDecision === 'reject'
                    ? 'bg-red-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-red-500/20'
                } disabled:opacity-50`}
              >
                <AlertCircle className="w-5 h-5 mr-2" />
                Reject
              </button>
              <button
                onClick={() => setReviewDecision('request_info')}
                disabled={submitting}
                className={`p-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center ${
                  reviewDecision === 'request_info'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-yellow-500/20'
                } disabled:opacity-50`}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Request Info
              </button>
            </div>
          </div>

          <button
            onClick={handleSubmitReview}
            disabled={submitting || !reviewComment.trim() || !reviewDecision}
            className="w-full glass-button bg-gradient-to-r from-blue-500 to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Response'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ReviewDetails;
