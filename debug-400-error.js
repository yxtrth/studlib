#!/usr/bin/env node

const https = require('https');

async function debug400Error() {
    console.log('🔍 DEBUGGING 400 ERROR IN REGISTRATION');
    console.log('=' .repeat(50));
    
    try {
        // Test 1: Send empty data (should get 400 with clear error message)
        console.log('\n📝 1. TESTING WITH EMPTY DATA');
        console.log('-'.repeat(35));
        
        const emptyTest = await makeFormDataRequest(
            'https://student-library-backend-o116.onrender.com/api/auth/register',
            {}
        );
        
        console.log(`   Status: ${emptyTest.status}`);
        console.log(`   Response: ${JSON.stringify(emptyTest.data, null, 2)}`);
        
        // Test 2: Send minimal required data
        console.log('\n📝 2. TESTING WITH MINIMAL REQUIRED DATA');
        console.log('-'.repeat(40));
        
        const minimalTest = await makeFormDataRequest(
            'https://student-library-backend-o116.onrender.com/api/auth/register',
            {
                name: 'Test User',
                email: 'test' + Date.now() + '@example.com',
                password: 'testpassword123'
            }
        );
        
        console.log(`   Status: ${minimalTest.status}`);
        console.log(`   Response: ${JSON.stringify(minimalTest.data, null, 2)}`);
        
        // Test 3: Send complete data (like frontend sends)
        console.log('\n📝 3. TESTING WITH COMPLETE DATA');
        console.log('-'.repeat(35));
        
        const completeTest = await makeFormDataRequest(
            'https://student-library-backend-o116.onrender.com/api/auth/register',
            {
                name: 'Complete Test User',
                email: 'complete' + Date.now() + '@example.com',
                password: 'testpassword123',
                studentId: 'TEST123',
                department: 'Computer Science',
                bio: 'Test bio'
            }
        );
        
        console.log(`   Status: ${completeTest.status}`);
        console.log(`   Response: ${JSON.stringify(completeTest.data, null, 2)}`);
        
        // Analysis
        console.log('\n🔍 ANALYSIS:');
        console.log('-'.repeat(35));
        
        if (emptyTest.status === 400) {
            console.log('✅ Backend validation is working (400 for empty data)');
            if (emptyTest.data.message) {
                console.log(`   Error message: "${emptyTest.data.message}"`);
            }
        }
        
        if (minimalTest.status === 201) {
            console.log('✅ Minimal data registration works');
        } else if (minimalTest.status === 400) {
            console.log('⚠️  Even minimal data gets 400 error');
            console.log('   This suggests the backend expects more fields');
        }
        
        if (completeTest.status === 201) {
            console.log('✅ Complete data registration works');
            console.log('   Frontend should use this exact format');
        } else {
            console.log('❌ Even complete data gets 400 error');
            console.log('   There might be a backend validation issue');
        }
        
    } catch (error) {
        console.log('❌ Test error:', error.message);
    }
    
    console.log('\n💡 SOLUTION HINTS:');
    console.log('-'.repeat(35));
    console.log('1. Check what fields the backend expects as required');
    console.log('2. Ensure frontend sends all required fields');
    console.log('3. Check if field names match exactly');
    console.log('4. Verify FormData is being sent correctly');
}

function makeFormDataRequest(url, data) {
    return new Promise((resolve, reject) => {
        // Create multipart form data
        const boundary = '----formdata-' + Math.random().toString(36);
        let formData = '';
        
        Object.keys(data).forEach(key => {
            formData += `--${boundary}\r\n`;
            formData += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
            formData += `${data[key]}\r\n`;
        });
        
        formData += `--${boundary}--\r\n`;
        
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
            reject(new Error('Timeout'));
        });
        
        req.on('error', reject);
        req.write(formData);
        req.end();
    });
}

debug400Error();
