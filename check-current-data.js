// Verify URLs are working
const https = require('https');

const makeRequest = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
};

async function checkData() {
  try {
    console.log('📚 Checking books...');
    
    const booksData = await makeRequest('https://student-library-backend-o116.onrender.com/api/books');
    
    if (booksData.books && booksData.books.length > 0) {
      console.log(`Found ${booksData.books.length} books:`);
      booksData.books.slice(0, 3).forEach(book => {
        console.log(`📖 ${book.title} - PDF: ${book.pdfFile?.url || 'NO URL'}`);
      });
    }

    console.log('\n🎬 Checking videos...');
    
    const videosData = await makeRequest('https://student-library-backend-o116.onrender.com/api/videos');
    
    if (videosData.videos && videosData.videos.length > 0) {
      console.log(`Found ${videosData.videos.length} videos:`);
      videosData.videos.slice(0, 3).forEach(video => {
        console.log(`🎥 ${video.title} - URL: ${video.url || 'NO URL'}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkData();
