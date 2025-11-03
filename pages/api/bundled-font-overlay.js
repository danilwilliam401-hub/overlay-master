import sharp from 'sharp';
import https from 'https';
import http from 'http';
import path from 'path';

// Force Node.js runtime (crucial for Sharp + fontconfig)
export const runtime = 'nodejs';

// Set up fontconfig paths at module load time
process.env.FONTCONFIG_PATH = path.join(process.cwd(), 'fontconfig');
process.env.FONTCONFIG_FILE = path.join(process.cwd(), 'fontconfig', 'fonts.conf');

// Enable debug logging for fontconfig (remove in production)
// process.env.FC_DEBUG = "1";

console.log('🔤 Font paths configured:', {
  FONTCONFIG_PATH: process.env.FONTCONFIG_PATH,
  FONTCONFIG_FILE: process.env.FONTCONFIG_FILE,
  fontsDir: path.join(process.cwd(), 'fonts')
});

function fetchImageBuffer(imageUrl) {
  return new Promise((resolve, reject) => {
    const protocol = imageUrl.startsWith('https') ? https : http;
    
    protocol.get(imageUrl, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        console.log(`Redirecting to: ${response.headers.location}`);
        return fetchImageBuffer(response.headers.location).then(resolve).catch(reject);
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

export default async function handler(req, res) {
  console.log('\n🎨 === FONT-ENABLED OVERLAY GENERATOR ===');
  console.log('Method:', req.method);
  console.log('Query:', req.query);
  
  try {
    const {
      image = 'https://picsum.photos/800/600',
      title = 'Sample Title',
      website = 'Website.com',
      w = '1080',
      h = '1350'
    } = req.query;

    const targetWidth = parseInt(w);
    const targetHeight = parseInt(h);

    console.log('📥 Fetching image:', image);
    const imageBuffer = await fetchImageBuffer(image);
    console.log('✅ Image fetched:', imageBuffer.length, 'bytes');

    // Process base image
    const processedImage = sharp(imageBuffer)
      .resize(targetWidth, targetHeight, {
        fit: 'cover',
        position: 'center'
      });

    console.log('📝 Generating SVG with bundled fonts...');
    
    // Create SVG with proper font references
    const svg = `
      <svg width="${targetWidth}" height="200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:rgb(0,0,0);stop-opacity:0.3"/>
            <stop offset="100%" style="stop-color:rgb(0,0,0);stop-opacity:0.9"/>
          </linearGradient>
        </defs>
        
        <style>
          .title-text { 
            font-family: "Inter", "Inter-Regular", sans-serif; 
            font-size: 48px; 
            font-weight: bold;
            fill: white; 
            text-anchor: start;
            dominant-baseline: middle;
          }
          .website-text { 
            font-family: "Inter", "Inter-Regular", sans-serif; 
            font-size: 24px; 
            font-weight: normal;
            fill: #FFD700; 
            text-anchor: start;
            dominant-baseline: middle;
          }
        </style>
        
        <!-- Background -->
        <rect width="100%" height="100%" fill="url(#bgGradient)"/>
        
        <!-- Title Text -->
        <text x="40" y="80" class="title-text">${title.toUpperCase()}</text>
        
        <!-- Website Text -->
        <text x="40" y="140" class="website-text">${website.toUpperCase()}</text>
      </svg>
    `;
    
    console.log('🔤 SVG created with font references');
    console.log('📊 SVG preview (first 200 chars):', svg.substring(0, 200));
    
    // Convert SVG to buffer
    const svgBuffer = Buffer.from(svg, 'utf-8');
    
    console.log('⚡ Compositing with Sharp...');
    
    // Composite the SVG onto the image
    const finalImage = await processedImage
      .composite([{
        input: svgBuffer,
        left: 0,
        top: targetHeight - 200,
        blend: 'over'
      }])
      .jpeg({ quality: 90 })
      .toBuffer();
      
    console.log('✅ Final image generated:', finalImage.length, 'bytes');
    
    // Set response headers
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.setHeader('X-Font-System', 'bundled-inter');
    
    // Send the image
    res.send(finalImage);
    
  } catch (error) {
    console.error('❌ Font overlay generation failed:', error);
    
    // Provide detailed error info for debugging
    res.status(500).json({
      error: 'Font overlay generation failed',
      message: error.message,
      fontconfig: {
        FONTCONFIG_PATH: process.env.FONTCONFIG_PATH,
        FONTCONFIG_FILE: process.env.FONTCONFIG_FILE,
        exists: require('fs').existsSync(process.env.FONTCONFIG_FILE || '')
      }
    });
  }
}