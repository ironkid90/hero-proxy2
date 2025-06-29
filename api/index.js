const fetch = require('node-fetch');
const { compress } = require('../util/compress');
const { shouldCompress } = require('../util/shouldCompress');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Extract query parameters
  const { url, w, q, l } = req.query;

  // If no parameters provided, return service identification
  // This is what Bandwidth Hero extension uses to validate the service
  if (!url && !w && !q) {
    return res.status(200).send('Bandwidth Hero Data Compression Service');
  }

  // Parse parameters
  const maxWidth = parseInt(w, 10);
  const quality = parseInt(q, 10);
  const isGrayscale = l === '1'; // l=1 means grayscale

  // Validate required parameters
  if (!url) {
    return res.status(400).send('Missing "url" parameter');
  }

  if (isNaN(maxWidth) || maxWidth <= 0 || maxWidth > 8192) {
    return res.status(400).send('Invalid "w" (width) parameter. Must be between 1 and 8192');
  }

  if (isNaN(quality) || quality < 10 || quality > 100) {
    return res.status(400).send('Invalid "q" (quality) parameter. Must be between 10 and 100');
  }

  try {
    // Fetch the image
    const fetchOptions = {
      headers: {
        'User-Agent': req.headers['user-agent'] || 'Bandwidth-Hero-Proxy',
        'Accept': 'image/*',
        'Accept-Encoding': 'gzip, deflate',
        // Forward some headers from the original request
        ...(req.headers.referer && { 'Referer': req.headers.referer }),
        ...(req.headers.cookie && { 'Cookie': req.headers.cookie }),
      },
      timeout: 10000, // 10 second timeout
    };

    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    const contentLength = parseInt(response.headers.get('content-length') || '0', 10);

    // Check if it's actually an image
    if (!contentType.startsWith('image/')) {
      return res.status(400).send('URL does not point to an image');
    }

    const imageBuffer = await response.buffer();
    const actualSize = imageBuffer.length;

    // Check if compression is needed
    if (!shouldCompress(contentType, actualSize, contentType.includes('png') || contentType.includes('gif'))) {
      // Return original image if compression is not beneficial
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', actualSize.toString());
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.setHeader('X-Original-Size', actualSize.toString());
      res.setHeader('X-Compressed-Size', actualSize.toString());
      return res.send(imageBuffer);
    }

    // Compress the image
    const { err, output, headers } = await compress(
      imageBuffer,
      true,           // Always use WebP for better compression
      isGrayscale,    // Grayscale based on l parameter
      quality,
      actualSize,
      maxWidth
    );

    if (err) {
      console.error('Compression error:', err);
      throw new Error('Failed to compress image');
    }

    // Set response headers
    Object.entries(headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    res.setHeader('X-Original-Size', actualSize.toString());
    res.setHeader('X-Compressed-Size', output.length.toString());
    res.setHeader('X-Savings', Math.round((1 - output.length / actualSize) * 100).toString() + '%');

    return res.send(output);

  } catch (error) {
    console.error('Error processing request:', error);
    
    // Return appropriate error messages
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return res.status(400).send('Unable to connect to the image URL');
    }
    
    if (error.message.includes('timeout')) {
      return res.status(408).send('Request timeout while fetching image');
    }

    return res.status(500).send('Internal server error while processing image');
  }
};