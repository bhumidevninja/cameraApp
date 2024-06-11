const multer = require("multer");
const fs = require("fs");
const path = require("path");

const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const generateName = (originalName) => {
  return `video-${Math.round(Math.random() * 1000)}${path.extname(
    originalName
  )}`;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const fileName = generateName(file.originalname);
    console.log(fileName);
    cb(null, fileName);
  },
});

const filter = (req, file, cb) => {
  file.mimetype.startsWith("video")
    ? cb(null, true)
    : cb(new Error("Only video file is allowed"), false);
};

const _upload = multer({
  storage: storage,
  fileFilter: filter,
});

const upload = _upload.single("video");

module.exports = {
  upload,
};
