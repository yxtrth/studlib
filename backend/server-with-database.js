// Enhanced server with MongoDB database connection
console.log('🚀 Starting Student Library Backend with Database...');

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5003;

// Database connection
console.log('🔗 Connecting to MongoDB Atlas...');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Atlas connected successfully');
  })
  .catch(error => {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('⚠️  Continuing without database...');
  });

// Simple User Schema for testing
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationOTP: String,
  emailVerificationExpires: Date,
  isInGlobalChat: { type: Boolean, default: false },
  onlineStatus: { type: String, enum: ['online', 'offline'], default: 'offline' },
  avatar: {
    public_id: String,
    url: String
  },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://inquisitive-kashata-b3ac7e.netlify.app',
    'http://localhost:5173',
    'http://127.0.0.1:5500',
    'file://' // For local HTML files
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Health endpoint with database status
app.get('/api/health', async (req, res) => {
  console.log('✅ Health check requested');
  
  let dbStatus = 'disconnected';
  let dbInfo = {};
  
  try {
    if (mongoose.connection.readyState === 1) {
      dbStatus = 'connected';
      dbInfo = {
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        readyState: mongoose.connection.readyState
      };
      
      // Test database operation
      const userCount = await User.countDocuments();
      dbInfo.userCount = userCount;
    }
  } catch (error) {
    dbStatus = 'error';
    dbInfo.error = error.message;
  }
  
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatus,
      ...dbInfo
    },
    message: 'Student Library Backend with Database'
  });
});

// Registration endpoint with database
app.post('/api/auth/register', async (req, res) => {
  console.log('📝 Registration attempt:', req.body.email);
  
  try {
    const { name, email, password } = req.body;
    
    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }
    
    // Check if database is available
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️  Database not available, using demo mode');
      return res.status(201).json({
        success: true,
        message: 'Registration successful! (Demo mode - no database)',
        user: {
          id: 'demo_' + Date.now(),
          name: name,
          email: email
        },
        demoMode: true
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }
    
    // Create new user
    const userData = {
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      avatar: {
        public_id: 'default_avatar',
        url: `https://via.placeholder.com/150/007bff/ffffff?text=${encodeURIComponent(name.charAt(0).toUpperCase())}`
      }
    };
    
    const user = await User.create(userData);
    
    console.log('✅ User created successfully:', user.email);
    
    res.status(201).json({
      success: true,
      message: 'Registration successful! User created in database.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified
      }
    });
    
  } catch (error) {
    console.error('❌ Registration error:', error.message);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Login endpoint with database
app.post('/api/auth/login', async (req, res) => {
  console.log('🔐 Login attempt:', req.body.email);
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Check if database is available
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️  Database not available, using demo mode');
      return res.json({
        success: true,
        message: 'Login successful! (Demo mode)',
        token: 'demo_token_' + Date.now(),
        user: {
          id: 'demo_user',
          name: 'Demo User',
          email: email
        },
        demoMode: true
      });
    }
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    console.log('✅ Login successful:', user.email);
    
    // Update online status
    user.onlineStatus = 'online';
    await user.save();
    
    res.json({
      success: true,
      message: 'Login successful!',
      token: 'jwt_token_' + Date.now(), // Replace with actual JWT later
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        isInGlobalChat: user.isInGlobalChat
      }
    });
    
  } catch (error) {
    console.error('❌ Login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all users endpoint (for testing)
app.get('/api/users', async (req, res) => {
  console.log('👥 Users list requested');
  
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        success: true,
        users: [],
        message: 'Database not available',
        demoMode: true
      });
    }
    
    const users = await User.find({}, '-password -emailVerificationOTP')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({
      success: true,
      users: users,
      count: users.length
    });
    
  } catch (error) {
    console.error('❌ Users fetch error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  console.log('📍 Root endpoint accessed');
  res.json({
    message: 'Student Library Backend API with Database',
    version: '1.1.0',
    status: 'running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    endpoints: [
      'GET /api/health',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/users'
    ]
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log('❌ 404 - Route not found:', req.originalUrl);
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('❌ Server error:', error.message);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 CORS enabled for frontend origins`);
  console.log(`📝 Registration: http://localhost:${PORT}/api/auth/register`);
  console.log(`🔐 Login: http://localhost:${PORT}/api/auth/login`);
  console.log(`👥 Users: http://localhost:${PORT}/api/users`);
  console.log('🎉 Backend with database ready!');
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    console.log('💡 Kill existing process: taskkill /F /IM node.exe');
  } else {
    console.error('❌ Server error:', error.message);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    mongoose.connection.close(() => {
      console.log('✅ Database connection closed');
      console.log('✅ Server closed');
      process.exit(0);
    });
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down...');
  server.close(() => {
    mongoose.connection.close(() => {
      console.log('✅ Database connection closed');
      console.log('✅ Server closed');
      process.exit(0);
    });
  });
});
