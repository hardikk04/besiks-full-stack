const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: (req, file, cb) => {
    const uniqueFilename = uuidv4();
    console.log('====================================');
    console.log(file);
    console.log('====================================');
    cb(null, uniqueFilename + path.extname(file.originalname));
  },
});

module.exports = upload = multer({ storage: storage });
