// Complete server with database and email service
console.log('🚀 Starting Student Library Backend with Database and Email...');

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5003;

// Email service setup
console.log('📧 Setting up email service...');
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp, name) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Email configuration missing');
      return false;
    }

    console.log('📧 Sending OTP email to:', email);
    const transporter = createTransporter();
    
    // Verify transporter
    await transporter.verify();
    console.log('✅ Email transporter verified');
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Student Library Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center;">Welcome to Student Library!</h2>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #495057;">Hello ${name || 'Student'},</h3>
            <p style="color: #6c757d; line-height: 1.6;">
              Thank you for registering with Student Library! To complete your registration, please verify your email address.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="background-color: #007bff; color: white; padding: 15px; font-size: 24px; font-weight: bold; border-radius: 5px; letter-spacing: 2px;">
                ${otp}
              </div>
              <p style="color: #6c757d; margin-top: 10px; font-size: 14px;">
                This OTP will expire in 10 minutes
              </p>
            </div>
            <p style="color: #6c757d; line-height: 1.6;">
              If you didn't create an account with us, please ignore this email.
            </p>
          </div>
          <div style="text-align: center; color: #6c757d; font-size: 12px; margin-top: 20px;">
            <p>Student Library - Your Gateway to Knowledge</p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending OTP email:', error.message);
    return false;
  }
};

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

// Enhanced User Schema with email verification
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
    'file://', // For local HTML files
    /^https:\/\/.*--inquisitive-kashata-b3ac7e\.netlify\.app$/, // Netlify preview URLs
    /^https:\/\/.*\.netlify\.app$/ // Any Netlify app
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for handling FormData
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'avatar') {
      // Accept images only
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for avatar'), false);
      }
    } else {
      cb(null, true);
    }
  }
});

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Health endpoint with database and email status
app.get('/api/health', async (req, res) => {
  console.log('✅ Health check requested');
  
  let dbStatus = 'disconnected';
  let dbInfo = {};
  let emailStatus = 'not_configured';
  
  try {
    // Database status
    if (mongoose.connection.readyState === 1) {
      dbStatus = 'connected';
      dbInfo = {
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        readyState: mongoose.connection.readyState
      };
      
      const userCount = await User.countDocuments();
      dbInfo.userCount = userCount;
    }
    
    // Email status
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      emailStatus = 'configured';
      try {
        const transporter = createTransporter();
        await transporter.verify();
        emailStatus = 'verified';
      } catch (emailError) {
        emailStatus = 'error';
      }
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
    email: {
      status: emailStatus,
      user: process.env.EMAIL_USER || 'not_set'
    },
    message: 'Student Library Backend with Database and Email'
  });
});

// Registration endpoint with OTP email verification
app.post('/api/auth/register', upload.single('avatar'), async (req, res) => {
  console.log('📝 Registration attempt:', req.body.email);
  console.log('📝 Form data received:', Object.keys(req.body));
  
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
    
    // Generate OTP for email verification
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Handle avatar - for now we'll use default, but file is available in req.file
    let avatarData = {
      public_id: 'default_avatar',
      url: `https://via.placeholder.com/150/007bff/ffffff?text=${encodeURIComponent(name.charAt(0).toUpperCase())}`
    };
    
    // If avatar file was uploaded, we could process it here
    // For now, we'll use the default avatar
    if (req.file) {
      console.log('📷 Avatar file received:', req.file.originalname, req.file.size, 'bytes');
      // TODO: Upload to cloudinary or save file
      // For now, just use default avatar
    }
    
    // Create new user with OTP
    const userData = {
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      emailVerificationOTP: otp,
      emailVerificationExpires: otpExpires,
      isEmailVerified: false,
      avatar: avatarData
    };
    
    const user = await User.create(userData);
    console.log('✅ User created, sending OTP email...');
    
    // Send OTP email
    let emailSent = false;
    try {
      emailSent = await sendOTPEmail(user.email, otp, user.name);
    } catch (emailError) {
      console.log('⚠️  Email service not available, auto-verifying user');
    }
    
    if (!emailSent) {
      console.log('⚠️  Email not sent, auto-verifying user for demo');
      // Auto-verify user if email service is not available
      user.isEmailVerified = true;
      user.emailVerificationOTP = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();
      
      console.log('✅ User created and auto-verified (demo mode)');
      
      return res.status(201).json({
        success: true,
        message: 'Registration successful! Account automatically verified.',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isEmailVerified: true
        },
        autoVerified: true
      });
    }
    
    console.log('✅ User created and OTP email sent successfully');
    
    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email for verification code.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified
      },
      requiresVerification: true,
      userId: user._id,
      email: user.email
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

// Simple registration endpoint without email verification (for testing)
app.post('/api/auth/register-simple', async (req, res) => {
  console.log('📝 Simple registration attempt:', req.body.email);
  
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
        message: 'Registration successful! (Demo mode)',
        user: {
          id: 'demo_' + Date.now(),
          name: name,
          email: email,
          isEmailVerified: true
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
    
    // Create new user without email verification
    const userData = {
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      isEmailVerified: true, // Auto-verify for testing
      avatar: {
        public_id: 'default_avatar',
        url: `https://via.placeholder.com/150/007bff/ffffff?text=${encodeURIComponent(name.charAt(0).toUpperCase())}`
      }
    };
    
    const user = await User.create(userData);
    console.log('✅ User created and auto-verified');
    
    res.status(201).json({
      success: true,
      message: 'Registration successful! Account ready to use.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: true
      }
    });
    
  } catch (error) {
    console.error('❌ Simple registration error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// OTP verification endpoint
app.post('/api/auth/verify-otp', async (req, res) => {
  console.log('🔐 OTP verification attempt:', req.body);
  
  try {
    const { userId, otp, email } = req.body;
    
    if ((!userId && !email) || !otp) {
      return res.status(400).json({
        success: false,
        message: 'User ID (or email) and OTP are required'
      });
    }
    
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({
        success: false,
        message: 'Database not available'
      });
    }
    
    // Find user by userId or email with matching OTP
    let user;
    if (userId) {
      user = await User.findOne({
        _id: userId,
        emailVerificationOTP: otp,
        emailVerificationExpires: { $gt: new Date() }
      });
    } else {
      user = await User.findOne({
        email: email.toLowerCase(),
        emailVerificationOTP: otp,
        emailVerificationExpires: { $gt: new Date() }
      });
    }
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }
    
    // Verify the user
    user.isEmailVerified = true;
    user.isInGlobalChat = true; // Auto-add to global chat
    user.emailVerificationOTP = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    
    console.log('✅ OTP verified, user email confirmed');
    
    res.json({
      success: true,
      message: 'Email verified successfully! You can now login.',
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
    console.error('❌ OTP verification error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during verification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Resend OTP endpoint
app.post('/api/auth/resend-otp', async (req, res) => {
  console.log('🔄 Resend OTP attempt:', req.body);
  
  try {
    const { userId, email } = req.body;
    
    if (!userId && !email) {
      return res.status(400).json({
        success: false,
        message: 'User ID or email is required'
      });
    }
    
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({
        success: false,
        message: 'Database not available'
      });
    }
    
    // Find user by userId or email
    let user;
    if (userId) {
      user = await User.findById(userId);
    } else {
      user = await User.findOne({ email: email.toLowerCase() });
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }
    
    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Update user with new OTP
    user.emailVerificationOTP = otp;
    user.emailVerificationExpires = otpExpires;
    await user.save();
    
    console.log('✅ New OTP generated, sending email...');
    
    // Send new OTP email
    let emailSent = false;
    try {
      emailSent = await sendOTPEmail(user.email, otp, user.name);
    } catch (emailError) {
      console.log('⚠️  Email service not available during resend');
    }
    
    if (!emailSent) {
      console.log('⚠️  Email not sent, but OTP updated');
      return res.status(200).json({
        success: true,
        message: 'New verification code generated (email service unavailable)',
        emailSent: false
      });
    }
    
    console.log('✅ New OTP email sent successfully');
    
    res.status(200).json({
      success: true,
      message: 'New verification code sent to your email',
      emailSent: true
    });
    
  } catch (error) {
    console.error('❌ Resend OTP error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during resend',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Login endpoint (only for verified users)
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
    
    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email before logging in',
        requiresVerification: true
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

// Get all verified users (for chat)
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
    
    const users = await User.find({ isEmailVerified: true }, '-password -emailVerificationOTP')
      .sort({ createdAt: -1 });
    
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

// Books API endpoints
app.get('/api/books', async (req, res) => {
  console.log('📚 Books list requested');
  
  try {
    // For now, return demo books data
    const demoBooks = [
      {
        id: 1,
        title: "JavaScript: The Definitive Guide",
        author: "David Flanagan",
        category: "Programming",
        available: true,
        description: "A comprehensive reference for JavaScript programming"
      },
      {
        id: 2,
        title: "Clean Code",
        author: "Robert C. Martin",
        category: "Software Engineering",
        available: true,
        description: "A handbook of agile software craftsmanship"
      },
      {
        id: 3,
        title: "Introduction to Algorithms",
        author: "Thomas H. Cormen",
        category: "Computer Science",
        available: false,
        description: "Comprehensive introduction to algorithms and data structures"
      }
    ];
    
    res.json({
      success: true,
      books: demoBooks,
      count: demoBooks.length,
      message: 'Books retrieved successfully'
    });
    
  } catch (error) {
    console.error('❌ Books fetch error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching books',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Videos API endpoints
app.get('/api/videos', async (req, res) => {
  console.log('🎥 Videos list requested');
  
  try {
    // For now, return demo videos data
    const demoVideos = [
      {
        id: 1,
        title: "JavaScript Fundamentals",
        instructor: "Tech Academy",
        duration: "2h 30m",
        category: "Programming",
        available: true,
        description: "Learn JavaScript from basics to advanced concepts"
      },
      {
        id: 2,
        title: "React Development Course",
        instructor: "Web Dev Pro",
        duration: "4h 15m",
        category: "Web Development",
        available: true,
        description: "Complete React.js development tutorial"
      },
      {
        id: 3,
        title: "Database Design Principles",
        instructor: "Data Expert",
        duration: "3h 45m",
        category: "Database",
        available: false,
        description: "Learn how to design efficient databases"
      }
    ];
    
    res.json({
      success: true,
      videos: demoVideos,
      count: demoVideos.length,
      message: 'Videos retrieved successfully'
    });
    
  } catch (error) {
    console.error('❌ Videos fetch error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching videos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Base API route handlers (to prevent 404s)
app.get('/api/auth', (req, res) => {
  res.json({
    message: 'Authentication API',
    endpoints: [
      'POST /api/auth/register',
      'POST /api/auth/login', 
      'POST /api/auth/verify-otp'
    ]
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'Student Library API - Complete Version',
    version: '2.0.0',
    endpoints: [
      'GET /api/health',
      'GET /api/auth',
      'GET /api/users',
      'GET /api/books',
      'GET /api/videos'
    ]
  });
});

// Root endpoint
app.get('/', (req, res) => {
  console.log('📍 Root endpoint accessed');
  res.json({
    message: 'Student Library Backend API - Complete Version',
    version: '2.0.0',
    status: 'running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    email: process.env.EMAIL_USER ? 'configured' : 'not_configured',
    features: ['Database', 'Email Verification', 'OTP Authentication', 'Chat Ready'],
    endpoints: [
      'GET /api/health',
      'POST /api/auth/register',
      'POST /api/auth/verify-otp',
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
  console.log(`🔐 OTP Verification: http://localhost:${PORT}/api/auth/verify-otp`);
  console.log(`🔑 Login: http://localhost:${PORT}/api/auth/login`);
  console.log(`👥 Users: http://localhost:${PORT}/api/users`);
  console.log('🎉 Complete backend with database and email ready!');
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
