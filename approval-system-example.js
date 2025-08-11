// Add this to User model for approval system
const userSchema = new mongoose.Schema({
  // existing fields...
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  }
});

// Add this to auth middleware
const protect = async (req, res, next) => {
  // existing auth logic...
  
  if (!req.user.isApproved) {
    return res.status(403).json({ 
      message: 'Account pending approval. Please contact an administrator.' 
    });
  }
  
  next();
};
