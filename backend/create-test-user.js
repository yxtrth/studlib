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

const createTestUser = async () => {
  console.log('👤 Creating Test Student User...\n');
  
  try {
    await connectDB();

    // Delete existing test user if it exists
    await User.deleteOne({ email: 'student@test.com' });

    // Create test student user
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash('student123', salt);
    
    const testUser = await User.create({
      name: 'Test Student',
      email: 'student@test.com',
      password: hashedPassword,
      role: 'student',
      isActive: true,
      bio: 'Test student account',
      department: 'Computer Science',
      studentId: 'TEST001'
    });
    
    console.log('✅ Test student user created successfully');
    console.log('\n🔍 Test User Details:');
    console.log(`   📧 Email: ${testUser.email}`);
    console.log(`   👤 Name: ${testUser.name}`);
    console.log(`   🔐 Role: ${testUser.role}`);
    console.log(`   🆔 Student ID: ${testUser.studentId}`);

    console.log('\n🎉 Both accounts are ready!');
    console.log('\n🔐 Login Options:');
    console.log('\n👨‍💼 ADMIN ACCOUNT:');
    console.log('   Email: admin@studentlibrary.com');
    console.log('   Password: admin123456');
    console.log('\n👨‍🎓 STUDENT ACCOUNT:');
    console.log('   Email: student@test.com');
    console.log('   Password: student123');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating test user:', error);
    process.exit(1);
  }
};

// Run the test user creation
createTestUser();
