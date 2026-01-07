import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useSocket } from '../../context/SocketContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import LocationMap from '../../components/maps/LocationMap';
import { 
  ArrowLeft, 
  FileText, 
  MapPin, 
  MessageCircle,
  Send,
  Download,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building,
  Zap,
  Wrench,
  Trash2
} from 'lucide-react';

const PermitDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { socket, on, off } = useSocket();
  const [permit, setPermit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const commentsEndRef = useRef(null);

  useEffect(() => {
    fetchPermit();
    
    // Listen for permit updates
    const handlePermitUpdate = (data) => {
      if (data && data.permitId === id) {
        fetchPermit();
      }
    };
    
    const handleNotification = () => {
      fetchPermit();
    };
    
    if (socket) {
      on('permit_updated', handlePermitUpdate);
      on('notification', handleNotification);
    }
    
    return () => {
      if (socket) {
        off('permit_updated', handlePermitUpdate);
        off('notification', handleNotification);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, socket, on, off]);

  useEffect(() => {
    // Scroll to bottom when comments update
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [permit?.comments]);

  const fetchPermit = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/permits/${id}`);
      setPermit(response.data?.permit || response.data);
    } catch (error) {
      console.error('Error fetching permit:', error);
      if (error.response?.status === 404) {
        toast.error('Permit not found');
        navigate('/permits');
      } else {
        toast.error('Failed to load permit details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendComment = async (e) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      return;
    }

    try {
      setSendingComment(true);
      await axios.post(`/api/permits/${id}/comment`, { comment });
      setComment('');
      fetchPermit();
      toast.success('Comment sent successfully');
    } catch (error) {
      console.error('Error sending comment:', error);
      toast.error('Failed to send comment');
    } finally {
      setSendingComment(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      submitted: 'bg-blue-500',
      under_review: 'bg-yellow-500',
      request_more_docs: 'bg-orange-500',
      approved: 'bg-green-500',
      rejected: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5" />;
      case 'rejected':
        return <XCircle className="w-5 h-5" />;
      case 'under_review':
      case 'request_more_docs':
        return <Clock className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getPermitTypeIcon = (type) => {
    switch (type) {
      case 'building':
        return <Building className="w-5 h-5" />;
      case 'electric':
        return <Zap className="w-5 h-5" />;
      case 'plumber':
        return <Wrench className="w-5 h-5" />;
      case 'demolition':
        return <Trash2 className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getPermitTypeName = (type) => {
    const names = {
      building: 'Building Permit',
      electric: 'Electric Permit',
      plumber: 'Plumber Permit',
      demolition: 'Demolition Permit'
    };
    return names[type] || type;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    if (date.toDate) return date.toDate().toLocaleString();
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading permit details...</p>
        </div>
      </div>
    );
  }

  if (!permit) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass-card text-center p-8">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Permit Not Found</h2>
          <p className="text-gray-400 mb-4">The permit you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/permits')}
            className="glass-button bg-gradient-to-r from-blue-500 to-purple-600"
          >
            Back to Permits
          </button>
        </div>
      </div>
    );
  }

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
              onClick={() => navigate('/permits')}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-3 mb-2">
                {getPermitTypeIcon(permit.permitType)}
                <h1 className="text-2xl font-bold text-white">{getPermitTypeName(permit.permitType)}</h1>
              </div>
              <p className="text-gray-400">Project: {permit.projectName}</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${getStatusColor(permit.status)} text-white`}>
            {getStatusIcon(permit.status)}
            <span className="font-medium capitalize">{permit.status.replace('_', ' ')}</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Permit Description */}
          {permit.permitDescription && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="glass-card p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-4">Permit Description</h2>
              <p className="text-gray-300 leading-relaxed">{permit.permitDescription}</p>
            </motion.div>
          )}

          {/* Location Map */}
          {permit.location?.coordinates && (
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
                  selectedLocation={permit.location.coordinates?.lat && permit.location.coordinates?.lng
                    ? { lat: permit.location.coordinates.lat, lng: permit.location.coordinates.lng }
                    : null}
                  readOnly={true}
                  markerColor="green"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Street</p>
                  <p className="text-white">{permit.address?.street || 'N/A'}</p>
                </div>
                {permit.address?.houseNumber && (
                  <div>
                    <p className="text-gray-400 text-sm mb-1">House Number</p>
                    <p className="text-white">{permit.address.houseNumber}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-400 text-sm mb-1">Pincode</p>
                  <p className="text-white">{permit.address?.pincode || 'N/A'}</p>
                </div>
                {permit.address?.fullAddress && (
                  <div className="md:col-span-2">
                    <p className="text-gray-400 text-sm mb-1">Full Address</p>
                    <p className="text-white">{permit.address.fullAddress}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Documents */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass-card p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Documents</h2>
            <div className="space-y-3">
              {permit.documents && permit.documents.length > 0 ? (
                permit.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-white font-medium">{doc.name}</p>
                        <p className="text-gray-400 text-sm">
                          {(doc.size / 1024 / 1024).toFixed(2)} MB
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
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-4">No documents available</p>
              )}
            </div>
          </motion.div>

          {/* Comments/Chat Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="glass-card p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              Comments & Chat
            </h2>
            
            {/* Comments List */}
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {permit.comments && permit.comments.length > 0 ? (
                permit.comments.map((comment) => {
                  const isOwnComment = comment.user === user.id;
                  return (
                    <div
                      key={comment.id}
                      className={`p-4 rounded-lg ${
                        isOwnComment ? 'bg-blue-500/20 ml-8' : 'bg-white/5 mr-8'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-medium">
                            {comment.userName || 'Unknown'}
                          </span>
                          <span className="text-gray-400 text-xs">
                            ({comment.userRole || 'user'})
                          </span>
                        </div>
                        <span className="text-gray-400 text-xs">
                          {formatDate(comment.timestamp)}
                        </span>
                      </div>
                      <p className="text-gray-300">{comment.comment}</p>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-400 text-center py-4">No comments yet</p>
              )}
              <div ref={commentsEndRef} />
            </div>

            {/* Comment Input */}
            <form onSubmit={handleSendComment} className="flex items-center space-x-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Type your comment..."
                className="glass-input flex-1"
              />
              <button
                type="submit"
                disabled={sendingComment || !comment.trim()}
                className="glass-button bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingComment ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Permit Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Permit Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Type:</span>
                <span className="text-white">{getPermitTypeName(permit.permitType)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-white capitalize">{permit.status.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Submitted:</span>
                <span className="text-white">{formatDate(permit.submittedAt)}</span>
              </div>
              {permit.reviewer && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Reviewer:</span>
                  <span className="text-white">{permit.reviewer.name || 'Assigned'}</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Action Messages */}
          {permit.status === 'request_more_docs' && permit.requestMoreDocsComment && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="glass-card p-6 bg-orange-500/10 border-2 border-orange-500/50"
            >
              <h3 className="text-lg font-semibold text-orange-400 mb-2">Action Required</h3>
              <p className="text-gray-300 text-sm">{permit.requestMoreDocsComment}</p>
            </motion.div>
          )}

          {permit.status === 'rejected' && permit.rejectionComment && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="glass-card p-6 bg-red-500/10 border-2 border-red-500/50"
            >
              <h3 className="text-lg font-semibold text-red-400 mb-2">Rejection Reason</h3>
              <p className="text-gray-300 text-sm">{permit.rejectionComment}</p>
            </motion.div>
          )}

          {permit.status === 'approved' && permit.approvalComment && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="glass-card p-6 bg-green-500/10 border-2 border-green-500/50"
            >
              <h3 className="text-lg font-semibold text-green-400 mb-2">Approval Note</h3>
              <p className="text-gray-300 text-sm">{permit.approvalComment}</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PermitDetails;

