import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchVideos, searchVideos } from '../../store/slices/videosSlice';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlayIcon,
  ClockIcon,
  EyeIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const VideosList = () => {
  const dispatch = useDispatch();
  const { videos, isLoading, totalPages, currentPage } = useSelector((state) => state.videos);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    'Science',
    'Technology',
    'Mathematics',
    'Literature',
    'History',
    'Art',
    'Business',
    'Psychology',
    'Philosophy',
    'Medicine',
    'Engineering',
    'Tutorial',
    'Lecture',
    'Documentary',
    'Other',
  ];

  useEffect(() => {
    const filters = {
      page: 1,
      limit: 12,
      sortBy,
      ...(selectedCategory && { category: selectedCategory }),
      ...(searchTerm && { search: searchTerm }),
    };

    if (searchTerm) {
      dispatch(searchVideos(filters));
    } else {
      dispatch(fetchVideos(filters));
    }
  }, [dispatch, searchTerm, selectedCategory, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const filters = {
      page: 1,
      limit: 12,
      sortBy,
      search: searchTerm,
      ...(selectedCategory && { category: selectedCategory }),
    };
    dispatch(searchVideos(filters));
  };

  const handleLoadMore = () => {
    const filters = {
      page: currentPage + 1,
      limit: 12,
      sortBy,
      ...(selectedCategory && { category: selectedCategory }),
      ...(searchTerm && { search: searchTerm }),
    };

    if (searchTerm) {
      dispatch(searchVideos(filters));
    } else {
      dispatch(fetchVideos(filters));
    }
  };

  const formatDuration = (duration) => {
    if (!duration) return 'Unknown';
    
    // If duration is in seconds
    if (typeof duration === 'number') {
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    return duration;
  };

  const formatViews = (views) => {
    if (!views) return '0';
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Video Library</h1>
        <p className="mt-2 text-gray-600">
          Watch educational videos and tutorials from our collection
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search videos by title, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 lg:hidden"
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            Filters
          </button>

          <button
            type="submit"
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            Search
          </button>
        </form>

        {/* Filters */}
        <div className={`mt-4 pt-4 border-t border-gray-200 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort by
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="createdAt">Newest First</option>
                <option value="-createdAt">Oldest First</option>
                <option value="title">Title A-Z</option>
                <option value="-title">Title Z-A</option>
                <option value="-averageRating">Highest Rated</option>
                <option value="-views">Most Viewed</option>
                <option value="duration">Shortest First</option>
                <option value="-duration">Longest First</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setSortBy('createdAt');
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      {isLoading && videos.length === 0 ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="large" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {videos.map((video) => (
              <div
                key={video._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                <div className="relative">
                  <Link to={`/videos/${video._id}`}>
                    <img
                      src={video.thumbnail || '/api/placeholder/400/225'}
                      alt={video.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                      <PlayIcon className="h-12 w-12 text-white opacity-0 hover:opacity-100 transition-opacity duration-200" />
                    </div>
                  </Link>
                  
                  {/* Duration Badge */}
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {formatDuration(video.duration)}
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <Link
                    to={`/videos/${video._id}`}
                    className="block text-lg font-semibold text-gray-900 hover:text-primary-600 mb-2 line-clamp-2"
                  >
                    {video.title}
                  </Link>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                      {video.category}
                    </span>
                    <div className="flex items-center">
                      <EyeIcon className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-500">{formatViews(video.views)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">
                        {video.averageRating ? video.averageRating.toFixed(1) : 'No ratings'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500">
                        {new Date(video.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {video.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {video.description}
                    </p>
                  )}

                  {/* Instructor */}
                  {video.instructor && (
                    <p className="text-xs text-gray-500 mt-2">
                      Instructor: {video.instructor}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          {currentPage < totalPages && (
            <div className="flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <LoadingSpinner size="small" />
                ) : (
                  'Load More Videos'
                )}
              </button>
            </div>
          )}

          {videos.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <PlayIcon className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No videos found</h3>
              <p className="text-gray-600">
                Try adjusting your search criteria or browse all videos.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VideosList;
