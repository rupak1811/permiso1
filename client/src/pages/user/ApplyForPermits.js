import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import LocationMap from '../../components/maps/LocationMap';
import { 
  ArrowLeft, 
  FileText, 
  MapPin, 
  Upload,
  X,
  CheckCircle,
  Building,
  Zap,
  Wrench,
  Trash2
} from 'lucide-react';

const ApplyForPermits = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [formData, setFormData] = useState({
    permitType: '',
    permitDescription: '',
    selectedDocuments: [],
    address: {
      street: '',
      houseNumber: '',
      pincode: '',
      fullAddress: ''
    }
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/projects?limit=1000');
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProject = (project) => {
    setSelectedProject(project);
    setFormData({
      permitType: '',
      permitDescription: '',
      selectedDocuments: project.documents?.map(doc => doc.id || doc.fileName) || [],
      address: {
        street: project.location?.address || '',
        houseNumber: '',
        pincode: project.location?.zipCode || '',
        fullAddress: project.location?.fullAddress || 
          `${project.location?.address || ''}, ${project.location?.city || ''}, ${project.location?.state || ''} ${project.location?.zipCode || ''}`.trim()
      }
    });
    setErrors({});
  };

  const handleLocationSelect = (location) => {
    setFormData(prev => ({
      ...prev,
      address: {
        street: location.address || prev.address.street,
        houseNumber: prev.address.houseNumber,
        pincode: location.zipCode || prev.address.pincode,
        fullAddress: location.fullAddress || 
          `${location.address || ''}, ${location.city || ''}, ${location.state || ''} ${location.zipCode || ''}`.trim()
      }
    }));
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
    
    // Clear error
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const toggleDocument = (docId) => {
    setFormData(prev => {
      const selected = prev.selectedDocuments || [];
      if (selected.includes(docId)) {
        return {
          ...prev,
          selectedDocuments: selected.filter(id => id !== docId)
        };
      } else {
        return {
          ...prev,
          selectedDocuments: [...selected, docId]
        };
      }
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.permitType) {
      newErrors.permitType = 'Permit type is required';
    }
    
    if (!formData.address.street) {
      newErrors['address.street'] = 'Street address is required';
    }
    
    if (!formData.address.pincode) {
      newErrors['address.pincode'] = 'Pincode is required';
    }
    
    if (formData.selectedDocuments.length === 0) {
      newErrors.selectedDocuments = 'At least one document must be selected';
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
      setSubmitting(true);
      
      const permitData = {
        projectId: selectedProject.id,
        permitType: formData.permitType,
        permitDescription: formData.permitDescription,
        selectedDocuments: formData.selectedDocuments,
        address: formData.address
      };

      const response = await axios.post('/api/permits', permitData);
      
      toast.success('Permit application submitted successfully!');
      navigate('/permits');
    } catch (error) {
      console.error('Error submitting permit:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit permit application';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (!selectedProject) {
    return (
      <div className="space-y-6">
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
                <h1 className="text-2xl font-bold text-white">Apply for Permits</h1>
                <p className="text-gray-400">Select a project to apply for permits</p>
              </div>
            </div>
          </div>
        </motion.div>

        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass-card p-8 text-center"
          >
            <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No Projects Found</h2>
            <p className="text-gray-400 mb-6">You need to create a project first before applying for permits.</p>
            <button
              onClick={() => navigate('/projects/upload')}
              className="glass-button bg-gradient-to-r from-blue-500 to-purple-600"
            >
              Create Project
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="glass-card p-6 hover:bg-white/10 transition-all cursor-pointer"
                onClick={() => handleSelectProject(project)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">{project.title}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2">{project.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    project.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                    project.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                    project.status === 'under_review' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {project.status.replace('_', ' ')}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {project.documents?.length || 0} documents
                  </span>
                </div>

                <button
                  className="w-full glass-button bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectProject(project);
                  }}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Apply for Permits
                </button>
              </motion.div>
            ))}
          </div>
        )}
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
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSelectedProject(null)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Apply for Permits</h1>
              <p className="text-gray-400">Project: {selectedProject.title}</p>
            </div>
          </div>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass-card p-6 space-y-6"
        >
          {/* Project Name (Auto-filled) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={selectedProject.title}
              className="glass-input w-full bg-white/5"
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1">Auto-filled from selected project</p>
          </div>

          {/* Permit Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Permit Type <span className="text-red-400">*</span>
            </label>
            <select
              name="permitType"
              value={formData.permitType}
              onChange={handleInputChange}
              className={`glass-input w-full bg-white/5 ${errors.permitType ? 'border-red-400' : ''}`}
              required
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.75rem center',
                backgroundSize: '1em 1em',
                paddingRight: '2.5rem',
                appearance: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none'
              }}
            >
              <option value="" style={{ backgroundColor: 'rgba(10, 37, 64, 0.95)', color: 'white' }}>Select permit type</option>
              <option value="building" style={{ backgroundColor: 'rgba(10, 37, 64, 0.95)', color: 'white' }}>Building Permit</option>
              <option value="electric" style={{ backgroundColor: 'rgba(10, 37, 64, 0.95)', color: 'white' }}>Electric Permit</option>
              <option value="plumber" style={{ backgroundColor: 'rgba(10, 37, 64, 0.95)', color: 'white' }}>Plumber Permit</option>
              <option value="demolition" style={{ backgroundColor: 'rgba(10, 37, 64, 0.95)', color: 'white' }}>Demolition Permit</option>
            </select>
            {errors.permitType && (
              <p className="text-red-400 text-sm mt-1">{errors.permitType}</p>
            )}
          </div>

          {/* Location Map */}
          <div>
            <label className="block text-sm font-medium text-white mb-4">
              Project Location
            </label>
            <div className="mb-6">
              <LocationMap
                onLocationSelect={handleLocationSelect}
                selectedLocation={selectedProject.location?.coordinates?.lat && selectedProject.location?.coordinates?.lng
                  ? { lat: selectedProject.location.coordinates.lat, lng: selectedProject.location.coordinates.lng }
                  : null}
                readOnly={false}
              />
            </div>

            {/* Address Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Street <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  className={`glass-input w-full ${errors['address.street'] ? 'border-red-400' : ''}`}
                  placeholder="Street name"
                  required
                />
                {errors['address.street'] && (
                  <p className="text-red-400 text-sm mt-1">{errors['address.street']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  House Number
                </label>
                <input
                  type="text"
                  name="address.houseNumber"
                  value={formData.address.houseNumber}
                  onChange={handleInputChange}
                  className="glass-input w-full"
                  placeholder="House/Unit number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Pincode <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="address.pincode"
                  value={formData.address.pincode}
                  onChange={handleInputChange}
                  className={`glass-input w-full ${errors['address.pincode'] ? 'border-red-400' : ''}`}
                  placeholder="Pincode"
                  required
                />
                {errors['address.pincode'] && (
                  <p className="text-red-400 text-sm mt-1">{errors['address.pincode']}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Address
                </label>
                <textarea
                  name="address.fullAddress"
                  value={formData.address.fullAddress}
                  onChange={handleInputChange}
                  rows={2}
                  className="glass-input w-full"
                  placeholder="Full address (auto-filled from map)"
                />
              </div>
            </div>
          </div>

          {/* Permit Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Permit Description
            </label>
            <textarea
              name="permitDescription"
              value={formData.permitDescription}
              onChange={handleInputChange}
              rows={4}
              className="glass-input w-full"
              placeholder="Describe the purpose of this permit application..."
            />
          </div>

          {/* Project Documents */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-4">
              Project Documents <span className="text-red-400">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-4">
              Select documents to include in this permit application. Removing documents here will not remove them from the project.
            </p>
            {errors.selectedDocuments && (
              <p className="text-red-400 text-sm mb-4">{errors.selectedDocuments}</p>
            )}
            
            <div className="space-y-3">
              {selectedProject.documents?.map((doc) => {
                const docId = doc.id || doc.fileName;
                const isSelected = formData.selectedDocuments.includes(docId);
                
                return (
                  <div
                    key={docId}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'bg-blue-500/20 border-blue-500'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <FileText className="w-5 h-5 text-blue-400" />
                      <div className="flex-1">
                        <p className="text-white font-medium">{doc.name}</p>
                        <p className="text-gray-400 text-sm">
                          {(doc.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleDocument(docId)}
                      className={`p-2 rounded-lg transition-all ${
                        isSelected
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/10 text-gray-400 hover:bg-white/20'
                      }`}
                    >
                      {isSelected ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <X className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-white/20">
            <button
              type="button"
              onClick={() => setSelectedProject(null)}
              className="glass-button border-2 border-white/30 hover:bg-white/10 px-6 py-2.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="glass-button bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Submit Permit Application
                </>
              )}
            </button>
          </div>
        </motion.div>
      </form>
    </div>
  );
};

export default ApplyForPermits;

