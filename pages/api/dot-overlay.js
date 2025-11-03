import sharp from 'sharp';

export default async function handler(req, res) {
  try {
    console.log('🚀 ULTRA-SIMPLE OVERLAY - Letters as colored dots');
    
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
    
    // 🎯 ULTRA-SIMPLE: Dots for each character
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
    
    // Title as white dots
    if (title) {
      console.log('🔵 Creating dots for title...');
      const chars = title.replace(/\s/g, ''); // Remove spaces
      
      for (let i = 0; i < Math.min(chars.length, 15); i++) {
        const dot = await sharp({
          create: {
            width: 20,
            height: 20,
            channels: 3,
            background: { r: 255, g: 255, b: 255 }
          }
        }).png().toBuffer();
        
        overlayElements.push({
          input: dot,
          left: 50 + (i * 30),
          top: targetHeight - 120,
          blend: 'over'
        });
      }
      console.log(`✅ Created ${Math.min(chars.length, 15)} dots for title`);
    }
    
    // Website as yellow dots
    if (website) {
      console.log('🟡 Creating dots for website...');
      const chars = website.replace(/\s/g, ''); // Remove spaces
      
      for (let i = 0; i < Math.min(chars.length, 12); i++) {
        const dot = await sharp({
          create: {
            width: 16,
            height: 16,
            channels: 3,
            background: { r: 255, g: 215, b: 0 }
          }
        }).png().toBuffer();
        
        overlayElements.push({
          input: dot,
          left: 50 + (i * 25),
          top: targetHeight - 60,
          blend: 'over'
        });
      }
      console.log(`✅ Created ${Math.min(chars.length, 12)} dots for website`);
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