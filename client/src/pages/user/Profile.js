import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Save,
  Edit,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || ''
        }
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Profile update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || ''
        }
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 px-2 sm:px-0 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card p-4 sm:p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 break-words">
              Profile Settings
            </h1>
            <p className="text-sm sm:text-base text-gray-300">
              Manage your account information and preferences
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="glass-button bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 flex items-center justify-center space-x-2 px-4 py-2.5 sm:py-3 text-sm sm:text-base"
              >
                <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancel}
                  className="glass-button border-2 border-white/30 hover:bg-white/10 flex items-center justify-center space-x-2 px-4 py-2.5 sm:py-3 text-sm sm:text-base"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Profile Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="glass-card p-4 sm:p-6"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="glass-input w-full"
                    placeholder="Enter your full name"
                    required
                  />
                ) : (
                  <div className="glass-input w-full bg-white/5 text-white py-2.5">
                    {formData.name || 'Not provided'}
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                <div className="glass-input w-full bg-white/5 text-gray-400 py-2.5">
                  {formData.email}
                </div>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="glass-input w-full"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <div className="glass-input w-full bg-white/5 text-white py-2.5">
                    {formData.phone || 'Not provided'}
                  </div>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Role
                </label>
                <div className="glass-input w-full bg-white/5 text-white py-2.5 capitalize">
                  {user?.role || 'User'}
                </div>
                <p className="text-xs text-gray-500 mt-1">Role cannot be changed</p>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Address Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Street */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Street Address
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    className="glass-input w-full"
                    placeholder="Enter your street address"
                  />
                ) : (
                  <div className="glass-input w-full bg-white/5 text-white py-2.5">
                    {formData.address.street || 'Not provided'}
                  </div>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    className="glass-input w-full"
                    placeholder="Enter your city"
                  />
                ) : (
                  <div className="glass-input w-full bg-white/5 text-white py-2.5">
                    {formData.address.city || 'Not provided'}
                  </div>
                )}
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">State</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    className="glass-input w-full"
                    placeholder="Enter your state"
                  />
                ) : (
                  <div className="glass-input w-full bg-white/5 text-white py-2.5">
                    {formData.address.state || 'Not provided'}
                  </div>
                )}
              </div>

              {/* Zip Code */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Zip Code</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleChange}
                    className="glass-input w-full"
                    placeholder="Enter your zip code"
                  />
                ) : (
                  <div className="glass-input w-full bg-white/5 text-white py-2.5">
                    {formData.address.zipCode || 'Not provided'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          {isEditing && (
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-white/20">
              <button
                type="submit"
                disabled={loading}
                className="glass-button bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 flex items-center justify-center space-x-2 px-6 py-3 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          )}
        </form>
      </motion.div>
    </div>
  );
};

export default Profile;

