// Minimal working server for Student Library
console.log('🚀 Starting minimal Student Library server...');

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 5003;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://inquisitive-kashata-b3ac7e.netlify.app',
    'http://localhost:5173',
    'http://127.0.0.1:5500'
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Health endpoint
app.get('/api/health', (req, res) => {
  console.log('✅ Health check requested');
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    message: 'Student Library Backend is running'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  console.log('📍 Root endpoint accessed');
  res.json({
    message: 'Student Library Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: [
      'GET /api/health',
      'POST /api/auth/register',
      'POST /api/auth/login'
    ]
  });
});

// Basic registration endpoint (without database for now)
app.post('/api/auth/register', (req, res) => {
  console.log('📝 Registration attempt:', req.body.email);
  
  const { name, email, password } = req.body;
  
  // Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and password are required'
    });
  }
  
  // Simulate successful registration
  res.status(201).json({
    success: true,
    message: 'Registration successful! (Demo mode - no database)',
    user: {
      id: 'demo_' + Date.now(),
      name: name,
      email: email
    }
  });
});

// Basic login endpoint
app.post('/api/auth/login', (req, res) => {
  console.log('🔐 Login attempt:', req.body.email);
  
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }
  
  // Simulate successful login
  res.json({
    success: true,
    message: 'Login successful! (Demo mode)',
    token: 'demo_token_' + Date.now(),
    user: {
      id: 'demo_user',
      name: 'Demo User',
      email: email
    }
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
  console.log('🎉 Minimal server ready for connections!');
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    console.log('💡 Try a different port or kill the existing process');
  } else {
    console.error('❌ Server error:', error.message);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
