// Call admin endpoint to fix URLs
async function fixUrls() {
  try {
    // Login as admin first
    const loginResponse = await fetch('https://student-library-backend-o116.onrender.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@studentlibrary.com',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      console.error('❌ Login failed:', loginData.message);
      return;
    }

    console.log('✅ Admin login successful');
    const token = loginData.token;

    // Call fix-urls endpoint
    console.log('🔧 Calling fix-urls endpoint...');
    const fixResponse = await fetch('https://student-library-backend-o116.onrender.com/api/admin/fix-urls', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    const fixData = await fixResponse.json();
    
    if (fixData.success) {
      console.log('✅ URLs fixed successfully!');
      console.log(`📖 Updated ${fixData.bookUpdates} books`);
      console.log(`🎬 Updated ${fixData.videoUpdates} videos`);
    } else {
      console.error('❌ Fix failed:', fixData.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixUrls();
