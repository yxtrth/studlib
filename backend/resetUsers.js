const mongoose = require('mongoose');
require('dotenv').config();

// Import your User model
const User = require('./models/User');

const resetUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Count existing users
    const userCount = await User.countDocuments();
    console.log(`Found ${userCount} users in the database`);
    
    if (userCount > 0) {
      // Delete all users
      const result = await User.deleteMany({});
      console.log(`✅ Successfully deleted ${result.deletedCount} users`);
    } else {
      console.log('No users found to delete');
    }
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error resetting users:', error);
    process.exit(1);
  }
};

// Run the script
resetUsers();
