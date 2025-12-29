import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Upload, 
  FileText, 
  Image, 
  File, 
  X, 
  CheckCircle, 
  Bot,
  Sparkles,
  Eye,
  Download
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LocationMap from '../../components/maps/LocationMap';

const ProjectUpload = () => {
  useLanguage();
  const { theme, isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    estimatedCost: '',
    estimatedTimeline: '',
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      coordinates: {
        lat: null,
        lng: null
      }
    }
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errors, setErrors] = useState({});

  const projectTypes = [
    { value: 'building', label: 'New Building Construction' },
    { value: 'renovation', label: 'Building Renovation' },
    { value: 'commercial', label: 'Commercial Development' },
    { value: 'residential', label: 'Residential Development' },
    { value: 'other', label: 'Other' }
  ];

  const acceptedFileTypes = {
    'application/pdf': ['.pdf'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'application/vnd.ms-powerpoint': ['.ppt'],
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx']
  };

  const onDrop = async (acceptedFiles) => {
    setIsUploading(true);
    
    for (const file of acceptedFiles) {
      try {
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        
        const response = await axios.post('/api/uploads', uploadFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        const uploadedFile = {
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          url: response.data.file.url,
          status: 'uploaded'
        };

        setUploadedFiles(prev => [...prev, uploadedFile]);

        // Auto-analyze PDF documents to extract cost and time
        if (file.type === 'application/pdf') {
          try {
            setIsAnalyzing(true);
            const analysisResponse = await axios.post('/api/ai/analyze', {
              documentUrl: uploadedFile.url,
              projectType: formData.type || undefined
            });
            
            const analysis = analysisResponse.data.analysis;
            setAiAnalysis(analysis);
            
            // Auto-fill estimated cost and timeline from AI analysis
            if (analysis.extractedData) {
              if (analysis.extractedData.estimatedCost) {
                setFormData(prev => ({
                  ...prev,
                  estimatedCost: analysis.extractedData.estimatedCost
                }));
              }
              if (analysis.extractedData.estimatedTimeline) {
                setFormData(prev => ({
                  ...prev,
                  estimatedTimeline: analysis.extractedData.estimatedTimeline
                }));
              }
            }
            
            toast.success('Document analyzed and fields auto-filled');
          } catch (analysisError) {
            console.error('AI analysis error:', analysisError);
            toast.error('AI analysis failed, please fill fields manually');
          } finally {
            setIsAnalyzing(false);
          }
        }
      } catch (error) {
        console.error('Upload error:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
        toast.error(`Failed to upload ${file.name}: ${errorMessage}`);
      }
    }
    
    setIsUploading(false);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    multiple: true,
    maxSize: 30 * 1024 * 1024 // 30MB
  });

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleLocationSelect = (locationData) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        address: locationData.address || prev.location.address,
        city: locationData.city || prev.location.city,
        state: locationData.state || prev.location.state,
        zipCode: locationData.zipCode || prev.location.zipCode,
        country: locationData.country || prev.location.country,
        coordinates: locationData.coordinates || prev.location.coordinates
      }
    }));

    // Clear location-related errors
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors['location.address'];
      delete newErrors['location.city'];
      delete newErrors['location.state'];
      return newErrors;
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Project title is required';
    }
    if (!formData.type) {
      newErrors.type = 'Project type is required';
    }
    if (!formData.estimatedCost || formData.estimatedCost <= 0) {
      newErrors.estimatedCost = 'Estimated cost is required and must be greater than 0';
    }
    if (!formData.estimatedTimeline || formData.estimatedTimeline <= 0) {
      newErrors.estimatedTimeline = 'Estimated timeline is required and must be greater than 0';
    }
    if (!formData.location.address.trim()) {
      newErrors['location.address'] = 'Address is required';
    }
    if (!formData.location.city.trim()) {
      newErrors['location.city'] = 'City is required';
    }
    if (!formData.location.state.trim()) {
      newErrors['location.state'] = 'State is required';
    }
    if (uploadedFiles.length === 0) {
      newErrors.files = 'At least one document is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAnalyzeWithAI = async () => {
    if (uploadedFiles.length === 0) {
      toast.error('Please upload documents first');
      return;
    }

    setIsAnalyzing(true);
    try {
      // Analyze all PDF documents
      const pdfFiles = uploadedFiles.filter(file => file.type === 'application/pdf');
      if (pdfFiles.length === 0) {
        toast.error('Please upload PDF documents for AI analysis');
        setIsAnalyzing(false);
        return;
      }

      // Analyze the first PDF (can be enhanced to analyze all)
      const response = await axios.post('/api/ai/analyze', {
        documentUrl: pdfFiles[0].url,
        projectType: formData.type || undefined
      });
      
      const analysis = response.data.analysis;
      setAiAnalysis(analysis);
      
      // Auto-fill estimated cost and timeline from AI analysis
      if (analysis.extractedData) {
        if (analysis.extractedData.estimatedCost) {
          setFormData(prev => ({
            ...prev,
            estimatedCost: analysis.extractedData.estimatedCost
          }));
        }
        if (analysis.extractedData.estimatedTimeline) {
          setFormData(prev => ({
            ...prev,
            estimatedTimeline: analysis.extractedData.estimatedTimeline
          }));
        }
      }
      
      toast.success('AI analysis completed and fields updated');
    } catch (error) {
      console.error('AI analysis error:', error);
      toast.error('AI analysis failed');
    }
    setIsAnalyzing(false);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const projectData = {
        ...formData,
        estimatedCost: parseFloat(formData.estimatedCost),
        estimatedTimeline: parseInt(formData.estimatedTimeline),
        documents: uploadedFiles.map(file => ({
          name: file.name,
          url: file.url,
          type: file.type,
          size: file.size,
          isVerified: false // Documents start as unverified
        })),
        // Automatically set status to 'submitted' when documents are uploaded
        status: 'submitted',
        // Include AI analysis if available
        aiAnalysis: aiAnalysis || null
      };

      const response = await axios.post('/api/projects', projectData);
      toast.success('Project submitted successfully! It will now appear in the reviewer dashboard.');
      const projectId = response.data.project.id || response.data.project._id;
      navigate(`/projects/${projectId}`);
    } catch (error) {
      console.error('Project creation error:', error);
      toast.error('Failed to create project');
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return <Image className="w-5 h-5" />;
    } else if (fileType === 'application/pdf') {
      return <FileText className="w-5 h-5" />;
    } else {
      return <File className="w-5 h-5" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Upload New Project</h1>
              <p className="text-gray-300">Create a new permit application with AI assistance</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate('/documents')}
              className="glass-button border-2 border-white/20 hover:bg-white/10 text-sm"
            >
              View Documents
            </button>
            <button
              onClick={toggleTheme}
              className="glass-button border-2 border-white/20 hover:bg-white/10 text-sm"
            >
              Toggle Theme
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Project Information */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Project Information</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter project title"
                  className={`glass-input w-full ${errors.title ? 'border-red-400' : ''}`}
                />
                {errors.title && (
                  <p className="text-red-400 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your project"
                  rows={4}
                  className="glass-input w-full resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Project Type *
                </label>
                <div className="relative group">
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className={`
                      w-full 
                      bg-white/5 
                      backdrop-blur-md 
                      border 
                      ${errors.type ? 'border-red-400/50' : 'border-white/10'} 
                      rounded-lg 
                      px-4 
                      py-3 
                      text-white 
                      text-sm
                      appearance-none
                      cursor-pointer
                      transition-all
                      duration-200
                      hover:bg-white/10
                      hover:border-blue-400/30
                      focus:bg-white/10
                      focus:outline-none
                      focus:ring-2
                      focus:ring-blue-500/50
                      focus:border-blue-500/50
                      ${formData.type ? 'text-white' : 'text-gray-400'}
                      shadow-sm
                      hover:shadow-md
                    `}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23${isDark ? 'ffffff' : '1f2937'}' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      backgroundSize: '12px',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="" disabled className={`${isDark ? 'bg-gray-800' : 'bg-gray-100'} ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Select project type
                    </option>
                    {projectTypes.map(type => (
                      <option 
                        key={type.value} 
                        value={type.value}
                        className={`${isDark ? 'bg-gray-800' : 'bg-gray-100'} ${isDark ? 'text-white' : 'text-gray-900'}`}
                      >
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 pointer-events-none rounded-lg bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-200"></div>
                </div>
                {errors.type && (
                  <p className="text-red-400 text-sm mt-1">{errors.type}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Estimated Cost ($) *
                  </label>
                  <input
                    type="number"
                    name="estimatedCost"
                    value={formData.estimatedCost}
                    onChange={handleInputChange}
                    placeholder="Auto-filled from documents"
                    min="0"
                    step="0.01"
                    className={`glass-input w-full ${errors.estimatedCost ? 'border-red-400' : ''}`}
                    readOnly={isAnalyzing}
                  />
                  {errors.estimatedCost && (
                    <p className="text-red-400 text-sm mt-1">{errors.estimatedCost}</p>
                  )}
                  {isAnalyzing && (
                    <p className="text-blue-400 text-xs mt-1">AI is analyzing documents...</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Estimated Timeline (days) *
                  </label>
                  <input
                    type="number"
                    name="estimatedTimeline"
                    value={formData.estimatedTimeline}
                    onChange={handleInputChange}
                    placeholder="Auto-filled from documents"
                    min="0"
                    step="1"
                    className={`glass-input w-full ${errors.estimatedTimeline ? 'border-red-400' : ''}`}
                    readOnly={isAnalyzing}
                  />
                  {errors.estimatedTimeline && (
                    <p className="text-red-400 text-sm mt-1">{errors.estimatedTimeline}</p>
                  )}
                  {isAnalyzing && (
                    <p className="text-blue-400 text-xs mt-1">AI is analyzing documents...</p>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-4">
                    Project Location *
                  </label>
                  
                  {/* Map Component */}
                  <div className="mb-6">
                    <LocationMap
                      onLocationSelect={handleLocationSelect}
                      selectedLocation={formData.location.coordinates?.lat && formData.location.coordinates?.lng 
                        ? { lat: formData.location.coordinates.lat, lng: formData.location.coordinates.lng }
                        : null}
                    />
                  </div>

                  {/* Location Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        name="location.address"
                        value={formData.location.address}
                        onChange={handleInputChange}
                        placeholder="Street Name (e.g., Main Street, Park Avenue)"
                        className={`glass-input w-full ${errors['location.address'] ? 'border-red-400' : ''}`}
                      />
                      <p className="text-xs text-gray-500 mt-1">Street name only (door number excluded)</p>
                      {errors['location.address'] && (
                        <p className="text-red-400 text-sm mt-1">{errors['location.address']}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        name="location.city"
                        value={formData.location.city}
                        onChange={handleInputChange}
                        placeholder="City"
                        className={`glass-input w-full ${errors['location.city'] ? 'border-red-400' : ''}`}
                      />
                      {errors['location.city'] && (
                        <p className="text-red-400 text-sm mt-1">{errors['location.city']}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        name="location.state"
                        value={formData.location.state}
                        onChange={handleInputChange}
                        placeholder="State"
                        className={`glass-input w-full ${errors['location.state'] ? 'border-red-400' : ''}`}
                      />
                      {errors['location.state'] && (
                        <p className="text-red-400 text-sm mt-1">{errors['location.state']}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        name="location.zipCode"
                        value={formData.location.zipCode}
                        onChange={handleInputChange}
                        placeholder="ZIP Code"
                        className="glass-input w-full"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        name="location.country"
                        value={formData.location.country}
                        onChange={handleInputChange}
                        placeholder="Country"
                        className="glass-input w-full"
                        readOnly
                      />
                      <p className="text-xs text-gray-500 mt-1">Auto-filled from map selection</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    💡 Click on the map above to automatically fill all location fields (street name, city, state, zip code, and country). Door/street numbers are excluded.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Upload Documents</h2>
            
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${
                isDragActive
                  ? 'border-blue-400 bg-blue-500/10'
                  : 'border-white/20 hover:border-white/40 hover:bg-white/5'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-white text-lg mb-2">
                {isDragActive ? 'Drop files here' : 'Drag & drop files here, or click to select'}
              </p>
              <p className="text-gray-400 text-sm">
                Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG, GIF
              </p>
              <p className="text-gray-400 text-sm">Max file size: 10MB</p>
            </div>

            {errors.files && (
              <p className="text-red-400 text-sm mt-2">{errors.files}</p>
            )}

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="mt-6 space-y-3">
                <h3 className="text-lg font-medium text-white">Uploaded Files</h3>
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file.type)}
                      <div className="min-w-0">
                        <p className="text-white font-medium break-words">{file.name}</p>
                        <p className="text-gray-400 text-sm">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end space-x-2 w-full sm:w-auto">
                      <span className="text-green-400 text-sm">Uploaded</span>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="glass-button border-2 border-white/30 hover:bg-white/10 w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isUploading}
              className="glass-button bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              {isUploading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </motion.div>

        {/* AI Assistant Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-6"
        >
          {/* AI Analysis */}
          <div className="glass-card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">AI Analysis</h3>
            </div>
            
            {uploadedFiles.length > 0 ? (
              <div className="space-y-4">
                <button
                  onClick={handleAnalyzeWithAI}
                  disabled={isAnalyzing}
                  className="w-full glass-button bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </div>
                  ) : (
                    'Analyze Documents'
                  )}
                </button>

                {aiAnalysis && (
                  <div className="space-y-3">
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 font-medium">Analysis Complete</span>
                      </div>
                      <p className="text-gray-300 text-sm">
                        Confidence: {Math.round(aiAnalysis.confidence * 100)}%
                      </p>
                    </div>

                    <div>
                      <h4 className="text-white font-medium mb-2">Extracted Data:</h4>
                      <div className="space-y-2 text-sm">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="text-gray-400">Project Type:</span>
                      <span className="text-white text-sm sm:text-base">{aiAnalysis.extractedData.projectType}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="text-gray-400">Estimated Cost:</span>
                      <span className="text-white text-sm sm:text-base">${aiAnalysis.extractedData.estimatedCost.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="text-gray-400">Timeline:</span>
                      <span className="text-white text-sm sm:text-base">{aiAnalysis.extractedData.estimatedTimeline} days</span>
                    </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-white font-medium mb-2">Recommendations:</h4>
                      <ul className="space-y-1 text-sm text-gray-300">
                        {aiAnalysis.extractedData.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <Sparkles className="w-3 h-3 text-yellow-400 mt-1 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">
                Upload documents to enable AI analysis
              </p>
            )}
          </div>

          {/* Tips */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Upload Tips</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">
                  Include all required documents for faster processing
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">
                  Use high-quality scans for better AI analysis
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">
                  Organize files with descriptive names
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left p-3 rounded-lg hover:bg-white/5 transition-colors">
                <div className="flex items-center space-x-3">
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-300 text-sm">View Templates</span>
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-white/5 transition-colors">
                <div className="flex items-center space-x-3">
                  <Download className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300 text-sm">Download Checklist</span>
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-white/5 transition-colors">
                <div className="flex items-center space-x-3">
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-300 text-sm">Get Help</span>
                </div>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectUpload;
