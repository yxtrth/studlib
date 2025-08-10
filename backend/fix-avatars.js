const mongoose = require('mongoose');
require('dotenv').config();

async function updateAvatars() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-library');
    console.log('Connected to MongoDB');
    
    const User = require('./models/User');
    
    // Update all users with the broken avatar URL in nested object
    const result = await User.updateMany(
      { 'avatar.url': 'https://res.cloudinary.com/dxkufsejm/image/upload/v1640295994/avatars/default_avatar_c5d2ec.png' },
      { $set: { 'avatar.url': 'https://ui-avatars.com/api/?name=User&background=6366f1&color=fff&size=200&bold=true' } }
    );
    
    console.log('Updated', result.modifiedCount, 'users with nested avatar URL');
    
    // Also check if there are any users with just the old URL in a simple field
    const result2 = await User.updateMany(
      { avatar: 'https://res.cloudinary.com/dxkufsejm/image/upload/v1640295994/avatars/default_avatar_c5d2ec.png' },
      { $set: { avatar: 'https://ui-avatars.com/api/?name=User&background=6366f1&color=fff&size=200&bold=true' } }
    );
    
    console.log('Updated', result2.modifiedCount, 'users with simple avatar field');
    
    // List all users to see their current avatar values
    const users = await User.find({}, 'name email avatar').limit(5);
    console.log('Sample user avatars:');
    users.forEach(user => {
      console.log(`- ${user.email}: ${user.avatar?.url || user.avatar || 'No avatar'}`);
    });
    
    await mongoose.disconnect();
    console.log('Database update completed');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateAvatars();
