const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import your User model
const User = require('./models/User');

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Admin user details
    const adminData = {
      name: 'Admin User',
      email: 'admin@studentlib.com',
      password: 'admin123',
      role: 'admin',
      isActive: true,
      bio: 'System Administrator',
      department: 'Administration',
      studentId: 'ADMIN001'
    };
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log('❌ Admin user with this email already exists');
      console.log('Existing admin:', {
        name: existingAdmin.name,
        email: existingAdmin.email,
        role: existingAdmin.role
      });
      await mongoose.disconnect();
      return;
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    adminData.password = await bcrypt.hash(adminData.password, salt);
    
    // Create admin user
    const admin = new User(adminData);
    await admin.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('Admin Details:');
    console.log('Name:', admin.name);
    console.log('Email:', admin.email);
    console.log('Role:', admin.role);
    console.log('Password: admin123');
    console.log('\n🔐 Please change the password after first login!');
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

// Run the script
createAdmin();
