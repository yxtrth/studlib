#!/usr/bin/env node

const https = require('https');

async function monitorRenderDeployment() {
    console.log('📡 Monitoring Render Deployment Status...');
    console.log('=' .repeat(50));
    console.log('⏰ Checking every 30 seconds...');
    console.log('🎯 Looking for: database.status = "connected"');
    console.log('');
    
    let attempts = 0;
    const maxAttempts = 20; // 10 minutes total
    
    const checkStatus = async () => {
        attempts++;
        console.log(`🔍 Check #${attempts} (${new Date().toLocaleTimeString()})`);
        
        try {
            const response = await makeRequest('https://student-library-backend-o116.onrender.com/api/health');
            
            if (response.status === 200 && response.data) {
                const data = response.data;
                
                console.log(`   🏥 Status: ${data.status || 'unknown'}`);
                console.log(`   🌍 Environment: ${data.environment || 'undefined'}`);
                console.log(`   💾 Database: ${data.database?.status || 'undefined'}`);
                console.log(`   📧 Email: ${data.email?.status || 'undefined'}`);
                
                if (data.database?.status === 'connected') {
                    console.log('\n🎉 SUCCESS! Render deployment is working correctly!');
                    console.log('✅ Database connected:', data.database.name);
                    console.log('✅ User count:', data.database.userCount);
                    console.log('\n🚀 Your app is now fully operational!');
                    return true; // Success!
                }
                
                if (data.environment === 'production') {
                    console.log('   📦 Render is using production environment');
                    if (data.database?.status === 'disconnected' || data.database?.status === 'error') {
                        console.log('   ⚠️  Database connection issue - check MONGODB_URI');
                    }
                }
            } else {
                console.log(`   ❌ HTTP Status: ${response.status}`);
            }
            
        } catch (error) {
            console.log(`   ❌ Request failed: ${error.message}`);
        }
        
        if (attempts >= maxAttempts) {
            console.log('\n⏰ Timeout reached. Manual check required.');
            console.log('🔧 Please verify Render environment variables are set correctly.');
            return true; // Stop monitoring
        }
        
        console.log('   ⏳ Waiting 30 seconds...\n');
        return false; // Continue monitoring
    };
    
    // Check immediately, then every 30 seconds
    if (await checkStatus()) return;
    
    const interval = setInterval(async () => {
        if (await checkStatus()) {
            clearInterval(interval);
        }
    }, 30000);
}

function makeRequest(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
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
        }).on('error', reject);
    });
}

monitorRenderDeployment();
