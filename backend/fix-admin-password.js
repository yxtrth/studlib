const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function fixAdminPassword() {
    console.log('🔧 FIXING ADMIN PASSWORD');
    console.log('========================');
    
    const mongoURI = 'mongodb+srv://yatharth10a:bb@yathsdatabase.7fir4sd.mongodb.net/student-library?retryWrites=true&w=majority&appName=YATHSDATABASE';
    
    try {
        await mongoose.connect(mongoURI);
        console.log('✅ Connected to MongoDB Atlas');
        
        // Find the admin user
        const adminUser = await User.findOne({ email: 'admin@studentlibrary.com' });
        
        if (!adminUser) {
            console.log('❌ Admin user not found');
            return;
        }
        
        console.log('📧 Found admin user:', adminUser.email);
        console.log('🔍 Current password field:', typeof adminUser.password, adminUser.password ? 'exists' : 'is null/undefined');
        
        // Create a proper password hash
        console.log('🔐 Creating new password hash...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        
        // Update the admin user with the new password
        await User.findByIdAndUpdate(adminUser._id, {
            password: hashedPassword
        });
        
        console.log('✅ Password updated successfully!');
        
        // Verify the password works
        const updatedUser = await User.findById(adminUser._id);
        const isValid = await bcrypt.compare('admin123', updatedUser.password);
        
        console.log('🧪 Password verification test:', isValid ? '✅ PASSED' : '❌ FAILED');
        
        await mongoose.disconnect();
        console.log('🔌 Disconnected');
        
        console.log('\n🎯 ADMIN CREDENTIALS:');
        console.log('   Email: admin@studentlibrary.com');
        console.log('   Password: admin123');
        console.log('\n✅ Try logging in now!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

fixAdminPassword();
