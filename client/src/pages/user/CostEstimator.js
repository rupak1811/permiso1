import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Calculator, 
  DollarSign, 
  Clock, 
  MapPin, 
  Building, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';

const CostEstimator = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    projectType: '',
    size: '',
    complexity: 'medium',
    location: '',
    buildingType: '',
    occupancy: '',
    height: '',
    floors: '',
    specialFeatures: []
  });
  const [estimate, setEstimate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const projectTypes = [
    { value: 'building', label: 'New Building Construction' },
    { value: 'renovation', label: 'Building Renovation' },
    { value: 'commercial', label: 'Commercial Development' },
    { value: 'residential', label: 'Residential Development' },
    { value: 'other', label: 'Other' }
  ];

  const complexityLevels = [
    { value: 'low', label: 'Low', description: 'Simple, standard construction' },
    { value: 'medium', label: 'Medium', description: 'Moderate complexity with some custom features' },
    { value: 'high', label: 'High', description: 'Complex design with advanced systems' },
    { value: 'urgent', label: 'Urgent', description: 'Fast-track approval required' }
  ];

  const specialFeatures = [
    { value: 'solar', label: 'Solar Panels', costMultiplier: 1.1 },
    { value: 'elevator', label: 'Elevator', costMultiplier: 1.2 },
    { value: 'parking', label: 'Underground Parking', costMultiplier: 1.3 },
    { value: 'green', label: 'Green Building Features', costMultiplier: 1.15 },
    { value: 'security', label: 'Advanced Security Systems', costMultiplier: 1.05 },
    { value: 'fire', label: 'Fire Suppression Systems', costMultiplier: 1.1 }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSpecialFeaturesChange = (feature) => {
    setFormData(prev => ({
      ...prev,
      specialFeatures: prev.specialFeatures.includes(feature.value)
        ? prev.specialFeatures.filter(f => f !== feature.value)
        : [...prev.specialFeatures, feature.value]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.projectType) {
      newErrors.projectType = 'Project type is required';
    }
    if (!formData.size || formData.size < 100) {
      newErrors.size = 'Project size must be at least 100 sq ft';
    }
    if (!formData.location) {
      newErrors.location = 'Location is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEstimate = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const response = await axios.post('/api/ai/estimate', formData);
      setEstimate(response.data.estimate);
    } catch (error) {
      console.error('Estimation error:', error);
      // Fallback to mock estimation
      const mockEstimate = calculateMockEstimate();
      setEstimate(mockEstimate);
    }
    setIsLoading(false);
  };

  const calculateMockEstimate = () => {
    const baseCosts = {
      building: 50000,
      renovation: 25000,
      commercial: 75000,
      residential: 30000,
      other: 20000
    };

    const complexityMultipliers = {
      low: 0.8,
      medium: 1.0,
      high: 1.5,
      urgent: 2.0
    };

    const sizeMultiplier = Math.max(0.5, Math.min(2.0, formData.size / 1000));
    const baseCost = baseCosts[formData.projectType] || 20000;
    const complexity = complexityMultipliers[formData.complexity] || 1.0;
    
    let totalCost = baseCost * complexity * sizeMultiplier;
    
    // Apply special features multipliers
    formData.specialFeatures.forEach(featureValue => {
      const feature = specialFeatures.find(f => f.value === featureValue);
      if (feature) {
        totalCost *= feature.costMultiplier;
      }
    });

    const baseTimeline = {
      building: 120,
      renovation: 60,
      commercial: 150,
      residential: 90,
      other: 45
    };

    const timeline = Math.round(baseTimeline[formData.projectType] * complexity);

    return {
      cost: Math.round(totalCost),
      timeline,
      breakdown: {
        baseCost: Math.round(baseCost),
        complexityMultiplier: complexity,
        sizeMultiplier: sizeMultiplier,
        projectType: formData.projectType,
        location: formData.location
      }
    };
  };

  const getCostBreakdownData = () => {
    if (!estimate) return [];
    
    return [
      { name: 'Base Cost', value: estimate.breakdown.baseCost, color: '#3B82F6' },
      { name: 'Complexity', value: Math.round(estimate.cost * (estimate.breakdown.complexityMultiplier - 1)), color: '#8B5CF6' },
      { name: 'Size Factor', value: Math.round(estimate.cost * (estimate.breakdown.sizeMultiplier - 1)), color: '#10B981' },
      { name: 'Special Features', value: Math.round(estimate.cost * 0.1), color: '#F59E0B' }
    ];
  };

  const getTimelineData = () => {
    if (!estimate) return [];
    
    return [
      { name: 'Application Review', days: Math.round(estimate.timeline * 0.3), color: '#3B82F6' },
      { name: 'Technical Review', days: Math.round(estimate.timeline * 0.4), color: '#8B5CF6' },
      { name: 'Final Approval', days: Math.round(estimate.timeline * 0.3), color: '#10B981' }
    ];
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
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Cost & Timeline Estimator</h1>
            <p className="text-gray-300">Get accurate estimates for your permit applications</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Project Details</h2>
            
            <div className="space-y-6">
              {/* Project Type */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Project Type *
                </label>
                <select
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleInputChange}
                  className={`glass-input w-full ${errors.projectType ? 'border-red-400' : ''}`}
                >
                  <option value="">Select project type</option>
                  {projectTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.projectType && (
                  <p className="text-red-400 text-sm mt-1">{errors.projectType}</p>
                )}
              </div>

              {/* Project Size */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Project Size (sq ft) *
                </label>
                <input
                  type="number"
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  placeholder="Enter project size"
                  className={`glass-input w-full ${errors.size ? 'border-red-400' : ''}`}
                />
                {errors.size && (
                  <p className="text-red-400 text-sm mt-1">{errors.size}</p>
                )}
              </div>

              {/* Complexity */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Complexity Level
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {complexityLevels.map(level => (
                    <button
                      key={level.value}
                      onClick={() => setFormData(prev => ({ ...prev, complexity: level.value }))}
                      className={`p-3 rounded-lg border transition-all ${
                        formData.complexity === level.value
                          ? 'border-blue-400 bg-blue-500/20 text-white'
                          : 'border-white/20 text-gray-300 hover:border-white/40 hover:bg-white/5'
                      }`}
                    >
                      <div className="font-medium">{level.label}</div>
                      <div className="text-xs opacity-75">{level.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="City, State"
                  className={`glass-input w-full ${errors.location ? 'border-red-400' : ''}`}
                />
                {errors.location && (
                  <p className="text-red-400 text-sm mt-1">{errors.location}</p>
                )}
              </div>

              {/* Special Features */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Special Features (Optional)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {specialFeatures.map(feature => (
                    <label
                      key={feature.value}
                      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.specialFeatures.includes(feature.value)}
                        onChange={() => handleSpecialFeaturesChange(feature)}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-gray-300 text-sm">{feature.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleEstimate}
                disabled={isLoading}
                className="w-full glass-button bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Calculating...
                  </div>
                ) : (
                  'Get Estimate'
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-6"
        >
          {estimate ? (
            <>
              {/* Cost Estimate */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Cost Estimate</h3>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-white mb-2">
                    ${estimate.cost.toLocaleString()}
                  </div>
                  <p className="text-gray-400">Estimated total cost</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Base Cost</span>
                    <span className="text-white font-medium">
                      ${estimate.breakdown.baseCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Complexity Factor</span>
                    <span className="text-white font-medium">
                      {estimate.breakdown.complexityMultiplier}x
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Size Factor</span>
                    <span className="text-white font-medium">
                      {estimate.breakdown.sizeMultiplier.toFixed(1)}x
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Special Features</span>
                    <span className="text-white font-medium">
                      +{Math.round(estimate.cost * 0.1).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timeline Estimate */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Timeline Estimate</h3>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-white mb-2">
                    {estimate.timeline} days
                  </div>
                  <p className="text-gray-400">Estimated processing time</p>
                </div>

                <div className="space-y-3">
                  {getTimelineData().map((phase, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: phase.color }}
                        />
                        <span className="text-gray-300">{phase.name}</span>
                      </div>
                      <span className="text-white font-medium">{phase.days} days</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Charts */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Cost Breakdown</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getCostBreakdownData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {getCostBreakdownData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Timeline Chart */}
              <div className="glass-card p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Timeline Breakdown</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getTimelineData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        formatter={(value) => [`${value} days`, 'Duration']}
                        labelStyle={{ color: '#fff' }}
                        contentStyle={{ 
                          backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="days" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          ) : (
            <div className="glass-card p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Get Your Estimate</h3>
              <p className="text-gray-400">
                Fill out the form to get an accurate cost and timeline estimate for your permit application.
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="glass-card p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Estimation Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 text-green-400 mt-1" />
            <div>
              <h4 className="text-white font-medium mb-1">Accurate Sizing</h4>
              <p className="text-gray-400 text-sm">
                Provide accurate square footage for the most precise estimates
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-yellow-400 mt-1" />
            <div>
              <h4 className="text-white font-medium mb-1">Complexity Matters</h4>
              <p className="text-gray-400 text-sm">
                Higher complexity projects typically take longer and cost more
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Info className="w-6 h-6 text-blue-400 mt-1" />
            <div>
              <h4 className="text-white font-medium mb-1">Location Impact</h4>
              <p className="text-gray-400 text-sm">
                Different locations have varying permit requirements and costs
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CostEstimator;
