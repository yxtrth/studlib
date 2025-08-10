const express = require('express');
const cors = require('cors');
const { body, validationResult } = require('express-validator');

const app = express();

// Enable CORS
app.use(cors());
app.use(express.json());

// Simple registration endpoint with detailed error logging
app.post('/api/auth/register', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
], async (req, res) => {
  try {
    console.log('📝 Registration request received:');
    console.log('Body:', req.body);
    console.log('Headers:', req.headers);
    
    // Check for validation errors
    const errors = validationResult(req);
    console.log('Validation errors:', errors.array());
    
    if (!errors.isEmpty()) {
      console.log('❌ Validation failed:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
        receivedData: req.body
      });
    }

    const { name, email, password } = req.body;
    console.log('✅ Validation passed for:', { name, email, passwordLength: password?.length });

    // For testing, just return success without database
    res.status(201).json({
      success: true,
      message: 'Registration validation successful (test mode)',
      user: {
        name,
        email,
        id: 'test-id-' + Date.now()
      },
      debug: {
        receivedFields: Object.keys(req.body),
        nameLength: name?.length,
        emailFormat: email,
        passwordLength: password?.length
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during registration',
      error: error.message 
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Registration test server is running!'
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Registration test server working!',
    endpoints: ['/api/health', '/api/auth/register']
  });
});

const PORT = 5003;

app.listen(PORT, () => {
  console.log(`🚀 Registration test server running on port ${PORT}`);
  console.log(`📋 Test endpoints:`);
  console.log(`   GET  /api/health - Health check`);
  console.log(`   GET  /api/test - Test endpoint`);
  console.log(`   POST /api/auth/register - Registration test`);
  console.log(`\n🧪 Test with:`);
  console.log(`   curl -X POST http://localhost:${PORT}/api/auth/register -H "Content-Type: application/json" -d '{"name":"Test User","email":"test@example.com","password":"password123"}'`);
});
