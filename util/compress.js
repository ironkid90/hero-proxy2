const sharp = require('sharp');

exports.compress = async (buffer, webp, grayscale, quality, originSize, maxWidth) => {
  try {
    // Get image metadata first
    const metadata = await sharp(buffer).metadata();
    
    // Check if the image is already smaller than maxWidth
    if (metadata.width && metadata.width <= maxWidth) {
      maxWidth = metadata.width; // Don't upscale
    }

    let transformer = sharp(buffer, {
      // Optimize for serverless environment
      sequentialRead: true,
      limitInputPixels: 268402689 // ~16k x 16k max
    })
      .rotate() // Auto-rotate based on EXIF
      .resize({ 
        width: maxWidth, 
        withoutEnlargement: true,
        fastShrinkOnLoad: true // Optimize for performance
      });

    // Apply grayscale if requested
    if (grayscale) {
      transformer = transformer.grayscale();
    }

    // Apply format and quality settings
    if (webp) {
      transformer = transformer.webp({ 
        quality,
        effort: 4, // Balance between compression and speed
        nearLossless: quality > 90, // Use near-lossless for high quality
        smartSubsample: true
      });
    } else {
      transformer = transformer.jpeg({ 
        quality,
        progressive: true,
        mozjpeg: true // Better compression
      });
    }

    const outputBuffer = await transformer.toBuffer({ resolveWithObject: true });
    const outputMetadata = outputBuffer.info;

    const headers = {
      'content-type': webp ? 'image/webp' : 'image/jpeg',
      'cache-control': 'public, max-age=31536000, immutable',
      'content-length': outputBuffer.data.length.toString(),
      'x-image-width': outputMetadata.width.toString(),
      'x-image-height': outputMetadata.height.toString(),
      'x-image-format': outputMetadata.format
    };

    // Add compression info
    const compressionRatio = (1 - outputBuffer.data.length / originSize) * 100;
    if (compressionRatio > 0) {
      headers['x-compression-ratio'] = compressionRatio.toFixed(1) + '%';
    }

    return { 
      err: null, 
      output: outputBuffer.data, 
      headers,
      metadata: outputMetadata
    };
  } catch (err) {
    console.error('Compression error:', err);
    return { 
      err: new Error(`Image compression failed: ${err.message}`), 
      output: null, 
      headers: {},
      metadata: null
    };
  }
};