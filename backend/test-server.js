// Simple test to identify the issue
console.log('Starting test...');

try {
  const express = require('express');
  console.log('✓ Express loaded');
  
  const mongoose = require('mongoose');
  console.log('✓ Mongoose loaded');
  
  require('dotenv').config();
  console.log('✓ Environment variables loaded');
  
  const app = express();
  console.log('✓ Express app created');
  
  // Test basic middleware
  app.use(express.json());
  console.log('✓ Basic middleware configured');
  
  // Test route
  app.get('/test', (req, res) => {
    res.json({ message: 'Test successful!' });
  });
  console.log('✓ Test route configured');
  
  // Start server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✓ Test server running on port ${PORT}`);
  });
  
} catch (error) {
  console.error('✗ Error occurred:', error);
  console.error('Stack trace:', error.stack);
}
