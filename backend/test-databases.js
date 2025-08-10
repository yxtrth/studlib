#!/usr/bin/env node

const mongoose = require('mongoose');
const User = require('./models/User');

// Test multiple possible connection strings
const connections = [
  {
    name: "Atlas Database (that we seeded)",
    uri: "mongodb+srv://yatharth10a:bb@yathsdatabase.7fir4sd.mongodb.net/student-library?retryWrites=true&w=majority&appName=YATHSDATABASE"
  },
  {
    name: "Local MongoDB",
    uri: "mongodb://localhost:27017/student-library"
  }
];

const testConnection = async (connection) => {
  try {
    console.log(`\n🔍 Testing: ${connection.name}`);
    console.log(`📡 URI: ${connection.uri.replace(/\/\/.*@/, '//***:***@')}`);
    
    await mongoose.connect(connection.uri);
    console.log('✅ Connection successful');
    
    // Check for admin user
    const adminUser = await User.findOne({ email: 'admin@studentlibrary.com' });
    if (adminUser) {
      console.log('✅ Admin user found');
      console.log(`   👤 Name: ${adminUser.name}`);
      console.log(`   🔐 Role: ${adminUser.role}`);
      console.log(`   🆔 ID: ${adminUser._id}`);
    } else {
      console.log('❌ Admin user NOT found');
    }
    
    // Count books and videos
    const Book = require('./models/Book');
    const Video = require('./models/Video');
    
    const bookCount = await Book.countDocuments();
    const videoCount = await Video.countDocuments();
    
    console.log(`📚 Books: ${bookCount}`);
    console.log(`🎥 Videos: ${videoCount}`);
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected');
    
    return {
      connected: true,
      hasAdmin: !!adminUser,
      bookCount,
      videoCount
    };
    
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    return {
      connected: false,
      error: error.message
    };
  }
};

const runDiagnostics = async () => {
  console.log('🔍 BACKEND DATABASE DIAGNOSTICS\n');
  console.log('Testing which database your backend might be using...\n');
  
  for (const connection of connections) {
    await testConnection(connection);
  }
  
  console.log('\n📋 SUMMARY:');
  console.log('If you see admin user + books/videos in Atlas Database:');
  console.log('  → Your backend should use the Atlas connection string');
  console.log('\nIf you see admin user + books/videos in Local MongoDB:');
  console.log('  → Your backend is using local database');
  console.log('\nIf neither has the admin user:');
  console.log('  → We need to seed the correct database');
  
  process.exit(0);
};

runDiagnostics();
