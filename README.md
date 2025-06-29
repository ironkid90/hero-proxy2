# 🚀 Bandwidth Hero Proxy - Vercel Edition

A high-performance, serverless image compression service designed for the [Bandwidth Hero](https://github.com/ayastreb/bandwidth-hero) browser extension. This version is optimized for deployment on **Vercel** and includes significant improvements over the original.

## ✨ Features

- **WebP Conversion**: Automatically converts images to WebP format for optimal compression
- **Smart Compression**: Intelligent compression decisions based on image type and size
- **Serverless Architecture**: Optimized for Vercel's serverless functions
- **Real-time Processing**: No disk storage - images are processed in memory
- **CORS Support**: Full cross-origin support for browser extensions
- **Error Handling**: Comprehensive error handling and logging
- **Performance Optimized**: Fast compression with Sharp.js and optimized settings

## 🔧 What's New in Version 2.0

### Major Improvements
- ✅ **Vercel Compatibility**: Restructured for Vercel's API format
- ✅ **Service Validation**: Proper response for extension validation
- ✅ **Enhanced Compression**: Better quality vs size optimization
- ✅ **CORS Headers**: Full CORS support built-in
- ✅ **Error Handling**: More descriptive error messages
- ✅ **Performance**: Optimized Sharp.js settings for serverless
- ✅ **Modern UI**: Beautiful status page with usage instructions

### Technical Improvements
- Moved from Netlify Functions to Vercel API Routes
- Updated Sharp.js to latest version with optimizations
- Added intelligent compression thresholds
- Improved memory management for serverless environment
- Added comprehensive test suite

## 🚀 Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/himshim/bandwidth-hero-proxy2)

1. Click the deploy button above
2. Follow Vercel's deployment wizard
3. Once deployed, copy your Vercel app URL
4. Use `https://your-app.vercel.app/api/index` in Bandwidth Hero extension

## 🛠️ Manual Setup

### Prerequisites
- Node.js 18+ 
- Vercel CLI (optional, for local development)

### Local Development

```bash
# Clone the repository
git clone https://github.com/himshim/bandwidth-hero-proxy2.git
cd bandwidth-hero-proxy2

# Install dependencies
npm install

# Run locally with Vercel
npx vercel dev

# Or install Vercel CLI globally
npm i -g vercel
vercel dev
```

The service will be available at `http://localhost:3000`

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Test the service validation endpoint
curl http://localhost:3000/api/index
# Should return: "Bandwidth Hero Data Compression Service"

# Test image compression
curl "http://localhost:3000/api/index?url=https://example.com/image.jpg&w=800&q=80"
```

## 📱 Browser Extension Setup

1. Install [Bandwidth Hero](https://github.com/ayastreb/bandwidth-hero) extension
2. Open extension settings
3. In **"Data Compression Service"** field, enter:
   ```
   https://your-vercel-app.vercel.app/api/index
   ```
4. Save settings and enable the extension

## 🔌 API Usage

### Validation Endpoint
```http
GET /api/index
```
Returns: `Bandwidth Hero Data Compression Service`

### Compression Endpoint
```http
GET /api/index?url={IMAGE_URL}&w={WIDTH}&q={QUALITY}&l={GRAYSCALE}
```

#### Parameters
- `url` (required): Source image URL
- `w` (required): Maximum width (1-8192 pixels)
- `q` (required): Quality percentage (10-100)
- `l` (optional): Grayscale mode (`1` for grayscale)

#### Example
```bash
curl "https://your-app.vercel.app/api/index?url=https://example.com/photo.jpg&w=800&q=75&l=0"
```

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   Browser       │───▶│    Vercel    │───▶│   Image Source  │
│   Extension     │    │   Function   │    │                 │
└─────────────────┘    └──────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────┐
                       │    Sharp     │
                       │  Processing  │
                       └──────────────┘
                              │
                              ▼
                       ┌──────────────┐
                       │   WebP       │
                       │   Output     │
                       └──────────────┘
```

## 📊 Performance Considerations

- **Memory**: Functions use up to 1GB RAM for large images
- **Timeout**: 30-second timeout for processing
- **Concurrency**: Vercel handles scaling automatically
- **Caching**: Images are not cached (real-time processing)
- **Size Limits**: Handles images up to 50MB

## 🔧 Configuration

The service can be configured via `vercel.json`:

```json
{
  "functions": {
    "api/index.js": {
      "maxDuration": 30,
      "memory": 1024
    }
  }
}
```

## 🧪 Testing

The project includes comprehensive tests:

```bash
# Unit tests
npm test

# Integration test with a real image
curl "https://your-app.vercel.app/api/index?url=https://httpbin.org/image/jpeg&w=400&q=80"
```

## 🚨 Troubleshooting

### Extension Shows "Invalid Service"
- Ensure you're using the correct URL: `https://your-app.vercel.app/api/index`
- Test the validation endpoint manually
- Check browser console for CORS errors

### Images Not Compressing
- Verify image URLs are publicly accessible
- Check image format is supported
- Ensure images are larger than minimum compression threshold (1KB)

### Slow Performance
- Large images take longer to process
- Consider reducing quality parameter
- Check Vercel function logs for errors

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

- [GitHub Issues](https://github.com/himshim/bandwidth-hero-proxy2/issues)
- [Original Bandwidth Hero](https://github.com/ayastreb/bandwidth-hero)

---

**Made with ❤️ for faster web browsing**