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
  },
  // 🎨 NEW UNIVERSAL DESIGNS (15 additional styles)
  'modern': {
    name: 'Modern Lifestyle',
    titleColor: '#FFFFFF',
    websiteColor: '#E0E0E0',
    gradientColors: ['rgba(100,100,100,0.3)', 'rgba(50,50,50,0.9)'],
    titleSize: 60,
    websiteSize: 24,
    fontWeight: '900'
  },
  'bold': {
    name: 'Bold Impact',
    titleColor: '#FFFFFF',
    websiteColor: '#FFD700',
    gradientColors: ['rgba(139,0,0,0.95)', 'rgba(26,0,0,0.98)'],
    titleSize: 85,
    websiteSize: 35,
    fontWeight: '900'
  },
  'viral': {
    name: 'Viral Entertainment',
    titleColor: '#FFFFFF',
    websiteColor: '#FF1493',
    gradientColors: ['rgba(255,20,147,0.8)', 'rgba(138,43,226,0.9)'],
    titleSize: 67,
    websiteSize: 28,
    fontWeight: '800'
  },
  'breaking': {
    name: 'Breaking News',
    titleColor: '#FFFFFF',
    websiteColor: '#FF0000',
    gradientColors: ['rgba(0,30,60,0.9)', 'rgba(0,50,100,0.95)'],
    titleSize: 57,
    websiteSize: 25,
    fontWeight: '700'
  },
  'thoughtful': {
    name: 'Thoughtful Quotes',
    titleColor: '#2F2F2F',
    websiteColor: '#8B4513',
    gradientColors: ['rgba(245,245,220,0.9)', 'rgba(250,250,250,0.95)'],
    titleSize: 53,
    websiteSize: 22,
    fontWeight: '700'
  },
  'colorful': {
    name: 'Colorful Youth',
    titleColor: '#FFFFFF',
    websiteColor: '#FFE4E1',
    gradientColors: ['rgba(0,255,255,0.8)', 'rgba(255,165,0,0.9)'],
    titleSize: 63,
    websiteSize: 26,
    fontWeight: '900'
  },
  'overlay': {
    name: 'Photo Overlay',
    titleColor: '#FFFFFF',
    websiteColor: '#F0F0F0',
    gradientColors: ['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.8)'],
    titleSize: 60,
    websiteSize: 24,
    fontWeight: '800'
  },
  'aesthetic': {
    name: 'Aesthetic Style',
    titleColor: '#8E44AD',
    websiteColor: '#D2691E',
    gradientColors: ['rgba(255,182,193,0.7)', 'rgba(221,160,221,0.9)'],
    titleSize: 57,
    websiteSize: 23,
    fontWeight: '700'
  },
  'monochrome': {
    name: 'Monochrome Minimal',
    titleColor: '#000000',
    websiteColor: '#4A4A4A',
    gradientColors: ['rgba(255,255,255,0.95)', 'rgba(248,248,248,0.98)'],
    titleSize: 60,
    websiteSize: 24,
    fontWeight: '700'
  },
  'vintage': {
    name: 'Vintage Retro',
    titleColor: '#8B4513',
    websiteColor: '#D2691E',
    gradientColors: ['rgba(245,222,179,0.9)', 'rgba(222,184,135,0.95)'],
    titleSize: 53,
    websiteSize: 22,
    fontWeight: '600'
  },
  'luxury': {
    name: 'Luxury Premium',
    titleColor: '#FFD700',
    websiteColor: '#C0C0C0',
    gradientColors: ['rgba(0,0,0,0.9)', 'rgba(25,25,112,0.95)'],
    titleSize: 63,
    websiteSize: 26,
    fontWeight: '700'
  },
  'cinematic': {
    name: 'Cinematic Drama',
    titleColor: '#FFFFFF',
    websiteColor: '#FFD700',
    gradientColors: ['rgba(0,0,0,0.95)', 'rgba(20,20,20,0.98)'],
    titleSize: 70,
    websiteSize: 30,
    fontWeight: '900'
  },
  'neon': {
    name: 'Neon Tech',
    titleColor: '#00FF41',
    websiteColor: '#00BFFF',
    gradientColors: ['rgba(0,0,0,0.95)', 'rgba(10,10,30,0.98)'],
    titleSize: 60,
    websiteSize: 26,
    fontWeight: '800'
  },
  'inspire': {
    name: 'Inspirational',
    titleColor: '#FFFFFF',
    websiteColor: '#FFD700',
    gradientColors: ['rgba(30,144,255,0.8)', 'rgba(255,215,0,0.9)'],
    titleSize: 63,
    websiteSize: 26,
    fontWeight: '900'
  },
  'cute': {
    name: 'Cute Aesthetic',
    titleColor: '#FF1493',
    websiteColor: '#DA70D6',
    gradientColors: ['rgba(255,182,193,0.9)', 'rgba(221,160,221,0.95)'],
    titleSize: 67,
    websiteSize: 28,
    fontWeight: '800'
  },
  'warmbrown': {
    name: 'Warm Brown Elegance',
    titleColor: '#FFF8E1',
    websiteColor: '#FFD180',
    gradientColors: ['rgba(62,39,35,0.9)', 'rgba(161,136,127,0.95)'],
    titleSize: 67,
    websiteSize: 28,
    fontWeight: '800'
  },
  'pokemon': {
    name: 'Pokémon Electric',
    titleColor: '#FFCB05',
    websiteColor: '#2A75BB',
    gradientColors: ['rgba(255,214,0,0.95)', 'rgba(61,194,255,0.95)'],
    titleSize: 73,
    websiteSize: 30,
    fontWeight: '900'
  },
  // 30 High-Engagement Design Presets for Facebook Image Headlines
  'modern': {
    name: 'Modern Minimal',
    titleColor: '#FFFFFF',
    websiteColor: '#00BFA5',
    gradientColors: ['rgba(240,240,240,0.95)', 'rgba(26,26,26,0.98)'],
    titleSize: 75,
    websiteSize: 32,
    fontWeight: '900'
  },
  'boldblue': {
    name: 'Bold Blue Impact',
    titleColor: '#FFFFFF',
    websiteColor: '#FFD700',
    gradientColors: ['rgba(0,51,160,0.95)', 'rgba(0,31,77,0.98)'],
    titleSize: 80,
    websiteSize: 34,
    fontWeight: '900'
  },
  'sunrise': {
    name: 'Sunrise Energy',
    titleColor: '#FFFFFF',
    websiteColor: '#FFFFFF',
    gradientColors: ['rgba(255,140,0,0.95)', 'rgba(255,65,108,0.98)'],
    titleSize: 78,
    websiteSize: 32,
    fontWeight: '900'
  },
  'gradientgold': {
    name: 'Gradient Gold',
    titleColor: '#FFD700',
    websiteColor: '#FFFFFF',
    gradientColors: ['rgba(28,28,28,0.95)', 'rgba(58,58,58,0.98)'],
    titleSize: 75,
    websiteSize: 30,
    fontWeight: '900'
  },
  'minimalwhite': {
    name: 'Minimal White',
    titleColor: '#000000',
    websiteColor: '#999999',
    gradientColors: ['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.98)'],
    titleSize: 80,
    websiteSize: 32,
    fontWeight: '900'
  },
  'midnight': {
    name: 'Midnight Dark',
    titleColor: '#FFFFFF',
    websiteColor: '#00FFFF',
    gradientColors: ['rgba(13,27,42,0.95)', 'rgba(0,0,0,0.98)'],
    titleSize: 80,
    websiteSize: 34,
    fontWeight: '900'
  },
  'energetic': {
    name: 'Energetic Fire',
    titleColor: '#FFFFFF',
    websiteColor: '#FFD700',
    gradientColors: ['rgba(255,0,0,0.95)', 'rgba(255,165,0,0.98)'],
    titleSize: 85,
    websiteSize: 36,
    fontWeight: '900'
  },
  'cyberpunk': {
    name: 'Cyberpunk Neon',
    titleColor: '#FF00FF',
    websiteColor: '#00FFFF',
    gradientColors: ['rgba(13,13,13,0.95)', 'rgba(106,13,173,0.98)'],
    titleSize: 78,
    websiteSize: 32,
    fontWeight: '800'
  },
  'moody': {
    name: 'Moody Atmosphere',
    titleColor: '#FFFFFF',
    websiteColor: '#FFD180',
    gradientColors: ['rgba(78,52,46,0.95)', 'rgba(33,33,33,0.98)'],
    titleSize: 75,
    websiteSize: 30,
    fontWeight: '900'
  },
  'forest': {
    name: 'Forest Deep',
    titleColor: '#FFFFFF',
    websiteColor: '#AEEA00',
    gradientColors: ['rgba(0,77,64,0.95)', 'rgba(0,37,26,0.98)'],
    titleSize: 78,
    websiteSize: 32,
    fontWeight: '900'
  },
  'popart': {
    name: 'Pop Art Style',
    titleColor: '#000000',
    websiteColor: '#000000',
    gradientColors: ['rgba(255,82,82,0.95)', 'rgba(255,235,59,0.98)'],
    titleSize: 85,
    websiteSize: 34,
    fontWeight: '900'
  },
  'darkgold': {
    name: 'Dark Gold Luxury',
    titleColor: '#FFD700',
    websiteColor: '#EEEEEE',
    gradientColors: ['rgba(0,0,0,0.95)', 'rgba(17,17,17,0.98)'],
    titleSize: 75,
    websiteSize: 30,
    fontWeight: '900'
  },
  'aqua': {
    name: 'Aqua Fresh',
    titleColor: '#FFFFFF',
    websiteColor: '#FFFFFF',
    gradientColors: ['rgba(0,188,212,0.95)', 'rgba(0,77,128,0.98)'],
    titleSize: 80,
    websiteSize: 32,
    fontWeight: '900'
  },
  'fire': {
    name: 'Fire Intensity',
    titleColor: '#FFEB3B',
    websiteColor: '#FFFFFF',
    gradientColors: ['rgba(0,0,0,0.95)', 'rgba(255,87,34,0.98)'],
    titleSize: 85,
    websiteSize: 34,
    fontWeight: '900'
  },
  'chill': {
    name: 'Chill Vibes',
    titleColor: '#FFFFFF',
    websiteColor: '#FFFFFF',
    gradientColors: ['rgba(3,169,244,0.95)', 'rgba(0,188,212,0.98)'],
    titleSize: 80,
    websiteSize: 32,
    fontWeight: '900'
  },
  'royal': {
    name: 'Royal Elegance',
    titleColor: '#FFFFFF',
    websiteColor: '#FFD54F',
    gradientColors: ['rgba(40,53,147,0.95)', 'rgba(255,213,79,0.98)'],
    titleSize: 75,
    websiteSize: 30,
    fontWeight: '900'
  },
  'cinematic': {
    name: 'Cinematic Drama',
    titleColor: '#FFFFFF',
    websiteColor: '#E50914',
    gradientColors: ['rgba(0,0,0,0.95)', 'rgba(32,32,32,0.98)'],
    titleSize: 85,
    websiteSize: 32,
    fontWeight: '900'
  },
  'retro': {
    name: 'Retro Nostalgia',
    titleColor: '#FFF8E1',
    websiteColor: '#FCE4EC',
    gradientColors: ['rgba(255,112,67,0.95)', 'rgba(93,64,55,0.98)'],
    titleSize: 78,
    websiteSize: 32,
    fontWeight: '800'
  },
  'purpledream': {
    name: 'Purple Dream',
    titleColor: '#FFFFFF',
    websiteColor: '#FFFFFF',
    gradientColors: ['rgba(142,36,170,0.95)', 'rgba(224,64,251,0.98)'],
    titleSize: 80,
    websiteSize: 32,
    fontWeight: '900'
  },
  'grunge': {
    name: 'Grunge Style',
    titleColor: '#FFFFFF',
    websiteColor: '#FFD600',
    gradientColors: ['rgba(66,66,66,0.95)', 'rgba(33,33,33,0.98)'],
    titleSize: 78,
    websiteSize: 32,
    fontWeight: '900'
  },
  'matrix': {
    name: 'Matrix Code',
    titleColor: '#00FF00',
    websiteColor: '#00FF00',
    gradientColors: ['rgba(0,0,0,0.95)', 'rgba(0,51,0,0.98)'],
    titleSize: 80,
    websiteSize: 32,
    fontWeight: '900'
  },
  'street': {
    name: 'Street Urban',
    titleColor: '#FFFFFF',
    websiteColor: '#E53935',
    gradientColors: ['rgba(97,97,97,0.95)', 'rgba(66,66,66,0.98)'],
    titleSize: 80,
    websiteSize: 32,
    fontWeight: '900'
  },
  'cloud': {
    name: 'Cloud Sky',
    titleColor: '#0D47A1',
    websiteColor: '#FFFFFF',
    gradientColors: ['rgba(129,212,250,0.95)', 'rgba(255,255,255,0.98)'],
    titleSize: 78,
    websiteSize: 30,
    fontWeight: '900'
  },
  'metallic': {
    name: 'Metallic Steel',
    titleColor: '#EEEEEE',
    websiteColor: '#FFFFFF',
    gradientColors: ['rgba(176,190,197,0.95)', 'rgba(38,50,56,0.98)'],
    titleSize: 80,
    websiteSize: 32,
    fontWeight: '900'
  },
  'chocolate': {
    name: 'Chocolate Brown',
    titleColor: '#FFF3E0',
    websiteColor: '#FFE082',
    gradientColors: ['rgba(62,39,35,0.95)', 'rgba(121,85,72,0.98)'],
    titleSize: 78,
    websiteSize: 32,
    fontWeight: '900'
  },
  'future': {
    name: 'Future Tech',
    titleColor: '#00E5FF',
    websiteColor: '#FFFFFF',
    gradientColors: ['rgba(0,0,0,0.95)', 'rgba(117,117,117,0.98)'],
    titleSize: 80,
    websiteSize: 32,
    fontWeight: '900'
  },
  'limepop': {
    name: 'Lime Pop',
    titleColor: '#000000',
    websiteColor: '#FFFFFF',
    gradientColors: ['rgba(205,220,57,0.95)', 'rgba(104,159,56,0.98)'],
    titleSize: 80,
    websiteSize: 32,
    fontWeight: '900'
  },
  'royalred': {
    name: 'Royal Red',
    titleColor: '#FFFFFF',
    websiteColor: '#FFD700',
    gradientColors: ['rgba(183,28,28,0.95)', 'rgba(255,215,0,0.98)'],
    titleSize: 78,
    websiteSize: 30,
    fontWeight: '900'
  },
  'viral': {
    name: 'Viral Impact',
    titleColor: '#000000',
    websiteColor: '#FFFFFF',
    gradientColors: ['rgba(255,235,59,0.95)', 'rgba(255,145,0,0.98)'],
    titleSize: 85,
    websiteSize: 32,
    fontWeight: '900'
  }
};

export default async function handler(req, res) {
  console.log('\n🎨 === MULTI-DESIGN FONT OVERLAY GENERATOR ===');
  console.log('Method:', req.method);
  console.log('Query:', req.query);
  console.log('Full URL:', req.url);
  
  try {
    // Enhanced parameter extraction to handle complex image URLs with query parameters
    const rawParams = req.query;
    
    // Advanced URL parsing to handle image URLs with query parameters
    let imageUrl = 'https://picsum.photos/800/600';
    let title = 'Sample Title';
    let website = 'Website.com';
    let design = 'default';
    let w = '1080';
    let h = '1350';
    
    // Parse the raw URL to reconstruct image URL with its query parameters
    const originalUrl = req.url;
    console.log('📥 Processing URL:', originalUrl);
    
    // Extract the image parameter and reconstruct it with its query parameters
    const imageStartMatch = originalUrl.match(/[?&]image=([^&]*)/);
    if (imageStartMatch) {
      let reconstructedImageUrl = decodeURIComponent(imageStartMatch[1]);
      
      // If the image URL contains '?', it likely has query parameters that were split
      if (reconstructedImageUrl.includes('?')) {
        console.log('🔍 Detected image URL with query parameters, reconstructing...');
        
        // Find where the image URL ends by looking for our API parameters
        const apiParams = ['title', 'website', 'design', 'w', 'h'];
        const urlParts = originalUrl.split(/[?&]/);
        let imageQueryParams = [];
        let foundApiParam = false;
        
        for (let i = 0; i < urlParts.length; i++) {
          const part = urlParts[i];
          if (part.startsWith('image=')) continue; // Skip the image= part itself
          
          // Check if this is an API parameter
          const isApiParam = apiParams.some(param => part.startsWith(param + '='));
          
          if (isApiParam) {
            foundApiParam = true;
            // Extract API parameter
            const [paramName, paramValue] = part.split('=');
            switch (paramName) {
              case 'title': title = decodeURIComponent(paramValue); break;
              case 'website': website = decodeURIComponent(paramValue); break;
              case 'design': design = paramValue; break;
              case 'w': w = paramValue; break;
              case 'h': h = paramValue; break;
            }
          } else if (!foundApiParam && part.includes('=')) {
            // This is likely part of the image URL query parameters
            imageQueryParams.push(part);
          }
        }
        
        // Reconstruct the full image URL
        if (imageQueryParams.length > 0) {
          imageUrl = reconstructedImageUrl + '&' + imageQueryParams.join('&');
        } else {
          imageUrl = reconstructedImageUrl;
        }
      } else {
        imageUrl = reconstructedImageUrl;
      }
    }
    
    // Fallback to standard query parsing for other parameters if not already extracted
    if (title === 'Sample Title') {
      title = decodeURIComponent(rawParams.title || 'Sample Title');
    }
    if (website === 'Website.com') {
      website = decodeURIComponent(rawParams.website || 'Website.com');
    }
    if (design === 'default') {
      design = rawParams.design || 'default';
    }
    
    console.log('🔗 Reconstructed image URL:', imageUrl);
    console.log('� Parameters:', { title, website, design, w, h });
    
    const image = imageUrl.startsWith('http') ? imageUrl : decodeURIComponent(imageUrl);

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
    
    // Adjust website positioning for designs with accent elements
    let websiteY = Math.round(titleEndY + gapBetweenTitleAndWebsite);
    if (design === 'anime') {
      // For anime design, add extra space after the accent line (15px line position + 20px gap)
      websiteY = Math.round(titleEndY + 15 + 25); // accent line at +15, website at +40 from title end
    }
    
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
          ${design === 'warmbrown' ? `
          <radialGradient id="warmVignette" cx="50%" cy="30%" r="80%">
            <stop offset="0%" style="stop-color:rgba(0,0,0,0); stop-opacity:0"/>
            <stop offset="70%" style="stop-color:rgba(0,0,0,0); stop-opacity:0"/>
            <stop offset="100%" style="stop-color:rgba(0,0,0,0.3); stop-opacity:1"/>
          </radialGradient>` : ''}
          ${design === 'pokemon' ? `
          <radialGradient id="pokemonBurst" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.3"/>
            <stop offset="40%" stop-color="#FFCB05" stop-opacity="0.15"/>
            <stop offset="100%" stop-color="#FFCB05" stop-opacity="0"/>
          </radialGradient>` : ''}
          ${design === 'bold' ? `
          <radialGradient id="boldVignette" cx="50%" cy="50%" r="70%">
            <stop offset="0%" style="stop-color:rgba(0,0,0,0); stop-opacity:0"/>
            <stop offset="60%" style="stop-color:rgba(0,0,0,0); stop-opacity:0"/>
            <stop offset="100%" style="stop-color:rgba(0,0,0,0.5); stop-opacity:1"/>
          </radialGradient>` : ''}
        </defs>
        
        <style>
          .title-text { 
            font-family: "Noto Sans Bold", "Noto Sans", "Inter", sans-serif; 
            font-size: ${selectedDesign.titleSize}px; 
            font-weight: 900;
            fill: ${selectedDesign.titleColor}; 
            text-anchor: middle;
            dominant-baseline: middle;
            word-spacing: normal;
            letter-spacing: ${design === 'tech' ? '2px' : '1px'};
            ${design === 'tech' ? 'filter: url(#glow);' : ''}
          }
          .website-text { 
            font-family: "Noto Sans Bold", "Noto Sans", "Inter", sans-serif; 
            font-size: ${selectedDesign.websiteSize}px; 
            font-weight: 700;
            fill: ${selectedDesign.websiteColor}; 
            text-anchor: middle;
            dominant-baseline: middle;
            letter-spacing: ${design === 'sports' ? '3px' : '2px'};
            text-transform: uppercase;
          }
          .bold-text {
            font-family: "Noto Sans Bold", "Inter Bold", sans-serif;
            font-weight: 900;
            stroke: rgba(0,0,0,0.3);
            stroke-width: 1.5px;
            paint-order: stroke fill;
            filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));
          }
          ${design === 'boldblue' ? `
          .boldblue-title {
            font-family: "Noto Sans Bold", "Inter Bold", sans-serif;
            font-weight: 900;
            stroke: rgba(0,0,0,0.4);
            stroke-width: 2px;
            paint-order: stroke fill;
            filter: drop-shadow(0 3px 10px rgba(0,0,0,0.6));
            letter-spacing: 1px;
          }
          .boldblue-website {
            font-family: "Noto Sans Bold", "Inter Bold", sans-serif;
            font-weight: 800;
            letter-spacing: 2px;
            stroke: rgba(0,0,0,0.2);
            stroke-width: 1px;
            paint-order: stroke fill;
            filter: drop-shadow(0 2px 6px rgba(0,0,0,0.5));
          }` : ''}
          ${design === 'anime' ? `
          .accent-line {
            stroke: ${selectedDesign.websiteColor};
            stroke-width: 3;
            fill: none;
          }` : ''}
          ${design === 'breaking' ? `
          .breaking-tag {
            font-family: "Noto Sans Bold", "Inter Bold", sans-serif;
            font-size: 18px;
            font-weight: 900;
            fill: #FFFFFF;
            text-anchor: middle;
          }
          .breaking-bg {
            fill: #FF0000;
          }` : ''}
          ${design === 'thoughtful' ? `
          .divider-line {
            stroke: ${selectedDesign.websiteColor};
            stroke-width: 1;
            fill: none;
          }` : ''}
          ${design === 'cinematic' ? `
          .letterbox {
            fill: rgba(0,0,0,0.9);
          }` : ''}
          ${design === 'neon' ? `
          .neon-glow {
            filter: drop-shadow(0 0 10px ${selectedDesign.titleColor});
          }` : ''}
          ${design === 'warmbrown' ? `
          .warm-shadow {
            filter: drop-shadow(2px 2px 8px rgba(0,0,0,0.4));
          }
          .vignette-overlay {
            fill: url(#warmVignette);
          }` : ''}
          ${design === 'pokemon' ? `
          .pokemon-title {
            stroke: #2A75BB;
            stroke-width: 6;
            paint-order: stroke fill;
            filter: drop-shadow(0 6px 12px rgba(0,0,0,0.3));
          }
          .pokemon-website {
            letter-spacing: 3px;
          }
          .radial-burst {
            fill: url(#pokemonBurst);
            opacity: 0.6;
          }` : ''}
          ${design === 'bold' ? `
          .bold-title {
            font-family: "Noto Sans Bold", "Inter Bold", sans-serif;
            font-weight: 900;
            stroke: rgba(0,0,0,0.4);
            stroke-width: 2px;
            paint-order: stroke fill;
            filter: drop-shadow(0 6px 16px rgba(0,0,0,0.6));
            letter-spacing: 1px;
          }
          .bold-website {
            font-family: "Noto Sans Bold", "Inter Bold", sans-serif;
            font-weight: 800;
            letter-spacing: 3px;
          }
          .bold-vignette {
            fill: url(#boldVignette);
            opacity: 0.4;
          }` : ''}
        </style>
        
        <!-- Dynamic Design Gradient Background -->
        <rect width="100%" height="100%" fill="url(#dynamicGradient)"/>
        
        ${design === 'breaking' ? `
        <!-- Breaking News Tag (above title) -->
        <rect x="${Math.round(targetWidth / 2 - 60)}" y="${Math.round(titleStartY - 80)}" width="120" height="30" rx="4" class="breaking-bg"/>
        <text x="${Math.round(targetWidth / 2)}" y="${Math.round(titleStartY - 60)}" class="breaking-tag">BREAKING</text>
        ` : ''}
        
        ${design === 'cinematic' ? `
        <!-- Cinematic letterbox bars -->
        <rect x="0" y="0" width="${targetWidth}" height="80" class="letterbox"/>
        <rect x="0" y="${svgHeight - 80}" width="${targetWidth}" height="80" class="letterbox"/>
        ` : ''}

        ${design === 'pokemon' ? `
        <!-- Pokemon radial burst behind title -->
        <circle cx="${Math.round(targetWidth / 2)}" cy="${Math.round(titleStartY + (titleLines.length * lineHeight / 2))}" r="200" class="radial-burst"/>
        ` : ''}

        <!-- Title Text Lines - Center aligned with design-specific styling -->
        ${titleLines.map((line, index) => {
          // Determine classes for bold designs
          const boldDesigns = ['boldblue', 'bold', 'energetic', 'popart', 'viral'];
          const isBoldDesign = boldDesigns.includes(design);
          const classes = [
            'title-text',
            design === 'neon' ? 'neon-glow' : '',
            design === 'warmbrown' ? 'warm-shadow' : '',
            design === 'pokemon' ? 'pokemon-title' : '',
            design === 'bold' ? 'bold-title' : '',
            design === 'boldblue' ? 'boldblue-title' : '',
            isBoldDesign ? 'bold-text' : ''
          ].filter(Boolean).join(' ');
          
          return `<text x="${Math.round(targetWidth / 2)}" y="${Math.round(titleStartY + (index * lineHeight))}" class="${classes}">${line}</text>`;
        }).join('')}
        
        ${design === 'anime' ? `
        <!-- Anime-style accent lines (below title) -->
        <line x1="${padding}" y1="${Math.round(titleEndY + 15)}" x2="${targetWidth - padding}" y2="${Math.round(titleEndY + 15)}" class="accent-line"/>
        ` : ''}
        
        ${design === 'thoughtful' ? `
        <!-- Thoughtful-style thin divider -->
        <line x1="${Math.round(targetWidth / 2 - 100)}" y1="${Math.round(titleEndY + 15)}" x2="${Math.round(targetWidth / 2 + 100)}" y2="${Math.round(titleEndY + 15)}" class="divider-line"/>
        ` : ''}
        
        ${design === 'news' ? `
        <!-- News-style separator bar -->
        <rect x="${padding}" y="${Math.round(titleEndY + 10)}" width="${contentWidth}" height="4" fill="${selectedDesign.websiteColor}"/>
        ` : ''}
        
        <!-- Website Text - Dynamically positioned with design styling -->
        <text x="${Math.round(targetWidth / 2)}" y="${Math.round(websiteY)}" class="website-text ${design === 'pokemon' ? 'pokemon-website' : ''} ${design === 'bold' ? 'bold-website' : ''} ${design === 'boldblue' ? 'boldblue-website' : ''} ${['boldblue', 'bold', 'energetic', 'popart', 'viral'].includes(design) ? 'bold-text' : ''}">${websiteText}</text>
        
        ${design === 'warmbrown' ? `
        <!-- Warm brown vignette overlay for depth -->
        <rect width="100%" height="100%" class="vignette-overlay"/>
        ` : ''}
        
        ${design === 'bold' ? `
        <!-- Bold design vignette overlay for dramatic depth -->
        <rect width="100%" height="100%" class="bold-vignette"/>
        ` : ''}
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