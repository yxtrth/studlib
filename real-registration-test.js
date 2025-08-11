#!/usr/bin/env node

// Simple registration test with detailed logging
const https = require('https');

async function testRealRegistration() {
    console.log('🔍 TESTING REAL REGISTRATION');
    console.log('=' .repeat(40));
    
    // Create a unique test user
    const testEmail = `testuser${Date.now()}@example.com`;
    const testUser = {
        name: 'Real Test User',
        email: testEmail,
        password: 'password123',
        confirmPassword: 'password123'
    };
    
    console.log('📝 Attempting registration with:');
    console.log('   Name:', testUser.name);
    console.log('   Email:', testUser.email);
    console.log('   Password length:', testUser.password.length);
    console.log('');
    
    try {
        const result = await makePostRequest(
            'https://student-library-backend-o116.onrender.com/api/auth/register',
            testUser
        );
        
        console.log('📊 REGISTRATION RESULT:');
        console.log('   Status Code:', result.status);
        console.log('   Response:', JSON.stringify(result.data, null, 2));
        
        if (result.status === 200 || result.status === 201) {
            console.log('');
            console.log('✅ SUCCESS! Registration worked!');
            
            // Test with same email to see duplicate handling
            console.log('\n🔄 Testing duplicate email...');
            const duplicateTest = await makePostRequest(
                'https://student-library-backend-o116.onrender.com/api/auth/register',
                testUser
            );
            console.log('   Duplicate Status:', duplicateTest.status);
            console.log('   Duplicate Response:', JSON.stringify(duplicateTest.data, null, 2));
            
        } else if (result.status === 400) {
            console.log('');
            console.log('❌ VALIDATION ERROR - This is what we need to fix!');
            console.log('   The backend is rejecting the request');
            console.log('   Error message:', result.data?.message);
        } else if (result.status === 500) {
            console.log('');
            console.log('❌ SERVER ERROR - Backend issue');
            console.log('   Error message:', result.data?.message);
        }
        
    } catch (error) {
        console.log('❌ REQUEST FAILED:', error.message);
    }
}

function makePostRequest(url, data) {
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
                'User-Agent': 'Student-Library-Test/1.0',
                'Accept': 'application/json',
                'Origin': 'https://inquisitive-kashata-b3ac7e.netlify.app'
            }
        };
        
        console.log('🌐 Making request to:', url);
        console.log('📤 Sending data:', JSON.stringify(data, null, 2));
        
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
        
        req.setTimeout(15000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
        
        req.on('error', (error) => {
            reject(new Error(`Request failed: ${error.message}`));
        });
        
        req.write(postData);
        req.end();
    });
}

testRealRegistration();
