const mongoose = require('mongoose');
require('dotenv').config();

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-library');
    console.log('Connected to MongoDB');
    
    const Book = require('./models/Book');
    const Video = require('./models/Video');
    
    // Check books
    const books = await Book.find({}).limit(3).select('title fileUrl coverImage');
    console.log('Sample books:');
    books.forEach(book => {
      console.log(`- ${book.title}: fileUrl=${book.fileUrl || 'MISSING'}, cover=${book.coverImage || 'MISSING'}`);
    });
    
    // Check videos
    const videos = await Video.find({}).limit(3).select('title videoUrl thumbnail');
    console.log('\nSample videos:');
    videos.forEach(video => {
      console.log(`- ${video.title}: videoUrl=${video.videoUrl || 'MISSING'}, thumbnail=${video.thumbnail || 'MISSING'}`);
    });
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkData();
