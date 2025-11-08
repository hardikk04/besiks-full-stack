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
    
    // Use environment variable for base URL in production, fallback to request host for development
    const baseUrl = process.env.API_BASE_URL || `${req.protocol}://${req.get("host")}`;
    const url = `${baseUrl}/assets/${filename}`;
    
    return res.status(201).json({ success: true, filename, url });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Upload failed" });
  }
});

module.exports = router;


