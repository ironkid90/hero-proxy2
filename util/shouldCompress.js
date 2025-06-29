const MIN_COMPRESS_LENGTH = 1024; // 1KB
const MIN_TRANSPARENT_COMPRESS_LENGTH = MIN_COMPRESS_LENGTH * 50; // 50KB
const MAX_COMPRESS_LENGTH = 50 * 1024 * 1024; // 50MB

/**
 * Determines whether an image should be compressed
 * @param {string} imageType - Image content type
 * @param {number} size - Image size in bytes  
 * @param {boolean} isTransparent - Whether the image supports transparency
 * @returns {boolean} - Whether the image should be compressed
 */
function shouldCompress(imageType, size, isTransparent) {
  // Basic validation
  if (!imageType || typeof imageType !== 'string') {
    console.log('Skipping: Invalid content type');
    return false;
  }

  if (!imageType.startsWith("image")) {
    console.log('Skipping: Not an image type:', imageType);
    return false;
  }

  if (size === 0 || isNaN(size)) {
    console.log('Skipping: Invalid size:', size);
    return false;
  }

  // Skip very large files (they might cause memory issues)
  if (size > MAX_COMPRESS_LENGTH) {
    console.log('Skipping: File too large:', size, 'bytes');
    return false;
  }

  // Skip very small files (compression overhead not worth it)
  if (size < MIN_COMPRESS_LENGTH) {
    console.log('Skipping: File too small:', size, 'bytes');
    return false;
  }

  // Check specific image formats
  const lowerType = imageType.toLowerCase();
  
  // Always compress JPEG - they benefit greatly from recompression
  if (lowerType.includes('jpeg') || lowerType.includes('jpg')) {
    console.log('Compressing JPEG image:', size, 'bytes');
    return true;
  }

  // For WebP, only compress if it's quite large (WebP is already efficient)
  if (lowerType.includes('webp')) {
    const shouldCompress = size > MIN_COMPRESS_LENGTH * 10; // 10KB threshold
    console.log('WebP compression decision:', shouldCompress, 'size:', size);
    return shouldCompress;
  }

  // For PNG/GIF (potentially transparent)
  if (lowerType.includes('png') || lowerType.includes('gif')) {
    // For transparent images, require larger size threshold
    const threshold = isTransparent ? MIN_TRANSPARENT_COMPRESS_LENGTH : MIN_COMPRESS_LENGTH * 5;
    const shouldCompress = size > threshold;
    console.log(`${lowerType.toUpperCase()} compression decision:`, shouldCompress, 
               'size:', size, 'threshold:', threshold, 'transparent:', isTransparent);
    return shouldCompress;
  }

  // For other formats (BMP, TIFF, etc.), compress if reasonably sized
  if (lowerType.includes('bmp') || lowerType.includes('tiff') || lowerType.includes('tif')) {
    console.log('Compressing unoptimized format:', lowerType, size, 'bytes');
    return true;
  }

  // Default: compress if above minimum threshold
  const shouldCompress = size > MIN_COMPRESS_LENGTH * 2;
  console.log('Default compression decision:', shouldCompress, 'for type:', imageType);
  return shouldCompress;
}

module.exports = shouldCompress;
