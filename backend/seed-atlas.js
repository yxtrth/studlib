#!/usr/bin/env node

const mongoose = require('mongoose');
const { seedDatabase } = require('./utils/seedData');

// Your MongoDB Atlas connection string
const ATLAS_CONNECTION = "mongodb+srv://yatharth10a:bb@yathsdatabase.7fir4sd.mongodb.net/student-library?retryWrites=true&w=majority&appName=YATHSDATABASE";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(ATLAS_CONNECTION);
    console.log(`🔗 MongoDB Atlas Connected: ${conn.connection.host}`);
    console.log(`🌍 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ Database connection error:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure to replace <db_username> with your actual MongoDB Atlas username');
    console.log('2. Verify your password is correct (currently set to "bb")');
    console.log('3. Check if your IP is whitelisted in MongoDB Atlas');
    process.exit(1);
  }
};

const runAtlasSeeding = async () => {
  console.log('🌍 Seeding MongoDB Atlas Database for Netlify...\n');
  
  if (ATLAS_CONNECTION.includes('<db_username>')) {
    console.log('⚠️  IMPORTANT: Please edit this file and replace <db_username> with your actual MongoDB Atlas username');
    console.log('📝 Edit: backend/seed-atlas.js');
    console.log('🔧 Replace: <db_username> with your MongoDB Atlas database user');
    return;
  }
  
  console.log('🎯 Target: MongoDB Atlas Database');
  console.log('🌐 This will make content visible on your Netlify deployment');
  
  try {
    // Connect to Atlas database
    await connectDB();
    
    // Run seeding
    console.log('🌱 Starting seeding process...');
    const result = await seedDatabase();
    
    console.log('\n🎉 Atlas seeding completed successfully!');
    console.log('🌐 Your Netlify app should now show all content!');
    console.log('\n📊 Content Added:');
    console.log(`   📚 Books: ${result.books.length}`);
    console.log(`   🎥 Videos: ${result.videos.length}`);
    console.log('\n🔐 Admin Login for Netlify:');
    console.log('   Email: admin@studentlibrary.com');
    console.log('   Password: admin123456');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Atlas seeding failed:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Run the Atlas seeding
runAtlasSeeding();
