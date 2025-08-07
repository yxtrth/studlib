import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile, uploadAvatar } from '../store/slices/authSlice';
import { fetchBooks } from '../store/slices/booksSlice';
import { fetchVideos } from '../store/slices/videosSlice';
import {
  UserIcon,
  CameraIcon,
  PencilIcon,
  BookOpenIcon,
  PlayIcon,
  HeartIcon,
  AcademicCapIcon,
  MapPinIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  const { books } = useSelector((state) => state.books);
  const { videos } = useSelector((state) => state.videos);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    studentId: '',
    department: '',
    year: '',
    location: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        studentId: user.studentId || '',
        department: user.department || '',
        year: user.year || '',
        location: user.location || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (user?.favorites?.books?.length > 0) {
      dispatch(fetchBooks({ ids: user.favorites.books }));
    }
    if (user?.favorites?.videos?.length > 0) {
      dispatch(fetchVideos({ ids: user.favorites.videos }));
    }
  }, [dispatch, user?.favorites]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Avatar image must be less than 5MB');
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      if (avatarFile) {
        const avatarFormData = new FormData();
        avatarFormData.append('avatar', avatarFile);
        await dispatch(uploadAvatar(avatarFormData)).unwrap();
        setAvatarFile(null);
        setAvatarPreview(null);
      }

      await dispatch(updateProfile(formData)).unwrap();
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setAvatarFile(null);
    setAvatarPreview(null);
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        studentId: user.studentId || '',
        department: user.department || '',
        year: user.year || '',
        location: user.location || '',
      });
    }
  };

  const favoriteBooks = books.filter(book => user?.favorites?.books?.includes(book._id)) || [];
  const favoriteVideos = videos.filter(video => user?.favorites?.videos?.includes(video._id)) || [];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: UserIcon },
    { id: 'favorites', name: 'Favorites', icon: HeartIcon },
    { id: 'activity', name: 'Activity', icon: CalendarIcon },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="h-32 bg-gradient-to-r from-primary-500 to-primary-600"></div>
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-16 mb-4">
            <div className="relative">
              <img
                src={avatarPreview || user.avatar || '/api/placeholder/128/128'}
                alt={user.name}
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
              />
              {isEditing && (
                <label className="absolute bottom-2 right-2 bg-primary-600 text-white rounded-full p-2 cursor-pointer hover:bg-primary-700">
                  <CameraIcon className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            
            <div className="sm:ml-6 mt-4 sm:mt-0 flex-1">
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="text-2xl font-bold text-gray-900 border-b-2 border-primary-500 bg-transparent focus:outline-none"
                />
              ) : (
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              )}
              
              <div className="flex flex-wrap items-center mt-2 text-sm text-gray-600 space-x-4">
                {user.studentId && (
                  <div className="flex items-center">
                    <AcademicCapIcon className="h-4 w-4 mr-1" />
                    {user.studentId}
                  </div>
                )}
                {user.department && (
                  <div className="flex items-center">
                    <BookOpenIcon className="h-4 w-4 mr-1" />
                    {user.department}
                  </div>
                )}
                {user.location && (
                  <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {user.location}
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-4 sm:mt-0">
              {isEditing ? (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {isLoading ? <LoadingSpinner size="small" /> : 'Save'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-gray-600">
                    {user.bio || 'No bio available'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student ID
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-gray-600">{user.studentId || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                {isEditing ? (
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select Department</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Business Administration">Business Administration</option>
                    <option value="Arts">Arts</option>
                    <option value="Science">Science</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="text-gray-600">{user.department || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Academic Year
                </label>
                {isEditing ? (
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select Year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Graduate">Graduate</option>
                    <option value="PhD">PhD</option>
                  </select>
                ) : (
                  <p className="text-gray-600">{user.year || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="City, Country"
                  />
                ) : (
                  <p className="text-gray-600">{user.location || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <BookOpenIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-900">
                  {user.favorites?.books?.length || 0}
                </div>
                <div className="text-sm text-blue-600">Favorite Books</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <PlayIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-900">
                  {user.favorites?.videos?.length || 0}
                </div>
                <div className="text-sm text-green-600">Favorite Videos</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <CalendarIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-900">
                  {new Date(user.createdAt).toLocaleDateString()}
                </div>
                <div className="text-sm text-purple-600">Member Since</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <UserIcon className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-900">
                  {user.role || 'Student'}
                </div>
                <div className="text-sm text-orange-600">Role</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'favorites' && (
        <div className="space-y-8">
          {/* Favorite Books */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Favorite Books</h2>
            
            {favoriteBooks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoriteBooks.map((book) => (
                  <div key={book._id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                    <img
                      src={book.coverImage || '/api/placeholder/60/80'}
                      alt={book.title}
                      className="w-12 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{book.title}</h3>
                      <p className="text-sm text-gray-500 truncate">{book.author}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No favorite books yet</p>
            )}
          </div>

          {/* Favorite Videos */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Favorite Videos</h2>
            
            {favoriteVideos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoriteVideos.map((video) => (
                  <div key={video._id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                    <div className="relative">
                      <img
                        src={video.thumbnail || '/api/placeholder/80/45'}
                        alt={video.title}
                        className="w-16 h-9 object-cover rounded"
                      />
                      <PlayIcon className="absolute inset-0 w-4 h-4 text-white m-auto" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{video.title}</h3>
                      <p className="text-sm text-gray-500 truncate">{video.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No favorite videos yet</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="text-center py-8">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Activity tracking coming soon!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
