import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useSocket } from '../../context/SocketContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  MessageCircle,
  Eye,
  Building,
  Zap,
  Wrench,
  Trash2,
  User,
  MapPin
} from 'lucide-react';

const ReviewerPermits = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { socket, on, off } = useSocket();
  const navigate = useNavigate();
  const [permits, setPermits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedPermit, setSelectedPermit] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [actionComment, setActionComment] = useState('');
  const [requestedDocs, setRequestedDocs] = useState('');
  const [performingAction, setPerformingAction] = useState(false);

  useEffect(() => {
    fetchPermits();
    
    const handlePermitUpdate = () => {
      fetchPermits();
    };
    
    if (socket) {
      on('permit_updated', handlePermitUpdate);
      on('notification', handlePermitUpdate);
    }
    
    return () => {
      if (socket) {
        off('permit_updated', handlePermitUpdate);
        off('notification', handlePermitUpdate);
      }
    };
  }, [socket]);

  const fetchPermits = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/permits?all=true');
      setPermits(response.data.permits || []);
    } catch (error) {
      console.error('Error fetching permits:', error);
      toast.error('Failed to load permits');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action) => {
    if (!selectedPermit) return;

    try {
      setPerformingAction(true);
      
      const actionData = {
        action,
        comment: actionComment,
        requestedDocuments: action === 'request_more_docs' ? requestedDocs.split(',').map(d => d.trim()).filter(d => d) : []
      };

      await axios.put(`/api/permits/${selectedPermit.id}/action`, actionData);
      
      toast.success(`Permit ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'action updated'} successfully`);
      setActionModal(null);
      setSelectedPermit(null);
      setActionComment('');
      setRequestedDocs('');
      fetchPermits();
    } catch (error) {
      console.error('Error performing action:', error);
      toast.error('Failed to perform action');
    } finally {
      setPerformingAction(false);
    }
  };

  const handleAssign = async (permitId) => {
    try {
      await axios.put(`/api/permits/${permitId}/assign`, { reviewerId: user.id });
      toast.success('Permit assigned successfully');
      fetchPermits();
    } catch (error) {
      console.error('Error assigning permit:', error);
      toast.error('Failed to assign permit');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      submitted: 'bg-blue-500/20 text-blue-400 border-blue-500',
      under_review: 'bg-yellow-500/20 text-yellow-400 border-yellow-500',
      request_more_docs: 'bg-orange-500/20 text-orange-400 border-orange-500',
      approved: 'bg-green-500/20 text-green-400 border-green-500',
      rejected: 'bg-red-500/20 text-red-400 border-red-500'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500';
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

  const filteredPermits = filter === 'all' 
    ? permits 
    : permits.filter(p => p.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading permits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Permit Applications</h1>
            <p className="text-gray-400">Review and manage permit applications</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 overflow-x-auto">
          {['all', 'submitted', 'under_review', 'request_more_docs', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                filter === status
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {status === 'all' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
      </motion.div>

      {filteredPermits.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass-card p-8 text-center"
        >
          <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No Permits Found</h2>
          <p className="text-gray-400">
            {filter === 'all' 
              ? "No permit applications available."
              : `No permits with status "${filter.replace('_', ' ')}".`}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredPermits.map((permit) => (
            <motion.div
              key={permit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getPermitTypeIcon(permit.permitType)}
                    <h3 className="text-lg font-semibold text-white">{getPermitTypeName(permit.permitType)}</h3>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">Project: {permit.projectName}</p>
                  {permit.applicant && (
                    <div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
                      <User className="w-4 h-4" />
                      <span>{permit.applicant.name || permit.applicant.email || 'Unknown'}</span>
                    </div>
                  )}
                  {permit.permitDescription && (
                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">{permit.permitDescription}</p>
                  )}
                </div>
                <div className={`px-4 py-2 rounded-lg border-2 flex items-center space-x-2 ${getStatusColor(permit.status)}`}>
                  {getStatusIcon(permit.status)}
                  <span className="text-sm font-medium capitalize">
                    {permit.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span>
                    {permit.documents?.length || 0} documents
                  </span>
                  <span>
                    {permit.comments?.length || 0} comments
                  </span>
                  <span>
                    Submitted: {new Date(permit.submittedAt?.toDate ? permit.submittedAt.toDate() : permit.submittedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigate(`/reviewer/permits/${permit.id}`)}
                    className="glass-button border-2 border-white/30 hover:bg-white/10 px-4 py-2"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </button>
                  {(!permit.reviewer || permit.reviewer === user.id) && permit.status !== 'approved' && permit.status !== 'rejected' && (
                    <div className="flex items-center space-x-2">
                      {permit.status === 'submitted' && !permit.reviewer && (
                        <button
                          onClick={() => handleAssign(permit.id)}
                          className="glass-button bg-blue-500/20 hover:bg-blue-500/30 px-4 py-2"
                        >
                          Assign to Me
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedPermit(permit);
                          setActionModal('request_more_docs');
                        }}
                        className="glass-button bg-orange-500/20 hover:bg-orange-500/30 px-4 py-2"
                      >
                        Request Docs
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPermit(permit);
                          setActionModal('approve');
                        }}
                        className="glass-button bg-green-500/20 hover:bg-green-500/30 px-4 py-2"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPermit(permit);
                          setActionModal('reject');
                        }}
                        className="glass-button bg-red-500/20 hover:bg-red-500/30 px-4 py-2"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Action Modal */}
      {actionModal && selectedPermit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 max-w-md w-full"
          >
            <h2 className="text-xl font-semibold text-white mb-4">
              {actionModal === 'approve' ? 'Approve Permit' : 
               actionModal === 'reject' ? 'Reject Permit' : 
               'Request More Documents'}
            </h2>
            
            {actionModal === 'request_more_docs' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Requested Documents (comma-separated)
                </label>
                <input
                  type="text"
                  value={requestedDocs}
                  onChange={(e) => setRequestedDocs(e.target.value)}
                  className="glass-input w-full"
                  placeholder="e.g., Building plans, Electrical diagrams"
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Comment {actionModal === 'request_more_docs' ? '(optional)' : '*'}
              </label>
              <textarea
                value={actionComment}
                onChange={(e) => setActionComment(e.target.value)}
                rows={4}
                className="glass-input w-full"
                placeholder="Enter your comment..."
                required={actionModal !== 'request_more_docs'}
              />
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setActionModal(null);
                  setSelectedPermit(null);
                  setActionComment('');
                  setRequestedDocs('');
                }}
                className="glass-button border-2 border-white/30 hover:bg-white/10 px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(actionModal)}
                disabled={performingAction || (actionModal !== 'request_more_docs' && !actionComment.trim())}
                className={`glass-button px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  actionModal === 'approve' ? 'bg-green-500/20 hover:bg-green-500/30' :
                  actionModal === 'reject' ? 'bg-red-500/20 hover:bg-red-500/30' :
                  'bg-orange-500/20 hover:bg-orange-500/30'
                }`}
              >
                {performingAction ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  actionModal === 'approve' ? 'Approve' :
                  actionModal === 'reject' ? 'Reject' :
                  'Request'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ReviewerPermits;

