const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
], async (req, res) => {
  try {
    console.log('📝 Registration attempt for:', req.body.email);
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ 
        success: false,
        message: 'User already exists with this email' 
      });
    }

    // Create new user (password will be hashed by pre-save middleware)
    const user = await User.create({
      name,
      email,
      password
    });

    console.log('✅ User created successfully:', user._id);

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
        joinDate: user.joinDate
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during registration',
      ...(process.env.NODE_ENV === 'development' && { debug: error.message })
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
    console.log('🔐 Login attempt for:', req.body.email);
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    console.log('✅ User found:', user._id);

    // Check if account is active
    if (!user.isActive) {
      console.log('❌ Account is deactivated:', email);
      return res.status(401).json({ 
        success: false,
        message: 'Account is deactivated' 
      });
    }

    console.log('✅ Account is active');

    // Verify password using the model method
    const isPasswordMatch = await user.comparePassword(password);
    console.log('🔍 Password comparison result:', isPasswordMatch);
    
    if (!isPasswordMatch) {
      console.log('❌ Password does not match for:', email);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    console.log('✅ Password matches');

    // Update last seen timestamp
    try {
      await user.updateLastSeen();
      console.log('✅ Last seen updated');
    } catch (updateError) {
      console.log('⚠️ Failed to update last seen:', updateError.message);
      // Don't fail login if this fails
    }

    // Generate JWT token
    let token;
    try {
      token = generateToken(user._id);
      console.log('✅ Token generated successfully');
    } catch (tokenError) {
      console.log('❌ Token generation failed:', tokenError.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate authentication token'
      });
    }

    // Successful login response
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

    console.log('✅ Login successful for:', email);

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login',
      ...(process.env.NODE_ENV === 'development' && { debug: error.message })
    });
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', require('../middleware/auth').protect, async (req, res) => {
  try {
    console.log('👤 Getting current user:', req.user._id);
    
    const user = await User.findById(req.user._id)
      .populate('favoriteBooks', 'title author coverImage')
      .populate('favoriteVideos', 'title instructor thumbnail');

    if (!user) {
      console.log('❌ User not found:', req.user._id);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

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

    console.log('✅ Current user data sent');
  } catch (error) {
    console.error('❌ Get current user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      ...(process.env.NODE_ENV === 'development' && { debug: error.message })
    });
  }
});

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Public
router.post('/logout', (req, res) => {
  console.log('🚪 Logout request received');
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
    console.log('🔑 Password change request for:', req.user._id);
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password field
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      console.log('❌ User not found for password change:', req.user._id);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordMatch = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordMatch) {
      console.log('❌ Current password incorrect for:', req.user._id);
      return res.status(400).json({ 
        success: false,
        message: 'Current password is incorrect' 
      });
    }

    console.log('✅ Current password verified');

    // Update password (will be hashed by pre-save middleware)
    user.password = newPassword;
    await user.save();

    console.log('✅ Password changed successfully for:', req.user._id);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      ...(process.env.NODE_ENV === 'development' && { debug: error.message })
    });
  }
});

module.exports = router;
