// Simple test to verify login endpoint is working
async function testLoginEndpoint() {
    console.log('🧪 TESTING LOGIN ENDPOINT');
    console.log('=========================');
    
    const apiUrl = 'https://student-library-backend-o116.onrender.com/api/auth/login';
    
    const loginData = {
        email: 'admin@studentlibrary.com',
        password: 'admin123'
    };
    
    console.log('📡 Making login request...');
    console.log('URL:', apiUrl);
    console.log('Data:', JSON.stringify(loginData, null, 2));
    
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(loginData)
        });
        
        console.log('\n📊 RESPONSE:');
        console.log('Status:', response.status, response.statusText);
        console.log('Headers:', Object.fromEntries(response.headers.entries()));
        
        const responseText = await response.text();
        console.log('Body:', responseText);
        
        if (response.ok) {
            console.log('\n✅ LOGIN SUCCESSFUL!');
            try {
                const jsonData = JSON.parse(responseText);
                console.log('Token received:', jsonData.token ? 'YES' : 'NO');
                console.log('User data:', jsonData.user ? 'YES' : 'NO');
            } catch (e) {
                console.log('Response is not JSON');
            }
        } else {
            console.log('\n❌ LOGIN FAILED');
            console.log('This explains the 401 error in your React app');
        }
        
    } catch (error) {
        console.log('\n💥 NETWORK ERROR:', error.message);
        console.log('This indicates a connection problem to your backend');
    }
}

// Test if fetch is available (Node.js might need node-fetch)
if (typeof fetch === 'undefined') {
    console.log('Installing node-fetch...');
    global.fetch = require('node-fetch');
}

testLoginEndpoint();
