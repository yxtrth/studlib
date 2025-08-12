require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');

async function removeNonAdminUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete all users except admins
    const result = await User.deleteMany({ role: { $ne: 'admin' } });

    console.log(`Successfully removed ${result.deletedCount} non-admin users`);

  } catch (error) {
    console.error('Error removing non-admin users:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
removeNonAdminUsers();
