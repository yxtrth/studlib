const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Book = require('../models/Book');
const Video = require('../models/Video');
const { protect } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');
const { uploadImageToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

const router = express.Router();

// @desc    Get all users (for chat/admin)
// @route   GET /api/users
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const query = { isActive: true };

    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Exclude current user from results
    query._id = { $ne: req.user._id };

    const users = await User.find(query)
      .select('name email avatar bio lastSeen joinDate')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ lastSeen: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name email avatar bio lastSeen joinDate role')
      .populate('favoriteBooks', 'title author coverImage')
      .populate('favoriteVideos', 'title instructor thumbnail');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(404).json({ message: 'User account is deactivated' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', [
  protect,
  uploadAvatar,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters')
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

    const { name, bio } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update basic info
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;

    // Handle avatar upload
    if (req.file) {
      try {
        // Delete old avatar if it exists and it's not the default
        if (user.avatar.public_id) {
          await deleteFromCloudinary(user.avatar.public_id);
        }

        // Upload new avatar
        const uploadResult = await uploadImageToCloudinary(req.file, 'student-library/avatars');
        user.avatar = {
          public_id: uploadResult.public_id,
          url: uploadResult.url
        };
      } catch (uploadError) {
        console.error('Avatar upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload avatar' });
      }
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
        lastSeen: user.lastSeen,
        joinDate: user.joinDate
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Add book to favorites
// @route   POST /api/users/favorites/books/:bookId
// @access  Private
router.post('/favorites/books/:bookId', protect, async (req, res) => {
  try {
    const { bookId } = req.params;
    const user = await User.findById(req.user._id);
    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if already in favorites
    const isAlreadyFavorite = user.favoriteBooks.includes(bookId);
    
    if (isAlreadyFavorite) {
      // Remove from favorites
      user.favoriteBooks = user.favoriteBooks.filter(id => id.toString() !== bookId);
      await user.save();
      
      res.json({
        success: true,
        message: 'Book removed from favorites',
        isFavorite: false
      });
    } else {
      // Add to favorites
      user.favoriteBooks.push(bookId);
      await user.save();
      
      res.json({
        success: true,
        message: 'Book added to favorites',
        isFavorite: true
      });
    }
  } catch (error) {
    console.error('Toggle book favorite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Add video to favorites
// @route   POST /api/users/favorites/videos/:videoId
// @access  Private
router.post('/favorites/videos/:videoId', protect, async (req, res) => {
  try {
    const { videoId } = req.params;
    const user = await User.findById(req.user._id);
    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Check if already in favorites
    const isAlreadyFavorite = user.favoriteVideos.includes(videoId);
    
    if (isAlreadyFavorite) {
      // Remove from favorites
      user.favoriteVideos = user.favoriteVideos.filter(id => id.toString() !== videoId);
      await user.save();
      
      res.json({
        success: true,
        message: 'Video removed from favorites',
        isFavorite: false
      });
    } else {
      // Add to favorites
      user.favoriteVideos.push(videoId);
      await user.save();
      
      res.json({
        success: true,
        message: 'Video added to favorites',
        isFavorite: true
      });
    }
  } catch (error) {
    console.error('Toggle video favorite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get user's favorite books
// @route   GET /api/users/favorites/books
// @access  Private
router.get('/favorites/books', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'favoriteBooks',
        match: { isActive: true },
        select: 'title author category coverImage rating views createdAt',
        populate: {
          path: 'addedBy',
          select: 'name'
        }
      });

    res.json({
      success: true,
      favoriteBooks: user.favoriteBooks
    });
  } catch (error) {
    console.error('Get favorite books error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get user's favorite videos
// @route   GET /api/users/favorites/videos
// @access  Private
router.get('/favorites/videos', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'favoriteVideos',
        match: { isActive: true },
        select: 'title instructor category thumbnail rating views duration createdAt',
        populate: {
          path: 'addedBy',
          select: 'name'
        }
      });

    res.json({
      success: true,
      favoriteVideos: user.favoriteVideos
    });
  } catch (error) {
    console.error('Get favorite videos error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Deactivate user account
// @route   DELETE /api/users/account
// @access  Private
router.delete('/account', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Soft delete - deactivate account
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
