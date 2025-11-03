import sharp from 'sharp';

export default async function handler(req, res) {
  try {
    console.log('🚀 SIMPLE OVERLAY API - No text rendering issues');
    
    const { image, title, website } = req.query;
    
    if (!image) {
      return res.status(400).json({ error: 'Image URL required' });
    }
    
    console.log(`Processing: ${image}`);
    console.log(`Title: ${title || 'None'}`);
    console.log(`Website: ${website || 'None'}`);
    
    // Fetch the image
    let imageBuffer;
    try {
      const response = await fetch(image);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      imageBuffer = Buffer.from(await response.arrayBuffer());
    } catch (fetchError) {
      console.error('Fetch failed:', fetchError.message);
      return res.status(500).json({ error: 'Failed to fetch image' });
    }
    
    // Process with Sharp
    let processedImage = sharp(imageBuffer);
    
    // Get image info
    const { width, height } = await processedImage.metadata();
    console.log(`Image dimensions: ${width}x${height}`);
    
    // Resize to standard format
    const targetWidth = 1080;
    const targetHeight = 1350;
    
    processedImage = processedImage
      .resize(targetWidth, targetHeight, { 
        fit: 'cover', 
        position: 'center' 
      });
    
    // 🔥 VERCEL-SAFE APPROACH: Use only colored rectangles (no text at all)
    const overlayElements = [];
    
    // Dark background overlay
    const darkOverlay = await sharp({
      create: {
        width: targetWidth,
        height: 150,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0.7 }
      }
    }).png().toBuffer();
    
    overlayElements.push({
      input: darkOverlay,
      left: 0,
      top: targetHeight - 150,
      blend: 'over'
    });
    
    // Title indicator - white rectangle
    if (title) {
      const titleLength = title.length;
      const titleBar = await sharp({
        create: {
          width: Math.min(titleLength * 25, targetWidth - 60),
          height: 12,
          channels: 3,
          background: { r: 255, g: 255, b: 255 }
        }
      }).png().toBuffer();
      
      overlayElements.push({
        input: titleBar,
        left: 30,
        top: targetHeight - 120,
        blend: 'over'
      });
    }
    
    // Website indicator - yellow rectangle  
    if (website) {
      const websiteLength = website.length;
      const websiteBar = await sharp({
        create: {
          width: Math.min(websiteLength * 20, targetWidth - 60),
          height: 8,
          channels: 3,
          background: { r: 255, g: 215, b: 0 }
        }
      }).png().toBuffer();
      
      overlayElements.push({
        input: websiteBar,
        left: 30,
        top: targetHeight - 50,
        blend: 'over'
      });
    }
    
    // Apply all overlays
    const finalImage = await processedImage
      .composite(overlayElements)
      .jpeg({ quality: 85 })
      .toBuffer();
    
    console.log(`✅ Generated image: ${finalImage.length} bytes`);
    
    // Return the image
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.send(finalImage);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ error: 'Image processing failed' });
  }
}

export const config = {
  api: {
    responseLimit: '10mb',
  },
};