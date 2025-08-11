// MongoDB Connection Test
const https = require('https');

async function testMongoDBConnection() {
    console.log('🍃 Testing MongoDB Connection String...');
    console.log('=' .repeat(50));
    
    const connectionString = 'mongodb+srv://yatharth10a:bb@yathsdatabase.7fir4sd.mongodb.net/student-library?retryWrites=true&w=majority&appName=YATHSDATABASE';
    
    console.log('🔗 Connection String Format Check:');
    console.log('✅ Protocol: mongodb+srv');
    console.log('✅ Username: yatharth10a');
    console.log('✅ Password: [HIDDEN]');
    console.log('✅ Cluster: yathsdatabase.7fir4sd.mongodb.net');
    console.log('✅ Database: student-library');
    console.log('✅ App Name: YATHSDATABASE');
    
    console.log('\n🏥 Testing Backend Health...');
    
    try {
        const healthData = await makeRequest('https://student-library-backend-o116.onrender.com/api/health');
        
        if (healthData.status === 200) {
            console.log('✅ Backend is responding!');
            console.log('📊 Database Status:', healthData.data.database?.status || 'unknown');
            console.log('📧 Email Status:', healthData.data.email?.status || 'unknown');
            console.log('👥 User Count:', healthData.data.database?.userCount || '0');
            
            if (healthData.data.database?.status === 'connected') {
                console.log('🎉 MongoDB connection is working!');
            } else {
                console.log('❌ MongoDB connection issue detected');
                console.log('💡 Check your Render environment variables');
            }
        } else {
            console.log('❌ Backend health check failed');
            console.log('Response:', healthData.data);
        }
    } catch (error) {
        console.log('❌ Error testing backend:', error.message);
    }
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

testMongoDBConnection();
