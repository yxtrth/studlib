import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  AcademicCapIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const UserDirectory = ({ onStartConversation, onClose }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'online', 'department'
  const { user, token } = useSelector((state) => state.auth);

  // Set up axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  const filterUsers = useCallback(() => {
    let filtered = [...users];

    // Text search
    if (searchTerm) {
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    switch (filter) {
      case 'online':
        filtered = filtered.filter(u => u.onlineStatus === 'online');
        break;
      case 'department':
        filtered = filtered.filter(u => 
          u.department && u.department === user?.department
        );
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, filter, user]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [filterUsers]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/chat/users');
      
      if (response.data.success) {
        setUsers(response.data.users);
      } else {
        toast.error('Failed to load users');
      }
    } catch (error) {
      console.error('Fetch users error:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartConversation = (targetUser) => {
    if (onStartConversation) {
      onStartConversation(targetUser);
    }
  };

  const formatLastSeen = (lastSeen) => {
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffInMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const formatJoinDate = (joinDate) => {
    return new Date(joinDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center">
            <LoadingSpinner size="large" />
          </div>
          <p className="text-center mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">User Directory</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Find and connect with other students
          </p>
        </div>

        {/* Search and Filters */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, department, or student ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Users ({users.length})</option>
              <option value="online">Online Only</option>
              <option value="department">Same Department</option>
            </select>
          </div>
        </div>

        {/* Users List */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {filteredUsers.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm ? 'No users found matching your search' : 'No users available'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredUsers.map((targetUser) => (
                <div
                  key={targetUser._id}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Avatar */}
                      <div className="relative">
                        <img
                          src={targetUser.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(targetUser.name)}&background=6366f1&color=fff&size=128&bold=true`}
                          alt={targetUser.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${
                          targetUser.onlineStatus === 'online' ? 'bg-green-500' :
                          targetUser.onlineStatus === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                        }`}></div>
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {targetUser.name}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            targetUser.onlineStatus === 'online' ? 'text-green-600 bg-green-100' :
                            targetUser.onlineStatus === 'away' ? 'text-yellow-600 bg-yellow-100' :
                            'text-gray-600 bg-gray-100'
                          }`}>
                            {targetUser.onlineStatus === 'online' ? 'Online' :
                             targetUser.onlineStatus === 'away' ? 'Away' : 'Offline'}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-1">
                          {targetUser.department && (
                            <div className="flex items-center space-x-1">
                              <AcademicCapIcon className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-600">{targetUser.department}</span>
                            </div>
                          )}
                          
                          {targetUser.studentId && (
                            <span className="text-xs text-gray-600">ID: {targetUser.studentId}</span>
                          )}
                          
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-600">
                              {targetUser.onlineStatus === 'online' ? 'Online now' : formatLastSeen(targetUser.lastSeenInChat)}
                            </span>
                          </div>
                        </div>

                        {targetUser.bio && (
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {targetUser.bio}
                          </p>
                        )}

                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-500">
                            Joined {formatJoinDate(targetUser.joinDate)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleStartConversation(targetUser)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <ChatBubbleLeftRightIcon className="h-4 w-4" />
                      <span>Start Chat</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Showing {filteredUsers.length} of {users.length} users</span>
            <span>Click "Connect" to start chatting with someone new!</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDirectory;
