// Enhanced server starter with detailed error logging
console.log('🚀 Starting Student Library Backend...');

// Load environment variables first
require('dotenv').config();
console.log('✅ Environment variables loaded');

// Test basic dependencies
try {
  const express = require('express');
  console.log('✅ Express loaded');
  
  const mongoose = require('mongoose');
  console.log('✅ Mongoose loaded');
  
  const cors = require('cors');
  console.log('✅ CORS loaded');
  
} catch (error) {
  console.error('❌ Dependency loading failed:', error.message);
  process.exit(1);
}

// Test database connection
console.log('🔍 Testing database connection...');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Database connected successfully');
    startMainServer();
  })
  .catch(error => {
    console.error('❌ Database connection failed:', error.message);
    console.log('⚠️  Starting server without database...');
    startMainServer();
  });

function startMainServer() {
  try {
    console.log('🏗️  Loading main server...');
    require('./server.js');
  } catch (error) {
    console.error('❌ Server startup failed:', error.message);
    console.error('Stack trace:', error.stack);
    
    // Try starting a minimal server instead
    console.log('🔄 Starting minimal fallback server...');
    startFallbackServer();
  }
}

function startFallbackServer() {
  const express = require('express');
  const cors = require('cors');
  
  const app = express();
  app.use(cors());
  app.use(express.json());
  
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'OK',
      message: 'Fallback server running',
      timestamp: new Date().toISOString()
    });
  });
  
  app.get('/', (req, res) => {
    res.json({
      message: 'Student Library Fallback Server',
      status: 'Main server failed, running fallback'
    });
  });
  
  const PORT = process.env.PORT || 5003;
  app.listen(PORT, () => {
    console.log(`🆘 Fallback server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  });
}
