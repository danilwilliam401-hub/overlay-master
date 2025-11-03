import sharp from 'sharp';

export default async function handler(req, res) {
  try {
    console.log('🚀 SIMPLE OVERLAY API - Testing Sharp text rendering with fallback');
    
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
    
    // 🎯 ENHANCED: Create SVG text that Sharp can render
    if (title) {
      try {
        console.log('🔤 Creating SVG text for title...');
        
        // Create simple SVG with text
        const titleSvg = `
          <svg width="800" height="60" xmlns="http://www.w3.org/2000/svg">
            <text x="10" y="40" 
                  font-family="Arial, sans-serif" 
                  font-size="48" 
                  font-weight="bold"
                  fill="white" 
                  stroke="black" 
                  stroke-width="2">
              ${title.toUpperCase()}
            </text>
          </svg>
        `;
        
        const titleBuffer = await sharp(Buffer.from(titleSvg))
          .png()
          .toBuffer();
        
        overlayElements.push({
          input: titleBuffer,
          left: 30,
          top: targetHeight - 130,
          blend: 'over'
        });
        
        console.log('✅ SVG text rendering successful for title');
        
      } catch (textError) {
        console.log('❌ SVG text failed, using rectangle:', textError.message);
        
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
    
    // 🎯 ENHANCED: Create SVG text for website
    if (website) {
      try {
        console.log('🔤 Creating SVG text for website...');
        
        const websiteSvg = `
          <svg width="600" height="40" xmlns="http://www.w3.org/2000/svg">
            <text x="10" y="28" 
                  font-family="Arial, sans-serif" 
                  font-size="24" 
                  font-weight="normal"
                  fill="#FFD700" 
                  stroke="black" 
                  stroke-width="1">
              ${website.toUpperCase()}
            </text>
          </svg>
        `;
        
        const websiteBuffer = await sharp(Buffer.from(websiteSvg))
          .png()
          .toBuffer();
        
        overlayElements.push({
          input: websiteBuffer,
          left: 30,
          top: targetHeight - 70,
          blend: 'over'
        });
        
        console.log('✅ SVG text rendering successful for website');
        
      } catch (textError) {
        console.log('❌ SVG text failed, using rectangle:', textError.message);
        
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