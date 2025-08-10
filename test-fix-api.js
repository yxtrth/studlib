// Test the API endpoint
const https = require('https');

const makeRequest = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
};

async function testAPI() {
  try {
    console.log('🔐 Testing login...');
    
    const loginData = await makeRequest('https://student-library-backend-o116.onrender.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@studentlibrary.com',
        password: 'admin123'
      })
    });

    if (loginData.success) {
      console.log('✅ Login successful');
      console.log('🔧 Calling fix-urls...');
      
      const fixData = await makeRequest('https://student-library-backend-o116.onrender.com/api/admin/fix-urls', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📊 Fix URLs result:', fixData);
    } else {
      console.log('❌ Login failed:', loginData);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAPI();
