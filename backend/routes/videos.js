const express = require('express');
const { body, validationResult } = require('express-validator');
const Video = require('../models/Video');
const { protect, admin } = require('../middleware/auth');
const { uploadThumbnail, uploadVideo } = require('../middleware/upload');
const { uploadImageToCloudinary, uploadVideoToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

const router = express.Router();

// @desc    Get all videos
// @route   GET /api/videos
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      search, 
      sort = 'createdAt',
      order = 'desc',
      level
    } = req.query;

    // Build query
    const query = { isActive: true };

    // Add category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Add level filter
    if (level && level !== 'all') {
      query.level = level;
    }

    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { instructor: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    const sortOrder = order === 'desc' ? -1 : 1;
    let sortObj = {};
    
    switch (sort) {
      case 'title':
        sortObj = { title: sortOrder };
        break;
      case 'instructor':
        sortObj = { instructor: sortOrder };
        break;
      case 'rating':
        sortObj = { 'rating.average': sortOrder };
        break;
      case 'views':
        sortObj = { views: sortOrder };
        break;
      case 'duration':
        sortObj = { duration: sortOrder };
        break;
      case 'likes':
        sortObj = { 'likes.length': sortOrder };
        break;
      default:
        sortObj = { createdAt: sortOrder };
    }

    const videos = await Video.find(query)
      .populate('addedBy', 'name')
      .select('-reviews') // Exclude reviews for performance
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sortObj);

    const total = await Video.countDocuments(query);

    // Get categories and levels for filters
    const categories = await Video.distinct('category', { isActive: true });
    const levels = await Video.distinct('level', { isActive: true });

    res.json({
      success: true,
      videos,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      categories,
      levels
    });
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get single video
// @route   GET /api/videos/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('addedBy', 'name avatar')
      .populate('reviews.user', 'name avatar')
      .populate('likes.user', 'name');

    if (!video || !video.isActive) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Increment view count
    await video.incrementViews();

    res.json({
      success: true,
      video: {
        ...video.toObject(),
        likeCount: video.likes.length
      }
    });
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create new video
// @route   POST /api/videos
// @access  Private (Admin or User)
router.post('/', [
  protect,
  uploadThumbnail,
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title is required and must be less than 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('category')
    .notEmpty()
    .withMessage('Category is required'),
  body('url')
    .optional()
    .isURL()
    .withMessage('Please provide a valid URL')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      title,
      description,
      category,
      url,
      instructor,
      level,
      duration,
      tags
    } = req.body;

    // Check if video with same title already exists
    const existingVideo = await Video.findOne({ 
      title: { $regex: new RegExp(`^${title}$`, 'i') }
    });

    if (existingVideo) {
      return res.status(400).json({ message: 'Video with this title already exists' });
    }

    // Prepare video data
    const videoData = {
      title,
      description,
      category,
      addedBy: req.user._id,
      instructor: instructor || '',
      level: level || 'Beginner',
      duration: duration || 0,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      isExternal: !!url
    };

    // Handle external URL
    if (url) {
      videoData.url = url;
    }

    // Handle thumbnail upload
    if (req.file) {
      try {
        const uploadResult = await uploadImageToCloudinary(req.file, 'student-library/videos/thumbnails');
        videoData.thumbnail = {
          public_id: uploadResult.public_id,
          url: uploadResult.url
        };
      } catch (uploadError) {
        console.error('Thumbnail upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload thumbnail' });
      }
    }

    const video = await Video.create(videoData);
    await video.populate('addedBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Video created successfully',
      video
    });
  } catch (error) {
    console.error('Create video error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update video
// @route   PUT /api/videos/:id
// @access  Private (Admin or Owner)
router.put('/:id', [
  protect,
  uploadThumbnail,
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be less than 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('url')
    .optional()
    .isURL()
    .withMessage('Please provide a valid URL')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Check if user is admin or owner
    if (req.user.role !== 'admin' && video.addedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this video' });
    }

    const {
      title,
      description,
      category,
      url,
      instructor,
      level,
      duration,
      tags
    } = req.body;

    // Update fields
    if (title) video.title = title;
    if (description) video.description = description;
    if (category) video.category = category;
    if (url) {
      video.url = url;
      video.isExternal = true;
    }
    if (instructor) video.instructor = instructor;
    if (level) video.level = level;
    if (duration) video.duration = duration;
    if (tags) video.tags = tags.split(',').map(tag => tag.trim());

    // Handle thumbnail upload
    if (req.file) {
      try {
        // Delete old thumbnail if it exists
        if (video.thumbnail.public_id) {
          await deleteFromCloudinary(video.thumbnail.public_id);
        }

        // Upload new thumbnail
        const uploadResult = await uploadImageToCloudinary(req.file, 'student-library/videos/thumbnails');
        video.thumbnail = {
          public_id: uploadResult.public_id,
          url: uploadResult.url
        };
      } catch (uploadError) {
        console.error('Thumbnail upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload thumbnail' });
      }
    }

    await video.save();
    await video.populate('addedBy', 'name');

    res.json({
      success: true,
      message: 'Video updated successfully',
      video
    });
  } catch (error) {
    console.error('Update video error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete video
// @route   DELETE /api/videos/:id
// @access  Private (Admin or Owner)
router.delete('/:id', protect, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Check if user is admin or owner
    if (req.user.role !== 'admin' && video.addedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this video' });
    }

    // Soft delete
    video.isActive = false;
    await video.save();

    res.json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Add review to video
// @route   POST /api/videos/:id/review
// @access  Private
router.post('/:id/review', [
  protect,
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { rating, comment } = req.body;
    const video = await Video.findById(req.params.id);

    if (!video || !video.isActive) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Check if user already reviewed this video
    const existingReview = video.reviews.find(
      review => review.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this video' });
    }

    // Add review
    video.reviews.push({
      user: req.user._id,
      rating,
      comment: comment || ''
    });

    // Calculate new average rating
    await video.calculateAverageRating();
    await video.populate('reviews.user', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      video
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Toggle like on video
// @route   POST /api/videos/:id/like
// @access  Private
router.post('/:id/like', protect, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video || !video.isActive) {
      return res.status(404).json({ message: 'Video not found' });
    }

    await video.toggleLike(req.user._id);

    const isLiked = video.likes.some(like => like.user.toString() === req.user._id.toString());

    res.json({
      success: true,
      message: isLiked ? 'Video liked' : 'Video unliked',
      isLiked,
      likeCount: video.likes.length
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Upload video file
// @route   POST /api/videos/:id/upload-video
// @access  Private (Admin or Owner)
router.post('/:id/upload-video', [
  protect,
  uploadVideo
], async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Check if user is admin or owner
    if (req.user.role !== 'admin' && video.addedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to upload video file for this video' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please select a video file' });
    }

    try {
      // Delete old video if it exists
      if (video.videoFile.public_id) {
        await deleteFromCloudinary(video.videoFile.public_id);
      }

      // Upload new video
      const uploadResult = await uploadVideoToCloudinary(req.file, 'student-library/videos/files');
      video.videoFile = {
        public_id: uploadResult.public_id,
        url: uploadResult.url
      };

      // Update duration if available
      if (uploadResult.duration) {
        video.duration = uploadResult.duration;
      }

      // Mark as not external since we're hosting it
      video.isExternal = false;
      video.url = uploadResult.url;

      await video.save();

      res.json({
        success: true,
        message: 'Video uploaded successfully',
        videoFile: video.videoFile
      });
    } catch (uploadError) {
      console.error('Video upload error:', uploadError);
      return res.status(500).json({ message: 'Failed to upload video file' });
    }
  } catch (error) {
    console.error('Upload video error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
