import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchVideoById, rateVideo } from '../../store/slices/videosSlice';
import {
  StarIcon,
  EyeIcon,
  CalendarIcon,
  TagIcon,
  ArrowLeftIcon,
  ShareIcon,
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const VideoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const videoRef = useRef(null);
  
  const { currentVideo, isLoading } = useSelector((state) => state.videos);
  const { user } = useSelector((state) => state.auth);
  
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (id) {
      dispatch(fetchVideoById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentVideo && user) {
      const existingRating = currentVideo.ratings?.find(r => r.user === user._id);
      if (existingRating) {
        setUserRating(existingRating.rating);
      }
    }
  }, [currentVideo, user]);

  const handleRating = async (rating) => {
    if (!user) {
      toast.error('Please login to rate videos');
      return;
    }

    try {
      await dispatch(rateVideo({ videoId: id, rating })).unwrap();
      setUserRating(rating);
      toast.success('Rating submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit rating');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentVideo.title,
        text: `Check out this video: ${currentVideo.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  // Convert YouTube URL to embed format if needed
  const getEmbedUrl = (url) => {
    if (!url) return '';
    
    // If already an embed URL, return as is
    if (url.includes('/embed/')) {
      return url;
    }
    
    // Convert watch URL to embed URL
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    // Convert youtu.be URL to embed URL
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    // Return original URL if not a YouTube URL
    return url;
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setCurrentTime(current);
      setProgress((current / total) * 100);
    }
  };

  const handleSeek = (e) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * duration;
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!currentVideo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Video not found</h2>
          <Link
            to="/videos"
            className="text-primary-600 hover:text-primary-500"
          >
            Back to Videos
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
        {/* Video Player */}
        <div className="lg:col-span-2">
          <div className="bg-black rounded-lg overflow-hidden shadow-lg">
            <div className="relative">
              {/* YouTube Embed */}
              <div className="relative w-full" style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={getEmbedUrl(currentVideo.url)}
                  title={currentVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>

          {/* Video Info */}
          <div className="mt-6 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {currentVideo.title}
              </h1>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="flex items-center">
                  <StarIcon className="h-5 w-5 text-yellow-400 mr-2" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {currentVideo.averageRating ? currentVideo.averageRating.toFixed(1) : 'No ratings'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {currentVideo.ratings?.length || 0} reviews
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <EyeIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {currentVideo.views || 0}
                    </div>
                    <div className="text-xs text-gray-500">views</div>
                  </div>
                </div>

                <div className="flex items-center">
                  <TagIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {currentVideo.category}
                    </div>
                    <div className="text-xs text-gray-500">category</div>
                  </div>
                </div>

                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(currentVideo.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">published</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructor */}
            {currentVideo.instructor && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Instructor</h3>
                <p className="text-gray-600">{currentVideo.instructor}</p>
              </div>
            )}

            {/* Description */}
            {currentVideo.description && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 leading-relaxed">
                    {showFullDescription
                      ? currentVideo.description
                      : `${currentVideo.description.slice(0, 300)}${currentVideo.description.length > 300 ? '...' : ''}`}
                  </p>
                  {currentVideo.description.length > 300 && (
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
            {currentVideo.tags && currentVideo.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {currentVideo.tags.map((tag, index) => (
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
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            {/* Rating Section */}
            {user && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Rate this video</h3>
                <div className="flex space-x-1 mb-3">
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
                  <p className="text-sm text-gray-600">
                    You rated this video {userRating} star{userRating !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            )}

            {/* Video Details */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Video Details</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Duration:</span>
                  <span className="text-sm text-gray-900 ml-2">
                    {formatTime(duration)}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Category:</span>
                  <span className="text-sm text-gray-900 ml-2">{currentVideo.category}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Views:</span>
                  <span className="text-sm text-gray-900 ml-2">{currentVideo.views || 0}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Published:</span>
                  <span className="text-sm text-gray-900 ml-2">
                    {new Date(currentVideo.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Reviews */}
            {currentVideo.ratings && currentVideo.ratings.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Reviews</h3>
                <div className="space-y-4">
                  {currentVideo.ratings.slice(0, 3).map((rating, index) => (
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

export default VideoDetail;
