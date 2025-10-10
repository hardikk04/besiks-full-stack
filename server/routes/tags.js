const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  getTags,
  getTag,
  createTag,
  updateTag,
  deleteTag
} = require('../controllers/tagController');

// Public routes
router.get('/', getTags);
router.get('/:id', getTag);

// Admin routes
router.post('/', protect, admin, createTag);
router.put('/:id', protect, admin, updateTag);
router.delete('/:id', protect, admin, deleteTag);

module.exports = router; 