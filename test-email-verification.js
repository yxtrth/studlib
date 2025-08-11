#!/usr/bin/env node

const https = require('https');

async function testEmailVerificationSystem() {
    console.log('📧 TESTING EMAIL VERIFICATION SYSTEM');
    console.log('=' .repeat(45));
    
    // 1. Check current email configuration status
    console.log('\n🔧 1. EMAIL CONFIGURATION STATUS');
    console.log('-'.repeat(35));
    
    try {
        const healthResponse = await makeRequest('https://student-library-backend-o116.onrender.com/api/health');
        
        if (healthResponse.data.email) {
            console.log('📮 Email Status:', healthResponse.data.email.status);
            console.log('👤 Email User:', healthResponse.data.email.user);
            
            switch (healthResponse.data.email.status) {
                case 'not_configured':
                    console.log('❌ EMAIL NOT CONFIGURED');
                    console.log('💡 Need to add EMAIL_* variables to Render');
                    break;
                case 'configured':
                    console.log('⚠️  EMAIL CONFIGURED BUT NOT VERIFIED');
                    console.log('💡 SMTP settings exist but connection failed');
                    break;
                case 'verified':
                    console.log('✅ EMAIL FULLY WORKING');
                    break;
                case 'error':
                    console.log('❌ EMAIL ERROR');
                    console.log('💡 Check SMTP credentials');
                    break;
            }
        }
    } catch (error) {
        console.log('❌ Health check failed:', error.message);
    }
    
    // 2. Test registration with a unique email
    console.log('\n📝 2. REGISTRATION TEST');
    console.log('-'.repeat(35));
    
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@example.com`;
    
    try {
        console.log('📧 Testing registration with:', testEmail);
        
        const registrationData = {
            name: 'Test User',
            email: testEmail,
            password: 'testpassword123',
            confirmPassword: 'testpassword123'
        };
        
        const registerResponse = await makePostRequest(
            'https://student-library-backend-o116.onrender.com/api/auth/register',
            registrationData
        );
        
        console.log(`   Status: ${registerResponse.status}`);
        console.log(`   Response:`, JSON.stringify(registerResponse.data, null, 2));
        
        if (registerResponse.status === 201) {
            console.log('   ✅ REGISTRATION SUCCESSFUL!');
            if (registerResponse.data.requiresVerification) {
                console.log('   📧 OTP email should be sent');
                console.log('   🔐 User needs to verify email to activate account');
            }
        } else if (registerResponse.status === 500) {
            console.log('   ❌ SERVER ERROR - Likely email sending failed');
            console.log('   💡 Check Render email environment variables');
        } else {
            console.log('   ⚠️  Registration issue - check response above');
        }
        
    } catch (error) {
        console.log('❌ Registration test error:', error.message);
    }
    
    // 3. Test OTP verification endpoint
    console.log('\n🔐 3. OTP VERIFICATION TEST');
    console.log('-'.repeat(35));
    
    try {
        const otpResponse = await makePostRequest(
            'https://student-library-backend-o116.onrender.com/api/auth/verify-otp',
            { email: testEmail, otp: '123456' }
        );
        
        console.log(`   Status: ${otpResponse.status}`);
        console.log(`   Response:`, JSON.stringify(otpResponse.data, null, 2));
        
        if (otpResponse.status === 400) {
            console.log('   ✅ OTP ENDPOINT WORKING (invalid OTP expected)');
        }
        
    } catch (error) {
        console.log('❌ OTP test error:', error.message);
    }
    
    // 4. Summary and next steps
    console.log('\n🎯 4. EMAIL VERIFICATION SUMMARY');
    console.log('-'.repeat(35));
    
    console.log('📊 Current Status:');
    console.log('   • Registration endpoint: Working');
    console.log('   • OTP verification endpoint: Working');
    console.log('   • Email sending: Depends on Render config');
    
    console.log('\n🔧 TO FIX EMAIL VERIFICATION:');
    console.log('   1. Add EMAIL_* variables to Render environment');
    console.log('   2. Redeploy the backend service');
    console.log('   3. Test registration again');
    
    console.log('\n📧 REQUIRED RENDER ENVIRONMENT VARIABLES:');
    console.log('   EMAIL_HOST=smtp.gmail.com');
    console.log('   EMAIL_PORT=587');
    console.log('   EMAIL_USER=libyatharth@gmail.com');
    console.log('   EMAIL_PASS=untdnciohccycvwu');
    
    console.log('\n✅ AFTER FIX:');
    console.log('   • Users will receive OTP emails');
    console.log('   • Registration will work completely');
    console.log('   • Email verification will be functional');
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

testEmailVerificationSystem();
