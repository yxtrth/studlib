// Simple test server to check basic connectivity
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5003;

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// Basic health check
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Simple test server is running'
  });
});

// Basic test endpoint
app.get('/api/test', (req, res) => {
  console.log('Test endpoint requested');
  res.json({
    message: 'Test endpoint working',
    server: 'Simple test server'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  console.log('Root endpoint requested');
  res.json({
    message: 'Student Library Test Server',
    endpoints: [
      'GET /api/health',
      'GET /api/test'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Simple test server running on http://localhost:${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log('✅ Server is ready for connections');
});

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
});
