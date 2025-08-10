const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function testExactLogin() {
    console.log('🔐 TESTING EXACT LOGIN PROCESS');
    console.log('==============================');
    
    const productionURI = 'mongodb+srv://yatharth10a:bb@yathsdatabase.7fir4sd.mongodb.net/student-library?retryWrites=true&w=majority&appName=YATHSDATABASE';
    
    try {
        await mongoose.connect(productionURI);
        console.log('✅ Connected to production database');
        
        const email = 'admin@studentlibrary.com';
        const password = 'admin123';
        
        console.log(`\n🔍 Looking for user: ${email}`);
        
        // This is exactly what your backend login route does
        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (!user) {
            console.log('❌ User not found');
            return;
        }
        
        console.log('✅ User found:');
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Password Hash Length: ${user.password.length}`);
        
        console.log('\n🔐 Testing password verification...');
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (isPasswordValid) {
            console.log('✅ PASSWORD VERIFICATION SUCCESSFUL!');
            console.log('🎯 Login should work - the issue might be elsewhere');
        } else {
            console.log('❌ PASSWORD VERIFICATION FAILED!');
            console.log('🚨 This is why you\'re getting 401 Unauthorized');
            
            // Let's try to fix it by creating a new password hash
            console.log('\n🔧 Creating new password hash...');
            const newHash = await bcrypt.hash('admin123', 10);
            await User.updateOne(
                { email: email.toLowerCase() },
                { password: newHash }
            );
            console.log('✅ Password updated!');
            
            // Test again
            const updatedUser = await User.findOne({ email: email.toLowerCase() });
            const newTest = await bcrypt.compare('admin123', updatedUser.password);
            console.log(`🔐 New password test: ${newTest ? '✅ VALID' : '❌ INVALID'}`);
        }
        
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testExactLogin();
