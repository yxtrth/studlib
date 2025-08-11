#!/usr/bin/env node

const https = require('https');

async function checkRenderEnvironment() {
    console.log('🔧 Checking Render Environment Variables...');
    console.log('=' .repeat(50));
    
    try {
        console.log('📡 Testing production backend...');
        
        // Test basic health
        const healthResponse = await makeRequest('https://student-library-backend-o116.onrender.com/api/health');
        console.log('✅ Backend Response Status:', healthResponse.status);
        
        if (healthResponse.data) {
            const data = healthResponse.data;
            console.log('\n📊 Backend Health Details:');
            console.log('🏥 Status:', data.status);
            console.log('⏰ Uptime:', Math.floor(data.uptime / 60), 'minutes');
            console.log('🌍 Environment:', data.environment);
            
            if (data.database) {
                console.log('\n💾 Database Status:');
                console.log('🔗 Status:', data.database.status);
                console.log('🏠 Host:', data.database.host || 'unknown');
                console.log('📂 Database Name:', data.database.name || 'unknown');
                console.log('👥 User Count:', data.database.userCount || '0');
                
                if (data.database.status !== 'connected') {
                    console.log('❌ Database connection issue on Render!');
                    console.log('💡 Possible causes:');
                    console.log('   1. MONGODB_URI environment variable not set correctly');
                    console.log('   2. Database name missing from connection string');
                    console.log('   3. IP whitelist issue on MongoDB Atlas');
                }
            }
            
            if (data.email) {
                console.log('\n📧 Email Status:');
                console.log('📮 Status:', data.email.status);
                console.log('👤 User:', data.email.user || 'not_set');
            }
        }
        
        // Test database endpoint specifically
        console.log('\n🧪 Testing database endpoint...');
        try {
            const dbTest = await makeRequest('https://student-library-backend-o116.onrender.com/api/auth/test-db');
            console.log('📊 Database test response:', dbTest.status);
            if (dbTest.data) {
                console.log('📝 Response data:', JSON.stringify(dbTest.data, null, 2));
            }
        } catch (dbError) {
            console.log('❌ Database test failed:', dbError.message);
        }
        
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

function makeRequest(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        data: JSON.parse(data)
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: data
                    });
                }
            });
        }).on('error', reject);
    });
}

checkRenderEnvironment();
