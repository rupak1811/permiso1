import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  Save,
  X,
  Upload,
  FileText,
  MapPin,
  DollarSign,
  Calendar,
  AlertCircle
} from 'lucide-react';

const ProjectEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    estimatedCost: 0,
    estimatedTimeline: 0
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/projects/${id}`);
        const projectData = response.data.project;
        
        // Check if user owns this project
        if (user?.role === 'user' && projectData.applicant !== user.id && projectData.applicant?.id !== user.id) {
          toast.error('You do not have permission to edit this project');
          navigate('/projects');
          return;
        }

        setProject(projectData);
        setFormData({
          title: projectData.title || '',
          description: projectData.description || '',
          type: projectData.type || '',
          location: projectData.location || {
            address: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
          },
          estimatedCost: projectData.estimatedCost || 0,
          estimatedTimeline: projectData.estimatedTimeline || 0
        });
      } catch (error) {
        console.error('Error fetching project:', error);
        toast.error('Failed to load project');
        navigate('/projects');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProject();
    }
  }, [id, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [name]: value
      }
    }));
    // Clear error for this field
    if (errors[`location.${name}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`location.${name}`];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Project title is required';
    }
    if (!formData.type) {
      newErrors.type = 'Project type is required';
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
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setSaving(true);
      
      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        location: formData.location,
        estimatedCost: parseFloat(formData.estimatedCost) || 0,
        estimatedTimeline: parseInt(formData.estimatedTimeline) || 0
      };

      const response = await axios.put(`/api/projects/${id}`, updateData);
      
      toast.success('Project updated successfully!');
      navigate(`/projects/${id}`);
    } catch (error) {
      console.error('Error updating project:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Failed to update project';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card p-4 sm:p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(`/projects/${id}`)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Edit Project</h1>
              <p className="text-gray-400 text-sm sm:text-base">Update project details</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass-card p-4 sm:p-6 space-y-6"
        >
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`glass-input w-full ${errors.title ? 'border-red-500' : ''}`}
                  placeholder="Enter project title"
                  required
                />
                {errors.title && (
                  <p className="text-red-400 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="glass-input w-full"
                  placeholder="Enter project description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Type <span className="text-red-400">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className={`glass-input w-full ${errors.type ? 'border-red-500' : ''}`}
                  required
                >
                  <option value="">Select project type</option>
                  <option value="building">Building</option>
                  <option value="renovation">Renovation</option>
                  <option value="commercial">Commercial</option>
                  <option value="residential">Residential</option>
                  <option value="other">Other</option>
                </select>
                {errors.type && (
                  <p className="text-red-400 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.type}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Location
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.location.address}
                  onChange={handleLocationChange}
                  className={`glass-input w-full ${errors['location.address'] ? 'border-red-500' : ''}`}
                  placeholder="Street address"
                  required
                />
                {errors['location.address'] && (
                  <p className="text-red-400 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors['location.address']}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  City <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.location.city}
                  onChange={handleLocationChange}
                  className={`glass-input w-full ${errors['location.city'] ? 'border-red-500' : ''}`}
                  placeholder="City"
                  required
                />
                {errors['location.city'] && (
                  <p className="text-red-400 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors['location.city']}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  State <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.location.state}
                  onChange={handleLocationChange}
                  className={`glass-input w-full ${errors['location.state'] ? 'border-red-500' : ''}`}
                  placeholder="State"
                  required
                />
                {errors['location.state'] && (
                  <p className="text-red-400 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors['location.state']}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ZIP Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.location.zipCode}
                  onChange={handleLocationChange}
                  className="glass-input w-full"
                  placeholder="ZIP Code"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.location.country}
                  onChange={handleLocationChange}
                  className="glass-input w-full"
                  placeholder="Country"
                />
              </div>
            </div>
          </div>

          {/* Cost & Timeline */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Cost & Timeline
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Estimated Cost ($)
                </label>
                <input
                  type="number"
                  name="estimatedCost"
                  value={formData.estimatedCost}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="glass-input w-full"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Estimated Timeline (days)
                </label>
                <input
                  type="number"
                  name="estimatedTimeline"
                  value={formData.estimatedTimeline}
                  onChange={handleChange}
                  min="0"
                  className="glass-input w-full"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-white/20">
            <button
              type="button"
              onClick={() => navigate(`/projects/${id}`)}
              className="glass-button border-2 border-white/30 hover:bg-white/10 w-full sm:w-auto px-6 py-2.5 flex items-center justify-center"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="glass-button bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 w-full sm:w-auto px-6 py-2.5 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </motion.div>
      </form>
    </div>
  );
};

export default ProjectEdit;


