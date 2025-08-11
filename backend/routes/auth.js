const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { generateOTP, sendOTPEmail, sendWelcomeEmail } = require('../utils/emailService');

const router = express.Router();

// Configure multer for handling form data
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'avatar') {
      // Check if file is an image
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'), false);
      }
    } else {
      cb(null, true);
    }
  }
});

// Custom validation middleware for FormData
const validateRegistration = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  // Validate name
  if (!name || typeof name !== 'string') {
    errors.push({ field: 'name', message: 'Name is required' });
  } else if (name.trim().length < 2 || name.trim().length > 50) {
    errors.push({ field: 'name', message: 'Name must be between 2 and 50 characters' });
  }

  // Validate email
  if (!email || typeof email !== 'string') {
    errors.push({ field: 'email', message: 'Email is required' });
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push({ field: 'email', message: 'Please provide a valid email' });
    }
  }

  // Validate password
  if (!password || typeof password !== 'string') {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters long' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', upload.single('avatar'), validateRegistration, async (req, res) => {
  try {
    console.log('📝 Registration attempt for:', req.body.email);
    console.log('📋 Form data received:', req.body);
    
    const { name, email, password, studentId, department, bio } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ 
        success: false,
        message: 'User already exists with this email' 
      });
    }

    // Prepare user data
    const userData = {
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      studentId: studentId || '',
      department: department || '',
      bio: bio || ''
    };

    // Handle avatar upload if provided
    if (req.file) {
      // For now, use a default avatar until Cloudinary is configured
      userData.avatar = {
        public_id: 'default_avatar',
        url: 'https://via.placeholder.com/150/007bff/ffffff?text=' + encodeURIComponent(name.charAt(0).toUpperCase())
      };
      console.log('📸 Avatar file uploaded:', req.file.originalname);
    } else {
      // Default avatar with user's initial
      userData.avatar = {
        public_id: 'default_avatar',
        url: 'https://via.placeholder.com/150/007bff/ffffff?text=' + encodeURIComponent(name.charAt(0).toUpperCase())
      };
    }

    // Create new user (password will be hashed by pre-save middleware)
    // Generate OTP for email verification
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    userData.emailVerificationOTP = otp;
    userData.emailVerificationExpires = otpExpires;
    userData.isEmailVerified = false;

    const user = await User.create(userData);

    // Send OTP email
    console.log('📧 Attempting to send OTP email...');
    const emailSent = await sendOTPEmail(user.email, otp, user.name);
    
    if (!emailSent) {
      console.error('❌ Failed to send OTP email, deleting user');
      // If email fails, delete the user and return error
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please check your email address and try again.',
        errorCode: 'EMAIL_SEND_FAILED'
      });
    }

    console.log('✅ User created successfully, OTP sent to:', user.email);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email for verification code.',
      userId: user._id,
      email: user.email,
      requiresVerification: true
    });
  } catch (error) {
    console.error('❌ Registration error:', error.message);
    console.error('❌ Full error stack:', error.stack);
    
    // More specific error messages
    let errorMessage = 'Server error during registration';
    let errorCode = 'REGISTRATION_FAILED';
    
    if (error.name === 'ValidationError') {
      errorMessage = 'Invalid data provided';
      errorCode = 'VALIDATION_ERROR';
    } else if (error.code === 11000) {
      errorMessage = 'User already exists with this email';
      errorCode = 'DUPLICATE_EMAIL';
    }
    
    res.status(500).json({ 
      success: false,
      message: errorMessage,
      errorCode: errorCode,
      ...(process.env.NODE_ENV === 'development' && { 
        debug: error.message,
        stack: error.stack 
      })
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
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

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json({ 
        success: false,
        message: 'Please verify your email before logging in',
        requiresVerification: true,
        userId: user._id,
        email: user.email
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last seen
    await user.updateLastSeen();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
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
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', require('../middleware/auth').protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('favoriteBooks', 'title author coverImage')
      .populate('favoriteVideos', 'title instructor thumbnail');

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
        lastSeen: user.lastSeen,
        joinDate: user.joinDate,
        favoriteBooks: user.favoriteBooks,
        favoriteVideos: user.favoriteVideos
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Verify OTP for email verification
// @route   POST /api/auth/verify-otp
// @access  Public
router.post('/verify-otp', [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { userId, otp } = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification request'
      });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Check OTP
    if (user.emailVerificationOTP !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Check OTP expiration
    if (user.emailVerificationExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Verify the user and add to global chat
    user.isEmailVerified = true;
    user.isInGlobalChat = true; // Auto-add to global chat
    user.onlineStatus = 'online';
    user.emailVerificationOTP = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Send welcome email
    await sendWelcomeEmail(user.email, user.name);

    // Create a welcome message in global chat
    const Message = require('../models/Message');
    await Message.create({
      sender: user._id,
      content: `${user.name} has joined the Student Library community! 🎉`,
      messageType: 'system',
      chatType: 'global',
      room: 'general'
    });

    console.log('✅ Email verified and user added to global chat:', user.email);

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Email verified successfully! Welcome to Student Library!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
        joinDate: user.joinDate,
        studentId: user.studentId,
        department: user.department,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('❌ OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during verification'
    });
  }
});

// @desc    Resend OTP for email verification
// @route   POST /api/auth/resend-otp
// @access  Public
router.post('/resend-otp', [
  body('userId').notEmpty().withMessage('User ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { userId } = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request'
      });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.emailVerificationOTP = otp;
    user.emailVerificationExpires = otpExpires;
    await user.save();

    // Send OTP email
    const emailSent = await sendOTPEmail(user.email, otp, user.name);
    
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.'
      });
    }

    console.log('📧 OTP resent to:', user.email);

    res.json({
      success: true,
      message: 'Verification code sent to your email!'
    });
  } catch (error) {
    console.error('❌ Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during resend'
    });
  }
});

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Public
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', [
  require('../middleware/auth').protect,
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
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

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isCurrentPasswordMatch = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
