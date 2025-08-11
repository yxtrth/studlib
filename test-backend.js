const http = require('http');

// Test the backend server
const testBackend = () => {
  console.log('🧪 Testing backend server...');
  
  const options = {
    hostname: 'localhost',
    port: 5003,
    path: '/api/health',
    method: 'GET',
    timeout: 5000
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Backend responded with status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('📊 Backend response:', response);
        
        if (response.status === 'OK') {
          console.log('🎉 Backend is running correctly!');
          testRegistration();
        } else {
          console.log('⚠️ Backend responded but status is not OK');
        }
      } catch (e) {
        console.log('📄 Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Backend connection failed:', error.message);
    console.log('💡 Make sure to start the backend server first:');
    console.log('   cd backend && npm start');
  });

  req.on('timeout', () => {
    console.error('⏰ Request timeout - backend may not be running');
    req.destroy();
  });

  req.end();
};

// Test registration endpoint
const testRegistration = () => {
  console.log('\n🧪 Testing registration endpoint...');
  
  const testData = JSON.stringify({
    name: 'Test User',
    email: 'test@example.com',
    password: 'testpassword123'
  });

  const options = {
    hostname: 'localhost',
    port: 5003,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(testData)
    },
    timeout: 10000
  };

  const req = http.request(options, (res) => {
    console.log(`📝 Registration endpoint status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('📋 Registration response:', response);
        
        if (res.statusCode === 201) {
          console.log('✅ Registration endpoint works correctly!');
        } else if (res.statusCode === 400 && response.message?.includes('already exists')) {
          console.log('✅ Registration endpoint works (user already exists)');
        } else {
          console.log('⚠️ Registration endpoint returned unexpected response');
        }
      } catch (e) {
        console.log('📄 Raw registration response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Registration test failed:', error.message);
  });

  req.on('timeout', () => {
    console.error('⏰ Registration request timeout');
    req.destroy();
  });

  req.write(testData);
  req.end();
};

// Start testing
console.log('🚀 Starting backend tests...');
testBackend();
