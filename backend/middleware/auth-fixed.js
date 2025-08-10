const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - authenticate token
const protect = async (req, res, next) => {
  let token;

  try {
    // Check for token in header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      console.log('🔍 Token received:', token ? token.substring(0, 20) + '...' : 'No token');
    }

    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized, no token provided' 
      });
    }

    try {
      // Verify token
      console.log('🔍 Verifying token...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token verified, user ID:', decoded.id);

      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        console.log('❌ User not found for token:', decoded.id);
        return res.status(401).json({ 
          success: false,
          message: 'User not found' 
        });
      }

      if (!user.isActive) {
        console.log('❌ User account is deactivated:', decoded.id);
        return res.status(401).json({ 
          success: false,
          message: 'Account is deactivated' 
        });
      }

      console.log('✅ User authenticated:', user._id);
      req.user = user;
      next();
      
    } catch (tokenError) {
      console.log('❌ Token verification failed:', tokenError.message);
      
      // Provide specific error messages
      if (tokenError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false,
          message: 'Token expired, please login again' 
        });
      } else if (tokenError.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid token' 
        });
      } else {
        return res.status(401).json({ 
          success: false,
          message: 'Token verification failed' 
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error in authentication' 
    });
  }
};

// Admin only access
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    console.log('✅ Admin access granted:', req.user._id);
    next();
  } else {
    console.log('❌ Admin access denied for:', req.user?._id || 'unknown');
    res.status(403).json({ 
      success: false,
      message: 'Access denied. Admin privileges required.' 
    });
  }
};

// Generate JWT Token
const generateToken = (id) => {
  try {
    console.log('🔑 Generating token for user:', id);
    
    if (!process.env.JWT_SECRET) {
      console.log('❌ JWT_SECRET not configured');
      throw new Error('JWT_SECRET not configured');
    }

    if (!id) {
      console.log('❌ No user ID provided for token generation');
      throw new Error('User ID is required for token generation');
    }

    const token = jwt.sign(
      { id }, 
      process.env.JWT_SECRET, 
      {
        expiresIn: process.env.JWT_EXPIRE || '7d',
      }
    );

    console.log('✅ Token generated successfully');
    return token;
    
  } catch (error) {
    console.error('❌ Token generation error:', error);
    throw error;
  }
};

// Verify token utility function
const verifyToken = (token) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not configured');
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { success: true, decoded };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = { protect, admin, generateToken, verifyToken };
