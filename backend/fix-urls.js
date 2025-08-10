const mongoose = require('mongoose');
require('dotenv').config();

async function fixBookAndVideoUrls() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-library');
    console.log('Connected to MongoDB');
    
    const Book = require('./models/Book');
    const Video = require('./models/Video');
    
    // Update books with proper file URLs (open source books)
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
        title: "The Linux Command Line",
        fileUrl: "http://linuxcommand.org/tlcl.php"
      },
      {
        title: "Automate the Boring Stuff with Python",
        fileUrl: "https://automatetheboringstuff.com/2e/"
      },
      {
        title: "Think Python",
        fileUrl: "https://greenteapress.com/thinkpython2/thinkpython2.pdf"
      },
      {
        title: "Learn Python the Hard Way",
        fileUrl: "https://learnpythonthehardway.org/python3/"
      },
      {
        title: "JavaScript: The Good Parts",
        fileUrl: "https://github.com/dwyl/Javascript-the-Good-Parts-notes"
      },
      {
        title: "CSS: The Definitive Guide",
        fileUrl: "https://www.oreilly.com/library/view/css-the-definitive/9781449325053/"
      },
      {
        title: "HTML5: The Missing Manual",
        fileUrl: "https://www.oreilly.com/library/view/html5-the-missing/9781449312671/"
      },
      {
        title: "Design Patterns",
        fileUrl: "https://refactoring.guru/design-patterns"
      },
      {
        title: "Clean Code",
        fileUrl: "https://github.com/jnguyen095/clean-code"
      },
      {
        title: "The Pragmatic Programmer",
        fileUrl: "https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/"
      },
      {
        title: "Introduction to Algorithms",
        fileUrl: "https://mitpress.mit.edu/books/introduction-algorithms-third-edition"
      }
    ];

    // Update videos with proper video URLs (YouTube embeds)
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
        title: "Node.js Tutorial",
        videoUrl: "https://www.youtube.com/embed/TlB_eWDSMt4"
      },
      {
        title: "CSS Grid Layout",
        videoUrl: "https://www.youtube.com/embed/jV8B24rSN5o"
      },
      {
        title: "HTML5 & CSS3 Complete Course",
        videoUrl: "https://www.youtube.com/embed/mU6anWqZJcc"
      },
      {
        title: "Git and GitHub Tutorial",
        videoUrl: "https://www.youtube.com/embed/RGOj5yH7evk"
      },
      {
        title: "Database Design Course",
        videoUrl: "https://www.youtube.com/embed/ztHopE5Wnpc"
      },
      {
        title: "Web Development Full Course",
        videoUrl: "https://www.youtube.com/embed/nu_pCVPKzTk"
      },
      {
        title: "Data Structures and Algorithms",
        videoUrl: "https://www.youtube.com/embed/RBSGKlAvoiM"
      },
      {
        title: "Machine Learning Course",
        videoUrl: "https://www.youtube.com/embed/aircAruvnKk"
      },
      {
        title: "Cybersecurity Fundamentals",
        videoUrl: "https://www.youtube.com/embed/sdpxddDzXfE"
      },
      {
        title: "Cloud Computing Basics",
        videoUrl: "https://www.youtube.com/embed/M988_fsOSWo"
      },
      {
        title: "DevOps Tutorial",
        videoUrl: "https://www.youtube.com/embed/Xrgk023l4lI"
      },
      {
        title: "Mobile App Development",
        videoUrl: "https://www.youtube.com/embed/0-S5a0eXPoc"
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
      }
    }

    console.log(`\n📚 Updated ${booksUpdated} books with file URLs`);
    console.log(`🎥 Updated ${videosUpdated} videos with video URLs`);
    
    await mongoose.disconnect();
    console.log('\n✅ All books and videos now have proper URLs!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixBookAndVideoUrls();
