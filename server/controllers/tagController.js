const Tag = require('../models/Tag');

// @desc    Get all tags
// @route   GET /api/tags
// @access  Public
const getTags = async (req, res) => {
  try {
    const tags = await Tag.find({ isActive: true }).sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      count: tags.length,
      data: tags
    });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tags'
    });
  }
};

// @desc    Get single tag
// @route   GET /api/tags/:id
// @access  Public
const getTag = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);
    
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    res.status(200).json({
      success: true,
      data: tag
    });
  } catch (error) {
    console.error('Get tag error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tag'
    });
  }
};

// @desc    Create new tag
// @route   POST /api/tags
// @access  Private/Admin
const createTag = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Tag name is required'
      });
    }

    // Check if tag already exists
    const existingTag = await Tag.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingTag) {
      return res.status(400).json({
        success: false,
        message: 'Tag with this name already exists'
      });
    }

    const tag = await Tag.create({
      name,
      description
    });

    res.status(201).json({
      success: true,
      data: tag
    });
  } catch (error) {
    console.error('Create tag error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating tag'
    });
  }
};

// @desc    Update tag
// @route   PUT /api/tags/:id
// @access  Private/Admin
const updateTag = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;

    let tag = await Tag.findById(req.params.id);
    
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    // Check if new name conflicts with existing tag
    if (name && name !== tag.name) {
      const existingTag = await Tag.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      if (existingTag) {
        return res.status(400).json({
          success: false,
          message: 'Tag with this name already exists'
        });
      }
    }

    tag.name = name || tag.name;
    tag.description = description !== undefined ? description : tag.description;
    tag.isActive = isActive !== undefined ? isActive : tag.isActive;

    await tag.save();

    res.status(200).json({
      success: true,
      data: tag
    });
  } catch (error) {
    console.error('Update tag error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating tag'
    });
  }
};

// @desc    Delete tag
// @route   DELETE /api/tags/:id
// @access  Private/Admin
const deleteTag = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);
    
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    await Tag.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Tag deleted successfully'
    });
  } catch (error) {
    console.error('Delete tag error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting tag'
    });
  }
};

module.exports = {
  getTags,
  getTag,
  createTag,
  updateTag,
  deleteTag
}; 