const mongoose = require('mongoose');
const Book = require('./models/Book');
const Video = require('./models/Video');

require('dotenv').config();

const verifyContent = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 Connected to MongoDB');

    const books = await Book.find({ isActive: true }).select('title author category');
    const videos = await Video.find({ isActive: true }).select('title instructor category duration');

    console.log('\n📚 BOOKS IN DATABASE:');
    console.log(`Total: ${books.length}`);
    books.forEach((book, index) => {
      console.log(`${index + 1}. "${book.title}" by ${book.author} (${book.category})`);
    });

    console.log('\n🎥 VIDEOS IN DATABASE:');
    console.log(`Total: ${videos.length}`);
    videos.forEach((video, index) => {
      const duration = Math.floor(video.duration / 60);
      console.log(`${index + 1}. "${video.title}" by ${video.instructor} (${video.category}) - ${duration}min`);
    });

    console.log('\n📊 CATEGORY BREAKDOWN:');
    const bookCategories = books.reduce((acc, book) => {
      acc[book.category] = (acc[book.category] || 0) + 1;
      return acc;
    }, {});
    
    const videoCategories = videos.reduce((acc, video) => {
      acc[video.category] = (acc[video.category] || 0) + 1;
      return acc;
    }, {});

    console.log('\nBooks by Category:');
    Object.entries(bookCategories).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} books`);
    });

    console.log('\nVideos by Category:');
    Object.entries(videoCategories).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} videos`);
    });

    console.log('\n✅ Content verification complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

verifyContent();
