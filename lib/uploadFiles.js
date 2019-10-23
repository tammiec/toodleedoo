const multer = require('multer');
const fs = require('fs');
const path = require('path');
const assetsPath = 'public/assets/profile_photos/';
const photoPath = 'assets/profile_photos/';

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, assetsPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

let fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/octet-stream' || file.mimetype === 'application/x-msdos-program') {
    cb(new Error('File type not allowed: ' + file.originalname), false);
  } else {
    cb(null, true);
  }
}

let upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 10
  },
  fileFilter
});

const manageFile = file => {
  if (!file) return '';
  const profilePhotosPath = path.join(assetsPath);
  newFileName = getFileName() + '.' + file.filename.split('.').slice(-1);
  fs.copyFile(path.join(profilePhotosPath, file.filename), path.join(profilePhotosPath, newFileName), (err) => {
    if (err) { new Error(err) }
    try { fs.unlinkSync(path.join(profilePhotosPath, file.filename)); }
    catch (err) { new Error(err) }
  });
  return newFileName = photoPath + newFileName;
}

const getFileName = () => {
  let text = '';
  const charset = 'abcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 24; i++)
    text += charset.charAt(Math.floor(Math.random() * charset.length));
  return text;
};

module.exports = {
  upload, manageFile
}
