const express = require('express');
const { body, validationResult } = require('express-validator');
const Book = require('../models/Book');
const { protect, admin } = require('../middleware/auth');
const { uploadCover, uploadPdf } = require('../middleware/upload');
const { uploadImageToCloudinary, uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

const router = express.Router();

// @desc    Get all books
// @route   GET /api/books
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      search, 
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build query
    const query = { isActive: true };

    // Add category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
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
      case 'author':
        sortObj = { author: sortOrder };
        break;
      case 'rating':
        sortObj = { 'rating.average': sortOrder };
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
      .populate('addedBy', 'name')
      .select('-reviews') // Exclude reviews for performance
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sortObj);

    const total = await Book.countDocuments(query);

    // Get categories for filter
    const categories = await Book.distinct('category', { isActive: true });

    res.json({
      success: true,
      books,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      categories
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('addedBy', 'name avatar')
      .populate('reviews.user', 'name avatar');

    if (!book || !book.isActive) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Increment view count
    await book.incrementViews();

    res.json({
      success: true,
      book
    });
  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create new book
// @route   POST /api/books
// @access  Private (Admin or User)
router.post('/', [
  protect,
  uploadCover,
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title is required and must be less than 100 characters'),
  body('author')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Author is required and must be less than 50 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
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
      author,
      description,
      category,
      isbn,
      publishedDate,
      publisher,
      pages,
      language,
      tags
    } = req.body;

    // Check if book with same title and author already exists
    const existingBook = await Book.findOne({ 
      title: { $regex: new RegExp(`^${title}$`, 'i') },
      author: { $regex: new RegExp(`^${author}$`, 'i') }
    });

    if (existingBook) {
      return res.status(400).json({ message: 'Book with this title and author already exists' });
    }

    // Prepare book data
    const bookData = {
      title,
      author,
      description,
      category,
      addedBy: req.user._id,
      isbn,
      publishedDate,
      publisher,
      pages,
      language: language || 'English',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    };

    // Handle cover image upload
    if (req.file) {
      try {
        const uploadResult = await uploadImageToCloudinary(req.file, 'student-library/books/covers');
        bookData.coverImage = {
          public_id: uploadResult.public_id,
          url: uploadResult.url
        };
      } catch (uploadError) {
        console.error('Cover upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload cover image' });
      }
    }

    const book = await Book.create(bookData);
    await book.populate('addedBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      book
    });
  } catch (error) {
    console.error('Create book error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private (Admin or Owner)
router.put('/:id', [
  protect,
  uploadCover,
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be less than 100 characters'),
  body('author')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Author must be less than 50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters')
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

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if user is admin or owner
    if (req.user.role !== 'admin' && book.addedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this book' });
    }

    const {
      title,
      author,
      description,
      category,
      isbn,
      publishedDate,
      publisher,
      pages,
      language,
      tags
    } = req.body;

    // Update fields
    if (title) book.title = title;
    if (author) book.author = author;
    if (description) book.description = description;
    if (category) book.category = category;
    if (isbn) book.isbn = isbn;
    if (publishedDate) book.publishedDate = publishedDate;
    if (publisher) book.publisher = publisher;
    if (pages) book.pages = pages;
    if (language) book.language = language;
    if (tags) book.tags = tags.split(',').map(tag => tag.trim());

    // Handle cover image upload
    if (req.file) {
      try {
        // Delete old cover if it exists
        if (book.coverImage.public_id) {
          await deleteFromCloudinary(book.coverImage.public_id);
        }

        // Upload new cover
        const uploadResult = await uploadImageToCloudinary(req.file, 'student-library/books/covers');
        book.coverImage = {
          public_id: uploadResult.public_id,
          url: uploadResult.url
        };
      } catch (uploadError) {
        console.error('Cover upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload cover image' });
      }
    }

    await book.save();
    await book.populate('addedBy', 'name');

    res.json({
      success: true,
      message: 'Book updated successfully',
      book
    });
  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private (Admin or Owner)
router.delete('/:id', protect, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if user is admin or owner
    if (req.user.role !== 'admin' && book.addedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this book' });
    }

    // Soft delete
    book.isActive = false;
    await book.save();

    res.json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Add review to book
// @route   POST /api/books/:id/review
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
    const book = await Book.findById(req.params.id);

    if (!book || !book.isActive) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if user already reviewed this book
    const existingReview = book.reviews.find(
      review => review.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this book' });
    }

    // Add review
    book.reviews.push({
      user: req.user._id,
      rating,
      comment: comment || ''
    });

    // Calculate new average rating
    await book.calculateAverageRating();
    await book.populate('reviews.user', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      book
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Download book
// @route   GET /api/books/:id/download
// @access  Private
router.get('/:id/download', protect, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book || !book.isActive) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (!book.pdfFile.url) {
      return res.status(404).json({ message: 'PDF file not available for this book' });
    }

    // Increment download count
    await book.incrementDownloads();

    res.json({
      success: true,
      downloadUrl: book.pdfFile.url,
      message: 'Download link generated'
    });
  } catch (error) {
    console.error('Download book error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Upload PDF file for book
// @route   POST /api/books/:id/upload-pdf
// @access  Private (Admin or Owner)
router.post('/:id/upload-pdf', [
  protect,
  uploadPdf
], async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if user is admin or owner
    if (req.user.role !== 'admin' && book.addedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to upload PDF for this book' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please select a PDF file' });
    }

    try {
      // Delete old PDF if it exists
      if (book.pdfFile.public_id) {
        await deleteFromCloudinary(book.pdfFile.public_id);
      }

      // Upload new PDF
      const uploadResult = await uploadToCloudinary(req.file, 'student-library/books/pdfs');
      book.pdfFile = {
        public_id: uploadResult.public_id,
        url: uploadResult.url
      };

      await book.save();

      res.json({
        success: true,
        message: 'PDF uploaded successfully',
        pdfFile: book.pdfFile
      });
    } catch (uploadError) {
      console.error('PDF upload error:', uploadError);
      return res.status(500).json({ message: 'Failed to upload PDF file' });
    }
  } catch (error) {
    console.error('Upload PDF error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
