const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const path = require("path");

// Single file upload: field name 'file'
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    const filename = req.file.filename;
    const url = `${req.protocol}://${req.get("host")}/assets/${filename}`;
    return res.status(201).json({ success: true, filename, url });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Upload failed" });
  }
});

module.exports = router;


