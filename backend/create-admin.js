#!/usr/bin/env node

const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

// Import User model
const User = require('./models/User');

// Atlas connection
const ATLAS_CONNECTION = "mongodb+srv://yatharth10a:bb@yathsdatabase.7fir4sd.mongodb.net/student-library?retryWrites=true&w=majority&appName=YATHSDATABASE";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(ATLAS_CONNECTION);
    console.log(`🔗 MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

const createAdminUser = async () => {
  console.log('👤 Creating/Updating Admin User...\n');
  
  try {
    await connectDB();

    // Check if admin user exists
    let adminUser = await User.findOne({ email: 'admin@studentlibrary.com' });
    
    if (adminUser) {
      console.log('📝 Admin user found, updating credentials...');
      
      // Update password and ensure admin role
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash('admin123456', salt);
      
      adminUser.password = hashedPassword;
      adminUser.role = 'admin';
      adminUser.isActive = true;
      adminUser.name = 'Admin User';
      
      await adminUser.save();
      console.log('✅ Admin user updated successfully');
    } else {
      console.log('📝 Creating new admin user...');
      
      // Create new admin user
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash('admin123456', salt);
      
      adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@studentlibrary.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        bio: 'System Administrator',
        department: 'Administration'
      });
      
      console.log('✅ New admin user created successfully');
    }

    // Verify the admin user
    const verifyAdmin = await User.findOne({ email: 'admin@studentlibrary.com' });
    if (verifyAdmin) {
      console.log('\n🔍 Admin User Verification:');
      console.log(`   📧 Email: ${verifyAdmin.email}`);
      console.log(`   👤 Name: ${verifyAdmin.name}`);
      console.log(`   🔐 Role: ${verifyAdmin.role}`);
      console.log(`   ✅ Active: ${verifyAdmin.isActive}`);
      console.log(`   🆔 ID: ${verifyAdmin._id}`);
      
      // Test password verification
      const isPasswordValid = await bcryptjs.compare('admin123456', verifyAdmin.password);
      console.log(`   🔑 Password Valid: ${isPasswordValid}`);
    }

    console.log('\n🎉 Admin user setup completed!');
    console.log('\n🔐 Login Credentials for Netlify:');
    console.log('   Email: admin@studentlibrary.com');
    console.log('   Password: admin123456');
    console.log('\n🌐 Try logging in to your Netlify app now!');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating admin user:', error);
    process.exit(1);
  }
};

// Run the admin creation
createAdminUser();
