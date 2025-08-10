const mongoose = require('mongoose');
const Book = require('./models/Book');
const Video = require('./models/Video');

// Better book URLs - actual open source programming books
const bookUrls = {
  "Introduction to Programming": "https://www.gutenberg.org/files/35/35-pdf.pdf",
  "Learn Python Programming": "https://greenteapress.com/thinkpython2/thinkpython2.pdf", 
  "JavaScript: The Good Parts": "https://github.com/getify/You-Dont-Know-JS",
  "Clean Code": "https://www.oreilly.com/library/view/clean-code-a/9780136083238/",
  "Data Structures and Algorithms": "https://algs4.cs.princeton.edu/home/",
  "Introduction to Machine Learning": "https://www.cs.cmu.edu/~tom/mlbook.html",
  "Computer Networks": "https://book.systemsapproach.org/",
  "Database Systems": "https://db-book.com/",
  "Software Engineering": "https://software-engineering-book.com/",
  "Operating Systems": "https://pages.cs.wisc.edu/~remzi/OSTEP/",
  "Linear Algebra": "https://linear.axler.net/",
  "Introduction to Physics": "https://www.feynmanlectures.caltech.edu/",
  "Chemistry Basics": "https://openstax.org/details/books/chemistry-2e",
  "Business Management": "https://openstax.org/details/books/principles-management"
};

// Better video URLs - actual educational YouTube videos
const videoUrls = {
  "Programming Fundamentals": "https://www.youtube.com/embed/zOjov-2OZ0E",
  "Python Tutorial for Beginners": "https://www.youtube.com/embed/YYXdXT2l-Gg", 
  "JavaScript Crash Course": "https://www.youtube.com/embed/hdI2bqOjy3c",
  "React.js Tutorial": "https://www.youtube.com/embed/Ke90Tje7VS0",
  "Node.js Basics": "https://www.youtube.com/embed/TlB_eWDSMt4",
  "Introduction to Machine Learning": "https://www.youtube.com/embed/ukzFI9rgwfU",
  "Database Design": "https://www.youtube.com/embed/ztHopE5Wnpc",
  "Web Development Crash Course": "https://www.youtube.com/embed/UB1O30fR-EE",
  "Data Structures Tutorial": "https://www.youtube.com/embed/RBSGKlAvoiM",
  "Computer Networks Explained": "https://www.youtube.com/embed/3QhU9jd03a0",
  "Linear Algebra Course": "https://www.youtube.com/embed/fNk_zzaMoSs",
  "Physics Lecture Series": "https://www.youtube.com/embed/VdOkJW_ZZJ8",
  "Chemistry Fundamentals": "https://www.youtube.com/embed/FSyAehMdpyI",
  "Business Management Basics": "https://www.youtube.com/embed/yP3QKfqJAH4",
  "Introduction to Psychology": "https://www.youtube.com/embed/vo4pMVb0R6M"
};

const connectDB = async () => {
  try {
    // Use Render's environment variable
    const dbURI = process.env.MONGODB_URI || 'mongodb+srv://kantikatiwaristudent:1DhvL4yd7sQi5FUy@cluster0.pgh1d.mongodb.net/student-library?retryWrites=true&w=majority';
    const conn = await mongoose.connect(dbURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

const updateSpecificUrls = async () => {
  await connectDB();

  try {
    console.log('📚 Updating Book URLs with specific content...');
    
    let bookUpdates = 0;
    for (const [title, url] of Object.entries(bookUrls)) {
      const result = await Book.updateOne(
        { title: { $regex: title, $options: 'i' } },
        { $set: { 'pdfFile.url': url } }
      );
      if (result.modifiedCount > 0) {
        bookUpdates++;
        console.log(`✅ Updated: ${title}`);
      }
    }
    
    console.log(`📖 Updated ${bookUpdates} books with specific URLs`);

    console.log('\n🎥 Updating Video URLs with specific content...');
    
    let videoUpdates = 0;
    for (const [title, url] of Object.entries(videoUrls)) {
      const result = await Video.updateOne(
        { title: { $regex: title, $options: 'i' } },
        { $set: { url: url } }
      );
      if (result.modifiedCount > 0) {
        videoUpdates++;
        console.log(`✅ Updated: ${title}`);
      }
    }
    
    console.log(`🎬 Updated ${videoUpdates} videos with specific URLs`);

    // Verify the updates
    console.log('\n🔍 Verifying updates...');
    
    const books = await Book.find({ 'pdfFile.url': { $ne: '' } }, 'title pdfFile.url').limit(5);
    console.log('\nUpdated books:');
    books.forEach(book => {
      console.log(`📖 ${book.title} - PDF: ${book.pdfFile?.url?.substring(0, 50)}...`);
    });

    const videos = await Video.find({ url: { $ne: '' } }, 'title url').limit(5);
    console.log('\nUpdated videos:');
    videos.forEach(video => {
      console.log(`🎬 ${video.title} - URL: ${video.url?.substring(0, 50)}...`);
    });

    console.log('\n✅ Specific URL update completed successfully!');
    
  } catch (error) {
    console.error('❌ Error updating URLs:', error);
  } finally {
    mongoose.connection.close();
  }
};

if (require.main === module) {
  updateSpecificUrls();
}

module.exports = { updateSpecificUrls };
