const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Enable CORS
app.use(cors());
app.use(express.json());

// Mock user data for testing (in production this would come from database)
const mockUser = {
  _id: '507f1f77bcf86cd799439011',
  email: 'test@test.com',
  password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // "password"
  name: 'Test User',
  isActive: true
};

// Password comparison function
const comparePassword = async (enteredPassword, hashedPassword) => {
  return await bcrypt.compare(enteredPassword, hashedPassword);
};

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Test endpoint to create a hashed password
app.post('/api/test/hash-password', async (req, res) => {
  try {
    const { password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    res.json({
      success: true,
      original: password,
      hashed: hashedPassword,
      saltRounds: 10
    });
  } catch (error) {
    res.status(500).json({ message: 'Error hashing password', error: error.message });
  }
});

// Test login endpoint with detailed debugging
app.post('/api/test/login', async (req, res) => {
  try {
    console.log('🔍 Login attempt received:', req.body);
    
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
        debug: { email: !!email, password: !!password }
      });
    }

    console.log('✅ Basic validation passed');

    // Find user (mock)
    let user = null;
    if (email.toLowerCase() === mockUser.email) {
      user = mockUser;
      console.log('✅ User found in mock database');
    } else {
      console.log('❌ User not found');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        debug: { userFound: false, email }
      });
    }

    // Check if account is active
    if (!user.isActive) {
      console.log('❌ Account is deactivated');
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated',
        debug: { isActive: user.isActive }
      });
    }

    console.log('✅ Account is active');

    // Check password
    console.log('🔍 Comparing passwords...');
    console.log('Entered password:', password);
    console.log('Stored hash:', user.password);
    
    const isPasswordMatch = await comparePassword(password, user.password);
    console.log('Password match result:', isPasswordMatch);

    if (!isPasswordMatch) {
      console.log('❌ Password does not match');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        debug: {
          passwordMatch: false,
          enteredPasswordLength: password.length,
          hashedPasswordLength: user.password.length
        }
      });
    }

    console.log('✅ Password matches');

    // Generate token
    console.log('🔍 Generating JWT token...');
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length);

    const token = generateToken(user._id);
    console.log('✅ Token generated:', token.substring(0, 20) + '...');

    // Verify token immediately
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token verification successful:', decoded);
    } catch (tokenError) {
      console.log('❌ Token verification failed:', tokenError.message);
      return res.status(500).json({
        success: false,
        message: 'Token generation failed',
        debug: { tokenError: tokenError.message }
      });
    }

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      },
      debug: {
        passwordMatch: true,
        tokenGenerated: true,
        jwtSecretExists: !!process.env.JWT_SECRET
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      debug: {
        error: error.message,
        stack: error.stack
      }
    });
  }
});

// Test token verification endpoint
app.post('/api/test/verify-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    res.json({
      success: true,
      message: 'Token is valid',
      decoded,
      debug: {
        tokenExists: !!token,
        jwtSecretExists: !!process.env.JWT_SECRET,
        decodedId: decoded.id
      }
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token',
      debug: {
        error: error.message,
        tokenProvided: !!req.body.token,
        jwtSecretExists: !!process.env.JWT_SECRET
      }
    });
  }
});

// Environment check endpoint
app.get('/api/test/env-check', (req, res) => {
  res.json({
    success: true,
    environment: {
      nodeEnv: process.env.NODE_ENV,
      port: process.env.PORT,
      jwtSecretExists: !!process.env.JWT_SECRET,
      jwtSecretLength: process.env.JWT_SECRET?.length,
      jwtExpire: process.env.JWT_EXPIRE,
      mongodbUri: process.env.MONGODB_URI ? '[HIDDEN]' : 'Not set'
    }
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Login debug server running on port ${PORT}`);
  console.log(`📋 Test endpoints:`);
  console.log(`   POST /api/test/login - Test login with debugging`);
  console.log(`   POST /api/test/verify-token - Test token verification`);
  console.log(`   POST /api/test/hash-password - Generate password hash`);
  console.log(`   GET /api/test/env-check - Check environment variables`);
  console.log(`\n🧪 Test credentials:`);
  console.log(`   Email: test@test.com`);
  console.log(`   Password: password`);
});
