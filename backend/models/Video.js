const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a video title'],
    trim: true,
    maxLength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxLength: [2000, 'Description cannot exceed 2000 characters']
  },
  url: {
    type: String,
    required: [true, 'Please provide a video URL']
  },
  thumbnail: {
    public_id: {
      type: String,
      default: ''
    },
    url: {
      type: String,
      default: 'https://via.placeholder.com/480x360/4A90E2/FFFFFF?text=No+Thumbnail'
    }
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: [
      'Programming',
      'Web Development',
      'Mobile Development',
      'Data Science',
      'Machine Learning',
      'Artificial Intelligence',
      'Cybersecurity',
      'Networking',
      'Database',
      'Software Engineering',
      'Mathematics',
      'Physics',
      'Chemistry',
      'Biology',
      'Business',
      'Economics',
      'Literature',
      'History',
      'Philosophy',
      'Psychology',
      'Tutorial',
      'Lecture',
      'Documentary',
      'Other'
    ]
  },
  duration: {
    type: Number, // Duration in seconds
    min: [1, 'Duration must be positive']
  },
  instructor: {
    type: String,
    trim: true,
    maxLength: [50, 'Instructor name cannot exceed 50 characters']
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  tags: [{
    type: String,
    trim: true,
    maxLength: [30, 'Tag cannot exceed 30 characters']
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxLength: [500, 'Review comment cannot exceed 500 characters']
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  videoFile: {
    public_id: {
      type: String,
      default: ''
    },
    url: {
      type: String,
      default: ''
    }
  },
  isExternal: {
    type: Boolean,
    default: false // true if video is hosted externally (YouTube, Vimeo, etc.)
  }
}, {
  timestamps: true
});

// Index for search functionality
videoSchema.index({
  title: 'text',
  description: 'text',
  instructor: 'text',
  tags: 'text'
});

// Calculate average rating
videoSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.rating.average = 0;
    this.rating.count = 0;
  } else {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.rating.average = (sum / this.reviews.length).toFixed(1);
    this.rating.count = this.reviews.length;
  }
  return this.save();
};

// Increment view count
videoSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Toggle like
videoSchema.methods.toggleLike = function(userId) {
  const existingLike = this.likes.find(like => like.user.toString() === userId.toString());
  
  if (existingLike) {
    this.likes = this.likes.filter(like => like.user.toString() !== userId.toString());
  } else {
    this.likes.push({ user: userId });
  }
  
  return this.save();
};

// Get like count
videoSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

module.exports = mongoose.model('Video', videoSchema);
