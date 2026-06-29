const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { v2: cloudinary } = require('cloudinary');

// Configure Cloudinary with credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Stream files directly to Cloudinary — no local disk write
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isImage = file.mimetype.startsWith('image/');
    return {
      folder: 'fund-manager/proofs',
      // Images → optimised WebP; PDFs stored as raw
      resource_type: isImage ? 'image' : 'raw',
      format: isImage ? 'webp' : undefined,
      // Filename: userId_timestamp_sanitizedOriginalName
      public_id: `${req.user?._id || 'unknown'}_${Date.now()}_${
        file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.[^.]+$/, '')
      }`,
      // Apply automatic quality optimisation for images
      transformation: isImage
        ? [{ quality: 'auto', fetch_format: 'auto' }]
        : undefined,
    };
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, and PDF files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

/**
 * Returns the Cloudinary CDN URL for the uploaded file.
 * multer-storage-cloudinary sets file.path to the full CDN URL automatically.
 */
const getFileUrl = (_req, file) => {
  if (!file) return null;
  return file.path; // e.g. https://res.cloudinary.com/dp678feha/image/upload/...
};

module.exports = { upload, getFileUrl, cloudinary };

