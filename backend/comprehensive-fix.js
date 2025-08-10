const mongoose = require('mongoose');
const Book = require('./models/Book');
const Video = require('./models/Video');

const connectDB = async () => {
  try {
    // Try to connect to production MongoDB Atlas
    const conn = await mongoose.connect('mongodb+srv://kantikatiwaristudent:1DhvL4yd7sQi5FUy@cluster0.pgh1d.mongodb.net/student-library?retryWrites=true&w=majority');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('Database connection error:', error.message);
    return false;
  }
};

const checkAndFixData = async () => {
  const connected = await connectDB();
  if (!connected) {
    console.log('❌ Could not connect to database');
    return;
  }

  try {
    console.log('🔍 Checking current data...\n');
    
    // Check books
    const books = await Book.find({}).limit(5);
    console.log(`📚 Found ${books.length} books:`);
    books.forEach((book, index) => {
      console.log(`${index + 1}. ${book.title}`);
      console.log(`   PDF URL: ${book.pdfFile?.url || 'MISSING'}`);
      console.log(`   Cover: ${book.coverImage?.url || 'MISSING'}\n`);
    });

    // Check videos  
    const videos = await Video.find({}).limit(5);
    console.log(`🎥 Found ${videos.length} videos:`);
    videos.forEach((video, index) => {
      console.log(`${index + 1}. ${video.title}`);
      console.log(`   Video URL: ${video.url || 'MISSING'}`);
      console.log(`   Thumbnail: ${video.thumbnail?.url || 'MISSING'}\n`);
    });

    // Update books with proper open source book URLs
    console.log('📖 Updating books with open source URLs...');
    const bookUrls = [
      'https://www.gutenberg.org/ebooks/74', // The Adventures of Tom Sawyer
      'https://www.gutenberg.org/ebooks/1342', // Pride and Prejudice
      'https://www.gutenberg.org/ebooks/11', // Alice's Adventures in Wonderland
      'https://www.gutenberg.org/ebooks/84', // Frankenstein
      'https://www.gutenberg.org/ebooks/345', // Dracula
      'https://www.gutenberg.org/ebooks/174', // The Picture of Dorian Gray
      'https://www.gutenberg.org/ebooks/46', // A Christmas Carol
      'https://www.gutenberg.org/ebooks/1661', // The Adventures of Sherlock Holmes
      'https://www.gutenberg.org/ebooks/76', // Adventures of Huckleberry Finn
      'https://www.gutenberg.org/ebooks/5200', // Metamorphosis
      'https://www.gutenberg.org/ebooks/2701', // Moby Dick
      'https://www.gutenberg.org/ebooks/98', // A Tale of Two Cities
      'https://www.gutenberg.org/ebooks/64317', // The Great Gatsby
      'https://www.gutenberg.org/ebooks/1080' // A Modest Proposal
    ];

    const allBooks = await Book.find({});
    for (let i = 0; i < allBooks.length && i < bookUrls.length; i++) {
      await Book.findByIdAndUpdate(allBooks[i]._id, {
        'pdfFile.url': bookUrls[i]
      });
    }

    // Update videos with proper YouTube URLs
    console.log('🎬 Updating videos with YouTube URLs...');
    const videoUrls = [
      'https://www.youtube.com/embed/RGOj5yH7evk', // Git and GitHub for Beginners
      'https://www.youtube.com/embed/SWYqp7iY_Tc', // Git & GitHub Crash Course
      'https://www.youtube.com/embed/fJtyf62yAb8', // JavaScript for Beginners
      'https://www.youtube.com/embed/PkZNo7MFNFg', // Learn JavaScript - Full Course
      'https://www.youtube.com/embed/Ke90Tje7VS0', // React Course - Beginner's Tutorial
      'https://www.youtube.com/embed/nTeuhbP7wdE', // React Tutorial for Beginners
      'https://www.youtube.com/embed/0riHps91AzE', // Node.js Tutorial for Beginners
      'https://www.youtube.com/embed/TlB_eWDSMt4', // Node.js Full Course
      'https://www.youtube.com/embed/9OPP_1eAENg', // MySQL Tutorial for Beginners
      'https://www.youtube.com/embed/HXV3zeQKqGY', // SQL - Full Database Course
      'https://www.youtube.com/embed/ER9SspLe4Hg', // Python for Everybody - Full Course
      'https://www.youtube.com/embed/rfscVS0vtbw', // Learn Python - Full Course
      'https://www.youtube.com/embed/WGJJIrtnfpk', // C Programming Tutorial
      'https://www.youtube.com/embed/KJgsSFOSQv0', // C Programming Full Course
      'https://www.youtube.com/embed/vLnPwxZdW4Y' // C++ Tutorial for Beginners
    ];

    const allVideos = await Video.find({});
    for (let i = 0; i < allVideos.length && i < videoUrls.length; i++) {
      await Video.findByIdAndUpdate(allVideos[i]._id, {
        'url': videoUrls[i]
      });
    }

    console.log('✅ URL updates completed!');
    
    // Verify updates
    console.log('\n🔍 Verifying updates...');
    const updatedBooks = await Book.find({}).limit(3);
    console.log('Sample updated books:');
    updatedBooks.forEach(book => {
      console.log(`📖 ${book.title} - PDF: ${book.pdfFile?.url || 'MISSING'}`);
    });

    const updatedVideos = await Video.find({}).limit(3);
    console.log('Sample updated videos:');
    updatedVideos.forEach(video => {
      console.log(`🎬 ${video.title} - URL: ${video.url || 'MISSING'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

checkAndFixData();
