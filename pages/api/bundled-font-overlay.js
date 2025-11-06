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

// Design configurations for different styles
const DESIGN_THEMES = {
  'default': {
    name: 'Classic Dark',
    titleColor: '#FFFFFF',
    websiteColor: '#FFD700',
    gradientColors: ['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.95)'],
    titleSize: 48,
    websiteSize: 24,
    fontWeight: '700'
  },
  'tech': {
    name: 'Tech Blue',
    titleColor: '#FFFFFF',
    websiteColor: '#00D4FF',
    gradientColors: ['rgba(0,0,0,0.95)', 'rgba(0,0,0,0.95)'],
    titleSize: 52,
    websiteSize: 26,
    fontWeight: '800'
  },
  'entertainment': {
    name: 'Entertainment Yellow',
    titleColor: '#000000',
    websiteColor: '#000000',
    gradientColors: ['rgba(255,212,0,0.95)', 'rgba(255,212,0,0.95)'],
    titleSize: 70,
    websiteSize: 32,
    fontWeight: '900'
  },
  'sports': {
    name: 'Sports Dynamic',
    titleColor: '#FFFFFF',
    websiteColor: '#00FF88',
    gradientColors: ['rgba(0,40,80,0.3)', 'rgba(10,70,140,0.95)'],
    titleSize: 50,
    websiteSize: 25,
    fontWeight: '800'
  },
  'anime': {
    name: 'Anime Dark',
    titleColor: '#FFD700',
    websiteColor: '#FF6B35',
    gradientColors: ['rgba(20,10,30,0.4)', 'rgba(40,20,60,0.95)'],
    titleSize: 46,
    websiteSize: 23,
    fontWeight: '700'
  },
  'eco': {
    name: 'Eco Green',
    titleColor: '#FFFFFF',
    websiteColor: '#32CD32',
    gradientColors: ['rgba(10,40,20,0.3)', 'rgba(20,80,40,0.95)'],
    titleSize: 48,
    websiteSize: 24,
    fontWeight: '700'
  },
  'news': {
    name: 'News Professional',
    titleColor: '#FFFFFF',
    websiteColor: '#FF4444',
    gradientColors: ['rgba(20,20,20,0.4)', 'rgba(60,60,60,0.95)'],
    titleSize: 44,
    websiteSize: 22,
    fontWeight: '600'
  },
  'minimal': {
    name: 'Minimal Clean',
    titleColor: '#333333',
    websiteColor: '#666666',
    gradientColors: ['rgba(255,255,255,0.1)', 'rgba(240,240,240,0.9)'],
    titleSize: 42,
    websiteSize: 20,
    fontWeight: '500'
  }
};

export default async function handler(req, res) {
  console.log('\n🎨 === MULTI-DESIGN FONT OVERLAY GENERATOR ===');
  console.log('Method:', req.method);
  console.log('Query:', req.query);
  
  try {
    // Extract and properly decode UTF-8 parameters
    const rawParams = req.query;
    
    const image = decodeURIComponent(rawParams.image || 'https://picsum.photos/800/600');
    const title = decodeURIComponent(rawParams.title || 'Sample Title');
    const website = decodeURIComponent(rawParams.website || 'Website.com');
    const design = rawParams.design || 'default'; // New design parameter
    const w = rawParams.w || '1080';
    const h = rawParams.h || '1350';

    // Get design theme configuration
    const selectedDesign = DESIGN_THEMES[design] || DESIGN_THEMES['default'];
    console.log('🎨 Selected Design Theme:', selectedDesign.name);

    // Debug UTF-8 decoding
    console.log('🔤 UTF-8 Parameter Decoding:');
    console.log('  Raw title:', rawParams.title);
    console.log('  Decoded title:', title);
    console.log('  Title bytes:', Buffer.from(title, 'utf-8'));
    console.log('  Raw website:', rawParams.website);
    console.log('  Decoded website:', website);
    console.log('  Website bytes:', Buffer.from(website, 'utf-8'));
    console.log('  Design theme:', design);

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
    
    // Function to escape XML entities for safe SVG embedding
    function escapeXml(text) {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    // Ensure proper UTF-8 text processing and XML escaping
    const titleText = escapeXml(Buffer.from(title, 'utf-8').toString('utf-8').toUpperCase());
    const websiteText = escapeXml(Buffer.from(website, 'utf-8').toString('utf-8').toUpperCase());
    
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
    
    // Wrap the title text using design-specific font size
    const titleLines = wrapText(titleText, contentWidth, selectedDesign.titleSize);
    const lineHeight = Math.round(selectedDesign.titleSize + 8); // Dynamic line spacing based on font size (ensure integer)
    const totalTitleHeight = Math.round(titleLines.length * lineHeight);
    
    // Dynamic positioning to prevent overlap
    const topMargin = 20; // Top margin
    const gapBetweenTitleAndWebsite = 25; // Minimum gap between title and website
    const websiteTextSize = selectedDesign.websiteSize; // Design-specific website text size
    
    // Calculate title start position (ensure integers)
    const titleStartY = Math.round(topMargin + (lineHeight * 0.8)); // Start from top with margin
    
    // Calculate website position based on where title ends (ensure integers)
    const titleEndY = Math.round(titleStartY + totalTitleHeight);
    const websiteY = Math.round(titleEndY + gapBetweenTitleAndWebsite);
    
    // Calculate dynamic SVG height to fit all content (ensure integers)
    const bottomMargin = 20;
    const svgHeight = Math.round(Math.max(200, websiteY + bottomMargin + 10)); // Minimum 200px, or calculated height
    
    // Generate design-specific gradient stops
    const gradientStops = selectedDesign.gradientColors.map((color, index) => {
      const offset = index === 0 ? '0%' : '100%';
      return `<stop offset="${offset}" style="stop-color:${color}"/>`;
    }).join('');

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
      <svg width="${targetWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="dynamicGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            ${gradientStops}
          </linearGradient>
          ${design === 'tech' ? `
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>` : ''}
        </defs>
        
        <style>
          .title-text { 
            font-family: "Noto Sans", "Inter", sans-serif; 
            font-size: ${selectedDesign.titleSize}px; 
            font-weight: ${selectedDesign.fontWeight};
            fill: ${selectedDesign.titleColor}; 
            text-anchor: middle;
            dominant-baseline: middle;
            word-spacing: normal;
            letter-spacing: ${design === 'tech' ? '2px' : '1px'};
            ${design === 'tech' ? 'filter: url(#glow);' : ''}
          }
          .website-text { 
            font-family: "Noto Sans", "Inter", sans-serif; 
            font-size: ${selectedDesign.websiteSize}px; 
            font-weight: ${design === 'minimal' ? '400' : '500'};
            fill: ${selectedDesign.websiteColor}; 
            text-anchor: middle;
            dominant-baseline: middle;
            letter-spacing: ${design === 'sports' ? '3px' : '2px'};
            text-transform: uppercase;
          }
          ${design === 'anime' ? `
          .accent-line {
            stroke: ${selectedDesign.websiteColor};
            stroke-width: 3;
            fill: none;
          }` : ''}
        </style>
        
        <!-- Dynamic Design Gradient Background -->
        <rect width="100%" height="100%" fill="url(#dynamicGradient)"/>
        
        ${design === 'anime' ? `
        <!-- Anime-style accent lines -->
        <line x1="${padding}" y1="${Math.round(titleStartY - 20)}" x2="${targetWidth - padding}" y2="${Math.round(titleStartY - 20)}" class="accent-line"/>
        ` : ''}
        
        <!-- Title Text Lines - Center aligned with design-specific styling -->
        ${titleLines.map((line, index) => 
          `<text x="${Math.round(targetWidth / 2)}" y="${Math.round(titleStartY + (index * lineHeight))}" class="title-text">${line}</text>`
        ).join('')}
        
        ${design === 'news' ? `
        <!-- News-style separator bar -->
        <rect x="${padding}" y="${Math.round(titleEndY + 10)}" width="${contentWidth}" height="4" fill="${selectedDesign.websiteColor}"/>
        ` : ''}
        
        <!-- Website Text - Dynamically positioned with design styling -->
        <text x="${Math.round(targetWidth / 2)}" y="${Math.round(websiteY)}" class="website-text">${websiteText}</text>
      </svg>
    `;
    
    console.log('🔤 SVG created with font references');
    console.log('📊 SVG preview (first 200 chars):', svg.substring(0, 200));
    
    // Convert SVG to buffer
    const svgBuffer = Buffer.from(svg, 'utf-8');
    
    console.log('⚡ Compositing with Sharp...');
    
    // Composite the SVG onto the image (ensure integer positioning)
    const finalImage = await processedImage
      .composite([{
        input: svgBuffer,
        left: 0,
        top: Math.round(targetHeight - svgHeight),
        blend: 'over'
      }])
      .jpeg({ quality: 90 })
      .toBuffer();
      
    console.log('✅ Final image generated:', finalImage.length, 'bytes');
    
    // Set response headers with proper filename and content length
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Disposition', `inline; filename="${design}-overlay.jpg"`);
    res.setHeader('Content-Length', String(finalImage.length));
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.setHeader('X-Font-System', 'bundled-fonts');
    res.setHeader('X-Design-Theme', selectedDesign.name);
    
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