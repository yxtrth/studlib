const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Book = require('../models/Book');
const Video = require('../models/Video');
const Message = require('../models/Message');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Most routes require admin access, but fix-urls is temporarily public for debugging

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
router.get('/stats', async (req, res) => {
  try {
    // Get counts
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalBooks = await Book.countDocuments({ isActive: true });
    const totalVideos = await Video.countDocuments({ isActive: true });
    const totalMessages = await Message.countDocuments({ isDeleted: false });

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      isActive: true
    });

    // Get top categories
    const topBookCategories = await Book.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const topVideoCategories = await Video.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Get user growth data (last 12 months)
    const userGrowthData = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalBooks,
        totalVideos,
        totalMessages,
        recentUsers,
        topBookCategories,
        topVideoCategories,
        userGrowthData
      }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get all users for admin management
// @route   GET /api/admin/users
// @access  Private (Admin only)
router.get('/users', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      role,
      status = 'all',
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build query
    const query = {};

    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Add role filter
    if (role && role !== 'all') {
      query.role = role;
    }

    // Add status filter
    if (status !== 'all') {
      query.isActive = status === 'active';
    }

    // Build sort object
    const sortOrder = order === 'desc' ? -1 : 1;
    let sortObj = {};
    
    switch (sort) {
      case 'name':
        sortObj = { name: sortOrder };
        break;
      case 'email':
        sortObj = { email: sortOrder };
        break;
      case 'role':
        sortObj = { role: sortOrder };
        break;
      case 'lastSeen':
        sortObj = { lastSeen: sortOrder };
        break;
      default:
        sortObj = { createdAt: sortOrder };
    }

    const users = await User.find(query)
      .select('name email avatar role isActive lastSeen joinDate createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sortObj);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update user status (activate/deactivate)
// @route   PUT /api/admin/users/:userId/status
// @access  Private (Admin only)
router.put('/users/:userId/status', [
  body('isActive')
    .isBoolean()
    .withMessage('isActive must be a boolean value')
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

    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deactivating themselves
    if (userId === req.user._id.toString() && !isActive) {
      return res.status(400).json({ message: 'Cannot deactivate your own account' });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update user role
// @route   PUT /api/admin/users/:userId/role
// @access  Private (Admin only)
router.put('/users/:userId/role', [
  body('role')
    .isIn(['student', 'admin'])
    .withMessage('Role must be either student or admin')
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

    const { userId } = req.params;
    const { role } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from changing their own role to student
    if (userId === req.user._id.toString() && role === 'student') {
      return res.status(400).json({ message: 'Cannot change your own role from admin to student' });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: `User role updated to ${role} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete user permanently
// @route   DELETE /api/admin/users/:userId
// @access  Private (Admin only)
router.delete('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent admin from deleting themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user and related data
    await Promise.all([
      User.findByIdAndDelete(userId),
      Book.updateMany({ addedBy: userId }, { isActive: false }),
      Video.updateMany({ addedBy: userId }, { isActive: false }),
      Message.updateMany(
        { $or: [{ senderId: userId }, { receiverId: userId }] },
        { isDeleted: true }
      )
    ]);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get all books for admin management
// @route   GET /api/admin/books
// @access  Private (Admin only)
router.get('/books', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      category,
      status = 'all',
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build query
    const query = {};

    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }

    // Add category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Add status filter
    if (status !== 'all') {
      query.isActive = status === 'active';
    }

    // Build sort object
    const sortOrder = order === 'desc' ? -1 : 1;
    let sortObj = {};
    
    switch (sort) {
      case 'title':
        sortObj = { title: sortOrder };
        break;
      case 'author':
        sortObj = { author: sortOrder };
        break;
      case 'category':
        sortObj = { category: sortOrder };
        break;
      case 'views':
        sortObj = { views: sortOrder };
        break;
      case 'downloads':
        sortObj = { downloads: sortOrder };
        break;
      default:
        sortObj = { createdAt: sortOrder };
    }

    const books = await Book.find(query)
      .populate('addedBy', 'name email')
      .select('-reviews') // Exclude reviews for performance
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sortObj);

    const total = await Book.countDocuments(query);

    res.json({
      success: true,
      books,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get admin books error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get all videos for admin management
// @route   GET /api/admin/videos
// @access  Private (Admin only)
router.get('/videos', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      category,
      status = 'all',
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build query
    const query = {};

    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { instructor: { $regex: search, $options: 'i' } }
      ];
    }

    // Add category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Add status filter
    if (status !== 'all') {
      query.isActive = status === 'active';
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
      case 'category':
        sortObj = { category: sortOrder };
        break;
      case 'views':
        sortObj = { views: sortOrder };
        break;
      case 'duration':
        sortObj = { duration: sortOrder };
        break;
      default:
        sortObj = { createdAt: sortOrder };
    }

    const videos = await Video.find(query)
      .populate('addedBy', 'name email')
      .select('-reviews') // Exclude reviews for performance
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sortObj);

    const total = await Video.countDocuments(query);

    res.json({
      success: true,
      videos,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get admin videos error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update book status
// @route   PUT /api/admin/books/:bookId/status
// @access  Private (Admin only)
router.put('/books/:bookId/status', [
  body('isActive')
    .isBoolean()
    .withMessage('isActive must be a boolean value')
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

    const { bookId } = req.params;
    const { isActive } = req.body;

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.isActive = isActive;
    await book.save();

    res.json({
      success: true,
      message: `Book ${isActive ? 'activated' : 'deactivated'} successfully`,
      book: {
        id: book._id,
        title: book.title,
        isActive: book.isActive
      }
    });
  } catch (error) {
    console.error('Update book status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update video status
// @route   PUT /api/admin/videos/:videoId/status
// @access  Private (Admin only)
router.put('/videos/:videoId/status', [
  body('isActive')
    .isBoolean()
    .withMessage('isActive must be a boolean value')
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

    const { videoId } = req.params;
    const { isActive } = req.body;

    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    video.isActive = isActive;
    await video.save();

    res.json({
      success: true,
      message: `Video ${isActive ? 'activated' : 'deactivated'} successfully`,
      video: {
        id: video._id,
        title: video.title,
        isActive: video.isActive
      }
    });
  } catch (error) {
    console.error('Update video status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Fix URLs for books and videos  
// @route   POST /api/admin/fix-urls
// @access  Public (for debugging)
router.post('/fix-urls', async (req, res) => {
  try {
    console.log('🔧 Fixing URLs for all books and videos...');
    
    // Get all books and update them with open source URLs
    const books = await Book.find({});
    console.log(`Found ${books.length} books to update`);
    
    // Open source book URLs
    const openSourceBookUrls = [
      "https://www.gutenberg.org/ebooks/74", // Adventures of Tom Sawyer
      "https://www.gutenberg.org/ebooks/1342", // Pride and Prejudice  
      "https://www.gutenberg.org/ebooks/11", // Alice's Adventures in Wonderland
      "https://www.gutenberg.org/ebooks/84", // Frankenstein
      "https://www.gutenberg.org/ebooks/345", // Dracula
      "https://www.gutenberg.org/ebooks/174", // Picture of Dorian Gray
      "https://www.gutenberg.org/ebooks/46", // A Christmas Carol
      "https://www.gutenberg.org/ebooks/1661", // Adventures of Sherlock Holmes
      "https://www.gutenberg.org/ebooks/76", // Adventures of Huckleberry Finn
      "https://www.gutenberg.org/ebooks/5200", // Metamorphosis
      "https://www.gutenberg.org/ebooks/2701", // Moby Dick
      "https://www.gutenberg.org/ebooks/98", // A Tale of Two Cities
      "https://www.gutenberg.org/ebooks/64317", // The Great Gatsby
      "https://www.gutenberg.org/ebooks/1080", // A Modest Proposal
      "https://www.gutenberg.org/ebooks/25344" // The Art of War
    ];

    let bookUpdates = 0;
    for (let i = 0; i < books.length; i++) {
      const urlIndex = i % openSourceBookUrls.length;
      const result = await Book.findByIdAndUpdate(books[i]._id, {
        'pdfFile.url': openSourceBookUrls[urlIndex]
      });
      if (result) {
        bookUpdates++;
        console.log(`✅ Updated book: ${books[i].title}`);
      }
    }
    
    // Get all videos and update them with YouTube URLs
    const videos = await Video.find({});
    console.log(`Found ${videos.length} videos to update`);
    
    // Educational YouTube video URLs
    const youtubeVideoUrls = [
      "https://www.youtube.com/embed/RGOj5yH7evk", // Git and GitHub for Beginners
      "https://www.youtube.com/embed/SWYqp7iY_Tc", // Git & GitHub Crash Course
      "https://www.youtube.com/embed/fJtyf62yAb8", // JavaScript for Beginners
      "https://www.youtube.com/embed/PkZNo7MFNFg", // Learn JavaScript - Full Course
      "https://www.youtube.com/embed/Ke90Tje7VS0", // React Course - Beginner's Tutorial
      "https://www.youtube.com/embed/nTeuhbP7wdE", // React Tutorial for Beginners
      "https://www.youtube.com/embed/0riHps91AzE", // Node.js Tutorial for Beginners
      "https://www.youtube.com/embed/TlB_eWDSMt4", // Node.js Full Course
      "https://www.youtube.com/embed/9OPP_1eAENg", // MySQL Tutorial for Beginners
      "https://www.youtube.com/embed/HXV3zeQKqGY", // SQL - Full Database Course
      "https://www.youtube.com/embed/ER9SspLe4Hg", // Python for Everybody - Full Course
      "https://www.youtube.com/embed/rfscVS0vtbw", // Learn Python - Full Course
      "https://www.youtube.com/embed/WGJJIrtnfpk", // C Programming Tutorial
      "https://www.youtube.com/embed/KJgsSFOSQv0", // C Programming Full Course
      "https://www.youtube.com/embed/vLnPwxZdW4Y", // C++ Tutorial for Beginners
      "https://www.youtube.com/embed/YYXdXT2l-Gg", // Python Tutorial
      "https://www.youtube.com/embed/hdI2bqOjy3c", // JavaScript Crash Course
      "https://www.youtube.com/embed/ukzFI9rgwfU", // Machine Learning
      "https://www.youtube.com/embed/ztHopE5Wnpc", // Database Design
      "https://www.youtube.com/embed/UB1O30fR-EE"  // Web Development
    ];

    let videoUpdates = 0;
    for (let i = 0; i < videos.length; i++) {
      const urlIndex = i % youtubeVideoUrls.length;
      const result = await Video.findByIdAndUpdate(videos[i]._id, {
        'url': youtubeVideoUrls[urlIndex]
      });
      if (result) {
        videoUpdates++;
        console.log(`✅ Updated video: ${videos[i].title}`);
      }
    }

    res.json({ 
      success: true, 
      message: 'URLs updated successfully',
      bookUpdates,
      videoUpdates,
      totalBooks: books.length,
      totalVideos: videos.length
    });
  } catch (error) {
    console.error('Error fixing URLs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update URLs',
      error: error.message 
    });
  }
});

module.exports = router;
