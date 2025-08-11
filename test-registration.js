#!/usr/bin/env node

const https = require('https');

async function testRegistration() {
    console.log('🔍 TESTING REGISTRATION ENDPOINT');
    console.log('=' .repeat(40));
    
    // Test 1: Check health status first
    console.log('\n📊 1. CHECKING BACKEND HEALTH');
    console.log('-'.repeat(30));
    
    try {
        const health = await makeRequest('https://student-library-backend-o116.onrender.com/api/health');
        console.log('Health Status:', JSON.stringify(health.data, null, 2));
    } catch (error) {
        console.log('❌ Health check failed:', error.message);
    }
    
    // Test 2: Test registration with complete data
    console.log('\n📝 2. TESTING REGISTRATION WITH COMPLETE DATA');
    console.log('-'.repeat(45));
    
    const testUser = {
        name: 'Test User Registration',
        email: 'testuser' + Date.now() + '@example.com',
        password: 'testpassword123',
        confirmPassword: 'testpassword123'
    };
    
    console.log('Sending data:', JSON.stringify(testUser, null, 2));
    
    try {
        const registerResult = await makePostRequest(
            'https://student-library-backend-o116.onrender.com/api/auth/register',
            testUser
        );
        
        console.log(`\nResponse Status: ${registerResult.status}`);
        console.log('Response Data:', JSON.stringify(registerResult.data, null, 2));
        
        if (registerResult.status === 200 || registerResult.status === 201) {
            console.log('✅ REGISTRATION SUCCESSFUL!');
        } else if (registerResult.status === 400) {
            console.log('❌ VALIDATION ERROR - Check required fields');
        } else if (registerResult.status === 500) {
            console.log('❌ SERVER ERROR - Check backend logs');
        }
        
    } catch (error) {
        console.log('❌ Registration test failed:', error.message);
    }
    
    // Test 3: Test with missing fields to see validation
    console.log('\n🔍 3. TESTING VALIDATION (MISSING FIELDS)');
    console.log('-'.repeat(40));
    
    try {
        const invalidResult = await makePostRequest(
            'https://student-library-backend-o116.onrender.com/api/auth/register',
            { name: 'Only Name' }
        );
        
        console.log(`Validation Status: ${invalidResult.status}`);
        console.log('Validation Response:', JSON.stringify(invalidResult.data, null, 2));
        
    } catch (error) {
        console.log('❌ Validation test failed:', error.message);
    }
    
    console.log('\n🎯 DEBUGGING COMPLETE');
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
        
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
        
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

testRegistration();
