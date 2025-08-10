const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function debugLogin() {
    console.log('🔍 DEBUGGING LOGIN ISSUE');
    console.log('=========================');
    
    // Connect to the same database your backend should be using
    const mongoURI = 'mongodb+srv://yatharth10a:bb@yathsdatabase.7fir4sd.mongodb.net/student-library?retryWrites=true&w=majority&appName=YATHSDATABASE';
    
    try {
        await mongoose.connect(mongoURI);
        console.log('✅ Connected to MongoDB Atlas');
        
        // Check if admin user exists
        console.log('\n📧 Checking for admin user...');
        const adminUser = await User.findOne({ email: 'admin@studentlibrary.com' });
        
        if (!adminUser) {
            console.log('❌ NO ADMIN USER FOUND with email: admin@studentlibrary.com');
            
            // Check what users exist
            const allUsers = await User.find({});
            console.log(`\n👥 Found ${allUsers.length} users in database:`);
            allUsers.forEach(user => {
                console.log(`   - Email: ${user.email}, Role: ${user.role}, Name: ${user.name}`);
            });
            
        } else {
            console.log('✅ Admin user found!');
            console.log(`   👤 Name: ${adminUser.name}`);
            console.log(`   📧 Email: ${adminUser.email}`);
            console.log(`   🔐 Role: ${adminUser.role}`);
            console.log(`   🆔 ID: ${adminUser._id}`);
            
            // Test password verification
            console.log('\n🔐 Testing password verification...');
            const testPassword = 'admin123';
            const isValidPassword = await bcrypt.compare(testPassword, adminUser.password);
            
            console.log(`   Password "admin123": ${isValidPassword ? '✅ VALID' : '❌ INVALID'}`);
            
            if (!isValidPassword) {
                console.log('   🔍 Password hash in database:', adminUser.password.substring(0, 20) + '...');
                
                // Try to create a new password hash to compare
                const newHash = await bcrypt.hash('admin123', 10);
                console.log('   🔍 New hash for "admin123":', newHash.substring(0, 20) + '...');
            }
        }
        
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

debugLogin();
