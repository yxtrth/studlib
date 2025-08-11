#!/usr/bin/env node

// Test the complete registration flow to see where the OTP page redirect fails
const https = require('https');

async function testRegistrationFlow() {
    console.log('🔍 TESTING REGISTRATION → OTP PAGE FLOW');
    console.log('=' .repeat(50));
    
    const testUser = {
        name: 'OTP Test User',
        email: `otptest${Date.now()}@example.com`,
        password: 'otptest123',
        studentId: 'ST123',
        department: 'Computer Science',
        bio: 'Testing OTP flow'
    };
    
    console.log('📝 Step 1: Testing Registration Response');
    console.log('-'.repeat(40));
    console.log('User data:', JSON.stringify(testUser, null, 2));
    
    try {
        // Test registration with JSON (like our debug script)
        const registerResult = await makeJSONRequest(
            'https://student-library-backend-o116.onrender.com/api/auth/register',
            testUser
        );
        
        console.log('\n📊 REGISTRATION RESULT:');
        console.log('Status:', registerResult.status);
        console.log('Response:', JSON.stringify(registerResult.data, null, 2));
        
        if (registerResult.status === 200 || registerResult.status === 201) {
            const response = registerResult.data;
            
            console.log('\n🔍 CHECKING REDIRECT DATA:');
            console.log('requiresVerification:', response.requiresVerification);
            console.log('userId:', response.userId);
            console.log('email:', response.email);
            
            if (response.requiresVerification && response.userId && response.email) {
                console.log('\n✅ Backend provides correct data for OTP redirect');
                console.log('   Frontend should redirect to: /verify-email');
                console.log('   With state: { userId: "' + response.userId + '", email: "' + response.email + '" }');
                
                // Test if the verify-otp endpoint is working
                console.log('\n📱 Step 2: Testing OTP Verification Endpoint');
                console.log('-'.repeat(45));
                
                const fakeOtp = '123456';
                const otpResult = await makeJSONRequest(
                    'https://student-library-backend-o116.onrender.com/api/auth/verify-otp',
                    { userId: response.userId, otp: fakeOtp }
                );
                
                console.log('OTP Test Status:', otpResult.status);
                console.log('OTP Test Response:', JSON.stringify(otpResult.data, null, 2));
                
                if (otpResult.status === 400 && otpResult.data.message.includes('Invalid or expired')) {
                    console.log('✅ OTP endpoint working correctly');
                } else {
                    console.log('❌ OTP endpoint issue');
                }
                
            } else {
                console.log('\n❌ ISSUE: Backend not providing required fields for OTP redirect');
                console.log('   Missing fields needed for frontend navigation:');
                if (!response.requiresVerification) console.log('   - requiresVerification');
                if (!response.userId) console.log('   - userId');
                if (!response.email) console.log('   - email');
            }
        } else {
            console.log('\n❌ Registration failed');
        }
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
    }
    
    console.log('\n🔍 FRONTEND ISSUE ANALYSIS:');
    console.log('-'.repeat(30));
    console.log('If backend is working correctly, the issue might be:');
    console.log('1. Frontend not sending FormData correctly');
    console.log('2. Frontend not receiving the response properly');
    console.log('3. React Router navigation not working');
    console.log('4. EmailVerification component route not configured');
    
    console.log('\n🎯 NEXT STEPS TO FIX:');
    console.log('1. Check if /verify-email route exists in React Router');
    console.log('2. Check if frontend is properly handling the response');
    console.log('3. Check browser console for JavaScript errors');
    console.log('4. Verify the register component navigation logic');
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

testRegistrationFlow();
