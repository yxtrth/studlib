const http = require('http');

console.log('🧪 Testing backend connectivity...');

const testEndpoint = (path, description) => {
  return new Promise((resolve) => {
    console.log(`\n📡 Testing: ${description} (${path})`);
    
    const options = {
      hostname: 'localhost',
      port: 5003,
      path: path,
      method: 'GET',
      timeout: 5000,
      headers: {
        'User-Agent': 'Backend-Test-Script'
      }
    };

    const req = http.request(options, (res) => {
      console.log(`✅ Status: ${res.statusCode} ${res.statusMessage}`);
      console.log(`📋 Headers:`, res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log(`📄 Response:`, jsonData);
          resolve({ success: true, status: res.statusCode, data: jsonData });
        } catch (e) {
          console.log(`📄 Raw response:`, data);
          resolve({ success: true, status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Connection failed: ${error.message}`);
      console.log(`💡 Error code: ${error.code}`);
      resolve({ success: false, error: error.message, code: error.code });
    });

    req.on('timeout', () => {
      console.log(`⏰ Request timeout (5 seconds)`);
      req.destroy();
      resolve({ success: false, error: 'timeout' });
    });

    req.end();
  });
};

const runTests = async () => {
  console.log('🚀 Starting backend connectivity tests...\n');
  
  // Test 1: Health endpoint
  const healthResult = await testEndpoint('/api/health', 'Health Endpoint');
  
  // Test 2: Test endpoint
  const testResult = await testEndpoint('/api/test', 'Test Endpoint');
  
  // Test 3: Root endpoint
  const rootResult = await testEndpoint('/', 'Root Endpoint');
  
  // Summary
  console.log('\n📊 TEST SUMMARY:');
  console.log('================');
  console.log(`Health Endpoint: ${healthResult.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Test Endpoint: ${testResult.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Root Endpoint: ${rootResult.success ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = healthResult.success && testResult.success && rootResult.success;
  
  if (allPassed) {
    console.log('\n🎉 ALL TESTS PASSED! Backend is reachable and working.');
    console.log('💡 You can now access:');
    console.log('   - http://localhost:5003/api/health');
    console.log('   - http://localhost:5003/api/test');
    console.log('   - http://localhost:5003/');
  } else {
    console.log('\n⚠️  SOME TESTS FAILED! Check the errors above.');
    console.log('💡 Troubleshooting:');
    console.log('   1. Make sure the server is running');
    console.log('   2. Check if port 5003 is available');
    console.log('   3. Verify firewall settings');
  }
};

runTests().catch(console.error);
