#!/usr/bin/env node

const mongoose = require('mongoose');
const { seedDatabase } = require('./utils/seedData');

// Load environment variables
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`🔗 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

const runSeed = async () => {
  console.log('🚀 Starting Student Library Database Seeding...\n');
  
  try {
    // Connect to database
    await connectDB();
    
    // Run seeding
    const result = await seedDatabase();
    
    console.log('\n🎉 Seeding completed successfully!');
    console.log('You can now login with:');
    console.log('Email: admin@studentlibrary.com');
    console.log('Password: admin123456');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Run the seeding
runSeed();
