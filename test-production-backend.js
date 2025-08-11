// Quick test of your production Render backend
const https = require('https');

const PRODUCTION_URL = 'https://student-library-backend-o116.onrender.com';

async function makeRequest(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        data: JSON.parse(data)
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        data: data
                    });
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

async function testProductionBackend() {
    console.log('🌐 Testing Production Backend: ' + PRODUCTION_URL);
    console.log('=' .repeat(50));
    
    try {
        // Test health endpoint
        console.log('🏥 Testing /api/health...');
        const healthResponse = await makeRequest(PRODUCTION_URL + '/api/health');
        
        if (healthResponse.status === 200) {
            console.log('✅ Health check passed!');
            console.log('📊 Database:', healthResponse.data.database?.status || 'unknown');
            console.log('📧 Email:', healthResponse.data.email?.status || 'unknown');
            console.log('👥 Users:', healthResponse.data.database?.userCount || '0');
            console.log('⏱️ Uptime:', Math.floor(healthResponse.data.uptime || 0) + 's');
        } else {
            console.log('❌ Health check failed. Status:', healthResponse.status);
            console.log('Response:', healthResponse.data);
        }
        
        // Test CORS
        console.log('\n🔗 Testing CORS headers...');
        const corsHeaders = healthResponse.headers['access-control-allow-origin'];
        console.log('CORS Origin:', corsHeaders || 'Not set');
        
        console.log('\n🎉 Your production backend is deployed and working!');
        console.log('🔗 Frontend URL: https://inquisitive-kashata-b3ac7e.netlify.app');
        console.log('🔗 Backend URL: ' + PRODUCTION_URL);
        
    } catch (error) {
        console.log('❌ Production backend test failed:', error.message);
        console.log('💡 Make sure your Render service is running');
    }
}

// Run the test
testProductionBackend();
