const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function createProductionAdmin() {
    console.log('🔧 CREATING FRESH ADMIN USER IN PRODUCTION');
    console.log('===========================================');
    
    const productionURI = 'mongodb+srv://yatharth10a:bb@yathsdatabase.7fir4sd.mongodb.net/student-library?retryWrites=true&w=majority&appName=YATHSDATABASE';
    
    try {
        await mongoose.connect(productionURI);
        console.log('✅ Connected to production database');
        
        // Remove any existing admin users
        await User.deleteMany({ role: 'admin' });
        console.log('🗑️ Removed existing admin users');
        
        // Create fresh admin user with proper password hashing
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash('admin123', saltRounds);
        
        const adminUser = new User({
            name: 'Admin User',
            email: 'admin@studentlibrary.com',
            password: hashedPassword,
            role: 'admin'
        });
        
        await adminUser.save();
        console.log('✅ Fresh admin user created successfully!');
        
        // Verify the user was created
        const savedAdmin = await User.findOne({ email: 'admin@studentlibrary.com' });
        console.log('✅ Verification:');
        console.log(`   Name: ${savedAdmin.name}`);
        console.log(`   Email: ${savedAdmin.email}`);
        console.log(`   Role: ${savedAdmin.role}`);
        console.log(`   ID: ${savedAdmin._id}`);
        
        // Test password verification
        const passwordTest = await bcrypt.compare('admin123', savedAdmin.password);
        console.log(`   Password test: ${passwordTest ? '✅ VALID' : '❌ INVALID'}`);
        
        await mongoose.disconnect();
        console.log('🔌 Disconnected');
        
        console.log('\n🎯 NOW TRY LOGGING IN WITH:');
        console.log('📧 Email: admin@studentlibrary.com');
        console.log('🔐 Password: admin123');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

createProductionAdmin();
