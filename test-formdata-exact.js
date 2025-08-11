#!/usr/bin/env node

// Test registration with FormData exactly like the frontend sends
const https = require('https');

function createFormDataRequest(data) {
    const boundary = '----formdata-' + Math.random().toString(16);
    let body = '';
    
    for (const [key, value] of Object.entries(data)) {
        body += `--${boundary}\r\n`;
        body += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
        body += `${value}\r\n`;
    }
    
    body += `--${boundary}--\r\n`;
    
    return {
        body: body,
        contentType: `multipart/form-data; boundary=${boundary}`
    };
}

async function testFormDataRegistration() {
    console.log('🔍 TESTING FORMDATA REGISTRATION (EXACT FRONTEND SIMULATION)');
    console.log('=' .repeat(65));
    
    const testUser = {
        name: 'FormData Test User',
        email: `formdata${Date.now()}@example.com`,
        password: 'formdata123',
        studentId: 'FD001',
        department: 'Computer Science',
        bio: 'Testing FormData registration'
    };
    
    console.log('📝 Sending FormData registration (like frontend):');
    console.log(JSON.stringify(testUser, null, 2));
    
    try {
        const formData = createFormDataRequest(testUser);
        const result = await makeFormDataRequest(
            'https://student-library-backend-o116.onrender.com/api/auth/register',
            formData
        );
        
        console.log('\n📊 FORMDATA REGISTRATION RESULT:');
        console.log('Status:', result.status);
        console.log('Response:', JSON.stringify(result.data, null, 2));
        
        if (result.status === 200 || result.status === 201) {
            const response = result.data;
            
            console.log('\n🔍 ANALYZING RESPONSE FOR OTP REDIRECT:');
            console.log('✅ Registration successful!');
            console.log('requiresVerification:', response.requiresVerification);
            console.log('userId:', response.userId);
            console.log('email:', response.email);
            
            if (response.requiresVerification && response.userId && response.email) {
                console.log('\n🎯 PERFECT! Backend provides all needed data:');
                console.log('   ✅ requiresVerification: true');
                console.log('   ✅ userId: ' + response.userId);
                console.log('   ✅ email: ' + response.email);
                console.log('\n📱 Frontend should redirect to:');
                console.log('   URL: /verify-email');
                console.log('   State: { userId: "' + response.userId + '", email: "' + response.email + '" }');
                
                console.log('\n🔍 If OTP page still not showing, the issue is in frontend:');
                console.log('   1. React Router route configuration');
                console.log('   2. Navigation logic in Register component');
                console.log('   3. EmailVerification component not being reached');
                
                // Test the OTP page endpoint
                console.log('\n📋 Testing OTP verification endpoint:');
                const otpTest = await makeJSONRequest(
                    'https://student-library-backend-o116.onrender.com/api/auth/verify-otp',
                    { userId: response.userId, otp: '123456' }
                );
                
                console.log('OTP endpoint status:', otpTest.status);
                if (otpTest.status === 400) {
                    console.log('✅ OTP endpoint working (correctly rejects fake OTP)');
                } else {
                    console.log('❌ OTP endpoint issue');
                }
                
            } else {
                console.log('\n❌ Backend response missing required fields!');
            }
        } else {
            console.log('\n❌ FormData registration failed');
            console.log('This means the multer middleware might not be working');
        }
        
    } catch (error) {
        console.log('\n❌ FormData test failed:', error.message);
    }
    
    console.log('\n🔧 SOLUTION STEPS:');
    console.log('-'.repeat(20));
    console.log('1. If backend works: Check React Router in frontend');
    console.log('2. If backend fails: Fix multer middleware');
    console.log('3. Check browser console for navigation errors');
    console.log('4. Verify /verify-email route exists in App.js');
}

function makeFormDataRequest(url, formData) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        
        const options = {
            hostname: urlObj.hostname,
            port: 443,
            path: urlObj.pathname,
            method: 'POST',
            headers: {
                'Content-Type': formData.contentType,
                'Content-Length': Buffer.byteLength(formData.body),
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
        
        req.setTimeout(15000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
        
        req.on('error', reject);
        req.write(formData.body);
        req.end();
    });
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

testFormDataRegistration();
