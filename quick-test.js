#!/usr/bin/env node

// Quick test to check if the registration is working now
const https = require('https');

async function quickRegistrationTest() {
    console.log('🚀 QUICK REGISTRATION TEST');
    console.log('=' .repeat(30));
    
    // Test with JSON first to see if basic registration works
    const testUser = {
        name: 'Quick Test User',
        email: `quicktest${Date.now()}@example.com`,
        password: 'quicktest123'
    };
    
    console.log('📝 Testing JSON registration...');
    
    try {
        const result = await makeJSONRequest(
            'https://student-library-backend-o116.onrender.com/api/auth/register',
            testUser
        );
        
        console.log('Status:', result.status);
        console.log('Response:', JSON.stringify(result.data, null, 2));
        
        if (result.status === 200 || result.status === 201) {
            console.log('\n✅ JSON registration works!');
        } else {
            console.log('\n❌ Issue with registration');
        }
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
    }
}

function makeJSONRequest(url, data) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(data);
        const urlObj = new URL(url);
        
        const options = {
            hostname: urlObj.hostname,
            port: 443,
            path: urlObj.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'Origin': 'https://inquisitive-kashata-b3ac7e.netlify.app'
            }
        };
        
        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => responseData += chunk);
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(responseData);
                    resolve({
                        status: res.statusCode,
                        data: parsedData
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: responseData
                    });
                }
            });
        });
        
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
        
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

quickRegistrationTest();
