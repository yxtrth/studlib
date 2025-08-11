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
      default: 'https://ui-avatars.com/api/?name=User&background=6366f1&color=fff&size=200&bold=true'
    }
  },
  bio: {
    type: String,
    maxLength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  studentId: {
    type: String,
    trim: true,
    default: ''
  },
  department: {
    type: String,
    trim: true,
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
  resetPasswordExpire: Date,
  emailVerificationOTP: String,
  emailVerificationExpires: Date,
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  // Chat System Fields
  isInGlobalChat: {
    type: Boolean,
    default: false
  },
  onlineStatus: {
    type: String,
    enum: ['online', 'offline', 'away'],
    default: 'offline'
  },
  lastSeenInChat: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Update last seen
userSchema.methods.updateLastSeen = function() {
  this.lastSeen = Date.now();
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
