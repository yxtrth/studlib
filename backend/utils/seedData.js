const mongoose = require('mongoose');
const Book = require('../models/Book');
const Video = require('../models/Video');
const User = require('../models/User');

// Open Source Books Data
const booksData = [
  // Programming Books
  {
    title: "You Don't Know JS: Scope & Closures",
    author: "Kyle Simpson",
    description: "This book will drive you to understand not just the pieces of JS, but how they work together. You'll learn to appreciate and respect the language's power and elegance, instead of just tolerating its quirks.",
    category: "Programming",
    isbn: "9781449335885",
    publishedDate: new Date("2014-03-11"),
    publisher: "O'Reilly Media",
    pages: 98,
    language: "English",
    tags: ["JavaScript", "Web Development", "Open Source", "Programming"],
    coverImage: {
      url: "https://covers.openlibrary.org/b/isbn/9781449335885-L.jpg"
    },
    pdfFile: {
      url: "https://github.com/getify/You-Dont-Know-JS/tree/1st-ed/scope%20%26%20closures"
    }
  },
  {
    title: "Eloquent JavaScript",
    author: "Marijn Haverbeke",
    description: "A modern introduction to programming using JavaScript. This book teaches JavaScript, programming, and the wonders of the digital world.",
    category: "Programming",
    isbn: "9781593279509",
    publishedDate: new Date("2018-12-04"),
    publisher: "No Starch Press",
    pages: 472,
    language: "English",
    tags: ["JavaScript", "Programming", "Open Source", "Beginner"],
    coverImage: {
      url: "https://eloquentjavascript.net/img/cover.jpg"
    },
    pdfFile: {
      url: "https://eloquentjavascript.net/Eloquent_JavaScript.pdf"
    }
  },
  {
    title: "Pro Git",
    author: "Scott Chacon and Ben Straub",
    description: "The entire Pro Git book, written by Scott Chacon and Ben Straub and published by Apress, is available here for free under the Creative Commons license.",
    category: "Software Engineering",
    isbn: "9781484200773",
    publishedDate: new Date("2014-11-18"),
    publisher: "Apress",
    pages: 574,
    language: "English",
    tags: ["Git", "Version Control", "Development Tools", "Open Source"],
    coverImage: {
      url: "https://git-scm.com/images/progit2.png"
    },
    pdfFile: {
      url: "https://github.com/progit/progit2/releases/download/2.1.362/progit.pdf"
    }
  },
  {
    title: "The Art of Computer Programming, Volume 1",
    author: "Donald E. Knuth",
    description: "This multivolume work on the analysis of algorithms has long been recognized as the definitive description of classical computer science.",
    category: "Programming",
    publishedDate: new Date("1997-07-17"),
    publisher: "Addison-Wesley",
    pages: 672,
    language: "English",
    tags: ["Algorithms", "Computer Science", "Programming", "Classic"],
    coverImage: {
      url: "https://covers.openlibrary.org/b/isbn/9780201896831-L.jpg"
    }
  },
  {
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    description: "A comprehensive textbook covering the full spectrum of modern algorithms: from the fastest algorithms and data structures to polynomial-time algorithms.",
    category: "Programming",
    isbn: "9780262033848",
    publishedDate: new Date("2009-07-31"),
    publisher: "MIT Press",
    pages: 1312,
    language: "English",
    tags: ["Algorithms", "Data Structures", "Computer Science", "Academic"],
    coverImage: {
      url: "https://covers.openlibrary.org/b/isbn/9780262033848-L.jpg"
    }
  },
  {
    title: "Clean Code",
    author: "Robert C. Martin",
    description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees.",
    category: "Software Engineering",
    isbn: "9780132350884",
    publishedDate: new Date("2008-08-01"),
    publisher: "Prentice Hall",
    pages: 464,
    language: "English",
    tags: ["Software Engineering", "Best Practices", "Programming", "Clean Code"],
    coverImage: {
      url: "https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg"
    }
  },
  // Mathematics Books
  {
    title: "Linear Algebra Done Right",
    author: "Sheldon Axler",
    description: "This text for a second course in linear algebra, aimed at math majors and graduates, adopts a novel approach by banishing determinants to the end of the book.",
    category: "Mathematics",
    isbn: "9783319110790",
    publishedDate: new Date("2015-01-01"),
    publisher: "Springer",
    pages: 340,
    language: "English",
    tags: ["Linear Algebra", "Mathematics", "Academic", "Theory"],
    coverImage: {
      url: "https://covers.openlibrary.org/b/isbn/9783319110790-L.jpg"
    }
  },
  {
    title: "Calculus",
    author: "Gilbert Strang",
    description: "Gilbert Strang's clear, direct style and detailed, intensive explanations make this textbook ideal as both a course companion and for self-study.",
    category: "Mathematics",
    publishedDate: new Date("2010-01-01"),
    publisher: "Wellesley-Cambridge Press",
    pages: 671,
    language: "English",
    tags: ["Calculus", "Mathematics", "MIT", "Open Courseware"],
    coverImage: {
      url: "https://mitpress.mit.edu/sites/default/files/styles/large_book_cover/http/mitp-content-server.mit.edu:18180/books/covers/cover/?%2FBooksImages%2Fcover-image-not-available.png"
    },
    pdfFile: {
      url: "https://ocw.mit.edu/resources/res-18-001-calculus-online-textbook-spring-2005/"
    }
  },
  // Physics Books
  {
    title: "The Feynman Lectures on Physics",
    author: "Richard P. Feynman",
    description: "The famous lectures on physics by Nobel laureate Richard Feynman. These lectures represent one of the most important physics textbooks ever written.",
    category: "Physics",
    publishedDate: new Date("2013-01-01"),
    publisher: "California Institute of Technology",
    language: "English",
    tags: ["Physics", "Quantum Mechanics", "Classical Physics", "Nobel Prize"],
    coverImage: {
      url: "https://www.feynmanlectures.caltech.edu/img/FLP_banner.jpg"
    },
    pdfFile: {
      url: "https://www.feynmanlectures.caltech.edu/"
    }
  },
  // Computer Science Books
  {
    title: "Structure and Interpretation of Computer Programs",
    author: "Harold Abelson and Gerald Jay Sussman",
    description: "SICP is a computer science textbook by MIT professors Harold Abelson and Gerald Jay Sussman with Julie Sussman.",
    category: "Programming",
    isbn: "9780262510875",
    publishedDate: new Date("1996-07-25"),
    publisher: "MIT Press",
    pages: 657,
    language: "English",
    tags: ["Computer Science", "Programming", "Scheme", "MIT", "Classic"],
    coverImage: {
      url: "https://covers.openlibrary.org/b/isbn/9780262510875-L.jpg"
    },
    pdfFile: {
      url: "https://web.mit.edu/alexmv/6.037/sicp.pdf"
    }
  },
  // Data Science Books
  {
    title: "Introduction to Statistical Learning",
    author: "Gareth James et al.",
    description: "This book provides an introduction to statistical learning methods. It is aimed for upper level undergraduate students, masters students and Ph.D. students.",
    category: "Data Science",
    isbn: "9781461471370",
    publishedDate: new Date("2013-06-24"),
    publisher: "Springer",
    pages: 426,
    language: "English",
    tags: ["Machine Learning", "Statistics", "Data Science", "R Programming"],
    coverImage: {
      url: "https://covers.openlibrary.org/b/isbn/9781461471370-L.jpg"
    },
    pdfFile: {
      url: "https://www.statlearning.com/s/ISLR-Seventh-Printing.pdf"
    }
  },
  // Philosophy Books
  {
    title: "Meditations",
    author: "Marcus Aurelius",
    description: "Meditations is a series of personal writings by Marcus Aurelius, Roman Emperor from 161 to 180 AD, recording his private notes to himself and ideas on Stoic philosophy.",
    category: "Philosophy",
    publishedDate: new Date("180-01-01"),
    publisher: "Public Domain",
    language: "English",
    tags: ["Philosophy", "Stoicism", "Classical", "Public Domain"],
    coverImage: {
      url: "https://www.gutenberg.org/files/2680/2680-h/images/cover.jpg"
    },
    pdfFile: {
      url: "https://www.gutenberg.org/files/2680/2680-pdf.pdf"
    }
  },
  // Literature
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    description: "Pride and Prejudice is an 1813 romantic novel of manners written by Jane Austen. It follows the character development of Elizabeth Bennet.",
    category: "Literature",
    isbn: "9780141439518",
    publishedDate: new Date("1813-01-28"),
    publisher: "T. Egerton",
    pages: 432,
    language: "English",
    tags: ["Classic Literature", "Romance", "19th Century", "Public Domain"],
    coverImage: {
      url: "https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg"
    },
    pdfFile: {
      url: "https://www.gutenberg.org/files/1342/1342-pdf.pdf"
    }
  },
  // Web Development
  {
    title: "HTML5 for Web Designers",
    author: "Jeremy Keith",
    description: "HTML5 is the longest HTML specification ever written. It is also the most powerful, and in some ways, the most confusing. What do accessible, content-focused standards-based web designers and front-end developers need to know?",
    category: "Web Development",
    isbn: "9780984442508",
    publishedDate: new Date("2010-05-25"),
    publisher: "A Book Apart",
    pages: 85,
    language: "English",
    tags: ["HTML5", "Web Development", "Frontend", "Standards"],
    coverImage: {
      url: "https://covers.openlibrary.org/b/isbn/9780984442508-L.jpg"
    }
  }
];

// Open Source Videos Data
const videosData = [
  // Programming Tutorials
  {
    title: "JavaScript Fundamentals",
    description: "Complete JavaScript fundamentals course covering variables, functions, objects, arrays, and more. Perfect for beginners starting their programming journey.",
    category: "Programming",
    url: "https://www.youtube.com/watch?v=hdI2bqOjy3c",
    instructor: "Traversy Media",
    level: "Beginner",
    duration: 3600, // 1 hour
    tags: ["JavaScript", "Programming", "Tutorial", "Beginner"],
    thumbnail: {
      url: "https://img.youtube.com/vi/hdI2bqOjy3c/maxresdefault.jpg"
    }
  },
  {
    title: "Python for Everybody",
    description: "Learn Python programming from scratch. This comprehensive course covers basic programming concepts using Python.",
    category: "Programming",
    url: "https://www.youtube.com/watch?v=8DvywoWv6fI",
    instructor: "freeCodeCamp.org",
    level: "Beginner",
    duration: 14400, // 4 hours
    tags: ["Python", "Programming", "Tutorial", "Complete Course"],
    thumbnail: {
      url: "https://img.youtube.com/vi/8DvywoWv6fI/maxresdefault.jpg"
    }
  },
  {
    title: "React.js Full Course",
    description: "Complete React.js tutorial covering components, props, state, hooks, and building real-world applications.",
    category: "Web Development",
    url: "https://www.youtube.com/watch?v=DLX62G4lc44",
    instructor: "freeCodeCamp.org",
    level: "Intermediate",
    duration: 10800, // 3 hours
    tags: ["React", "JavaScript", "Frontend", "Components"],
    thumbnail: {
      url: "https://img.youtube.com/vi/DLX62G4lc44/maxresdefault.jpg"
    }
  },
  // Computer Science Lectures
  {
    title: "Harvard CS50 - Introduction to Computer Science",
    description: "Harvard University's introduction to the intellectual enterprises of computer science and the art of programming.",
    category: "Programming",
    url: "https://www.youtube.com/watch?v=YoXxevp1WRQ",
    instructor: "David J. Malan",
    level: "Beginner",
    duration: 6300, // 1.75 hours
    tags: ["Computer Science", "Harvard", "CS50", "Introduction"],
    thumbnail: {
      url: "https://img.youtube.com/vi/YoXxevp1WRQ/maxresdefault.jpg"
    }
  },
  {
    title: "MIT 6.006 Introduction to Algorithms",
    description: "Introduction to mathematical modeling of computational problems, as well as common algorithms, algorithmic paradigms, and data structures.",
    category: "Programming",
    url: "https://www.youtube.com/watch?v=HtSuA80QTyo",
    instructor: "Erik Demaine",
    level: "Advanced",
    duration: 3000, // 50 minutes
    tags: ["Algorithms", "MIT", "Data Structures", "Academic"],
    thumbnail: {
      url: "https://img.youtube.com/vi/HtSuA80QTyo/maxresdefault.jpg"
    }
  },
  // Mathematics Videos
  {
    title: "Linear Algebra - MIT OpenCourseWare",
    description: "Professor Gilbert Strang's Linear Algebra course from MIT. Covers matrix operations, vector spaces, eigenvalues and eigenvectors.",
    category: "Mathematics",
    url: "https://www.youtube.com/watch?v=ZK3O402wf1c",
    instructor: "Gilbert Strang",
    level: "Intermediate",
    duration: 2940, // 49 minutes
    tags: ["Linear Algebra", "MIT", "Mathematics", "Vector Spaces"],
    thumbnail: {
      url: "https://img.youtube.com/vi/ZK3O402wf1c/maxresdefault.jpg"
    }
  },
  {
    title: "Calculus - The Essence of Calculus",
    description: "3Blue1Brown's intuitive introduction to calculus concepts. Beautifully animated explanations of derivatives and integrals.",
    category: "Mathematics",
    url: "https://www.youtube.com/watch?v=WUvTyaaNkzM",
    instructor: "3Blue1Brown",
    level: "Beginner",
    duration: 1020, // 17 minutes
    tags: ["Calculus", "Animation", "Intuitive", "Derivatives"],
    thumbnail: {
      url: "https://img.youtube.com/vi/WUvTyaaNkzM/maxresdefault.jpg"
    }
  },
  // Physics Videos
  {
    title: "Physics - MIT 8.01 Classical Mechanics",
    description: "Professor Walter Lewin's legendary physics lectures from MIT covering classical mechanics, forces, energy, and momentum.",
    category: "Physics",
    url: "https://www.youtube.com/watch?v=wWnfJ0-xXRE",
    instructor: "Walter Lewin",
    level: "Intermediate",
    duration: 3000, // 50 minutes
    tags: ["Physics", "Classical Mechanics", "MIT", "Walter Lewin"],
    thumbnail: {
      url: "https://img.youtube.com/vi/wWnfJ0-xXRE/maxresdefault.jpg"
    }
  },
  // Data Science Videos
  {
    title: "Machine Learning Course - Stanford",
    description: "Andrew Ng's famous machine learning course from Stanford University. Covers supervised learning, unsupervised learning, and best practices.",
    category: "Machine Learning",
    url: "https://www.youtube.com/watch?v=jGwO_UgTS7I",
    instructor: "Andrew Ng",
    level: "Intermediate",
    duration: 7200, // 2 hours
    tags: ["Machine Learning", "Stanford", "Andrew Ng", "AI"],
    thumbnail: {
      url: "https://img.youtube.com/vi/jGwO_UgTS7I/maxresdefault.jpg"
    }
  },
  {
    title: "Data Science with Python",
    description: "Complete data science tutorial using Python, pandas, matplotlib, and scikit-learn. Covers data analysis and visualization.",
    category: "Data Science",
    url: "https://www.youtube.com/watch?v=LHBE6Q9XlzI",
    instructor: "freeCodeCamp.org",
    level: "Intermediate",
    duration: 21600, // 6 hours
    tags: ["Data Science", "Python", "Pandas", "Visualization"],
    thumbnail: {
      url: "https://img.youtube.com/vi/LHBE6Q9XlzI/maxresdefault.jpg"
    }
  },
  // Web Development Videos
  {
    title: "HTML & CSS Full Course",
    description: "Complete HTML and CSS course for beginners. Learn to build responsive websites from scratch.",
    category: "Web Development",
    url: "https://www.youtube.com/watch?v=mU6anWqZJcc",
    instructor: "freeCodeCamp.org",
    level: "Beginner",
    duration: 11400, // 3.17 hours
    tags: ["HTML", "CSS", "Web Development", "Responsive Design"],
    thumbnail: {
      url: "https://img.youtube.com/vi/mU6anWqZJcc/maxresdefault.jpg"
    }
  },
  {
    title: "Node.js Tutorial for Beginners",
    description: "Learn Node.js from scratch. Build REST APIs, work with databases, and create full-stack applications.",
    category: "Web Development",
    url: "https://www.youtube.com/watch?v=TlB_eWDSMt4",
    instructor: "Programming with Mosh",
    level: "Beginner",
    duration: 3600, // 1 hour
    tags: ["Node.js", "Backend", "API", "JavaScript"],
    thumbnail: {
      url: "https://img.youtube.com/vi/TlB_eWDSMt4/maxresdefault.jpg"
    }
  },
  // Philosophy & History
  {
    title: "Introduction to Philosophy - Yale",
    description: "Yale University's introduction to philosophy course covering major philosophical questions and thinkers.",
    category: "Philosophy",
    url: "https://www.youtube.com/watch?v=kBdfcR-8hEY",
    instructor: "Shelly Kagan",
    level: "Beginner",
    duration: 2700, // 45 minutes
    tags: ["Philosophy", "Yale", "Ethics", "Critical Thinking"],
    thumbnail: {
      url: "https://img.youtube.com/vi/kBdfcR-8hEY/maxresdefault.jpg"
    }
  },
  // Business & Economics
  {
    title: "Economics - Supply and Demand",
    description: "Khan Academy's introduction to microeconomics covering supply and demand, market equilibrium, and price mechanisms.",
    category: "Economics",
    url: "https://www.youtube.com/watch?v=3gz1QoN7BEE",
    instructor: "Khan Academy",
    level: "Beginner",
    duration: 600, // 10 minutes
    tags: ["Economics", "Supply Demand", "Khan Academy", "Microeconomics"],
    thumbnail: {
      url: "https://img.youtube.com/vi/3gz1QoN7BEE/maxresdefault.jpg"
    }
  },
  // Cybersecurity
  {
    title: "Ethical Hacking Full Course",
    description: "Complete ethical hacking course covering penetration testing, network security, and cybersecurity fundamentals.",
    category: "Cybersecurity",
    url: "https://www.youtube.com/watch?v=3Kq1MIfTWCE",
    instructor: "freeCodeCamp.org",
    level: "Intermediate",
    duration: 64800, // 18 hours
    tags: ["Cybersecurity", "Ethical Hacking", "Penetration Testing", "Security"],
    thumbnail: {
      url: "https://img.youtube.com/vi/3Kq1MIfTWCE/maxresdefault.jpg"
    }
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Check if admin user exists, if not create one
    let adminUser = await User.findOne({ email: 'admin@studentlibrary.com' });
    
    if (!adminUser) {
      console.log('📝 Creating admin user...');
      adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@studentlibrary.com',
        password: 'admin123456',
        role: 'admin',
        isActive: true
      });
      console.log('✅ Admin user created');
    }

    // Clear existing books and videos (optional - remove if you want to keep existing data)
    console.log('🗑️ Clearing existing seed data...');
    await Book.deleteMany({ 
      title: { 
        $in: booksData.map(book => book.title) 
      } 
    });
    await Video.deleteMany({ 
      title: { 
        $in: videosData.map(video => video.title) 
      } 
    });

    // Seed books
    console.log('📚 Seeding books...');
    const booksWithAdmin = booksData.map(book => ({
      ...book,
      addedBy: adminUser._id,
      isActive: true,
      views: Math.floor(Math.random() * 1000) + 100,
      downloads: Math.floor(Math.random() * 500) + 50,
      rating: {
        average: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
        count: Math.floor(Math.random() * 50) + 10
      }
    }));

    const createdBooks = await Book.insertMany(booksWithAdmin);
    console.log(`✅ ${createdBooks.length} books added successfully`);

    // Seed videos
    console.log('🎥 Seeding videos...');
    const videosWithAdmin = videosData.map(video => ({
      ...video,
      addedBy: adminUser._id,
      isActive: true,
      isExternal: true,
      views: Math.floor(Math.random() * 5000) + 500,
      rating: {
        average: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
        count: Math.floor(Math.random() * 100) + 20
      }
    }));

    const createdVideos = await Video.insertMany(videosWithAdmin);
    console.log(`✅ ${createdVideos.length} videos added successfully`);

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   📚 Books: ${createdBooks.length}`);
    console.log(`   🎥 Videos: ${createdVideos.length}`);
    console.log(`   👤 Admin User: ${adminUser.email}`);

    return {
      books: createdBooks,
      videos: createdVideos,
      admin: adminUser
    };

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

module.exports = {
  seedDatabase,
  booksData,
  videosData
};
