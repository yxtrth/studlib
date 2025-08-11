#!/usr/bin/env node

const https = require('https');

async function testActualRegistration() {
    console.log('🧪 TESTING ACTUAL REGISTRATION FLOW');
    console.log('=' .repeat(50));
    
    try {
        // Test with FormData exactly like the frontend sends
        console.log('\n📝 TESTING REGISTRATION WITH FORMDATA');
        console.log('-'.repeat(45));
        
        const testUser = {
            name: 'OTP Test User',
            email: 'otptest' + Date.now() + '@example.com',
            password: 'testpassword123',
            studentId: 'OTP' + Date.now(),
            department: 'Computer Science',
            bio: 'Testing OTP redirect flow'
        };
        
        console.log(`Testing with email: ${testUser.email}`);
        
        // Create proper multipart form data
        const boundary = '----formdata-boundary-' + Math.random().toString(36);
        let formDataBody = '';
        
        Object.entries(testUser).forEach(([key, value]) => {
            formDataBody += `--${boundary}\r\n`;
            formDataBody += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
            formDataBody += `${value}\r\n`;
        });
        
        formDataBody += `--${boundary}--\r\n`;
        
        const result = await makeFormDataRequest(
            'https://student-library-backend-o116.onrender.com/api/auth/register',
            formDataBody,
            boundary
        );
        
        console.log(`\n📊 BACKEND RESPONSE:`);
        console.log(`Status Code: ${result.status}`);
        console.log(`Response: ${JSON.stringify(result.data, null, 2)}`);
        
        // Analyze what the frontend should do
        console.log('\n🔍 FRONTEND ANALYSIS:');
        console.log('-'.repeat(45));
        
        if (result.status === 201 || result.status === 200) {
            if (result.data.requiresVerification) {
                console.log('✅ Backend returns requiresVerification: true');
                console.log(`✅ userId: ${result.data.userId}`);
                console.log(`✅ email: ${result.data.email}`);
                console.log('\n🎯 FRONTEND SHOULD REDIRECT TO /verify-email');
                console.log('   The React component should navigate with userId and email in state');
            } else {
                console.log('❌ Backend does NOT return requiresVerification: true');
                console.log('   This is why the OTP page doesn\'t appear!');
                console.log('   The frontend only redirects if requiresVerification is true');
            }
        } else {
            console.log('❌ Registration failed with unexpected status');
            console.log('   Frontend will show error instead of redirecting');
        }
        
        // Test if backend is auto-verifying users
        if (result.data.autoVerified) {
            console.log('\n⚠️  BACKEND IS AUTO-VERIFYING USERS');
            console.log('   This happens when email service is not configured');
            console.log('   Users bypass OTP verification entirely');
        }
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
        console.log('   Backend might still be deploying or have issues');
    }
    
    console.log('\n💡 DEBUGGING RECOMMENDATIONS:');
    console.log('-'.repeat(45));
    console.log('1. If requiresVerification is missing → Backend email config issue');
    console.log('2. If status is not 200/201 → Backend deployment issue');
    console.log('3. If autoVerified is true → Email service not working');
    console.log('4. Try manual registration and check browser Network tab');
}

function makeFormDataRequest(url, formData, boundary) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        
        const options = {
            hostname: urlObj.hostname,
            port: 443,
            path: urlObj.pathname,
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': Buffer.byteLength(formData),
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
            reject(new Error('Request timeout'));
        });
        
        req.on('error', reject);
        req.write(formData);
        req.end();
    });
}

testActualRegistration();
