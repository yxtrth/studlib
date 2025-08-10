// Simple test to call the fix-urls endpoint
const https = require('https');

console.log('🔧 Testing fix-urls endpoint...');

const postData = JSON.stringify({});

const options = {
  hostname: 'student-library-backend-o116.onrender.com',
  port: 443,
  path: '/api/admin/fix-urls',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('📊 Response:', result);
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Error:', e.message);
});

req.write(postData);
req.end();
