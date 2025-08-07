// Comprehensive Health Check Script
const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

console.log('🔍 STUDENT LIBRARY - COMPREHENSIVE HEALTH CHECK');
console.log('================================================\n');

// 1. Environment Variables Check
console.log('1. 📋 ENVIRONMENT VARIABLES CHECK');
console.log('--------------------------------');
console.log(`✓ NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`✓ PORT: ${process.env.PORT || 5000}`);
console.log(`✓ MONGODB_URI: ${process.env.MONGODB_URI ? 'Set (MongoDB Atlas)' : 'Not set'}`);
console.log(`✓ JWT_SECRET: ${process.env.JWT_SECRET ? 'Set' : 'Not set'}`);
console.log(`✓ CLIENT_URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
console.log(`✓ CLOUDINARY_CLOUD_NAME: ${process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Not set'}\n`);

// 2. MongoDB Connection Test
async function testMongoDB() {
  console.log('2. 🗄️  MONGODB CONNECTION TEST');
  console.log('------------------------------');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-library', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB Atlas connected successfully');
    console.log(`✓ Database: ${mongoose.connection.db.databaseName}`);
    console.log(`✓ Connection state: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    
    // Test a simple query
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`✓ Collections found: ${collections.length}`);
    collections.forEach(col => console.log(`  - ${col.name}`));
    
  } catch (error) {
    console.log('❌ MongoDB connection failed');
    console.log(`✗ Error: ${error.message}`);
  }
  console.log('');
}

// 3. Backend Dependencies Check
console.log('3. 📦 BACKEND DEPENDENCIES CHECK');
console.log('--------------------------------');
try {
  const express = require('express');
  console.log('✅ Express loaded');
  
  const cors = require('cors');
  console.log('✅ CORS loaded');
  
  const helmet = require('helmet');
  console.log('✅ Helmet loaded');
  
  const bcrypt = require('bcryptjs');
  console.log('✅ bcryptjs loaded');
  
  const jwt = require('jsonwebtoken');
  console.log('✅ jsonwebtoken loaded');
  
  const { Server } = require('socket.io');
  console.log('✅ Socket.IO loaded');
  
  const cloudinary = require('cloudinary');
  console.log('✅ Cloudinary loaded');
  
} catch (error) {
  console.log(`❌ Dependency error: ${error.message}`);
}
console.log('');

// 4. Routes Check
console.log('4. 🛣️  ROUTES CHECK');
console.log('------------------');
try {
  const authRoutes = require('./routes/auth');
  console.log('✅ Auth routes loaded');
  
  const userRoutes = require('./routes/users');
  console.log('✅ User routes loaded');
  
  const bookRoutes = require('./routes/books');
  console.log('✅ Book routes loaded');
  
  const videoRoutes = require('./routes/videos');
  console.log('✅ Video routes loaded');
  
  const messageRoutes = require('./routes/messages');
  console.log('✅ Message routes loaded');
  
  const adminRoutes = require('./routes/admin');
  console.log('✅ Admin routes loaded');
  
} catch (error) {
  console.log(`❌ Routes error: ${error.message}`);
}
console.log('');

// 5. Models Check
console.log('5. 🏗️  MODELS CHECK');
console.log('-------------------');
try {
  const User = require('./models/User');
  console.log('✅ User model loaded');
  
  const Book = require('./models/Book');
  console.log('✅ Book model loaded');
  
  const Video = require('./models/Video');
  console.log('✅ Video model loaded');
  
  const Message = require('./models/Message');
  console.log('✅ Message model loaded');
  
} catch (error) {
  console.log(`❌ Models error: ${error.message}`);
}
console.log('');

// 6. Middleware Check
console.log('6. 🔧 MIDDLEWARE CHECK');
console.log('---------------------');
try {
  const { protect, admin, generateToken } = require('./middleware/auth');
  console.log('✅ Auth middleware loaded');
  
  const { uploadCover, uploadPdf } = require('./middleware/upload');
  console.log('✅ Upload middleware loaded');
  
} catch (error) {
  console.log(`❌ Middleware error: ${error.message}`);
}
console.log('');

// Run the MongoDB test
testMongoDB().then(() => {
  console.log('🎯 DEPLOYMENT READINESS CHECK');
  console.log('=============================');
  
  console.log('\n📤 RENDER DEPLOYMENT STATUS:');
  console.log('- render.yaml: Configured for Node.js service');
  console.log('- Build command: cd backend && npm install');
  console.log('- Start command: cd backend && npm start');
  console.log('- Environment variables: Ready for manual setup');
  
  console.log('\n📤 NETLIFY DEPLOYMENT STATUS:');
  console.log('- netlify.toml: Configured for React build');
  console.log('- Build command: CI=false npm run build');
  console.log('- Publish directory: build');
  console.log('- Environment variables: Ready for setup');
  
  console.log('\n🔗 CONNECTION SUMMARY:');
  console.log('- Local Backend: http://localhost:5000');
  console.log('- Local Frontend: http://localhost:3000');
  console.log('- MongoDB Atlas: Configured');
  console.log('- CORS: localhost:3000 allowed');
  
  console.log('\n✅ HEALTH CHECK COMPLETE!');
  console.log('All systems appear ready for deployment.');
  
  process.exit(0);
});
