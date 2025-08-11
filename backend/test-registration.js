const http = require('http');

console.log('🧪 Testing registration endpoint...');

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
  console.log(`✅ Registration Status: ${res.statusCode} ${res.statusMessage}`);
  console.log(`📋 Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log(`📄 Registration Response:`, response);
      
      if (res.statusCode === 201 && response.success) {
        console.log('🎉 REGISTRATION TEST PASSED!');
        console.log('✅ Backend is working correctly for user registration');
      } else {
        console.log('⚠️ Registration returned unexpected result');
      }
    } catch (e) {
      console.log(`📄 Raw response:`, data);
    }
  });
});

req.on('error', (error) => {
  console.log(`❌ Registration test failed: ${error.message}`);
});

req.on('timeout', () => {
  console.log(`⏰ Registration request timeout`);
  req.destroy();
});

req.write(testData);
req.end();
