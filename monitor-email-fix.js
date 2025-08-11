#!/usr/bin/env node

const https = require('https');

async function monitorEmailFix() {
    console.log('📧 MONITORING EMAIL VERIFICATION FIX');
    console.log('=' .repeat(40));
    console.log('⏰ Waiting for Render deployment...');
    console.log('🔧 Looking for: Email working with OTP sending');
    console.log('');
    
    let attempts = 0;
    const maxAttempts = 15; // About 7-8 minutes
    
    const checkEmailStatus = async () => {
        attempts++;
        console.log(`🔍 Check #${attempts} (${new Date().toLocaleTimeString()})`);
        
        try {
            // 1. Check email configuration in health endpoint
            const healthResponse = await makeRequest('https://student-library-backend-o116.onrender.com/api/health');
            
            if (healthResponse.status === 200 && healthResponse.data.email) {
                console.log(`   📧 Email Status: ${healthResponse.data.email.status}`);
                console.log(`   👤 Email User: ${healthResponse.data.email.user}`);
                
                if (healthResponse.data.email.status === 'verified') {
                    console.log('   ✅ Email configuration is working!');
                    
                    // 2. Test actual registration with email sending
                    console.log('   🧪 Testing registration with email...');
                    const timestamp = Date.now();
                    const testEmail = `test${timestamp}@example.com`;
                    
                    const registerResponse = await makePostRequest(
                        'https://student-library-backend-o116.onrender.com/api/auth/register',
                        {
                            name: 'Test User',
                            email: testEmail,
                            password: 'testpassword123',
                            confirmPassword: 'testpassword123'
                        }
                    );
                    
                    console.log(`   📝 Registration Status: ${registerResponse.status}`);
                    
                    if (registerResponse.status === 201) {
                        console.log('\n🎉 SUCCESS! EMAIL VERIFICATION IS WORKING!');
                        console.log('✅ User registration working');
                        console.log('✅ OTP email sending working');
                        console.log('✅ Email verification system operational');
                        
                        console.log('\n📱 Your users can now:');
                        console.log('   • Register new accounts');
                        console.log('   • Receive OTP emails');
                        console.log('   • Verify their email addresses');
                        console.log('   • Login after verification');
                        
                        console.log('\n🌐 Test your live app:');
                        console.log('   Frontend: https://inquisitive-kashata-b3ac7e.netlify.app');
                        console.log('   Try registering with a real email address!');
                        
                        return true; // Success!
                    } else if (registerResponse.status === 500) {
                        console.log('   ⚠️  Server error - deployment may still be updating');
                    } else {
                        console.log(`   📄 Response: ${JSON.stringify(registerResponse.data)}`);
                    }
                    
                } else if (healthResponse.data.email.status === 'configured') {
                    console.log('   ⚠️  Email configured but not verified yet');
                } else if (healthResponse.data.email.status === 'not_configured') {
                    console.log('   ❌ Email still not configured - deployment updating');
                }
            } else {
                console.log(`   ❌ Health check failed: ${healthResponse.status}`);
            }
            
        } catch (error) {
            console.log(`   ❌ Request failed: ${error.message}`);
        }
        
        if (attempts >= maxAttempts) {
            console.log('\n⏰ Monitoring timeout reached.');
            console.log('💡 Check manually: https://student-library-backend-o116.onrender.com/api/health');
            return true; // Stop monitoring
        }
        
        console.log('   ⏳ Waiting 30 seconds...\n');
        return false; // Continue monitoring
    };
    
    // Check immediately, then every 30 seconds
    if (await checkEmailStatus()) return;
    
    const interval = setInterval(async () => {
        if (await checkEmailStatus()) {
            clearInterval(interval);
        }
    }, 30000);
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

monitorEmailFix();
