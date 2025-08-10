const mongoose = require('mongoose');
const Book = require('./models/Book');
const Video = require('./models/Video');

const connectDB = async () => {
  const maxRetries = 3;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      // Use the working connection string from previous scripts
      const dbURI = 'mongodb+srv://kantikatiwaristudent:1DhvL4yd7sQi5FUy@cluster0.pgh1d.mongodb.net/student-library?retryWrites=true&w=majority';
      const conn = await mongoose.connect(dbURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 30000, // 30 seconds
        connectTimeoutMS: 30000, // 30 seconds
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      retries++;
      console.error(`Database connection attempt ${retries} failed:`, error.message);
      if (retries >= maxRetries) {
        console.error('All connection attempts failed');
        process.exit(1);
      }
      // Wait 2 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

const updateUrls = async () => {
  await connectDB();

  try {
    console.log('📚 Updating Book URLs...');
    
    // Update all books with the correct field name: pdfFile.url
    const bookUpdateResult = await Book.updateMany(
      {},
      {
        $set: {
          'pdfFile.url': 'https://www.gutenberg.org/ebooks/search/?query=programming'
        }
      }
    );
    
    console.log(`✅ Updated ${bookUpdateResult.modifiedCount} books with PDF URLs`);

    console.log('🎥 Updating Video URLs...');
    
    // Update all videos with the correct field name: url
    const videoUpdateResult = await Video.updateMany(
      {},
      {
        $set: {
          'url': 'https://www.youtube.com/embed/dQw4w9WgXcQ'
        }
      }
    );
    
    console.log(`✅ Updated ${videoUpdateResult.modifiedCount} videos with URLs`);

    // Verify the updates
    console.log('\n🔍 Verifying updates...');
    
    const books = await Book.find({}, 'title pdfFile.url').limit(3);
    console.log('\nSample books:');
    books.forEach(book => {
      console.log(`📖 ${book.title} - PDF URL: ${book.pdfFile?.url || 'MISSING'}`);
    });

    const videos = await Video.find({}, 'title url').limit(3);
    console.log('\nSample videos:');
    videos.forEach(video => {
      console.log(`🎬 ${video.title} - Video URL: ${video.url || 'MISSING'}`);
    });

    console.log('\n✅ URL update completed successfully!');
    
  } catch (error) {
    console.error('❌ Error updating URLs:', error);
  } finally {
    mongoose.connection.close();
  }
};

updateUrls();
