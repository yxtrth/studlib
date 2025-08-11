const http = require('http');

console.log('🧪 Testing database endpoints...');

async function makeRequest(options, data = null) {
  return new Promise((resolve) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ error: error.message });
    });

    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function testDatabaseEndpoints() {
  console.log('\n🏥 Testing health with database status...');
  
  const healthResult = await makeRequest({
    hostname: 'localhost',
    port: 5003,
    path: '/api/health',
    method: 'GET'
  });
  
  if (healthResult.status === 200) {
    console.log('✅ Health endpoint working');
    console.log('📊 Database status:', healthResult.data.database.status);
    console.log('👥 User count:', healthResult.data.database.userCount || 0);
  } else {
    console.log('❌ Health endpoint failed');
  }
  
  console.log('\n📝 Testing registration with database...');
  
  const regData = JSON.stringify({
    name: 'Database Test User',
    email: `dbtest${Date.now()}@example.com`,
    password: 'testpassword123'
  });
  
  const regResult = await makeRequest({
    hostname: 'localhost',
    port: 5003,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(regData)
    }
  }, regData);
  
  if (regResult.status === 201 && regResult.data.success) {
    console.log('✅ Registration successful!');
    console.log('👤 User ID:', regResult.data.user.id);
    console.log('📧 Email:', regResult.data.user.email);
    console.log('🖼️ Avatar:', regResult.data.user.avatar?.url);
    
    if (regResult.data.demoMode) {
      console.log('⚠️ Running in demo mode (no database)');
    } else {
      console.log('✅ User saved to database!');
      
      // Test login with the registered user
      console.log('\n🔐 Testing login with registered user...');
      
      const loginData = JSON.stringify({
        email: regResult.data.user.email,
        password: 'testpassword123'
      });
      
      const loginResult = await makeRequest({
        hostname: 'localhost',
        port: 5003,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(loginData)
        }
      }, loginData);
      
      if (loginResult.status === 200 && loginResult.data.success) {
        console.log('✅ Login successful!');
        console.log('🎫 Token received:', loginResult.data.token ? 'Yes' : 'No');
        console.log('👤 User data:', loginResult.data.user.name);
      } else {
        console.log('❌ Login failed:', loginResult.data.message);
      }
    }
  } else {
    console.log('❌ Registration failed:', regResult.data?.message || 'Unknown error');
  }
  
  console.log('\n👥 Testing users endpoint...');
  
  const usersResult = await makeRequest({
    hostname: 'localhost',
    port: 5003,
    path: '/api/users',
    method: 'GET'
  });
  
  if (usersResult.status === 200) {
    console.log('✅ Users endpoint working');
    console.log('📊 Total users:', usersResult.data.count);
    if (usersResult.data.demoMode) {
      console.log('⚠️ Demo mode - no real users');
    } else {
      console.log('👥 Users in database:', usersResult.data.users.length);
    }
  } else {
    console.log('❌ Users endpoint failed');
  }
  
  console.log('\n🎯 DATABASE TESTING COMPLETE!');
  console.log('=====================================');
}

testDatabaseEndpoints().catch(console.error);
