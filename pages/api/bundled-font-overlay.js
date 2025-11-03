import sharp from 'sharp';
import https from 'https';
import http from 'http';
import path from 'path';

// Force Node.js runtime (crucial for Sharp + fontconfig)
export const runtime = 'nodejs';

// Set up fontconfig paths at module load time
const fontConfigPath = path.join(process.cwd(), 'fontconfig');
const fontConfigFile = path.join(fontConfigPath, 'fonts.conf');
const fontsDir = path.join(process.cwd(), 'fonts');

// Configure fontconfig environment
process.env.FONTCONFIG_PATH = fontConfigPath;
process.env.FONTCONFIG_FILE = fontConfigFile;
process.env.FONTCONFIG_CACHE = '/tmp/fontconfig-cache';

// Enable debug logging for fontconfig (helpful for debugging)
process.env.FC_DEBUG = "1";

// Verify font files exist
const fs = require('fs');
const notoRegular = path.join(fontsDir, 'NotoSans-Regular.ttf');
const notoBold = path.join(fontsDir, 'NotoSans-Bold.ttf');
const interRegular = path.join(fontsDir, 'Inter-Regular.ttf');
const interBold = path.join(fontsDir, 'Inter-Bold.ttf');

console.log('🔤 Font Configuration Check:', {
  workingDir: process.cwd(),
  FONTCONFIG_PATH: process.env.FONTCONFIG_PATH,
  FONTCONFIG_FILE: process.env.FONTCONFIG_FILE,
  FONTCONFIG_CACHE: process.env.FONTCONFIG_CACHE,
  fontsDir: fontsDir,
  fontConfigExists: fs.existsSync(fontConfigFile),
  notoRegularExists: fs.existsSync(notoRegular),
  notoBoldExists: fs.existsSync(notoBold),
  interRegularExists: fs.existsSync(interRegular),
  interBoldExists: fs.existsSync(interBold)
});

// List all font files available
try {
  const fontFiles = fs.readdirSync(fontsDir);
  console.log('📁 Available font files:', fontFiles);
} catch (err) {
  console.log('❌ Could not read fonts directory:', err.message);
}

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
    // Extract and properly decode UTF-8 parameters
    const rawParams = req.query;
    
    const image = decodeURIComponent(rawParams.image || 'https://picsum.photos/800/600');
    const title = decodeURIComponent(rawParams.title || 'Sample Title');
    const website = decodeURIComponent(rawParams.website || 'Website.com');
    const w = rawParams.w || '1080';
    const h = rawParams.h || '1350';

    // Debug UTF-8 decoding
    console.log('🔤 UTF-8 Parameter Decoding:');
    console.log('  Raw title:', rawParams.title);
    console.log('  Decoded title:', title);
    console.log('  Title bytes:', Buffer.from(title, 'utf-8'));
    console.log('  Raw website:', rawParams.website);
    console.log('  Decoded website:', website);
    console.log('  Website bytes:', Buffer.from(website, 'utf-8'));

    const targetWidth = parseInt(w);
    const targetHeight = parseInt(h);

    console.log('📥 Fetching image:', image);
    let imageBuffer;
    try {
      imageBuffer = await fetchImageBuffer(image);
      console.log('✅ Image fetched:', imageBuffer.length, 'bytes');
    } catch (fetchError) {
      console.log('⚠️ Image fetch failed, creating default image:', fetchError.message);
      // Create a default solid color image
      imageBuffer = await sharp({
        create: {
          width: targetWidth,
          height: targetHeight,
          channels: 3,
          background: { r: 70, g: 130, b: 180 } // Steel blue background
        }
      }).jpeg().toBuffer();
      console.log('✅ Default image created:', imageBuffer.length, 'bytes');
    }

    // Process base image
    const processedImage = sharp(imageBuffer)
      .resize(targetWidth, targetHeight, {
        fit: 'cover',
        position: 'center'
      });

    console.log('📝 Generating SVG with bundled fonts...');
    
    // Ensure proper UTF-8 text processing
    const titleText = Buffer.from(title, 'utf-8').toString('utf-8').toUpperCase();
    const websiteText = Buffer.from(website, 'utf-8').toString('utf-8').toUpperCase();
    
    console.log('🔤 Text Processing Check:');
    console.log('  Original title:', title);
    console.log('  Processed title:', titleText);
    console.log('  Original website:', website);
    console.log('  Processed website:', websiteText);
    
    // Create SVG with proper UTF-8 encoding and font references
    const padding = 80; // Increased left and right padding to prevent edge contact
    const contentWidth = targetWidth - (padding * 2); // Available width for text
    
    // Function to wrap text into multiple lines - NO ELLIPSIS, accept all text
    function wrapText(text, maxWidth, fontSize) {
      const words = text.split(' ');
      const lines = [];
      let currentLine = '';
      
      // More accurate character width estimation for Noto Sans
      const avgCharWidth = fontSize * 0.55;
      const maxCharsPerLine = Math.floor(maxWidth / avgCharWidth);
      
      // NO maximum lines limit - accept all text
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        
        if (testLine.length <= maxCharsPerLine) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            // Word is too long, add it anyway
            lines.push(word);
            currentLine = '';
          }
        }
      }
      
      if (currentLine) {
        lines.push(currentLine);
      }
      
      return lines;
    }
    
    // Wrap the title text
    const titleLines = wrapText(titleText, contentWidth, 48);
    const lineHeight = 50; // Line spacing between title lines
    const totalTitleHeight = titleLines.length * lineHeight;
    
    // Dynamic positioning to prevent overlap
    const topMargin = 20; // Top margin
    const gapBetweenTitleAndWebsite = 25; // Minimum gap between title and website
    const websiteTextSize = 24; // Website text font size
    
    // Calculate title start position
    const titleStartY = topMargin + (lineHeight * 0.8); // Start from top with margin
    
    // Calculate website position based on where title ends
    const titleEndY = titleStartY + totalTitleHeight;
    const websiteY = titleEndY + gapBetweenTitleAndWebsite;
    
    // Calculate dynamic SVG height to fit all content
    const bottomMargin = 20;
    const svgHeight = Math.max(200, websiteY + bottomMargin + 10); // Minimum 200px, or calculated height
    
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
      <svg width="${targetWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">`
        <defs>
          <linearGradient id="strongBlackGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:rgb(0,0,0);stop-opacity:0.2"/>
            <stop offset="30%" style="stop-color:rgb(0,0,0);stop-opacity:0.6"/>
            <stop offset="60%" style="stop-color:rgb(0,0,0);stop-opacity:0.85"/>
            <stop offset="100%" style="stop-color:rgb(0,0,0);stop-opacity:0.95"/>
          </linearGradient>
        </defs>
        
        <style>
          .title-text { 
            font-family: "Noto Sans", "Inter", sans-serif; 
            font-size: 48px; 
            font-weight: 700;
            fill: white; 
            text-anchor: middle;
            dominant-baseline: middle;
            word-spacing: normal;
            letter-spacing: 1px;
          }
          .website-text { 
            font-family: "Noto Sans", "Inter", sans-serif; 
            font-size: 24px; 
            font-weight: 400;
            fill: #FFD700; 
            text-anchor: middle;
            dominant-baseline: middle;
            letter-spacing: 2px;
          }
        </style>
        
        <!-- Strong Black Gradient Background -->
        <rect width="100%" height="100%" fill="url(#strongBlackGradient)"/>
        
        <!-- Title Text Lines - Center aligned with proper wrapping and padding -->
        ${titleLines.map((line, index) => 
          `<text x="${targetWidth / 2}" y="${titleStartY + (index * lineHeight)}" class="title-text">${line}</text>`
        ).join('')}
        
        <!-- Website Text - Dynamically positioned to avoid overlap -->
        <text x="${targetWidth / 2}" y="${websiteY}" class="website-text">${websiteText}</text>
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
        top: targetHeight - svgHeight,
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