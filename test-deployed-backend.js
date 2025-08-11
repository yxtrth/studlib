#!/usr/bin/env node

const https = require('https');

async function testDeployedBackend() {
    console.log('🔍 TESTING DEPLOYED BACKEND');
    console.log('=' .repeat(50));
    
    try {
        // Test different endpoints to see what's actually deployed
        console.log('\n🔌 1. TESTING BASIC ENDPOINTS');
        console.log('-'.repeat(35));
        
        // Test health endpoint
        console.log('❤️ Testing health endpoint...');
        const healthTest = await makeRequest('https://student-library-backend-o116.onrender.com/api/health');
        console.log(`   Status: ${healthTest.status}`);
        console.log(`   Response: ${JSON.stringify(healthTest.data, null, 2)}`);
        
        // Test auth base endpoint
        console.log('\n🔑 Testing auth base endpoint...');
        const authTest = await makeRequest('https://student-library-backend-o116.onrender.com/api/auth');
        console.log(`   Status: ${authTest.status}`);
        console.log(`   Response: ${JSON.stringify(authTest.data, null, 2)}`);
        
        // Test register endpoint with GET (should return 405 Method Not Allowed)
        console.log('\n📝 Testing register endpoint with GET...');
        const registerGetTest = await makeRequest('https://student-library-backend-o116.onrender.com/api/auth/register');
        console.log(`   Status: ${registerGetTest.status}`);
        console.log(`   Response: ${JSON.stringify(registerGetTest.data, null, 2)}`);
        
        // Test login endpoint with GET
        console.log('\n🔑 Testing login endpoint with GET...');
        const loginGetTest = await makeRequest('https://student-library-backend-o116.onrender.com/api/auth/login');
        console.log(`   Status: ${loginGetTest.status}`);
        console.log(`   Response: ${JSON.stringify(loginGetTest.data, null, 2)}`);
        
    } catch (error) {
        console.log('❌ Test error:', error.message);
    }
    
    console.log('\n🔍 2. TESTING POST REQUESTS');
    console.log('-'.repeat(35));
    
    try {
        // Test register with POST and empty body
        console.log('📝 Testing register POST with empty body...');
        const registerPostTest = await makePostRequest(
            'https://student-library-backend-o116.onrender.com/api/auth/register',
            {}
        );
        console.log(`   Status: ${registerPostTest.status}`);
        console.log(`   Response: ${JSON.stringify(registerPostTest.data, null, 2)}`);
        
        // Test login with POST and empty body
        console.log('\n🔑 Testing login POST with empty body...');
        const loginPostTest = await makePostRequest(
            'https://student-library-backend-o116.onrender.com/api/auth/login',
            {}
        );
        console.log(`   Status: ${loginPostTest.status}`);
        console.log(`   Response: ${JSON.stringify(loginPostTest.data, null, 2)}`);
        
    } catch (error) {
        console.log('❌ POST test error:', error.message);
    }
    
    console.log('\n📊 ANALYSIS:');
    console.log('-'.repeat(35));
    console.log('Expected behavior:');
    console.log('• Health endpoint: Should return 200 with database status');
    console.log('• Auth endpoint: Should return 200 with simple response');
    console.log('• GET register/login: Should return 405 (Method Not Allowed)');
    console.log('• POST register/login: Should return 400 (validation errors)');
    console.log('');
    console.log('If any endpoint returns 404 "Route not found", the server');
    console.log('deployment has an issue or wrong file is deployed.');
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
        
        request.setTimeout(15000, () => {
            request.destroy();
            reject(new Error('Timeout'));
        });
        
        request.on('error', reject);
    });
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
                'Origin': 'https://inquisitive-kashata-b3ac7e.netlify.app'
            }
        };
        
        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => responseData += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        data: JSON.parse(responseData)
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
            reject(new Error('Timeout'));
        });
        
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

testDeployedBackend();
