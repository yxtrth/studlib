const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

console.log('✓ Dependencies loaded successfully');

let app, server;

// Import routes
try {
  const authRoutes = require('./routes/auth');
  console.log('✓ Auth routes loaded');
  const userRoutes = require('./routes/users');
  console.log('✓ User routes loaded');
  const bookRoutes = require('./routes/books');
  console.log('✓ Book routes loaded');
  const videoRoutes = require('./routes/videos');
  console.log('✓ Video routes loaded');
  const messageRoutes = require('./routes/messages');
  console.log('✓ Message routes loaded');
  const adminRoutes = require('./routes/admin');
  console.log('✓ Admin routes loaded');
  
  app = express();
  server = createServer(app);
  console.log('✓ Express app and HTTP server created');

  // CORS origins configuration - used for both Socket.IO and Express
  const allowedOrigins = [
    'http://localhost:3000',
    'https://inquisitive-kashata-b3ac7e.netlify.app', // Main production URL
    process.env.CLIENT_URL,
    'http://localhost:5173',  // Added for local development with Vite
    'http://127.0.0.1:5500', // Added for VS Code Live Server
    'http://localhost:5500'  // Added for VS Code Live Server alternative URL
  ].filter(Boolean);

  // Helper function to check if origin matches any allowed patterns
  const isOriginAllowed = (origin) => {
    if (!origin) return true;
    
    // Check exact matches first
    if (allowedOrigins.includes(origin)) return true;
    
    // Check if it's any Netlify preview URL for your domain
    const netlifyPreviewPattern = /^https:\/\/[a-zA-Z0-9-]+--inquisitive-kashata-b3ac7e\.netlify\.app$/;
    if (netlifyPreviewPattern.test(origin)) {
      console.log('✓ Allowed Netlify preview URL:', origin);
      return true;
    }
    
    // Also allow the main Netlify domain without preview prefix
    const netlifyMainPattern = /^https:\/\/inquisitive-kashata-b3ac7e\.netlify\.app$/;
    if (netlifyMainPattern.test(origin)) {
      console.log('✓ Allowed main Netlify URL:', origin);
      return true;
    }
    
    console.log('✗ Origin not allowed:', origin);
    return false;
  };

  // Socket.IO setup
  const io = new Server(server, {
    cors: {
      origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps)
        if (!origin) return callback(null, true);
        
        if (isOriginAllowed(origin)) {
          callback(null, true);
        } else {
          console.log('Socket.IO CORS blocked origin:', origin);
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ["GET", "POST"],
      credentials: true
    }
  });
  console.log('✓ Socket.IO configured with dynamic CORS checking');

  // Middleware
  app.use(helmet());
  app.use(morgan('combined'));
  
  // CORS configuration using the shared allowedOrigins
  app.use(cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }));
  console.log('✓ Security middleware configured with origins:', allowedOrigins);

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  });
  app.use('/api/', limiter);

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  console.log('✓ Body parsing middleware configured');

  // MongoDB connection with graceful fallback
  console.log('Attempting to connect to MongoDB...');

  const connectDB = async () => {
    try {
      console.log('Connecting to MongoDB URI:', process.env.MONGODB_URI || 'mongodb://localhost:27017/student-library');
      
      // Check if MongoDB service is running
      const { exec } = require('child_process');
      exec('sc query MongoDB', (error, stdout, stderr) => {
        if (error) {
          console.log('⚠️ MongoDB service status check failed. Make sure MongoDB is installed.');
        } else {
          console.log('MongoDB service status:', stdout);
        }
      });
      
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-library', {
        serverSelectionTimeoutMS: 5000 // 5 second timeout
      });
      
      console.log('✓ MongoDB connected successfully');
      return true;
    } catch (err) {
      console.error('✗ MongoDB connection error:', err.message);
      console.log('📝 Note: The server will continue running, but database features will not work');
      console.log('📝 To fix this:');
      console.log('   1. Install MongoDB locally, or');
      console.log('   2. Use MongoDB Atlas (cloud), or');
      console.log('   3. Run setup-mongodb.bat for help');
      return false;
    }
  };

  // Connect to database (non-blocking)
  connectDB();

  // Socket.IO connection handling
  const activeUsers = new Map();

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // User joins with their ID
    socket.on('join', (userId) => {
      activeUsers.set(userId, socket.id);
      socket.userId = userId;
      socket.broadcast.emit('userOnline', userId);
    });

    // Handle private messages
    socket.on('sendMessage', (data) => {
      const { receiverId, message, senderId } = data;
      const receiverSocketId = activeUsers.get(receiverId);
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('newMessage', {
          senderId,
          message,
          timestamp: new Date()
        });
      }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      const { receiverId, isTyping } = data;
      const receiverSocketId = activeUsers.get(receiverId);
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('userTyping', {
          userId: socket.userId,
          isTyping
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      if (socket.userId) {
        activeUsers.delete(socket.userId);
        socket.broadcast.emit('userOffline', socket.userId);
      }
      console.log('User disconnected:', socket.id);
    });
  });
  console.log('✓ Socket.IO event handlers configured');

  // Make io accessible to routes
  app.set('io', io);

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/books', bookRoutes);
  app.use('/api/videos', videoRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/admin', adminRoutes);
  console.log('✓ All routes configured');

  // Health check
  app.get('/api/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      database: dbStatus,
      message: 'Backend server is running!'
    });
  });

  // Test route
  app.get('/api/test', (req, res) => {
    res.json({ 
      message: 'Backend API is working!',
      database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
      message: 'Something went wrong!', 
      error: process.env.NODE_ENV === 'production' ? {} : err.stack 
    });
  });

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });

  const PORT = process.env.PORT || 8080;

  server.listen(PORT, () => {
    console.log(`✓ Server running on port ${PORT}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('✓ Student Library Backend Server is ready!');
  });

} catch (error) {
  console.error('✗ Error starting server:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}

// Export app for testing purposes
module.exports = app;
