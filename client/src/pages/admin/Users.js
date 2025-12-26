import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  UserCheck,
  UserX
} from 'lucide-react';

const AdminUsers = () => {
  const { t } = useLanguage();
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@email.com',
      role: 'user',
      status: 'active',
      joinDate: '2024-01-15',
      projects: 5
    },
    {
      id: 2,
      name: 'Jane Doe',
      email: 'jane.doe@email.com',
      role: 'reviewer',
      status: 'active',
      joinDate: '2024-01-10',
      projects: 12
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@email.com',
      role: 'admin',
      status: 'active',
      joinDate: '2024-01-05',
      projects: 0
    }
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const getRoleColor = (role) => {
    const colors = {
      user: 'bg-blue-100 text-blue-800 border-blue-200',
      reviewer: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      admin: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[role] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusColor = (status) => {
    return status === 'active' 
      ? 'text-green-400 bg-green-500/20' 
      : 'text-red-400 bg-red-500/20';
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">User Management</h1>
            <p className="text-gray-300">Manage platform users and their permissions</p>
          </div>
          <button className="glass-button bg-gradient-to-r from-blue-500 to-purple-600">
            <Users className="w-5 h-5 mr-2" />
            Add User
          </button>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="glass-card p-6"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-input w-full pl-10"
            />
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="glass-input"
            >
              <option value="all">All Roles</option>
              <option value="user">Users</option>
              <option value="reviewer">Reviewers</option>
              <option value="admin">Admins</option>
            </select>
            <button className="glass-button border-2 border-white/30 hover:bg-white/10">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </button>
          </div>
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="glass-card p-6"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-3 px-4 text-white font-medium">User</th>
                <th className="text-left py-3 px-4 text-white font-medium">Role</th>
                <th className="text-left py-3 px-4 text-white font-medium">Status</th>
                <th className="text-left py-3 px-4 text-white font-medium">Projects</th>
                <th className="text-left py-3 px-4 text-white font-medium">Join Date</th>
                <th className="text-left py-3 px-4 text-white font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-white/10 hover:bg-white/5">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-white">{user.projects}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-gray-400">{new Date(user.joinDate).toLocaleDateString()}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-white transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-white transition-colors">
                        <Shield className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminUsers;
