import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchBooks, searchBooks } from '../../store/slices/booksSlice';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  HeartIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const BooksList = () => {
  const dispatch = useDispatch();
  const { books, isLoading, totalPages, currentPage } = useSelector((state) => state.books);
  const { user } = useSelector((state) => state.auth);

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
      dispatch(searchBooks(filters));
    } else {
      dispatch(fetchBooks(filters));
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
    dispatch(searchBooks(filters));
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
      dispatch(searchBooks(filters));
    } else {
      dispatch(fetchBooks(filters));
    }
  };

  const isBookFavorited = (bookId) => {
    return user?.favorites?.books?.includes(bookId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Books Library</h1>
        <p className="mt-2 text-gray-600">
          Discover and explore our collection of educational books
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
                placeholder="Search books by title, author, or ISBN..."
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
                <option value="author">Author A-Z</option>
                <option value="-averageRating">Highest Rated</option>
                <option value="-views">Most Viewed</option>
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

      {/* Books Grid */}
      {isLoading && books.length === 0 ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="large" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {books.map((book) => (
              <div
                key={book._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                <div className="relative">
                  <Link to={`/books/${book._id}`}>
                    <img
                      src={book.coverImage || '/api/placeholder/300/400'}
                      alt={book.title}
                      className="w-full h-64 object-cover"
                    />
                  </Link>
                  <button
                    className={`absolute top-2 right-2 p-2 rounded-full ${
                      isBookFavorited(book._id)
                        ? 'bg-red-500 text-white'
                        : 'bg-white text-gray-400 hover:text-red-500'
                    } shadow-sm transition-colors duration-200`}
                  >
                    {isBookFavorited(book._id) ? (
                      <HeartSolidIcon className="h-5 w-5" />
                    ) : (
                      <HeartIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>

                <div className="p-4">
                  <Link
                    to={`/books/${book._id}`}
                    className="block text-lg font-semibold text-gray-900 hover:text-primary-600 mb-2 line-clamp-2"
                  >
                    {book.title}
                  </Link>
                  
                  <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                      {book.category}
                    </span>
                    <div className="flex items-center">
                      <EyeIcon className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-500">{book.views || 0}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">
                        {book.averageRating ? book.averageRating.toFixed(1) : 'No ratings'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {book.ratings?.length || 0} reviews
                    </span>
                  </div>

                  {book.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {book.description}
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
                  'Load More Books'
                )}
              </button>
            </div>
          )}

          {books.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <MagnifyingGlassIcon className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
              <p className="text-gray-600">
                Try adjusting your search criteria or browse all books.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BooksList;
