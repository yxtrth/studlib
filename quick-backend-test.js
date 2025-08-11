#!/usr/bin/env node

const https = require('https');

async function quickBackendTest() {
    console.log('⚡ QUICK BACKEND STATUS CHECK');
    console.log('=' .repeat(40));
    
    try {
        console.log('Testing backend health...');
        
        const health = await makeRequest('https://student-library-backend-o116.onrender.com/api/health');
        console.log(`Health Status: ${health.status}`);
        
        if (health.status === 200) {
            console.log('✅ BACKEND IS WORKING!');
            console.log('Registration should now work properly.');
            
            // Quick test of registration endpoint
            console.log('\nTesting registration endpoint...');
            const regTest = await makePostRequest(
                'https://student-library-backend-o116.onrender.com/api/auth/register',
                { name: 'Test', email: 'test@test.com', password: 'test123' }
            );
            
            console.log(`Registration test status: ${regTest.status}`);
            if (regTest.status === 400 || regTest.status === 201) {
                console.log('✅ REGISTRATION ENDPOINT IS WORKING!');
                console.log('\n🎯 YOUR OTP ISSUE SHOULD BE FIXED!');
                console.log('Go test registration on your live app:');
                console.log('https://inquisitive-kashata-b3ac7e.netlify.app/register');
            } else {
                console.log('❌ Registration endpoint issue');
                console.log('Response:', JSON.stringify(regTest.data));
            }
            
        } else {
            console.log('❌ Backend not responding properly');
            console.log('Wait 2-3 more minutes for deployment');
        }
        
    } catch (error) {
        console.log('❌ Error:', error.message);
        console.log('Backend might still be deploying...');
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
                'Content-Length': Buffer.byteLength(postData)
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

quickBackendTest();
