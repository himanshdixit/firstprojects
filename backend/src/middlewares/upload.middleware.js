const fs = require('fs');
const path = require('path');
const multer = require('multer');
const AppError = require('../utils/AppError');

const UPLOAD_ROOT = path.join(__dirname, '..', '..', 'uploads');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function buildStorage(subFolder) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      const targetDir = path.join(UPLOAD_ROOT, subFolder);
      ensureDir(targetDir);
      cb(null, targetDir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
      const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext) ? ext : '.jpg';
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
      cb(null, uniqueName);
    },
  });
}

function imageFileFilter(_req, file, cb) {
  if (!file.mimetype || !file.mimetype.startsWith('image/')) {
    return cb(new AppError('Only image uploads are allowed', 400));
  }
  return cb(null, true);
}

function createImageUpload(subFolder) {
  return multer({
    storage: buildStorage(subFolder),
    fileFilter: imageFileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024,
      files: 1,
    },
  });
}

function getUploadedFileUrl(req, subFolder, fileName) {
  const configuredBaseUrl = process.env.BACKEND_PUBLIC_URL
    ? process.env.BACKEND_PUBLIC_URL.replace(/\/+$/, '')
    : '';
  const requestBaseUrl = `${req.protocol}://${req.get('host')}`;
  const baseUrl = configuredBaseUrl || requestBaseUrl;
  return `${baseUrl}/uploads/${subFolder}/${fileName}`;
}

const uploadAvatar = createImageUpload('avatars');
const uploadPostImage = createImageUpload('posts');

module.exports = {
  uploadAvatar,
  uploadPostImage,
  getUploadedFileUrl,
};
