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

const fixAdminUser = async () => {
  console.log('🔧 Fixing Admin User Credentials...\n');
  
  try {
    await connectDB();

    // Delete existing admin user if it exists
    await User.deleteOne({ email: 'admin@studentlibrary.com' });
    console.log('🗑️ Removed existing admin user');

    // Create fresh admin user with proper password hashing
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash('admin123', salt);
    
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@studentlibrary.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      bio: 'System Administrator',
      department: 'Administration'
    });
    
    console.log('✅ Fresh admin user created successfully');
    console.log('\n🔍 Admin User Details:');
    console.log(`   📧 Email: ${adminUser.email}`);
    console.log(`   👤 Name: ${adminUser.name}`);
    console.log(`   🔐 Role: ${adminUser.role}`);
    console.log(`   ✅ Active: ${adminUser.isActive}`);
    console.log(`   🆔 ID: ${adminUser._id}`);

    console.log('\n🎉 Admin user is ready!');
    console.log('\n🔐 Login Credentials:');
    console.log('   Email: admin@studentlibrary.com');
    console.log('   Password: admin123456');
    console.log('\n🌐 Try logging in to your Netlify app now!');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error fixing admin user:', error);
    process.exit(1);
  }
};

// Run the admin fix
fixAdminUser();
