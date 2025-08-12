const mongoose = require('mongoose');

function createModel() {
  const userSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student'
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationOTP: {
      type: String
    },
    otpExpires: {
      type: Date
    }
  }, {
    timestamps: true
  });

  // Remove password when converting to JSON
  userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    return user;
  };

  try {
    // Try to get the existing model
    return mongoose.model('User');
  } catch {
    // If the model doesn't exist, create it
    return mongoose.model('User', userSchema);
  }
}

module.exports = createModel();
