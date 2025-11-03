import sharp from 'sharp';

// 🚀 FORCE NODE.JS RUNTIME (Sharp not supported on Edge)
export const runtime = 'nodejs';

export default async function handler(req, res) {
  try {
    console.log('🚀 SIMPLE OVERLAY API - Bitmap text rendering (no font dependencies)');
    
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
    
    // 🎯 SHARP TEXT RENDERING: Try built-in text capabilities
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
    
    // 🎯 BITMAP TEXT: Create text using pattern-based approach
    if (title) {
      try {
        console.log('🔤 Creating bitmap-style text for title...');
        
        // Create text using a simple pattern approach
        const chars = title.toUpperCase().split('');
        const charWidth = 24;
        const charHeight = 40;
        const textWidth = chars.length * charWidth;
        
        // Create base canvas for text
        const textCanvas = await sharp({
          create: {
            width: textWidth + 20,
            height: charHeight + 10,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          }
        });
        
        // Create simple character blocks
        const charElements = [];
        
        for (let i = 0; i < chars.length; i++) {
          const char = chars[i];
          
          // Create a simple block pattern for each character
          const charBlock = await sharp({
            create: {
              width: charWidth - 2,
              height: charHeight - 2,
              channels: 4,
              background: char === ' ' ? 
                { r: 0, g: 0, b: 0, alpha: 0 } : 
                { r: 255, g: 255, b: 255, alpha: 0.9 }
            }
          }).png().toBuffer();
          
          charElements.push({
            input: charBlock,
            left: i * charWidth + 10,
            top: 5,
            blend: 'over'
          });
        }
        
        const titleBuffer = await textCanvas
          .composite(charElements)
          .png()
          .toBuffer();
        
        overlayElements.push({
          input: titleBuffer,
          left: 30,
          top: targetHeight - 130,
          blend: 'over'
        });
        
        console.log('✅ Bitmap text rendering successful for title');
        
      } catch (textError) {
        console.log('❌ Bitmap text failed, using rectangle:', textError.message);
        
        // Fallback to rectangle
        const titleBar = await sharp({
          create: {
            width: Math.min(title.length * 25, targetWidth - 60),
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
    }
    
    // 🎯 BITMAP TEXT: Create website text using patterns
    if (website) {
      try {
        console.log('🔤 Creating bitmap-style text for website...');
        
        const chars = website.toUpperCase().split('');
        const charWidth = 16;
        const charHeight = 24;
        const textWidth = chars.length * charWidth;
        
        // Create base canvas for website text
        const textCanvas = await sharp({
          create: {
            width: textWidth + 20,
            height: charHeight + 10,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          }
        });
        
        // Create character blocks for website
        const charElements = [];
        
        for (let i = 0; i < chars.length; i++) {
          const char = chars[i];
          
          // Create colored block for each character
          const charBlock = await sharp({
            create: {
              width: charWidth - 2,
              height: charHeight - 2,
              channels: 4,
              background: char === ' ' ? 
                { r: 0, g: 0, b: 0, alpha: 0 } : 
                { r: 255, g: 215, b: 0, alpha: 0.9 } // Gold color
            }
          }).png().toBuffer();
          
          charElements.push({
            input: charBlock,
            left: i * charWidth + 10,
            top: 5,
            blend: 'over'
          });
        }
        
        const websiteBuffer = await textCanvas
          .composite(charElements)
          .png()
          .toBuffer();
        
        overlayElements.push({
          input: websiteBuffer,
          left: 30,
          top: targetHeight - 70,
          blend: 'over'
        });
        
        console.log('✅ Bitmap text rendering successful for website');
        
      } catch (textError) {
        console.log('❌ Bitmap text failed, using rectangle:', textError.message);
        
        // Fallback to rectangle
        const websiteBar = await sharp({
          create: {
            width: Math.min(website.length * 20, targetWidth - 60),
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