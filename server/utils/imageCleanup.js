const fs = require("fs").promises;
const path = require("path");

/**
 * Extract filename from a URL
 * @param {string} url - Image URL (e.g., "http://localhost:5000/assets/abc123.png" or "/assets/abc123.png")
 * @returns {string|null} - Filename or null if invalid
 */
const extractFilenameFromUrl = (url) => {
  if (!url || typeof url !== "string") return null;
  
  try {
    // Handle both full URLs and relative paths
    const urlPath = url.includes("/assets/") 
      ? url.split("/assets/")[1] 
      : url.split("/").pop();
    
    // Remove query parameters if any
    return urlPath.split("?")[0];
  } catch (error) {
    console.error("Error extracting filename from URL:", error);
    return null;
  }
};

/**
 * Delete a single image file from the server
 * @param {string} imageUrl - URL or path to the image
 * @returns {Promise<boolean>} - True if deleted, false otherwise
 */
const deleteImageFile = async (imageUrl) => {
  if (!imageUrl) return false;

  try {
    const filename = extractFilenameFromUrl(imageUrl);
    if (!filename) return false;

    const filePath = path.join(__dirname, "../public/assets", filename);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      // File doesn't exist, return true (considered success)
      return true;
    }

    // Delete the file
    await fs.unlink(filePath);
    console.log(`Successfully deleted image: ${filename}`);
    return true;
  } catch (error) {
    console.error(`Error deleting image file (${imageUrl}):`, error.message);
    return false;
  }
};

/**
 * Delete multiple image files
 * @param {string[]} imageUrls - Array of image URLs
 * @returns {Promise<void>}
 */
const deleteImageFiles = async (imageUrls) => {
  if (!Array.isArray(imageUrls) || imageUrls.length === 0) return;

  const deletePromises = imageUrls.map((url) => deleteImageFile(url));
  await Promise.allSettled(deletePromises);
};

/**
 * Find images that are in oldImages but not in newImages
 * @param {string[]} oldImages - Array of old image URLs
 * @param {string[]} newImages - Array of new image URLs
 * @returns {string[]} - Array of image URLs to delete
 */
const findDeletedImages = (oldImages, newImages) => {
  if (!Array.isArray(oldImages) || oldImages.length === 0) return [];
  if (!Array.isArray(newImages)) return oldImages;

  const newImageSet = new Set(newImages);
  return oldImages.filter((url) => !newImageSet.has(url));
};

module.exports = {
  deleteImageFile,
  deleteImageFiles,
  findDeletedImages,
  extractFilenameFromUrl,
};

