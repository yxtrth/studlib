const multer = require('multer');
const path = require('path');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|avi|mov|wmv|flv|mkv/;
  const allowedDocumentTypes = /pdf|doc|docx|txt/;
  
  const extname = allowedImageTypes.test(path.extname(file.originalname).toLowerCase()) ||
                  allowedVideoTypes.test(path.extname(file.originalname).toLowerCase()) ||
                  allowedDocumentTypes.test(path.extname(file.originalname).toLowerCase());
  
  const mimetype = file.mimetype.startsWith('image/') ||
                   file.mimetype.startsWith('video/') ||
                   file.mimetype === 'application/pdf' ||
                   file.mimetype.includes('document') ||
                   file.mimetype.includes('text');

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images, videos, and documents are allowed!'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: fileFilter
});

// Specific upload configurations
const uploadSingle = upload.single('file');
const uploadAvatar = upload.single('avatar');
const uploadCover = upload.single('coverImage');
const uploadVideo = upload.single('video');
const uploadThumbnail = upload.single('thumbnail');
const uploadPdf = upload.single('pdfFile');

module.exports = {
  upload,
  uploadSingle,
  uploadAvatar,
  uploadCover,
  uploadVideo,
  uploadThumbnail,
  uploadPdf
};
