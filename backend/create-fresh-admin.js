const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function createFreshAdmin() {
    console.log('🚀 CREATING FRESH ADMIN USER');
    console.log('============================');
    
    const mongoURI = 'mongodb+srv://yatharth10a:bb@yathsdatabase.7fir4sd.mongodb.net/student-library?retryWrites=true&w=majority&appName=YATHSDATABASE';
    
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(mongoURI);
        console.log('✅ Connected to MongoDB Atlas');
        
        // Delete any existing admin user
        console.log('🗑️ Removing any existing admin users...');
        await User.deleteMany({ email: 'admin@studentlibrary.com' });
        await User.deleteMany({ role: 'admin' });
        console.log('✅ Cleared existing admin users');
        
        // Create a completely fresh admin user
        console.log('🔐 Creating password hash...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        console.log('✅ Password hash created');
        
        console.log('👤 Creating new admin user...');
        const newAdmin = new User({
            name: 'Admin User',
            email: 'admin@studentlibrary.com',
            password: hashedPassword,
            role: 'admin'
        });
        
        const savedAdmin = await newAdmin.save();
        console.log('✅ Admin user created successfully!');
        console.log('   ID:', savedAdmin._id);
        console.log('   Email:', savedAdmin.email);
        console.log('   Role:', savedAdmin.role);
        
        // Test the password immediately
        console.log('🧪 Testing password verification...');
        const testResult = await bcrypt.compare('admin123', savedAdmin.password);
        console.log('   Test result:', testResult ? '✅ SUCCESS' : '❌ FAILED');
        
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        
        console.log('\n🎯 READY TO LOGIN:');
        console.log('   Email: admin@studentlibrary.com');
        console.log('   Password: admin123');
        console.log('\n🚀 Go try logging in now!');
        
    } catch (error) {
        console.error('❌ Error:', error);
        console.error('Stack:', error.stack);
    }
}

createFreshAdmin().catch(console.error);
