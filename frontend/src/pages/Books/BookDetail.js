import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchBookById, rateBook, addBookToFavorites, removeBookFromFavorites } from '../../store/slices/booksSlice';
import {
  StarIcon,
  HeartIcon,
  EyeIcon,
  CalendarIcon,
  TagIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentBook, isLoading } = useSelector((state) => state.books);
  const { user } = useSelector((state) => state.auth);
  
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchBookById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentBook && user) {
      const existingRating = currentBook.ratings?.find(r => r.user === user._id);
      if (existingRating) {
        setUserRating(existingRating.rating);
      }
    }
  }, [currentBook, user]);

  const handleRating = async (rating) => {
    if (!user) {
      toast.error('Please login to rate books');
      return;
    }

    try {
      await dispatch(rateBook({ bookId: id, rating })).unwrap();
      setUserRating(rating);
      toast.success('Rating submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit rating');
    }
  };

  const handleFavorite = async () => {
    if (!user) {
      toast.error('Please login to add favorites');
      return;
    }

    try {
      if (isBookFavorited()) {
        await dispatch(removeBookFromFavorites(id)).unwrap();
        toast.success('Removed from favorites');
      } else {
        await dispatch(addBookToFavorites(id)).unwrap();
        toast.success('Added to favorites');
      }
    } catch (error) {
      toast.error('Failed to update favorites');
    }
  };

  const isBookFavorited = () => {
    return user?.favorites?.books?.includes(id);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentBook.title,
        text: `Check out this book: ${currentBook.title} by ${currentBook.author}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!currentBook) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Book not found</h2>
          <Link
            to="/books"
            className="text-primary-600 hover:text-primary-500"
          >
            Back to Books
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Book Cover and Actions */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <img
              src={currentBook.coverImage || '/api/placeholder/400/600'}
              alt={currentBook.title}
              className="w-full max-w-sm mx-auto rounded-lg shadow-lg"
            />

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              {currentBook.fileUrl && (
                <a
                  href={currentBook.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-primary-600 text-white py-3 px-4 rounded-md font-medium hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center"
                >
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  Read Book
                </a>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={handleFavorite}
                  className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors duration-200 flex items-center justify-center ${
                    isBookFavorited()
                      ? 'bg-red-50 text-red-600 border border-red-200'
                      : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {isBookFavorited() ? (
                    <HeartSolidIcon className="h-5 w-5 mr-2" />
                  ) : (
                    <HeartIcon className="h-5 w-5 mr-2" />
                  )}
                  {isBookFavorited() ? 'Favorited' : 'Add to Favorites'}
                </button>

                <button
                  onClick={handleShare}
                  className="px-4 py-2 bg-gray-50 text-gray-600 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors duration-200"
                >
                  <ShareIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Rating Section */}
            {user && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Rate this book</h3>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="text-2xl focus:outline-none"
                    >
                      {star <= (hoverRating || userRating) ? (
                        <StarSolidIcon className="h-6 w-6 text-yellow-400" />
                      ) : (
                        <StarIcon className="h-6 w-6 text-gray-300" />
                      )}
                    </button>
                  ))}
                </div>
                {userRating > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    You rated this book {userRating} star{userRating !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Book Details */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {/* Title and Author */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {currentBook.title}
              </h1>
              <p className="text-xl text-gray-600">by {currentBook.author}</p>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center">
                <StarIcon className="h-5 w-5 text-yellow-400 mr-2" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {currentBook.averageRating ? currentBook.averageRating.toFixed(1) : 'No ratings'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {currentBook.ratings?.length || 0} reviews
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <EyeIcon className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {currentBook.views || 0}
                  </div>
                  <div className="text-xs text-gray-500">views</div>
                </div>
              </div>

              <div className="flex items-center">
                <TagIcon className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {currentBook.category}
                  </div>
                  <div className="text-xs text-gray-500">category</div>
                </div>
              </div>

              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {new Date(currentBook.createdAt).getFullYear()}
                  </div>
                  <div className="text-xs text-gray-500">published</div>
                </div>
              </div>
            </div>

            {/* ISBN */}
            {currentBook.isbn && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">ISBN</h3>
                <p className="text-gray-600 font-mono">{currentBook.isbn}</p>
              </div>
            )}

            {/* Description */}
            {currentBook.description && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 leading-relaxed">
                    {showFullDescription
                      ? currentBook.description
                      : `${currentBook.description.slice(0, 300)}${currentBook.description.length > 300 ? '...' : ''}`}
                  </p>
                  {currentBook.description.length > 300 && (
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="text-primary-600 hover:text-primary-500 font-medium mt-2"
                    >
                      {showFullDescription ? 'Show Less' : 'Read More'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Tags */}
            {currentBook.tags && currentBook.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {currentBook.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block px-3 py-1 text-sm font-medium bg-primary-100 text-primary-800 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Reviews */}
            {currentBook.ratings && currentBook.ratings.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Reviews</h3>
                <div className="space-y-4">
                  {currentBook.ratings.slice(0, 3).map((rating, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-center mb-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <StarSolidIcon
                              key={star}
                              className={`h-4 w-4 ${
                                star <= rating.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">
                          {rating.user?.name || 'Anonymous'}
                        </span>
                      </div>
                      {rating.review && (
                        <p className="text-gray-600 text-sm">{rating.review}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
