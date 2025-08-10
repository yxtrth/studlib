const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Book = require('../models/Book');
const Video = require('../models/Video');
const Message = require('../models/Message');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// All routes require admin access
router.use(protect, admin);

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
// @access  Private (Admin only)
router.post('/fix-urls', async (req, res) => {
  try {
    console.log('🔧 Admin triggered URL fix...');
    
    // Better book URLs - actual open source programming books
    const bookUrls = {
      "Introduction to Programming": "https://www.gutenberg.org/files/35/35-pdf.pdf",
      "Learn Python Programming": "https://greenteapress.com/thinkpython2/thinkpython2.pdf", 
      "JavaScript: The Good Parts": "https://github.com/getify/You-Dont-Know-JS",
      "Clean Code": "https://www.oreilly.com/library/view/clean-code-a/9780136083238/",
      "Data Structures and Algorithms": "https://algs4.cs.princeton.edu/home/",
      "Introduction to Machine Learning": "https://www.cs.cmu.edu/~tom/mlbook.html",
      "Computer Networks": "https://book.systemsapproach.org/",
      "Database Systems": "https://db-book.com/",
      "Software Engineering": "https://software-engineering-book.com/",
      "Operating Systems": "https://pages.cs.wisc.edu/~remzi/OSTEP/",
      "Linear Algebra": "https://linear.axler.net/",
      "Introduction to Physics": "https://www.feynmanlectures.caltech.edu/",
      "Chemistry Basics": "https://openstax.org/details/books/chemistry-2e",
      "Business Management": "https://openstax.org/details/books/principles-management"
    };

    // Better video URLs - actual educational YouTube videos
    const videoUrls = {
      "Programming Fundamentals": "https://www.youtube.com/embed/zOjov-2OZ0E",
      "Python Tutorial for Beginners": "https://www.youtube.com/embed/YYXdXT2l-Gg", 
      "JavaScript Crash Course": "https://www.youtube.com/embed/hdI2bqOjy3c",
      "React.js Tutorial": "https://www.youtube.com/embed/Ke90Tje7VS0",
      "Node.js Basics": "https://www.youtube.com/embed/TlB_eWDSMt4",
      "Introduction to Machine Learning": "https://www.youtube.com/embed/ukzFI9rgwfU",
      "Database Design": "https://www.youtube.com/embed/ztHopE5Wnpc",
      "Web Development Crash Course": "https://www.youtube.com/embed/UB1O30fR-EE",
      "Data Structures Tutorial": "https://www.youtube.com/embed/RBSGKlAvoiM",
      "Computer Networks Explained": "https://www.youtube.com/embed/3QhU9jd03a0",
      "Linear Algebra Course": "https://www.youtube.com/embed/fNk_zzaMoSs",
      "Physics Lecture Series": "https://www.youtube.com/embed/VdOkJW_ZZJ8",
      "Chemistry Fundamentals": "https://www.youtube.com/embed/FSyAehMdpyI",
      "Business Management Basics": "https://www.youtube.com/embed/yP3QKfqJAH4",
      "Introduction to Psychology": "https://www.youtube.com/embed/vo4pMVb0R6M"
    };

    let bookUpdates = 0;
    for (const [title, url] of Object.entries(bookUrls)) {
      const result = await Book.updateOne(
        { title: { $regex: title, $options: 'i' } },
        { $set: { 'pdfFile.url': url } }
      );
      if (result.modifiedCount > 0) {
        bookUpdates++;
        console.log(`✅ Updated book: ${title}`);
      }
    }
    
    let videoUpdates = 0;
    for (const [title, url] of Object.entries(videoUrls)) {
      const result = await Video.updateOne(
        { title: { $regex: title, $options: 'i' } },
        { $set: { url: url } }
      );
      if (result.modifiedCount > 0) {
        videoUpdates++;
        console.log(`✅ Updated video: ${title}`);
      }
    }

    res.json({ 
      success: true, 
      message: 'URLs updated successfully',
      bookUpdates,
      videoUpdates
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
