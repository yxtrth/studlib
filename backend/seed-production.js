#!/usr/bin/env node

const mongoose = require('mongoose');
const { seedDatabase } = require('./utils/seedData');

// Load environment variables
require('dotenv').config();

// Production MongoDB Atlas connection
const PRODUCTION_MONGODB_URI = "mongodb+srv://yatharth10a:bb@yathsdatabase.7fir4sd.mongodb.net/student-library?retryWrites=true&w=majority&appName=YATHSDATABASE";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(PRODUCTION_MONGODB_URI);
    console.log(`🔗 MongoDB Connected: ${conn.connection.host}`);
    console.log(`🌍 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

const runProductionSeed = async () => {
  console.log('🌍 Starting PRODUCTION Database Seeding...\n');
  
  if (!PRODUCTION_MONGODB_URI || PRODUCTION_MONGODB_URI.includes('localhost')) {
    console.error('❌ Error: Production MongoDB URI not found!');
    console.log('Please set PRODUCTION_MONGODB_URI environment variable to your MongoDB Atlas connection string.');
    console.log('Example: PRODUCTION_MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/student-library');
    process.exit(1);
  }
  
  console.log('⚠️  WARNING: This will seed your PRODUCTION database!');
  console.log('📡 Target Database:', PRODUCTION_MONGODB_URI.replace(/\/\/.*@/, '//***:***@'));
  
  try {
    // Connect to production database
    await connectDB();
    
    // Run seeding
    const result = await seedDatabase();
    
    console.log('\n🎉 Production seeding completed successfully!');
    console.log('🌐 Your Netlify app should now show the content!');
    console.log('\nAdmin credentials for production:');
    console.log('Email: admin@studentlibrary.com');
    console.log('Password: admin123456');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Production seeding failed:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Run the production seeding
runProductionSeed();
