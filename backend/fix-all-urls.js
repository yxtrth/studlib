const mongoose = require('mongoose');
require('dotenv').config();

async function fixAllUrls() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-library');
    console.log('Connected to MongoDB');
    
    const Book = require('./models/Book');
    const Video = require('./models/Video');
    
    // Update all books with proper file URLs
    const bookUpdates = [
      {
        title: "You Don't Know JS: Scope & Closures",
        fileUrl: "https://github.com/getify/You-Dont-Know-JS/blob/2nd-ed/scope-closures/README.md"
      },
      {
        title: "Eloquent JavaScript",
        fileUrl: "https://eloquentjavascript.net/Eloquent_JavaScript.pdf"
      },
      {
        title: "Pro Git",
        fileUrl: "https://git-scm.com/book/en/v2"
      },
      {
        title: "The Art of Computer Programming, Volume 1",
        fileUrl: "https://www-cs-faculty.stanford.edu/~knuth/taocp.html"
      },
      {
        title: "Introduction to Algorithms",
        fileUrl: "https://mitpress.mit.edu/books/introduction-algorithms-third-edition"
      },
      {
        title: "Clean Code",
        fileUrl: "https://github.com/jnguyen095/clean-code"
      },
      {
        title: "Linear Algebra Done Right",
        fileUrl: "https://linear.axler.net/"
      },
      {
        title: "Calculus",
        fileUrl: "https://openstax.org/details/books/calculus-volume-1"
      },
      {
        title: "The Feynman Lectures on Physics",
        fileUrl: "https://www.feynmanlectures.caltech.edu/"
      },
      {
        title: "Structure and Interpretation of Computer Programs",
        fileUrl: "https://mitpress.mit.edu/sites/default/files/sicp/full-text/book/book.html"
      },
      {
        title: "Introduction to Statistical Learning",
        fileUrl: "https://www.statlearning.com/"
      },
      {
        title: "Meditations",
        fileUrl: "https://www.gutenberg.org/ebooks/2680"
      },
      {
        title: "Pride and Prejudice",
        fileUrl: "https://www.gutenberg.org/ebooks/1342"
      },
      {
        title: "HTML5 for Web Designers",
        fileUrl: "https://html5forwebdesigners.com/"
      }
    ];

    // Update all videos with proper video URLs (YouTube embeds)
    const videoUpdates = [
      {
        title: "JavaScript Fundamentals",
        videoUrl: "https://www.youtube.com/embed/hdI2bqOjy3c"
      },
      {
        title: "Python for Everybody",
        videoUrl: "https://www.youtube.com/embed/8DvywoWv6fI"
      },
      {
        title: "React.js Full Course",
        videoUrl: "https://www.youtube.com/embed/DLX62G4lc44"
      },
      {
        title: "Harvard CS50 - Introduction to Computer Science",
        videoUrl: "https://www.youtube.com/embed/YoXxevp1WRQ"
      },
      {
        title: "MIT 6.006 Introduction to Algorithms",
        videoUrl: "https://www.youtube.com/embed/HtSuA80QTyo"
      },
      {
        title: "Linear Algebra - MIT OpenCourseWare",
        videoUrl: "https://www.youtube.com/embed/ZK3O402wf1c"
      },
      {
        title: "Calculus - The Essence of Calculus",
        videoUrl: "https://www.youtube.com/embed/WUvTyaaNkzM"
      },
      {
        title: "Physics - MIT 8.01 Classical Mechanics",
        videoUrl: "https://www.youtube.com/embed/wWnfJ0-xXRE"
      },
      {
        title: "Machine Learning Course - Stanford",
        videoUrl: "https://www.youtube.com/embed/PPLop4L2eGk"
      },
      {
        title: "Data Science with Python",
        videoUrl: "https://www.youtube.com/embed/LHBE6Q9XlzI"
      },
      {
        title: "HTML & CSS Full Course",
        videoUrl: "https://www.youtube.com/embed/mU6anWqZJcc"
      },
      {
        title: "Node.js Tutorial for Beginners",
        videoUrl: "https://www.youtube.com/embed/TlB_eWDSMt4"
      },
      {
        title: "Introduction to Philosophy - Yale",
        videoUrl: "https://www.youtube.com/embed/kBdfcR-8hEY"
      },
      {
        title: "Economics - Supply and Demand",
        videoUrl: "https://www.youtube.com/embed/3ez10ADR_gM"
      },
      {
        title: "Ethical Hacking Full Course",
        videoUrl: "https://www.youtube.com/embed/3Kq1MIfTWCE"
      }
    ];

    // Update books
    let booksUpdated = 0;
    for (const bookUpdate of bookUpdates) {
      const result = await Book.updateOne(
        { title: bookUpdate.title },
        { $set: { fileUrl: bookUpdate.fileUrl } }
      );
      if (result.modifiedCount > 0) {
        booksUpdated++;
        console.log(`✓ Updated book: ${bookUpdate.title}`);
      } else {
        console.log(`⚠ No match found for book: ${bookUpdate.title}`);
      }
    }

    // Update videos
    let videosUpdated = 0;
    for (const videoUpdate of videoUpdates) {
      const result = await Video.updateOne(
        { title: videoUpdate.title },
        { $set: { videoUrl: videoUpdate.videoUrl } }
      );
      if (result.modifiedCount > 0) {
        videosUpdated++;
        console.log(`✓ Updated video: ${videoUpdate.title}`);
      } else {
        console.log(`⚠ No match found for video: ${videoUpdate.title}`);
      }
    }

    console.log(`\n📚 Updated ${booksUpdated} out of ${bookUpdates.length} books with file URLs`);
    console.log(`🎥 Updated ${videosUpdated} out of ${videoUpdates.length} videos with video URLs`);
    
    await mongoose.disconnect();
    console.log('\n✅ Database update completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixAllUrls();
