const fetch = require('node-fetch');

async function testBackendEndpoints() {
    console.log('🌐 TESTING BACKEND ENDPOINTS');
    console.log('============================');
    
    const baseURL = 'https://student-library-backend-o116.onrender.com';
    
    const endpoints = [
        '/api/books',
        '/api/videos', 
        '/api/auth/login',
        '/'
    ];
    
    for (const endpoint of endpoints) {
        try {
            console.log(`\n📡 Testing: ${baseURL}${endpoint}`);
            const response = await fetch(`${baseURL}${endpoint}`, {
                method: endpoint === '/api/auth/login' ? 'POST' : 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: endpoint === '/api/auth/login' ? JSON.stringify({
                    email: 'admin@studentlibrary.com',
                    password: 'admin123'
                }) : undefined
            });
            
            console.log(`   Status: ${response.status} ${response.statusText}`);
            
            if (endpoint === '/api/books' || endpoint === '/api/videos') {
                if (response.ok) {
                    const data = await response.json();
                    console.log(`   Data count: ${Array.isArray(data) ? data.length : 'Not an array'}`);
                }
            }
            
            if (endpoint === '/api/auth/login') {
                if (response.ok) {
                    console.log('   ✅ Login successful!');
                } else {
                    const errorText = await response.text();
                    console.log(`   ❌ Login failed: ${errorText}`);
                }
            }
            
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
    }
}

testBackendEndpoints();
