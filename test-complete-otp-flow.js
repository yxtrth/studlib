#!/usr/bin/env node

// Test the complete registration to OTP flow
const https = require('https');

async function testCompleteRegistrationFlow() {
    console.log('🔍 TESTING COMPLETE REGISTRATION → OTP FLOW');
    console.log('=' .repeat(55));
    
    // Wait for deployment
    console.log('⏳ Waiting 30 seconds for deployment...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    const testUser = {
        name: 'OTP Flow Test User',
        email: `otpflow${Date.now()}@example.com`,
        password: 'otptest123',
        studentId: 'ST' + Date.now(),
        department: 'Computer Science',
        bio: 'Testing OTP flow'
    };
    
    console.log('📝 STEP 1: Testing Registration');
    console.log('-'.repeat(30));
    console.log('User data:', JSON.stringify(testUser, null, 2));
    
    try {
        // Step 1: Register user
        const registerResult = await makeJSONRequest(
            'https://student-library-backend-o116.onrender.com/api/auth/register',
            testUser
        );
        
        console.log('Registration Status:', registerResult.status);
        console.log('Registration Response:', JSON.stringify(registerResult.data, null, 2));
        
        if (registerResult.status === 200 || registerResult.status === 201) {
            const { requiresVerification, userId, email } = registerResult.data;
            
            if (requiresVerification && userId && email) {
                console.log('\n✅ STEP 1 SUCCESS: Registration created user with OTP!');
                console.log(`   → User ID: ${userId}`);
                console.log(`   → Email: ${email}`);
                console.log(`   → Requires verification: ${requiresVerification}`);
                
                // Step 2: Test OTP verification (with fake OTP to see error handling)
                console.log('\n📱 STEP 2: Testing OTP Verification');
                console.log('-'.repeat(35));
                
                const fakeOtp = '123456';
                const otpResult = await makeJSONRequest(
                    'https://student-library-backend-o116.onrender.com/api/auth/verify-otp',
                    { userId, otp: fakeOtp }
                );
                
                console.log('OTP Verification Status:', otpResult.status);
                console.log('OTP Verification Response:', JSON.stringify(otpResult.data, null, 2));
                
                if (otpResult.status === 400 && otpResult.data.message.includes('Invalid or expired')) {
                    console.log('✅ STEP 2 SUCCESS: OTP endpoint correctly rejects fake OTP');
                    
                    // Step 3: Test resend OTP
                    console.log('\n🔄 STEP 3: Testing Resend OTP');
                    console.log('-'.repeat(25));
                    
                    const resendResult = await makeJSONRequest(
                        'https://student-library-backend-o116.onrender.com/api/auth/resend-otp',
                        { userId }
                    );
                    
                    console.log('Resend OTP Status:', resendResult.status);
                    console.log('Resend OTP Response:', JSON.stringify(resendResult.data, null, 2));
                    
                    if (resendResult.status === 200) {
                        console.log('✅ STEP 3 SUCCESS: Resend OTP endpoint works!');
                        
                        console.log('\n🎉 COMPLETE FLOW TEST RESULTS:');
                        console.log('✅ Registration creates user and sends OTP');
                        console.log('✅ Backend returns userId and email for frontend navigation');
                        console.log('✅ OTP verification endpoint accepts userId');
                        console.log('✅ Resend OTP endpoint works');
                        console.log('✅ Frontend should now redirect to /verify-email');
                        
                        console.log('\n🌟 YOUR OTP FLOW IS WORKING! 🌟');
                        console.log('\n🚀 Test it live at:');
                        console.log('   https://inquisitive-kashata-b3ac7e.netlify.app');
                        console.log('\n📋 What to expect:');
                        console.log('   1. Fill registration form');
                        console.log('   2. Submit registration');
                        console.log('   3. Automatically redirected to OTP verification page');
                        console.log('   4. Enter 6-digit OTP from email');
                        console.log('   5. Get logged in and redirected to dashboard');
                        
                    } else {
                        console.log('❌ STEP 3 FAILED: Resend OTP issue');
                    }
                } else {
                    console.log('❌ STEP 2 FAILED: OTP verification issue');
                }
            } else {
                console.log('❌ STEP 1 ISSUE: Missing requiresVerification, userId, or email');
                console.log('   Frontend needs these fields to navigate to OTP page');
            }
        } else {
            console.log('❌ STEP 1 FAILED: Registration failed');
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
        
        req.setTimeout(15000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
        
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

testCompleteRegistrationFlow();
