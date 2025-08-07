const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a book title'],
    trim: true,
    maxLength: [100, 'Title cannot exceed 100 characters']
  },
  author: {
    type: String,
    required: [true, 'Please provide an author name'],
    trim: true,
    maxLength: [50, 'Author name cannot exceed 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxLength: [2000, 'Description cannot exceed 2000 characters']
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
      'Other'
    ]
  },
  coverImage: {
    public_id: {
      type: String,
      default: ''
    },
    url: {
      type: String,
      default: 'https://via.placeholder.com/300x400/4A90E2/FFFFFF?text=No+Image'
    }
  },
  pdfFile: {
    public_id: {
      type: String,
      default: ''
    },
    url: {
      type: String,
      default: ''
    }
  },
  isbn: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  publishedDate: {
    type: Date
  },
  publisher: {
    type: String,
    trim: true,
    maxLength: [100, 'Publisher name cannot exceed 100 characters']
  },
  pages: {
    type: Number,
    min: [1, 'Number of pages must be positive']
  },
  language: {
    type: String,
    default: 'English',
    trim: true
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
  downloads: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for search functionality
bookSchema.index({
  title: 'text',
  author: 'text',
  description: 'text',
  tags: 'text'
});

// Calculate average rating
bookSchema.methods.calculateAverageRating = function() {
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
bookSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Increment download count
bookSchema.methods.incrementDownloads = function() {
  this.downloads += 1;
  return this.save();
};

module.exports = mongoose.model('Book', bookSchema);
