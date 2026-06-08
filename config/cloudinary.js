const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const isCloudinaryConfigured = () =>
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET &&
  !process.env.CLOUDINARY_CLOUD_NAME.includes('your_');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

let upload;

if (isCloudinaryConfigured()) {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'dance-school',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 800, height: 800, crop: 'limit' }],
    },
  });
  upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) cb(null, true);
      else cb(new Error('Only image files are allowed'), false);
    },
  });
} else {
  console.warn('[Cloudinary] Not configured — using local memory storage. Images will not be persisted.');
  upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) cb(null, true);
      else cb(new Error('Only image files are allowed'), false);
    },
  });
}

module.exports = { cloudinary, upload, isCloudinaryConfigured };
