import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchBooks } from '../store/slices/booksSlice';
import { fetchVideos } from '../store/slices/videosSlice';
import { Link } from 'react-router-dom';
import {
  BookOpenIcon,
  PlayIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  StarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { books, isLoading: booksLoading } = useSelector((state) => state.books);
  const { videos, isLoading: videosLoading } = useSelector((state) => state.videos);

  useEffect(() => {
    dispatch(fetchBooks({ limit: 6 }));
    dispatch(fetchVideos({ limit: 6 }));
  }, [dispatch]);

  const stats = [
    {
      name: 'Total Books',
      value: books.length,
      icon: BookOpenIcon,
      color: 'bg-blue-500',
      link: '/books',
    },
    {
      name: 'Total Videos',
      value: videos.length,
      icon: PlayIcon,
      color: 'bg-green-500',
      link: '/videos',
    },
    {
      name: 'Chat Rooms',
      value: '12',
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-purple-500',
      link: '/chat',
    },
    {
      name: 'Active Users',
      value: '1,234',
      icon: UserGroupIcon,
      color: 'bg-orange-500',
      link: '/community',
    },
  ];

  const recentBooks = books.slice(0, 3);
  const recentVideos = videos.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's what's happening in your student library today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            to={stat.link}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`${stat.color} p-3 rounded-md`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Books */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Recent Books</h2>
            <Link
              to="/books"
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              View all
            </Link>
          </div>
          <div className="p-6">
            {booksLoading ? (
              <div className="flex justify-center">
                <LoadingSpinner size="medium" />
              </div>
            ) : recentBooks.length > 0 ? (
              <div className="space-y-4">
                {recentBooks.map((book) => (
                  <div key={book._id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <img
                        className="h-16 w-12 object-cover rounded"
                        src={book.coverImage || '/api/placeholder/48/64'}
                        alt={book.title}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/books/${book._id}`}
                        className="text-sm font-medium text-gray-900 hover:text-primary-600 truncate block"
                      >
                        {book.title}
                      </Link>
                      <p className="text-sm text-gray-500 truncate">
                        by {book.author}
                      </p>
                      <div className="flex items-center mt-1">
                        <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-500 ml-1">
                          {book.averageRating ? book.averageRating.toFixed(1) : 'No ratings'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No books available</p>
            )}
          </div>
        </div>

        {/* Recent Videos */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Recent Videos</h2>
            <Link
              to="/videos"
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              View all
            </Link>
          </div>
          <div className="p-6">
            {videosLoading ? (
              <div className="flex justify-center">
                <LoadingSpinner size="medium" />
              </div>
            ) : recentVideos.length > 0 ? (
              <div className="space-y-4">
                {recentVideos.map((video) => (
                  <div key={video._id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0 relative">
                      <img
                        className="h-16 w-20 object-cover rounded"
                        src={video.thumbnail || '/api/placeholder/80/64'}
                        alt={video.title}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <PlayIcon className="h-6 w-6 text-white bg-black bg-opacity-50 rounded-full p-1" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/videos/${video._id}`}
                        className="text-sm font-medium text-gray-900 hover:text-primary-600 truncate block"
                      >
                        {video.title}
                      </Link>
                      <p className="text-sm text-gray-500 truncate">
                        {video.category}
                      </p>
                      <div className="flex items-center mt-1">
                        <ClockIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500 ml-1">
                          {video.duration || 'Unknown duration'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No videos available</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/books"
              className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
            >
              <BookOpenIcon className="h-8 w-8 text-blue-600" />
              <span className="ml-3 text-sm font-medium text-blue-900">
                Browse Books
              </span>
            </Link>
            <Link
              to="/videos"
              className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200"
            >
              <PlayIcon className="h-8 w-8 text-green-600" />
              <span className="ml-3 text-sm font-medium text-green-900">
                Watch Videos
              </span>
            </Link>
            <Link
              to="/chat"
              className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors duration-200"
            >
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-purple-600" />
              <span className="ml-3 text-sm font-medium text-purple-900">
                Join Chat
              </span>
            </Link>
            <Link
              to="/profile"
              className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors duration-200"
            >
              <UserGroupIcon className="h-8 w-8 text-orange-600" />
              <span className="ml-3 text-sm font-medium text-orange-900">
                My Profile
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
