#!/usr/bin/env node

const https = require('https');

async function testRegistrationFlow() {
    console.log('🧪 TESTING REGISTRATION FLOW');
    console.log('=' .repeat(40));
    
    // Test 1: Registration with missing fields
    console.log('\n📝 1. TESTING VALIDATION');
    console.log('-'.repeat(25));
    
    try {
        const invalidTest = await makePostRequest(
            'https://student-library-backend-o116.onrender.com/api/auth/register',
            { name: 'Test' } // Missing email and password
        );
        console.log(`   Missing fields test: ${invalidTest.status}`);
        console.log(`   Response: ${JSON.stringify(invalidTest.data)}`);
    } catch (error) {
        console.log('❌ Validation test error:', error.message);
    }
    
    // Test 2: Registration with valid data
    console.log('\n✅ 2. TESTING VALID REGISTRATION');
    console.log('-'.repeat(25));
    
    try {
        const validTest = await makePostRequest(
            'https://student-library-backend-o116.onrender.com/api/auth/register',
            { 
                name: 'Test User ' + Date.now(),
                email: 'test' + Date.now() + '@example.com',
                password: 'password123',
                confirmPassword: 'password123'
            }
        );
        console.log(`   Valid registration test: ${validTest.status}`);
        console.log(`   Response: ${JSON.stringify(validTest.data, null, 2)}`);
        
        if (validTest.status === 201) {
            console.log('   ✅ REGISTRATION SUCCESSFUL!');
        } else if (validTest.status === 500) {
            console.log('   ⚠️  Email service issue (expected if not configured)');
        } else {
            console.log('   ❌ Unexpected response');
        }
    } catch (error) {
        console.log('❌ Valid registration test error:', error.message);
    }
    
    // Test 3: Check email configuration
    console.log('\n📧 3. CHECKING EMAIL CONFIGURATION');
    console.log('-'.repeat(25));
    
    try {
        const healthCheck = await makeRequest('https://student-library-backend-o116.onrender.com/api/health');
        if (healthCheck.data && healthCheck.data.email) {
            console.log(`   Email status: ${healthCheck.data.email.status}`);
            console.log(`   Email user: ${healthCheck.data.email.user}`);
            
            if (healthCheck.data.email.status === 'not_configured') {
                console.log('   ⚠️  Email service not configured - this blocks registration');
                console.log('   💡 Solution: Configure email or disable email verification');
            } else if (healthCheck.data.email.status === 'verified') {
                console.log('   ✅ Email service working');
            }
        }
    } catch (error) {
        console.log('❌ Email check error:', error.message);
    }
    
    // Test 4: Alternative registration without email verification
    console.log('\n🔧 4. SUGGESTED SOLUTION');
    console.log('-'.repeat(25));
    console.log('   If email is not configured, registration fails because:');
    console.log('   1. User registers → OTP email should be sent');
    console.log('   2. Email send fails → User account is deleted');
    console.log('   3. Registration appears to "not work"');
    console.log('');
    console.log('   💡 Solutions:');
    console.log('   A. Configure email service properly');
    console.log('   B. Modify registration to work without email verification');
    console.log('   C. Use demo mode for testing');
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
        
        request.setTimeout(8000, () => {
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
        
        req.setTimeout(8000, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
        
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

testRegistrationFlow();
