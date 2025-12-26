import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle,
  FileText,
  User,
  MessageCircle,
  Calendar,
  DollarSign
} from 'lucide-react';

const ReviewWorkflow = () => {
  const { t } = useLanguage();
  const [selectedProject, setSelectedProject] = useState(null);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewDecision, setReviewDecision] = useState('');

  const projects = [
    {
      id: 1,
      title: 'Residential Building Permit',
      applicant: 'John Smith',
      type: 'building',
      status: 'under_review',
      priority: 'high',
      submittedAt: '2024-01-15',
      estimatedCost: 25000,
      documents: 5,
      comments: 2
    },
    {
      id: 2,
      title: 'Commercial Renovation',
      applicant: 'Jane Doe',
      type: 'renovation',
      status: 'under_review',
      priority: 'medium',
      submittedAt: '2024-01-12',
      estimatedCost: 15000,
      documents: 3,
      comments: 1
    }
  ];

  const workflowSteps = [
    { id: 'submitted', name: 'Submitted', status: 'completed' },
    { id: 'initial_review', name: 'Initial Review', status: 'completed' },
    { id: 'technical_review', name: 'Technical Review', status: 'current' },
    { id: 'final_approval', name: 'Final Approval', status: 'pending' }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'current':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
      default:
        return <FileText className="w-5 h-5 text-blue-400" />;
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
        <div>
          <h1 className="text-3xl font-bold text-white">Review Workflow</h1>
          <p className="text-gray-300">Manage the review process for permit applications</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Projects List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-1"
        >
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Projects in Review</h2>
            <div className="space-y-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                    selectedProject?.id === project.id
                      ? 'bg-blue-500/20 border border-blue-500/30'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium">{project.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(project.priority)}`}>
                      {project.priority}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">by {project.applicant}</p>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{project.documents} docs</span>
                    <span>{project.comments} comments</span>
                    <span>${project.estimatedCost.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Review Interface */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="lg:col-span-2 space-y-6"
        >
          {selectedProject ? (
            <>
              {/* Project Details */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white">{selectedProject.title}</h2>
                    <p className="text-gray-400">by {selectedProject.applicant}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(selectedProject.priority)}`}>
                      {selectedProject.priority}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {new Date(selectedProject.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Workflow Steps */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-white mb-4">Review Progress</h3>
                  <div className="flex items-center space-x-4">
                    {workflowSteps.map((step, index) => (
                      <div key={step.id} className="flex items-center">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(step.status)}
                          <span className={`text-sm ${
                            step.status === 'completed' ? 'text-green-400' :
                            step.status === 'current' ? 'text-yellow-400' : 'text-gray-400'
                          }`}>
                            {step.name}
                          </span>
                        </div>
                        {index < workflowSteps.length - 1 && (
                          <div className="w-8 h-0.5 bg-gray-600 mx-2" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Project Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Type</p>
                    <p className="text-white capitalize">{selectedProject.type}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Documents</p>
                    <p className="text-white">{selectedProject.documents}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Comments</p>
                    <p className="text-white">{selectedProject.comments}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Estimated Cost</p>
                    <p className="text-white">${selectedProject.estimatedCost.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Review Actions */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Review Actions</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Review Comment
                    </label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Add your review comments..."
                      rows={4}
                      className="glass-input w-full resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Decision
                    </label>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => setReviewDecision('approve')}
                        className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                          reviewDecision === 'approve'
                            ? 'bg-green-500 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-green-500/20'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4 inline-block mr-2" />
                        Approve
                      </button>
                      <button
                        onClick={() => setReviewDecision('reject')}
                        className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                          reviewDecision === 'reject'
                            ? 'bg-red-500 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-red-500/20'
                        }`}
                      >
                        <AlertCircle className="w-4 h-4 inline-block mr-2" />
                        Reject
                      </button>
                      <button
                        onClick={() => setReviewDecision('request_info')}
                        className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                          reviewDecision === 'request_info'
                            ? 'bg-yellow-500 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-yellow-500/20'
                        }`}
                      >
                        <MessageCircle className="w-4 h-4 inline-block mr-2" />
                        Request Info
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button className="glass-button border-2 border-white/30 hover:bg-white/10">
                      Save Draft
                    </button>
                    <button className="glass-button bg-gradient-to-r from-blue-500 to-purple-600">
                      Submit Review
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="glass-card p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Select a Project</h3>
              <p className="text-gray-400">
                Choose a project from the list to begin the review process
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ReviewWorkflow;
