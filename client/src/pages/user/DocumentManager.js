import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Upload, 
  FileText, 
  Image, 
  File, 
  X, 
  Download,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Grid,
  List
} from 'lucide-react';

const DocumentManager = () => {
  const { t } = useLanguage();
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: 'Building Plans.pdf',
      type: 'application/pdf',
      size: 2048000,
      uploadedAt: '2024-01-15',
      project: 'Residential Building Permit',
      status: 'verified'
    },
    {
      id: 2,
      name: 'Site Survey.jpg',
      type: 'image/jpeg',
      size: 1024000,
      uploadedAt: '2024-01-15',
      project: 'Residential Building Permit',
      status: 'pending'
    },
    {
      id: 3,
      name: 'Engineering Report.pdf',
      type: 'application/pdf',
      size: 1536000,
      uploadedAt: '2024-01-16',
      project: 'Commercial Renovation',
      status: 'verified'
    },
    {
      id: 4,
      name: 'Electrical Plans.dwg',
      type: 'application/dwg',
      size: 5120000,
      uploadedAt: '2024-01-17',
      project: 'Residential Building Permit',
      status: 'rejected'
    }
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedFiles, setSelectedFiles] = useState([]);

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return <Image className="w-5 h-5" />;
    } else if (fileType === 'application/pdf') {
      return <FileText className="w-5 h-5" />;
    } else {
      return <File className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      verified: 'text-green-400 bg-green-500/20',
      pending: 'text-yellow-400 bg-yellow-500/20',
      rejected: 'text-red-400 bg-red-500/20'
    };
    return colors[status] || 'text-gray-400 bg-gray-500/20';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.project.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || doc.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleSelectFile = (fileId) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === filteredDocuments.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filteredDocuments.map(doc => doc.id));
    }
  };

  const handleDeleteSelected = () => {
    setDocuments(prev => prev.filter(doc => !selectedFiles.includes(doc.id)));
    setSelectedFiles([]);
  };

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
          <div>
            <h1 className="text-3xl font-bold text-white">Document Manager</h1>
            <p className="text-gray-300">Manage and organize your project documents</p>
          </div>
          <button className="glass-button bg-gradient-to-r from-blue-500 to-purple-600">
            <Upload className="w-5 h-5 mr-2" />
            Upload Documents
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search documents..."
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
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bulk Actions */}
      {selectedFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-white">
              {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-2">
              <button className="glass-button border-2 border-white/30 hover:bg-white/10">
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
              <button className="glass-button border-2 border-white/30 hover:bg-white/10">
                <Edit className="w-4 h-4 mr-2" />
                Rename
              </button>
              <button 
                onClick={handleDeleteSelected}
                className="glass-button bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Documents */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            Documents ({filteredDocuments.length})
          </h2>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedFiles.length === filteredDocuments.length && filteredDocuments.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <span className="text-gray-400 text-sm">Select All</span>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`glass-card p-4 hover:bg-white/5 transition-all duration-300 cursor-pointer ${
                  selectedFiles.includes(doc.id) ? 'ring-2 ring-blue-400' : ''
                }`}
                onClick={() => handleSelectFile(doc.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(doc.id)}
                      onChange={() => handleSelectFile(doc.id)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="text-blue-400">
                      {getFileIcon(doc.type)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button className="p-1 text-gray-400 hover:text-white transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-white transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-white font-medium mb-2 truncate">{doc.name}</h3>
                <p className="text-gray-400 text-sm mb-2">{doc.project}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{formatFileSize(doc.size)}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                    {doc.status}
                  </span>
                </div>
                <p className="text-gray-500 text-xs mt-2">
                  {new Date(doc.uploadedAt).toLocaleDateString()}
                </p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDocuments.map((doc) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-300 cursor-pointer ${
                  selectedFiles.includes(doc.id) ? 'ring-2 ring-blue-400' : ''
                }`}
                onClick={() => handleSelectFile(doc.id)}
              >
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(doc.id)}
                    onChange={() => handleSelectFile(doc.id)}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="text-blue-400">
                    {getFileIcon(doc.type)}
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{doc.name}</h3>
                    <p className="text-gray-400 text-sm">{doc.project}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">{formatFileSize(doc.size)}</p>
                    <p className="text-gray-500 text-xs">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                    {doc.status}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-white transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No documents found</h3>
            <p className="text-gray-400">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Upload your first document to get started'
              }
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DocumentManager;
