const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function createWorkingAdmin() {
    console.log('🔧 CREATING WORKING ADMIN USER');
    console.log('==============================');
    
    const productionURI = 'mongodb+srv://yatharth10a:bb@yathsdatabase.7fir4sd.mongodb.net/student-library?retryWrites=true&w=majority&appName=YATHSDATABASE';
    
    try {
        await mongoose.connect(productionURI);
        console.log('✅ Connected to production database');
        
        // Remove existing admin
        await User.deleteMany({ role: 'admin' });
        console.log('🗑️ Removed existing admin users');
        
        // Create admin with ALL required fields
        const adminData = {
            name: 'Admin User',
            email: 'admin@studentlibrary.com',
            password: 'admin123', // Will be hashed by pre-save middleware
            role: 'admin',
            isActive: true,  // IMPORTANT: Make sure this is true
            bio: 'System Administrator',
            department: 'Administration'
        };
        
        const admin = new User(adminData);
        const savedAdmin = await admin.save();
        
        console.log('✅ Admin user created successfully!');
        console.log(`   ID: ${savedAdmin._id}`);
        console.log(`   Name: ${savedAdmin.name}`);
        console.log(`   Email: ${savedAdmin.email}`);
        console.log(`   Role: ${savedAdmin.role}`);
        console.log(`   Active: ${savedAdmin.isActive}`);
        console.log(`   Department: ${savedAdmin.department}`);
        
        // Test password using the model method
        console.log('\n🔐 Testing password with model method...');
        const isValidPassword = await savedAdmin.comparePassword('admin123');
        console.log(`   Password test: ${isValidPassword ? '✅ VALID' : '❌ INVALID'}`);
        
        // Test direct bcrypt comparison
        console.log('\n🔐 Testing with direct bcrypt...');
        const directTest = await bcrypt.compare('admin123', savedAdmin.password);
        console.log(`   Direct bcrypt test: ${directTest ? '✅ VALID' : '❌ INVALID'}`);
        
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected');
        
        if (isValidPassword && savedAdmin.isActive) {
            console.log('\n🎉 SUCCESS! Admin user is ready for login!');
            console.log('🔐 Credentials:');
            console.log('   📧 Email: admin@studentlibrary.com');
            console.log('   🔑 Password: admin123');
            console.log('\n🚀 Try logging in now!');
        } else {
            console.log('\n❌ Something is still wrong...');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

createWorkingAdmin();
