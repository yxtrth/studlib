const mongoose = require('mongoose');
require('dotenv').config();

async function debugData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-library');
    console.log('Connected to MongoDB');
    
    const Book = require('./models/Book');
    const Video = require('./models/Video');
    
    // Get all books with their exact titles
    const books = await Book.find({}).select('title fileUrl');
    console.log('All books in database:');
    books.forEach((book, index) => {
      console.log(`${index + 1}. Title: "${book.title}"`);
      console.log(`   fileUrl: ${book.fileUrl || 'MISSING'}`);
      console.log('');
    });
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Get all videos with their exact titles
    const videos = await Video.find({}).select('title videoUrl');
    console.log('All videos in database:');
    videos.forEach((video, index) => {
      console.log(`${index + 1}. Title: "${video.title}"`);
      console.log(`   videoUrl: ${video.videoUrl || 'MISSING'}`);
      console.log('');
    });
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debugData();
