#!/usr/bin/env node

// Minimal test focusing on the exact frontend behavior
const https = require('https');

async function testExactFrontendCall() {
    console.log('🔍 TESTING EXACT FRONTEND BEHAVIOR');
    console.log('=' .repeat(50));
    
    // Test 1: Health check first
    console.log('📊 1. HEALTH CHECK');
    console.log('-'.repeat(25));
    
    try {
        const health = await makeGetRequest('https://student-library-backend-o116.onrender.com/api/health');
        console.log('Health Status:', health.status);
        if (health.status === 200) {
            console.log('✅ Backend is responding');
        } else {
            console.log('❌ Backend health issue');
        }
    } catch (error) {
        console.log('❌ Cannot reach backend:', error.message);
        return;
    }
    
    // Test 2: Same headers as browser would send
    console.log('\n📝 2. REGISTRATION WITH BROWSER-LIKE HEADERS');
    console.log('-'.repeat(45));
    
    const testUser = {
        name: 'Browser Test User',
        email: `browsertest${Date.now()}@example.com`,
        password: 'browsertest123'
    };
    
    console.log('Sending registration data:', JSON.stringify(testUser, null, 2));
    
    try {
        const result = await makePostRequestWithBrowserHeaders(
            'https://student-library-backend-o116.onrender.com/api/auth/register',
            testUser
        );
        
        console.log('\n📊 RESULT:');
        console.log('Status:', result.status);
        console.log('Headers:', result.headers);
        console.log('Body:', JSON.stringify(result.data, null, 2));
        
        if (result.status >= 200 && result.status < 300) {
            console.log('\n✅ SUCCESS! Registration is working!');
        } else if (result.status === 400) {
            console.log('\n❌ BAD REQUEST - Field validation failed');
            console.log('This means the backend received the request but rejected it');
        } else if (result.status === 500) {
            console.log('\n❌ SERVER ERROR - Backend crashed');
        }
        
    } catch (error) {
        console.log('\n❌ Request failed:', error.message);
    }
    
    // Test 3: Empty request like the error you're seeing
    console.log('\n🔍 3. TESTING EMPTY REQUEST (LIKE YOUR ERROR)');
    console.log('-'.repeat(45));
    
    try {
        const emptyResult = await makePostRequestWithBrowserHeaders(
            'https://student-library-backend-o116.onrender.com/api/auth/register',
            {}
        );
        
        console.log('Empty request status:', emptyResult.status);
        console.log('Empty request response:', JSON.stringify(emptyResult.data, null, 2));
        
        if (emptyResult.status === 400) {
            console.log('✅ This is EXPECTED - backend correctly rejects empty data');
        }
        
    } catch (error) {
        console.log('❌ Empty request failed:', error.message);
    }
}

function makeGetRequest(url) {
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

function makePostRequestWithBrowserHeaders(url, data) {
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
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Origin': 'https://inquisitive-kashata-b3ac7e.netlify.app',
                'Referer': 'https://inquisitive-kashata-b3ac7e.netlify.app/',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'cross-site',
                'Cache-Control': 'no-cache'
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
                        headers: res.headers,
                        data: parsedData
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
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

testExactFrontendCall();
