const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function testProductionLogin() {
    console.log('🔍 TESTING PRODUCTION DATABASE LOGIN');
    console.log('====================================');
    
    // Connect to the exact same database your backend should be using
    const productionURI = 'mongodb+srv://yatharth10a:bb@yathsdatabase.7fir4sd.mongodb.net/student-library?retryWrites=true&w=majority&appName=YATHSDATABASE';
    
    try {
        console.log('📡 Connecting to production database...');
        await mongoose.connect(productionURI);
        console.log('✅ Connected successfully');
        
        // Find the admin user
        console.log('\n🔍 Looking for admin user...');
        const adminUser = await User.findOne({ email: 'admin@studentlibrary.com' });
        
        if (!adminUser) {
            console.log('❌ NO ADMIN USER FOUND!');
            console.log('This explains the 401 error - user doesn\'t exist');
            
            // Let's see what users exist
            const allUsers = await User.find({});
            console.log('\n👥 Found users:');
            allUsers.forEach(user => {
                console.log(`   - ${user.email} (${user.role})`);
            });
            
        } else {
            console.log('✅ Admin user found:');
            console.log(`   👤 Name: ${adminUser.name}`);
            console.log(`   📧 Email: ${adminUser.email}`);
            console.log(`   🔐 Role: ${adminUser.role}`);
            console.log(`   🆔 ID: ${adminUser._id}`);
            
            // Test password verification
            console.log('\n🔐 Testing password verification...');
            const testPassword = 'admin123';
            const isValidPassword = await bcrypt.compare(testPassword, adminUser.password);
            
            if (isValidPassword) {
                console.log('✅ Password verification SUCCESSFUL');
                console.log('🎯 The admin user and password are correct!');
                console.log('🚨 The issue might be elsewhere...');
            } else {
                console.log('❌ Password verification FAILED');
                console.log('🚨 The stored password hash doesn\'t match "admin123"');
            }
        }
        
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testProductionLogin().catch(console.error);
