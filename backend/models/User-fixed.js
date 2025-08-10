const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxLength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minLength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password when fetching user
  },
  avatar: {
    public_id: {
      type: String,
      default: ''
    },
    url: {
      type: String,
      default: 'https://res.cloudinary.com/dxkufsejm/image/upload/v1640295994/avatars/default_avatar_c5d2ec.png'
    }
  },
  bio: {
    type: String,
    maxLength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  favoriteBooks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book'
  }],
  favoriteVideos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video'
  }],
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  try {
    // Only hash password if it has been modified
    if (!this.isModified('password')) {
      return next();
    }
    
    console.log('🔐 Hashing password for user:', this.email);
    
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(12); // Increased salt rounds for better security
    this.password = await bcrypt.hash(this.password, salt);
    
    console.log('✅ Password hashed successfully');
    next();
  } catch (error) {
    console.error('❌ Password hashing error:', error);
    next(error);
  }
});

// Compare password method with enhanced error handling
userSchema.methods.comparePassword = async function(enteredPassword) {
  try {
    if (!enteredPassword) {
      console.log('❌ No password provided for comparison');
      return false;
    }
    
    if (!this.password) {
      console.log('❌ No stored password hash found');
      return false;
    }
    
    console.log('🔍 Comparing passwords for user:', this.email);
    console.log('Entered password length:', enteredPassword.length);
    console.log('Stored hash length:', this.password.length);
    
    const result = await bcrypt.compare(enteredPassword, this.password);
    console.log('Password comparison result:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Password comparison error:', error);
    return false;
  }
};

// Update last seen with error handling
userSchema.methods.updateLastSeen = async function() {
  try {
    this.lastSeen = new Date();
    await this.save({ validateBeforeSave: false }); // Skip validation for this update
    console.log('✅ Last seen updated for user:', this._id);
  } catch (error) {
    console.error('❌ Error updating last seen:', error);
    throw error;
  }
};

// Method to get safe user data (without password)
userSchema.methods.getSafeUserData = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    bio: this.bio,
    role: this.role,
    isActive: this.isActive,
    lastSeen: this.lastSeen,
    joinDate: this.joinDate,
    favoriteBooks: this.favoriteBooks,
    favoriteVideos: this.favoriteVideos,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Static method to find user by email with password
userSchema.statics.findByEmailWithPassword = function(email) {
  return this.findOne({ email }).select('+password');
};

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ isActive: 1 });

module.exports = mongoose.model('User', userSchema);
