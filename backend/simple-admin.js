const mongoose = require('mongoose');
const User = require('./models/User');

async function createSimpleAdmin() {
    console.log('🔧 CREATING SIMPLE ADMIN USER');
    console.log('=============================');
    
    const mongoURI = 'mongodb+srv://yatharth10a:bb@yathsdatabase.7fir4sd.mongodb.net/student-library?retryWrites=true&w=majority&appName=YATHSDATABASE';
    
    try {
        await mongoose.connect(mongoURI);
        console.log('✅ Connected to MongoDB');
        
        // Delete existing admin
        await User.deleteMany({ email: 'admin@studentlibrary.com' });
        console.log('🗑️ Removed existing admin');
        
        // Create new admin (password will be hashed automatically by the pre-save hook)
        const admin = new User({
            name: 'Admin User',
            email: 'admin@studentlibrary.com',
            password: 'admin123',  // This will be hashed by the pre-save hook
            role: 'admin'
        });
        
        await admin.save();
        console.log('✅ Admin user created!');
        
        // Test by finding the user and using the comparePassword method
        const testUser = await User.findOne({ email: 'admin@studentlibrary.com' }).select('+password');
        if (testUser) {
            console.log('✅ User found in database');
            const isValid = await testUser.comparePassword('admin123');
            console.log('🔐 Password test:', isValid ? '✅ VALID' : '❌ INVALID');
        }
        
        await mongoose.disconnect();
        console.log('🔌 Disconnected');
        
        console.log('\n🎯 LOGIN CREDENTIALS:');
        console.log('Email: admin@studentlibrary.com');
        console.log('Password: admin123');
        console.log('\n🚀 Try logging in now!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

createSimpleAdmin();
