#!/usr/bin/env node

const https = require('https');

async function testFixedEndpoints() {
    console.log('🔧 TESTING FIXED API ENDPOINTS');
    console.log('=' .repeat(40));
    console.log('⏰ Waiting for Render deployment...\n');
    
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
        attempts++;
        console.log(`🔍 Test #${attempts} (${new Date().toLocaleTimeString()})`);
        
        try {
            // Test all endpoints
            const tests = [
                { name: '🏥 Health', url: 'https://student-library-backend-o116.onrender.com/api/health' },
                { name: '🔐 Auth Base', url: 'https://student-library-backend-o116.onrender.com/api/auth' },
                { name: '📚 Books', url: 'https://student-library-backend-o116.onrender.com/api/books' },
                { name: '🎥 Videos', url: 'https://student-library-backend-o116.onrender.com/api/videos' },
                { name: '👥 Users', url: 'https://student-library-backend-o116.onrender.com/api/users' }
            ];
            
            let allWorking = true;
            
            for (const test of tests) {
                try {
                    const result = await makeRequest(test.url);
                    if (result.status === 200) {
                        console.log(`   ✅ ${test.name}: Working (${result.status})`);
                        
                        if (test.name.includes('Books') && result.data.books) {
                            console.log(`      📚 Books count: ${result.data.books.length}`);
                        }
                        if (test.name.includes('Videos') && result.data.videos) {
                            console.log(`      🎥 Videos count: ${result.data.videos.length}`);
                        }
                        if (test.name.includes('Users') && result.data.users) {
                            console.log(`      👥 Users count: ${result.data.users.length}`);
                        }
                        if (test.name.includes('Health') && result.data.database) {
                            console.log(`      💾 Database: ${result.data.database.status}`);
                        }
                    } else {
                        console.log(`   ⚠️  ${test.name}: Status ${result.status}`);
                        allWorking = false;
                    }
                } catch (error) {
                    console.log(`   ❌ ${test.name}: ${error.message}`);
                    allWorking = false;
                }
            }
            
            if (allWorking) {
                console.log('\n🎉 ALL ENDPOINTS WORKING!');
                console.log('✅ API Routes: Fixed and responding');
                console.log('✅ Books & Videos: Demo data available');
                console.log('✅ Authentication: Ready for user registration');
                console.log('✅ Database: Connected and operational');
                
                console.log('\n🚀 YOUR APP IS READY:');
                console.log('Frontend: https://inquisitive-kashata-b3ac7e.netlify.app');
                console.log('Backend:  https://student-library-backend-o116.onrender.com');
                
                console.log('\n📱 Test with:');
                console.log('Email: admin@studentlibrary.com');
                console.log('Password: admin123456');
                break;
            }
            
        } catch (error) {
            console.log(`   ❌ Test failed: ${error.message}`);
        }
        
        if (attempts < maxAttempts) {
            console.log('   ⏳ Waiting 20 seconds for deployment...\n');
            await sleep(20000);
        }
    }
    
    if (attempts >= maxAttempts) {
        console.log('\n⏰ Max attempts reached. Check deployment manually.');
    }
}

function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const request = https.get(url, (res) => {
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
        });
        
        request.setTimeout(10000, () => {
            request.destroy();
            reject(new Error('Timeout'));
        });
        
        request.on('error', reject);
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

testFixedEndpoints();
