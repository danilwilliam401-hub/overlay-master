# 🔬 ImageData Parameter Feature

## Overview
The `imageData` parameter allows you to pass base64-encoded binary image data directly to the API instead of using image URLs. This is perfect for scenarios where you have image data in memory or want to avoid external URL dependencies.

## Key Features
- **📁 Direct Binary Support**: Pass base64-encoded image data directly
- **🔗 Data URI Compatible**: Supports both data URI format and raw base64
- **⚡ Priority System**: imageData > image URL > blank background
- **📤 POST Method**: Optimized for large binary data via JSON POST
- **🔄 Backward Compatible**: Existing image URL functionality unchanged

## API Priority Order
1. **imageData** parameter (base64 binary data) - **HIGHEST PRIORITY**
2. **image** parameter (URL) - fallback if no imageData
3. **Blank background** - fallback if neither imageData nor image provided

## Supported Formats

### Data URI Format (Recommended)
```
data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...
data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...
data:image/webp;base64,UklGRnoGAABXRUJQVlA4WAo...
```

### Raw Base64 Format
```
/9j/4AAQSkZJRgABAQAAAQ...
iVBORw0KGgoAAAANSUhEUg...
UklGRnoGAABXRUJQVlA4WAo...
```

## Usage Examples

### 1. POST Method (Recommended for Large Data)
```javascript
const base64Image = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...';

fetch('/api/bundled-font-overlay', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    imageData: base64Image,
    title: 'Binary Data Test',
    website: 'TestSite.com',
    design: 'tech',
    w: '1080',
    h: '1350'
  })
})
.then(response => response.blob())
.then(blob => {
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
});
```

### 2. URL Parameter Method (For Smaller Data)
```javascript
const smallBase64 = 'iVBORw0KGgoAAAANSUhEUg...'; // Smaller image data

const url = `/api/bundled-font-overlay?imageData=${encodeURIComponent(smallBase64)}&title=Small%20Binary&design=minimal`;

fetch(url)
  .then(response => response.blob())
  .then(blob => {
    // Handle image blob
  });
```

### 3. File Upload to Base64 Conversion
```javascript
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file || !file.type.startsWith('image/')) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const base64Data = e.target.result; // Data URI format
    
    // Use the base64Data with imageData parameter
    fetch('/api/bundled-font-overlay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageData: base64Data,
        title: 'Uploaded Image Test',
        design: 'tech'
      })
    });
  };
  reader.readAsDataURL(file);
}
```

### 4. Canvas to Base64 Conversion
```javascript
function generateSampleImage() {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');
  
  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, 400, 300);
  gradient.addColorStop(0, '#FF6B6B');
  gradient.addColorStop(1, '#4ECDC4');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 400, 300);
  
  // Add text
  ctx.fillStyle = 'white';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Generated Image', 200, 150);
  
  // Convert to base64
  const base64Data = canvas.toDataURL('image/png');
  
  // Use with imageData parameter
  return base64Data;
}
```

## Testing Tools

### Interactive Testing Page
Visit `http://localhost:3000/binary-test` for a complete testing interface that includes:

- **📁 File Upload**: Upload images and convert to base64
- **🎨 Sample Generation**: Generate test images programmatically
- **📊 Data Analysis**: View base64 length, format, and preview
- **🧪 Live Testing**: Test the imageData parameter with different designs
- **💡 Format Examples**: See both Data URI and raw base64 formats

### Test Commands
```bash
# Test with curl (URL parameter method)
curl -X POST "http://localhost:3000/api/bundled-font-overlay" \
  -H "Content-Type: application/json" \
  -d '{
    "imageData": "data:image/png;base64,iVBORw0KGgo...",
    "title": "Curl Binary Test",
    "design": "tech"
  }' \
  --output binary-test.jpg

# Test blank background fallback (no imageData or image)
curl "http://localhost:3000/api/bundled-font-overlay?title=Blank%20Background&design=quote1" \
  --output blank-test.jpg
```

## Error Handling

The API includes comprehensive error handling for imageData:

### Invalid Base64 Data
```javascript
// If base64 data is invalid, API falls back to image URL or blank background
{
  "error": "Invalid base64 image data",
  "fallback": "Using image URL instead"
}
```

### Unsupported Image Format
```javascript
{
  "error": "Unsupported image format in base64 data",
  "supported": ["jpeg", "png", "webp", "gif"]
}
```

### Data Too Large
```javascript
{
  "error": "Base64 data exceeds recommended size limit",
  "limit": "5MB recommended",
  "received": "8.2MB"
}
```

## Performance Considerations

### Optimal Practices
1. **Use POST method** for large binary data (>2KB base64)
2. **Compress images** before converting to base64
3. **Use Data URI format** for better compatibility
4. **Limit size to 5MB** for optimal performance
5. **Cache base64 data** when reusing the same image

### Size Guidelines
- **Small images**: <100KB base64 → URL parameter OK
- **Medium images**: 100KB-1MB base64 → POST method recommended
- **Large images**: >1MB base64 → Consider compression or URL method

## Implementation Details

### Parameter Processing Priority
```javascript
// 1. Check for imageData parameter (highest priority)
if (imageData) {
  // Process base64 data (with or without data URI prefix)
  return processBase64Image(imageData);
}

// 2. Check for image URL parameter (fallback)
if (imageURL) {
  // Fetch from URL
  return fetchImageFromURL(imageURL);
}

// 3. Generate blank background (final fallback)
return generateBlankBackground(design);
```

### Base64 Processing Logic
```javascript
function processBase64Data(imageData) {
  let base64String = imageData;
  
  // Handle Data URI format
  if (imageData.startsWith('data:')) {
    base64String = imageData.split(',')[1];
  }
  
  // Convert to buffer
  const imageBuffer = Buffer.from(base64String, 'base64');
  
  // Process with Sharp
  return sharp(imageBuffer);
}
```

## Integration Examples

### Make.com Integration
```javascript
// In Make.com HTTP module
{
  "url": "https://your-domain.com/api/bundled-font-overlay",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "imageData": "{{base64ImageFromPreviousStep}}",
    "title": "{{titleFromPreviousStep}}",
    "design": "tech"
  }
}
```

### Zapier Integration
```javascript
// In Zapier Code step
const base64Data = inputData.imageBase64;
const response = await fetch('https://your-domain.com/api/bundled-font-overlay', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    imageData: base64Data,
    title: inputData.title,
    design: inputData.design || 'tech'
  })
});

return { imageBlob: await response.blob() };
```

### Node.js Server Integration
```javascript
const fs = require('fs');
const path = require('path');

// Read local image file
const imagePath = path.join(__dirname, 'sample-image.jpg');
const imageBuffer = fs.readFileSync(imagePath);
const base64Data = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

// Send to API
const response = await fetch('https://your-domain.com/api/bundled-font-overlay', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    imageData: base64Data,
    title: 'Server Generated Banner',
    design: 'tech'
  })
});

const processedImageBlob = await response.blob();
```

## Benefits of Binary Data Support

1. **🔒 Security**: No need to expose internal image URLs
2. **⚡ Speed**: Avoid external HTTP requests for image fetching
3. **💾 Memory Efficiency**: Direct buffer processing without temporary files
4. **🔄 Flexibility**: Works with generated images, canvas data, uploaded files
5. **🌐 Offline Capability**: Process images without internet connectivity
6. **🔗 No Dependencies**: Eliminate reliance on external image hosting
7. **📱 Mobile Friendly**: Works well with camera/photo picker data

## Troubleshooting

### Common Issues

1. **Base64 Data Truncated**
   - Ensure complete base64 string is passed
   - Check for URL encoding issues in GET requests

2. **Invalid Image Format**
   - Verify base64 represents a valid image
   - Check data URI prefix if using Data URI format

3. **Request Too Large**
   - Use POST method for large binary data
   - Consider image compression before base64 conversion

4. **Memory Issues**
   - Limit base64 data size (5MB recommended)
   - Process images in smaller batches

### Debug Information

The API logs detailed information about imageData processing:
```
[DEBUG] Processing imageData parameter:
- Data length: 145,832 characters
- Format: Data URI (image/jpeg)
- Estimated size: 109KB
- Processing method: Direct buffer conversion
```

## Future Enhancements

Planned improvements for the imageData feature:
- **Streaming Support**: Handle larger binary data with streaming
- **Format Validation**: Enhanced image format detection and validation
- **Compression Options**: Automatic compression for oversized data
- **Multiple Images**: Support for multiple imageData parameters
- **WebP Optimization**: Enhanced WebP format support

---

**📝 Note**: The imageData parameter is fully backward compatible. All existing image URL functionality continues to work exactly as before.