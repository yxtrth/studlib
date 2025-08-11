#!/usr/bin/env node

// Test registration with FormData like the frontend sends
const https = require('https');

function createFormData(data) {
    const boundary = '----formdata-boundary-' + Math.random().toString(36);
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
    console.log('🔍 TESTING REGISTRATION WITH FORMDATA');
    console.log('=' .repeat(50));
    
    // Wait for deployment
    console.log('⏳ Waiting 30 seconds for Render deployment...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    const testUser = {
        name: 'FormData Test User',
        email: `formtest${Date.now()}@example.com`,
        password: 'formtest123',
        studentId: 'ST001',
        department: 'Computer Science',
        bio: 'Test bio'
    };
    
    console.log('📝 Testing FormData registration with:');
    console.log(JSON.stringify(testUser, null, 2));
    
    const formData = createFormData(testUser);
    
    try {
        const result = await makeFormDataRequest(
            'https://student-library-backend-o116.onrender.com/api/auth/register',
            formData
        );
        
        console.log('\n📊 REGISTRATION RESULT:');
        console.log('Status:', result.status);
        console.log('Response:', JSON.stringify(result.data, null, 2));
        
        if (result.status === 200 || result.status === 201) {
            console.log('\n🎉 SUCCESS! FormData registration is working!');
            console.log('✅ The frontend should now be able to register users');
        } else if (result.status === 400) {
            console.log('\n❌ Still getting 400 - checking error details...');
            console.log('Error:', result.data?.message);
        } else {
            console.log('\n⚠️  Unexpected status code');
        }
        
    } catch (error) {
        console.log('\n❌ Request failed:', error.message);
    }
    
    console.log('\n🚀 Now test the live app at:');
    console.log('   https://inquisitive-kashata-b3ac7e.netlify.app');
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
                'Origin': 'https://inquisitive-kashata-b3ac7e.netlify.app',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
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
        
        req.setTimeout(20000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
        
        req.on('error', (error) => {
            reject(new Error(`Request failed: ${error.message}`));
        });
        
        req.write(formData.body);
        req.end();
    });
}

testFormDataRegistration();
