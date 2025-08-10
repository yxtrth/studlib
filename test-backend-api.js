// Test your backend API directly
// Replace YOUR_BACKEND_URL with your actual backend URL

const testBackendAPI = async () => {
  const BACKEND_URL = "YOUR_BACKEND_URL"; // e.g., "https://your-app.herokuapp.com"
  
  try {
    console.log('🔍 Testing backend API...');
    
    // Test 1: Check if backend is alive
    const healthCheck = await fetch(`${BACKEND_URL}/api/auth/me`);
    console.log(`Health check status: ${healthCheck.status}`);
    
    // Test 2: Try login
    const loginResponse = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@studentlibrary.com',
        password: 'admin123456'
      })
    });
    
    const loginResult = await loginResponse.json();
    console.log('Login response:', loginResult);
    
    if (loginResponse.ok) {
      console.log('✅ Backend login works!');
    } else {
      console.log('❌ Backend login failed:', loginResult.message);
    }
    
  } catch (error) {
    console.log('❌ Backend connection failed:', error.message);
  }
};

// Run in browser console
testBackendAPI();
