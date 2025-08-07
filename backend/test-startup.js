// Test if server can start without errors
console.log('🚀 Testing backend server startup...');

try {
  // Test basic requires
  console.log('1. Testing basic requires...');
  const express = require('express');
  const mongoose = require('mongoose');
  require('dotenv').config();
  console.log('✓ Basic requires successful');

  // Test route requires
  console.log('2. Testing route requires...');
  const authRoutes = require('./routes/auth');
  const userRoutes = require('./routes/users');
  const bookRoutes = require('./routes/books');
  const videoRoutes = require('./routes/videos');
  const messageRoutes = require('./routes/messages');
  const adminRoutes = require('./routes/admin');
  console.log('✓ All routes loaded successfully');

  // Test middleware requires
  console.log('3. Testing middleware requires...');
  const { protect, admin, generateToken } = require('./middleware/auth');
  console.log('✓ Auth middleware loaded successfully');

  console.log('🎉 ALL TESTS PASSED! Server should start successfully.');
  console.log('Try running: npm run dev');

} catch (error) {
  console.error('❌ ERROR FOUND:', error.message);
  console.error('Stack:', error.stack);
}
