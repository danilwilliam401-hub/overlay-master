import sharp from 'sharp';
import https from 'https';
import http from 'http';
import path from 'path';
import fs from 'fs';
//import { protectApiRoute } from '../../lib/apiKeyAuth';
//import { logUsage } from './usage/log';

// Force Node.js runtime (crucial for Sharp + fontconfig)
export const runtime = 'nodejs';

// Log Sharp versions for debugging Vercel compatibility
console.log('🔍 Sharp versions:', sharp.versions);
console.log('🔍 Platform:', process.platform, '/', process.arch);
console.log('🔍 Node version:', process.version);

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

// Load and encode fonts as base64 at module load time
const fontFiles = {
  notoRegular: path.join(fontsDir, 'NotoSans-Regular.ttf'),
  notoBold: path.join(fontsDir, 'NotoSans-Bold.ttf'),
  interRegular: path.join(fontsDir, 'Inter-Regular.ttf'),
  interBold: path.join(fontsDir, 'Inter-Bold.ttf'),
  // Professional News Fonts
  bebasNeue: path.join(fontsDir, 'BebasNeue-Regular.ttf'),
  anton: path.join(fontsDir, 'Anton-Regular.ttf'),
  impact: path.join(fontsDir, 'Impact-Regular.ttf'),
  oswaldBold: path.join(fontsDir, 'Oswald-Bold.ttf'),
  montserratExtraBold: path.join(fontsDir, 'Montserrat-ExtraBold.ttf'),
  leagueSpartanBold: path.join(fontsDir, 'LeagueSpartan-Bold.ttf'),
  ralewayHeavy: path.join(fontsDir, 'Raleway-Heavy.ttf'),
  robotoCondensedBold: path.join(fontsDir, 'RobotoCondensed-Bold.ttf'),
  poppinsExtraBold: path.join(fontsDir, 'Poppins-ExtraBold.ttf'),
  playfairDisplayBlack: path.join(fontsDir, 'PlayfairDisplay-Black.ttf')
};

let fontBase64Cache = {};

// Function to load font as base64
function loadFontAsBase64(fontPath, fontName) {
  try {
    console.log(`🔍 Checking font: ${fontPath}`);
    console.log(`🔍 File exists: ${fs.existsSync(fontPath)}`);
    
    if (fs.existsSync(fontPath)) {
      const fontBuffer = fs.readFileSync(fontPath);
      const base64Font = fontBuffer.toString('base64');
      const dataUrl = `data:font/truetype;charset=utf-8;base64,${base64Font}`;
      
      console.log(`✅ Loaded ${fontName}: ${Math.round(base64Font.length / 1024)}KB`);
      console.log(`🔍 Base64 length: ${base64Font.length} chars`);
      console.log(`🔍 Data URL length: ${dataUrl.length} chars`);
      console.log(`🔍 First 100 chars: ${dataUrl.substring(0, 100)}...`);
      
      return dataUrl;
    } else {
      console.log(`❌ Font not found: ${fontPath}`);
      console.log(`🔍 Current working directory: ${process.cwd()}`);
      console.log(`🔍 Fonts directory: ${fontsDir}`);
      console.log(`🔍 Fonts dir exists: ${fs.existsSync(fontsDir)}`);
      if (fs.existsSync(fontsDir)) {
        console.log(`🔍 Files in fonts dir:`, fs.readdirSync(fontsDir));
      }
      return null;
    }
  } catch (error) {
    console.log(`❌ Error loading ${fontName}:`, error.message);
    console.log(`🔍 Error stack:`, error.stack);
    return null;
  }
}

// Load all fonts at startup
console.log('🔤 Loading fonts as base64...');
fontBase64Cache = {
  notoRegular: loadFontAsBase64(fontFiles.notoRegular, 'Noto Sans Regular'),
  notoBold: loadFontAsBase64(fontFiles.notoBold, 'Noto Sans Bold'),
  interRegular: loadFontAsBase64(fontFiles.interRegular, 'Inter Regular'),
  interBold: loadFontAsBase64(fontFiles.interBold, 'Inter Bold'),
  // Professional News Fonts
  bebasNeue: loadFontAsBase64(fontFiles.bebasNeue, 'Bebas Neue'),
  anton: loadFontAsBase64(fontFiles.anton, 'Anton'),
  impact: loadFontAsBase64(fontFiles.impact, 'Impact'),
  oswaldBold: loadFontAsBase64(fontFiles.oswaldBold, 'Oswald Bold'),
  montserratExtraBold: loadFontAsBase64(fontFiles.montserratExtraBold, 'Montserrat ExtraBold'),
  leagueSpartanBold: loadFontAsBase64(fontFiles.leagueSpartanBold, 'League Spartan Bold'),
  ralewayHeavy: loadFontAsBase64(fontFiles.ralewayHeavy, 'Raleway Heavy'),
  robotoCondensedBold: loadFontAsBase64(fontFiles.robotoCondensedBold, 'Roboto Condensed Bold'),
  poppinsExtraBold: loadFontAsBase64(fontFiles.poppinsExtraBold, 'Poppins ExtraBold'),
  playfairDisplayBlack: loadFontAsBase64(fontFiles.playfairDisplayBlack, 'Playfair Display Black')
};

// Debug font loading results
console.log('📊 Font Loading Results:');
Object.entries(fontBase64Cache).forEach(([key, value]) => {
  console.log(`  ${key}: ${value ? '✅ Loaded' : '❌ Failed'} (${value ? `${Math.round(value.length / 1024)}KB` : 'N/A'})`);
});

// Check if we have at least one bold font
const hasBoldFonts = fontBase64Cache.notoBold || fontBase64Cache.interBold || fontBase64Cache.bebasNeue || fontBase64Cache.anton || fontBase64Cache.impact || fontBase64Cache.oswaldBold || fontBase64Cache.montserratExtraBold || fontBase64Cache.leagueSpartanBold || fontBase64Cache.ralewayHeavy || fontBase64Cache.robotoCondensedBold || fontBase64Cache.poppinsExtraBold || fontBase64Cache.playfairDisplayBlack;
console.log(`🔤 Bold fonts available: ${hasBoldFonts ? '✅ YES' : '❌ NO'}`);

// Verify font files exist
console.log('🔤 Font Configuration Check:', {
  workingDir: process.cwd(),
  FONTCONFIG_PATH: process.env.FONTCONFIG_PATH,
  FONTCONFIG_FILE: process.env.FONTCONFIG_FILE,
  FONTCONFIG_CACHE: process.env.FONTCONFIG_CACHE,
  fontsDir: fontsDir,
  fontConfigExists: fs.existsSync(fontConfigFile),
  notoRegularExists: fs.existsSync(fontFiles.notoRegular),
  notoBoldExists: fs.existsSync(fontFiles.notoBold),
  interRegularExists: fs.existsSync(fontFiles.interRegular),
  interBoldExists: fs.existsSync(fontFiles.interBold),
  base64CacheReady: Object.values(fontBase64Cache).filter(Boolean).length > 0
});

// List all font files available
try {
  const fontFilesList = fs.readdirSync(fontsDir);
  console.log('📁 Available font files:', fontFilesList);
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
    name: 'Breaking News Boldness',
    titleColor: '#FFFFFF',
    websiteColor: '#FFD700',
    gradientColors: ['rgba(0,31,63,0.95)', 'rgba(0,31,63,0.98)'], // Navy Blue
    titleSize: 48,
    websiteSize: 24,
    fontWeight: '700',
    fontFamily: 'Bebas Neue'
  },
  'tech': {
    name: 'Professional Editorial',
    titleColor: '#FFFFFF',
    websiteColor: '#E0E0E0',
    gradientColors: ['rgba(38,50,56,0.95)', 'rgba(38,50,56,0.98)'], // Steel Blue
    titleSize: 52,
    websiteSize: 26,
    fontWeight: '700',
    fontFamily: 'Oswald'
  },
  'entertainment': {
    name: 'Viral & Loud',
    titleColor: '#FFFFFF',
    websiteColor: '#FFB347',
    gradientColors: ['rgba(230,81,0,0.95)', 'rgba(230,81,0,0.98)'], // Burnt Orange
    titleSize: 78,
    websiteSize: 32,
    fontWeight: '900',
    fontFamily: 'Anton'
  },
  'antonBlack': {
    name: 'Anton Black',
    titleColor: '#FFFFFF',
    websiteColor: '#FFFFFF',
    gradientColors: ['rgba(0,0,0,0.95)', 'rgba(0,0,0,0.98)'], // Pure Black
    titleSize: 78,
    websiteSize: 32,
    fontWeight: '900',
    fontFamily: 'Anton'
  },
  'antonBlack1': {
    name: 'Anton Black Gradient',
    titleColor: '#FFFFFF',
    websiteColor: '#FFFFFF',
    gradientColors: [
      'rgba(0,0,0,0.0)',      // 0%: Completely transparent at top
      'rgba(0,0,0,0.0)',      // 10%: Still transparent

'rgba(0,0,0,0.05)',
  'rgba(0,0,0,0.10)',
  'rgba(0,0,0,0.15)',
  'rgba(0,0,0,0.20)',
  'rgba(0,0,0,0.25)',
  'rgba(0,0,0,0.30)',
  'rgba(0,0,0,0.35)',
  'rgba(0,0,0,0.40)',
  'rgba(0,0,0,0.45)',
  'rgba(0,0,0,0.50)',
  'rgba(0,0,0,0.55)',
  'rgba(0,0,0,0.60)',
  'rgba(0,0,0,0.65)',
  'rgba(0,0,0,0.70)',
  'rgba(0,0,0,0.75)',
  'rgba(0,0,0,0.80)',
  'rgba(0,0,0,0.85)',
  'rgba(0,0,0,0.90)',
  'rgba(0,0,0,0.95)',


     
      'rgba(0,0,0,1.0)',      // 90%: Solid black - title coverage begins
      'rgba(0,0,0,1.0)' ,      // 100%: Bottom - Rich dark black for maximum readability
         'rgba(0,0,0,1.0)',      // 90%: Solid black - title coverage begins
      'rgba(0,0,0,1.0)' ,      // 100%: Bottom - Rich dark black for maximum readability
         'rgba(0,0,0,1.0)',      // 90%: Solid black - title coverage begins
      'rgba(0,0,0,1.0)' ,      // 100%: Bottom - Rich dark black for maximum readability
         'rgba(0,0,0,1.0)',      // 90%: Solid black - title coverage begins
      'rgba(0,0,0,1.0)'  ,     // 100%: Bottom - Rich dark black for maximum readability
         'rgba(0,0,0,1.0)',      // 90%: Solid black - title coverage begins
      'rgba(0,0,0,1.0)'  ,     // 100%: Bottom - Rich dark black for maximum readability

            'rgba(0,0,0,1.0)',      // 90%: Solid black - title coverage begins
      'rgba(0,0,0,1.0)' ,      // 100%: Bottom - Rich dark black for maximum readability
         'rgba(0,0,0,1.0)',      // 90%: Solid black - title coverage begins
      'rgba(0,0,0,1.0)' ,      // 100%: Bottom - Rich dark black for maximum readability
         'rgba(0,0,0,1.0)',      // 90%: Solid black - title coverage begins
      'rgba(0,0,0,1.0)' ,      // 100%: Bottom - Rich dark black for maximum readability
         'rgba(0,0,0,1.0)',      // 90%: Solid black - title coverage begins
      'rgba(0,0,0,1.0)'  ,     // 100%: Bottom - Rich dark black for maximum readability
         'rgba(0,0,0,1.0)',      // 90%: Solid black - title coverage begins
      'rgba(0,0,0,1.0)'       // 100%: Bottom - Rich dark black for maximum readability
    ], // Cinematic gradient with precise 10% increments from transparent top to solid dark bottom
    titleSize: 78,
    websiteSize: 32,
    fontWeight: '900',
    fontFamily: 'Anton'
  },
  'bebas': {
    name: 'Bebas Black Gradient',
    titleColor: '#FFFFFF',
    websiteColor: '#FFFFFF',
    highlightColor: '#2FB8FF', // Default fallback (not used with multi-color)
    gradientColors: [
      'rgba(0,0,0,0.0)',      // 0%: Completely transparent at top
      'rgba(0,0,0,0.0)',      // 10%: Still transparent
      'rgba(0,0,0,0.05)',
      'rgba(0,0,0,0.10)',
      'rgba(0,0,0,0.15)',
      'rgba(0,0,0,0.20)',
      'rgba(0,0,0,0.25)',
      'rgba(0,0,0,0.30)',
      'rgba(0,0,0,0.35)',
      'rgba(0,0,0,0.40)',
      'rgba(0,0,0,0.45)',
      'rgba(0,0,0,0.50)',
      'rgba(0,0,0,0.55)',
      'rgba(0,0,0,0.60)',
      'rgba(0,0,0,0.65)',
      'rgba(0,0,0,0.70)',
      'rgba(0,0,0,0.75)',
      'rgba(0,0,0,0.80)',
      'rgba(0,0,0,0.85)',
      'rgba(0,0,0,0.90)',
      'rgba(0,0,0,0.95)',
      'rgba(0,0,0,1.0)',      // Solid black - title coverage begins
      'rgba(0,0,0,1.0)',
      'rgba(0,0,0,1.0)',
      'rgba(0,0,0,1.0)',
      'rgba(0,0,0,1.0)',
      'rgba(0,0,0,1.0)',
      'rgba(0,0,0,1.0)',
      'rgba(0,0,0,1.0)',
      'rgba(0,0,0,1.0)',
      'rgba(0,0,0,1.0)',
      'rgba(0,0,0,1.0)',
      'rgba(0,0,0,1.0)',
      'rgba(0,0,0,1.0)',
      'rgba(0,0,0,1.0)',
      'rgba(0,0,0,1.0)',
      'rgba(0,0,0,1.0)',
      'rgba(0,0,0,1.0)',
      'rgba(0,0,0,1.0)'       // 100%: Bottom - Rich dark black for maximum readability
    ], // Cinematic gradient with precise increments from transparent top to solid dark bottom
    titleSize: 78,
    websiteSize: 32,
    fontWeight: '900',
    fontFamily: 'Anton',
    enableHighlight: true // Enable keyword highlighting
  },
  'antonTransparent': {
    name: 'Anton Transparent',
    titleColor: '#FFFFFF',
    websiteColor: '#FFD700', // Golden Yellow
    gradientColors: [], // No gradient - fully transparent
    titleSize: 78,
    websiteSize: 32,
    fontWeight: '900',
    fontFamily: 'Anton',
    transparent: true // Flag to output PNG with alpha channel
  },
  'antonTransparent2': {
    name: 'Anton White Background',
    titleColor: '#FFFFFF',
    websiteColor: '#FFB347', // Same as entertainment
    gradientColors: ['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.98)'], // White
    titleSize: 78,
    websiteSize: 32,
    fontWeight: '900',
    fontFamily: 'Anton'
  },
  'antonWhite': {
    name: 'Anton White with Black Text',
    titleColor: '#000000', // Black
    websiteColor: '#000000', // Black
    gradientColors: ['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.98)'], // White
    titleSize: 78,
    websiteSize: 32,
    fontWeight: '900',
    fontFamily: 'Anton'
  },
  'sports': {
    name: 'Impact Headlines',
    titleColor: '#FFFFFF',
    websiteColor: '#90EE90',
    gradientColors: ['rgba(0,77,64,0.95)', 'rgba(0,77,64,0.98)'], // Teal
    titleSize: 50,
    websiteSize: 25,
    fontWeight: '900',
    fontFamily: 'Impact'
  },
  'anime': {
    name: 'Friendly & Trustworthy',
    titleColor: '#FFFFFF',
    websiteColor: '#FFB347',
    gradientColors: ['rgba(255,111,0,0.95)', 'rgba(255,111,0,0.98)'], // Amber
    titleSize: 46,
    websiteSize: 23,
    fontWeight: '800',
    fontFamily: 'Poppins'
  },
  'eco': {
    name: 'Smart & Minimal',
    titleColor: '#FFFFFF',
    websiteColor: '#90EE90',
    gradientColors: ['rgba(0,77,77,0.95)', 'rgba(0,77,77,0.98)'], // Teal
    titleSize: 48,
    websiteSize: 24,
    fontWeight: '800',
    fontFamily: 'League Spartan'
  },
  'news': {
    name: 'Breaking News Crimson',
    titleColor: '#FFFFFF',
    websiteColor: '#FFD700',
    gradientColors: ['rgba(139,0,0,0.95)', 'rgba(139,0,0,0.98)'], // Crimson Red
    titleSize: 44,
    websiteSize: 22,
    fontWeight: '400',
    fontFamily: 'Bebas Neue'
  },
  'minimal': {
    name: 'Editorial Prestige',
    titleColor: '#FFFFFF',
    websiteColor: '#D4AF37',
    gradientColors: ['rgba(0,0,0,0.95)', 'rgba(0,0,0,0.98)'], // Pure Black
    titleSize: 42,
    websiteSize: 20,
    fontWeight: '900',
    fontFamily: 'Playfair Display'
  },
  // 🎨 NEW UNIVERSAL DESIGNS (15 additional styles)
  'modern': {
    name: 'Modern Authority',
    titleColor: '#FFFFFF',
    websiteColor: '#E6E6FA',
    gradientColors: ['rgba(0,51,153,0.95)', 'rgba(0,51,153,0.98)'], // Royal Blue
    titleSize: 60,
    websiteSize: 24,
    fontWeight: '800',
    fontFamily: 'Montserrat'
  },
  'bold': {
    name: 'Stylish Credibility',
    titleColor: '#FFFFFF',
    websiteColor: '#F5DEB3',
    gradientColors: ['rgba(62,39,35,0.95)', 'rgba(62,39,35,0.98)'], // Espresso
    titleSize: 85,
    websiteSize: 35,
    fontWeight: '900',
    fontFamily: 'Raleway'
  },
  'viral': {
    name: 'Versatile & Balanced',
    titleColor: '#FFFFFF',
    websiteColor: '#FFB6C1',
    gradientColors: ['rgba(43,43,43,0.95)', 'rgba(43,43,43,0.98)'], // Graphite
    titleSize: 67,
    websiteSize: 28,
    fontWeight: '700',
    fontFamily: 'Roboto Condensed'
  },
  'breaking': {
    name: 'Breaking News Alert',
    titleColor: '#FFFFFF',
    websiteColor: '#FFD700',
    gradientColors: ['rgba(139,0,0,0.95)', 'rgba(139,0,0,0.98)'], // Dark Red
    titleSize: 57,
    websiteSize: 25,
    fontWeight: '400',
    fontFamily: 'Bebas Neue'
  },
  'thoughtful': {
    name: 'Thoughtful Deep Purple',
    titleColor: '#FFFFFF',
    websiteColor: '#E6E6FA',
    gradientColors: ['rgba(74,20,140,0.95)', 'rgba(74,20,140,0.98)'], // Deep Purple
    titleSize: 53,
    websiteSize: 22,
    fontWeight: '700',
    fontFamily: 'Montserrat'
  },
  'colorful': {
    name: 'Colorful Amber',
    titleColor: '#FFFFFF',
    websiteColor: '#FFE4B5',
    gradientColors: ['rgba(255,111,0,0.95)', 'rgba(255,111,0,0.98)'], // Amber
    titleSize: 63,
    websiteSize: 26,
    fontWeight: '900',
    fontFamily: 'Anton'
  },
  'overlay': {
    name: 'Photo Overlay Dark Gray',
    titleColor: '#FFFFFF',
    websiteColor: '#D3D3D3',
    gradientColors: ['rgba(18,18,18,0.95)', 'rgba(18,18,18,0.98)'], // Dark Gray
    titleSize: 60,
    websiteSize: 24,
    fontWeight: '800',
    fontFamily: 'Roboto Condensed'
  },
  'aesthetic': {
    name: 'Aesthetic Sea Green',
    titleColor: '#FFFFFF',
    websiteColor: '#AFEEEE',
    gradientColors: ['rgba(46,139,87,0.95)', 'rgba(46,139,87,0.98)'], // Sea Green
    titleSize: 57,
    websiteSize: 23,
    fontWeight: '700',
    fontFamily: 'Poppins'
  },
  'monochrome': {
    name: 'Monochrome Graphite',
    titleColor: '#FFFFFF',
    websiteColor: '#D3D3D3',
    gradientColors: ['rgba(43,43,43,0.95)', 'rgba(43,43,43,0.98)'], // Graphite
    titleSize: 60,
    websiteSize: 24,
    fontWeight: '700',
    fontFamily: 'Impact'
  },
  'vintage': {
    name: 'Vintage Copper',
    titleColor: '#FFFFFF',
    websiteColor: '#F5DEB3',
    gradientColors: ['rgba(184,115,51,0.95)', 'rgba(184,115,51,0.98)'], // Copper
    titleSize: 68,
    websiteSize: 26,
    fontWeight: '900',
    fontFamily: 'Playfair Display'
  },
  'luxury': {
    name: 'Luxury Burgundy',
    titleColor: '#FFFFFF',
    websiteColor: '#FFD700',
    gradientColors: ['rgba(128,0,32,0.95)', 'rgba(128,0,32,0.98)'], // Burgundy
    titleSize: 63,
    websiteSize: 26,
    fontWeight: '700',
    fontFamily: 'Playfair Display'
  },
  'cinematic': {
    name: 'Cinematic Steel Blue',
    titleColor: '#FFFFFF',
    websiteColor: '#B0C4DE',
    gradientColors: ['rgba(38,50,56,0.95)', 'rgba(38,50,56,0.98)'], // Steel Blue
    titleSize: 56,
    websiteSize: 30,
    fontWeight: '900',
    fontFamily: 'Anton'
  },
  'neon': {
    name: 'Neon Indigo',
    titleColor: '#FFFFFF',
    websiteColor: '#87CEEB',
    gradientColors: ['rgba(63,81,181,0.95)', 'rgba(63,81,181,0.98)'], // Indigo
    titleSize: 60,
    websiteSize: 26,
    fontWeight: '800',
    fontFamily: 'Bebas Neue'
  },
  'inspire': {
    name: 'Inspirational Olive',
    titleColor: '#FFFFFF',
    websiteColor: '#F0E68C',
    gradientColors: ['rgba(61,153,112,0.95)', 'rgba(61,153,112,0.98)'], // Olive
    titleSize: 63,
    websiteSize: 26,
    fontWeight: '900',
    fontFamily: 'League Spartan'
  },
  'cute': {
    name: 'Cute Royal Violet',
    titleColor: '#FFFFFF',
    websiteColor: '#DDA0DD',
    gradientColors: ['rgba(94,53,177,0.95)', 'rgba(94,53,177,0.98)'], // Royal Violet
    titleSize: 67,
    websiteSize: 28,
    fontWeight: '800',
    fontFamily: 'Poppins'
  },
  'warmbrown': {
    name: 'Warm Espresso',
    titleColor: '#FFFFFF',
    websiteColor: '#D2B48C',
    gradientColors: ['rgba(62,39,35,0.95)', 'rgba(62,39,35,0.98)'], // Espresso
    titleSize: 67,
    websiteSize: 28,
    fontWeight: '800',
    fontFamily: 'Montserrat'
  },
  'pokemon': {
    name: 'Pokémon Wine',
    titleColor: '#FFFFFF',
    websiteColor: '#FFD700',
    gradientColors: ['rgba(81,45,168,0.95)', 'rgba(81,45,168,0.98)'], // Wine
    titleSize: 73,
    websiteSize: 30,
    fontWeight: '900',
    fontFamily: 'Impact'
  },
  'quote1': {
    name: 'Bold Quote Overlay',
    titleColor: '#FFFFFF',
    websiteColor: '#CCCCCC',
    gradientColors: ['rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)'], // Pure black - no overlay needed for blank backgrounds
    titleSize: 64,
    websiteSize: 28,
    fontWeight: '900',
    fontFamily: 'Anton'
  },
  'quote2': {
    name: 'Elegant Quote Overlay',
    titleColor: '#FFFFFF',
    websiteColor: '#E0E0E0',
    gradientColors: ['rgba(30,30,30,1.0)', 'rgba(30,30,30,1.0)'], // Dark charcoal - no overlay needed for blank backgrounds
    titleSize: 58,
    websiteSize: 26,
    fontWeight: '900',
    fontFamily: 'Playfair Display'
  },
  'quote3': {
    name: 'Impact Quote Overlay',
    titleColor: '#FFFFFF',
    websiteColor: '#FFD700',
    gradientColors: ['rgba(0,0,0,1.0)', 'rgba(20,20,20,1.0)'], // Gradient black - subtle gradient even on blank background
    titleSize: 68,
    websiteSize: 30,
    fontWeight: '900',
    fontFamily: 'Impact'
  },
  'blank': {
    name: 'Transparent Blank',
    titleColor: '#FFFFFF',
    websiteColor: '#E0E0E0',
    gradientColors: ['rgba(0,0,0,0)', 'rgba(0,0,0,0)'], // Completely transparent - no background
    titleSize: 60,
    websiteSize: 28,
    fontWeight: '900',
    fontFamily: 'Anton'
  }
};

export default async function handler(req, res) {
  const startTime = Date.now();
  
  console.log('\n🎨 === MULTI-DESIGN FONT OVERLAY GENERATOR ===');
  console.log('Method:', req.method);
  console.log('Query:', req.query);
  console.log('Body:', req.body);
  console.log('Full URL:', req.url);
  
  // ============================================================================
  // API KEY AUTHENTICATION & RATE LIMITING (TEMPORARILY DISABLED)
  // ============================================================================
  // NOTE: Authentication is currently disabled for backwards compatibility
  // Uncomment the code below to re-enable API key authentication
  
  /*
  const { valid, key, error, rateLimit } = await protectApiRoute(req, {
    requireKey: true,  // Set to false to allow anonymous access
    defaultLimit: 60   // Default: 60 requests per minute
  });
  
  // Handle authentication error
  if (!valid) {
    console.log(`❌ Auth failed: ${error}`);
    return res.status(401).json({ 
      status: 'error',
      error: error || 'Invalid API key',
      message: 'Provide a valid API key via Authorization: Bearer <key> or x-api-key header'
    });
  }
  
  // Handle rate limit exceeded
  if (!rateLimit.allowed) {
    console.log(`⚠️ Rate limit exceeded for key ${key.prefix}...`);
    
    await logUsage({
      apiKeyId: key.id,
      endpoint: '/api/bundled-font-overlay',
      method: req.method,
      status: 429,
      latencyMs: Date.now() - startTime,
      errorMessage: 'Rate limit exceeded'
    });
    
    return res.status(429)
      .setHeader('X-RateLimit-Limit', rateLimit.limit)
      .setHeader('X-RateLimit-Remaining', 0)
      .setHeader('X-RateLimit-Reset', rateLimit.resetAt)
      .json({ 
        status: 'error',
        error: 'Rate limit exceeded',
        limit: rateLimit.limit,
        remaining: 0,
        resetAt: new Date(rateLimit.resetAt).toISOString(),
        message: `You have exceeded the rate limit of ${rateLimit.limit} requests per minute`
      });
  }
  
  // Add rate limit headers to all responses
  res.setHeader('X-RateLimit-Limit', rateLimit.limit);
  res.setHeader('X-RateLimit-Remaining', rateLimit.remaining);
  res.setHeader('X-RateLimit-Reset', rateLimit.resetAt);
  
  console.log(`✅ Authenticated: ${key.user.email} (${key.name}) - ${rateLimit.remaining}/${rateLimit.limit} remaining`);
  */
  
  console.log('⚠️ Running in PUBLIC mode (no authentication required)');
  
  // ============================================================================
  // END AUTHENTICATION
  // ============================================================================
  
  try {
    // Support both GET and POST methods for long text handling
    let rawParams;
    if (req.method === 'POST') {
      // For POST requests, use body parameters
      rawParams = req.body || {};
      console.log('📝 Using POST body parameters for long text support');
    } else {
      // For GET requests, use query parameters
      rawParams = req.query;
      console.log('📝 Using GET query parameters');
    }
    
    // Advanced URL parsing to handle image URLs with query parameters
    let imageUrl = 'https://picsum.photos/800/600';
    let imageData = ''; // New parameter for base64 binary data
    let title = 'Sample Title';
    let website = '';
    let design = 'default';
    let val = ''; // New parameter for random quote generation
    let w = '1080';
    let h = '1350';
    
    // Tagalog quotes for random generation (Babae/Hugot theme)
const tagalogQuotes = [
  "Ang pagmamahal ay parang laro lang yan, Kung di ka marunong maglaro, Uuwi kang luhaan.",
  "Sa pag-ibig, walang bulag, walang pipi, walang bingi… pero tanga madami.",
  "Aanhin mo pa ang bahay nyo kung nakatira ka na sa puso ko.",
  "Alam mo ba ang salitang “pagmamahal”? Hindi ko yan pinagaralan pero sayo ko yan natutunan.",
  "Aanhin pa ang tiwala kung bawat hinala ay laging tumatama.",
  "Hindi naman masamang maging selfish. May mga bagay lang talaga na hindi pwedeng may kahati.",
  "Di ko man maisigaw sa buong mundo kung sino ang mahal ko, sapat nang alam natin pareho na ikaw ang tinutukoy ko.",
  "Hindi ka makakahanap ng totoong magmamahal sayo kung pati sarili mo niloloko mo.",
  "Sa love, ‘di maiiwasan na may U-Turn. Yung akala mong dire-diretso na, may babalikan pa pala.",
  "Magmahal ka ng tapat na pulitiko, yung tumutupad sa pangako.",
  "Ang jowa minsan parang sinaing rin iyan, kailangang bantayan.",
  "Ang buhay ng tao parang kuryente rin yan, ‘di natin alam kung kailan may interruption para mas lumiwanag.",
  "Mabuti pa yung kape, mainit man o malamig, hinahanap-hanap pa rin.",
  "Bago mo habulin ang kung sinuman, habulin mo muna grades mo.",
  "Sana may traffic lights din sa love, para alam natin kung kailang maghahanda, di-direstso, o hihinto.",
  "Para kang exam, hindi ko na maunawaan.",
  "Lahat ba ng Math major laging hinahanap si X?",
  "Minsan ang buhay parang yang roller coaster, dadalhin ka sa pinakamasasaya at pinakanakakatakot na parte.",
  "Hindi totoong pinaka masakit pakinggan ang rap songs, try mong umuwi ng madaling araw nang hindi nagpapaalam.",
  "Ang love minsan parang pagbabayad lang ‘yan sa cashier, binigay mo na lahat, hihingan ka pa ng sukli.",
  "Minsan ang love ‘di yan tulad ng phone na pag na lowbat, pwedeng e-recharge.",
  "Sa love, ‘di maiiwasan na may U-Turn. Yung akala mong dire-diretso na, may babalikan pa pala.",
  "Sabi nila “love is blind” kaya pwede bang pumikit ka na lang baka sakaling mahalin mo rin ako.",
  "Ang dami ng girlfriend ‘di dapat yan tulad ng kape na 3-in-1.",
  "Mahal. Minsan bilihin, kadalasan ikaw.",
  "Iwan mo lahat huwag lang ang call center agent, yung gabi kaya niyang gawing araw mahanap ka lang.",
  "Bago mo habulin ang kung sinuman, habulin mo muna grades mo.",
  "Sa love, ‘di maiiwasan na may U-Turn. Yung akala mong dire-diretso na, may babalikan pa pala.",
  "Ang pamilya parang buwan lang yan, hindi mo man minsan nakikita, pero alam mong nandyan lang iyan.",
  "I choose you na nga, pero you wanna catch them all.",
  "Love parang barya lang po sa umaga. Alam mo naman na di ka masusuklian nagbigay kapa ng buo.",
  "Maganda kasi yung daan kaya kumaliwa.",
  "Taken na nga, for granted naman hahaha",
  "May nag propose, bigla kang nag react",
  "Binitawan kaya hanggang tingin na lang.",
  "Sa pag-ibig, walang bulag pipi at bingi, pero tanga madami.",
  "Isa lang ang way para maka move on Pakabusog ka.",
  "Malabo. minsan  mata, minsan ikaw.",
  "Walang isda sa baybayin, saka never kang makakahuli. Choosy ka kasi.",
  "Na-catch mo na lahat pati na Feelings ko.",
  "Travel tayo, tapos libre mo ulit ako. Love you.",
  "Gusto mo ng magandang tanawin, tumitig ka sa sa akin.",
  "Marami na ang namatay sa maling akala.",
  "Ang crush ay parang isang Math problem, kung hindi mo makuha titigan mo nalang.",
  "Wag mo na ipagsiksikan ang sarili mo kung ayaw nya sayo.",
  "Wag nang ipilit masasaktan ka lang.",
  "Pagmamahal mo parang sweldo ko, di ko man lang naramdaman.",
  "Sayang ang plano, kung di naman magkakatuluyan.",
  "Wag basta magtiwala sa di ukulele.",
  "Minsan ang tao parang lugar, hindi na dapat balikan.",
  "Friends lang tayo, walang Malaysia",
  "Taga Baguio ka ba? Because you're so cold.",
  "Ingat ka, marami nang pa-fall ngayon.",
  "Sa limatik ka na nga lapitin, pinagtabuyan mo pa (Faie)",
  "Yung love story natin parang flight ko, akala ko delayed lang yun pala canceled na.",
  "The journey of a thousand miles begins pag may pera ka. Kaya mag-ipon ka.",
  "Sana piso fare pa rin. Piso fare na lang. Piso fare na lang ulet!",
  "Ang pag-ibig parang itinerary. Madalas hindi nasusunod.",
  "Buti pa kay manong tricycle driver, 25 pesos lang special kana (Faie)",
  "Ingat sa Cliff diving. Delikado ang ma-fall lalo na kung walang sasalo sayo.",
  "Kung yung weather nga pabago-bago. Feelings mo pa kaya?",
  "Kung mahal mo ko, wag mo akong Kazakhstan.",
  "Mabuti pa ang bundok inakyat mo, eh yung pag-akyat ng ligaw sakin kelan mo gagawin?",
  "Buti pa yung guide, jahit agod na hindi ako iniwan. Ikaw, hindi naman kita pinagod pero bakit mo ko binitawan?",
  "Sabi mo dollar lang ang ipagpapalit mo. Bakit pati ako?",
  "Buti pa ang travel mo kaya mong planuhin. Ako kaya? Kelan mo paplanuhing mahalin?",
  "Basta text kita later, male-late na KUWAIT!",
  "Ang usapan natin “Leave no trace,” pero bakit ang sakit-sakit pa rin?",
  "Buti pa ang bagyo, may pag-asa",
  "Yung pag-akyat ng bundok parang tayo, nakakapagod.",
  "Sa lahat ng napuntahan ko, ikaw lang ang gusto kong balik-balikan",
  "Pag nagmahal ka dapat SAGADA",
  "Kung tent tayo, ikaw ang pole. Because I can't stand without you.",
  "Ang lamig dito sa taas. Kasing lamig ng puso mo.",
  "Sabi mo, “Laro tayo”. Akala ko “Surfing” yun pala “Feelings”.",
  "Hanggang miss you all nalang ba tayo sa Group Chat?",
  "“Buti pa ang pamasahe ng tren tumaas. Sweldo ko na lang ang hindi.”",
  "Gusto ko ng kape, yung matapang yung kaya akong ipaglaban.",
  "Para kang sweldo ko, di mo namalayang wala na pala.",
  "Buti pa nga files sinesave mo, yung relasyon natin?",
  "Monitor kaba? Kai parang ang sarp mong titigan magdamag.",
  "Keyboard kaba? Kasi type na type kita",
  "Para kang aplikante ko, nangakong darating hindi naman.",
  "Ballpen nga nawawala, feelings pa kaya?",
  "Sick leave. Dahil nasaktan ako nung iniwan mo ko.",
  "Lahat ba ng Math major laging hinahanap si X?",
  "Huwag kang umasa na babalik pa siya, kung nasa piling na siya ng iba.",
  "Para kang exam, hindi ko na maunawaan.",
  "Sana may traffic lights din sa love, para alam natin kung kailang maghahanda, di-direstso, o hihinto.",
  "Ang jowa minsan parang sinaing rin iyan, kailangang bantayan.",
  "Mabuti pa yung kape, mainit man o malamig, hinahanap-hanap pa rin.",
  "Lahat ba ng Math major laging hinahanap si X?",
  "Sa love, ‘di maiiwasan na may U-Turn. Yung akala mong dire-diretso na, may babalikan pa pala.",
  "Walang masama magmahal basta alam mong saan ka liliko o didiretso para wala kang nasasagasaang tao.",
  "Mahal. Minsan bilihin, kadalasan ikaw.",
  "Mabuti pa sa date nyo, lagi kang maaga. Eh sa klase, kamusta?",
  "Sana yung pagmamahal mo parang hugasin rin sa bahay, hindi nauubos.",
  "Kung ayaw mong masaktan, huwag kang papatol sa alam mong expert sa kalokohan.",
  "Hindi lahat ng patama tungkol sa'yo, sadyang natatamaan ka lang kasi!",
  "Hindi ka magiging masaya kung patuloy mong babalikan ang tapos na.",
  "Ang daling matulog, ang hirap bumangon. Ang daling mahulog, ang hirap mag move on.",
  "Kung nagalit man ako nang walang dahilan, pasensya na. Nasaktan kasi ako nang wala kang alam",
  "Sa tamang panahon may isang taong magpapatunay sayo kung bakit ka para sa kanya at kung bakit hindi ka para sa iba.",
  "Di ko man maisigaw sa buong mundo kung sino ang mahal ko, sapat nang alam natin pareho na ikaw ang tinutukoy ko.",
  "Kung pwede lang maging excuse ang pagiging broken hearted, malamang marami ng absent sa high school at college.",
  "Wag mong isiksik ang sarili mo sa taong hindi marunong magpahalaga sa nararamdaman mo. Masasaktan ka lang.",
  "Mahirap kumalma lalo na kapag selos na selos ka na.",
  "Sana isinusulat na ang feelings, para madali lang burahin.",
  "Sana thesis na lang ako na ipaglalaban mo kahit hirap na hirap ka na.",
  "Balang araw makakaya ko na ulit na tingnan ka ng wala na akong nararamdaman pa.",
  "Yung feeling na may narinig kang kanta, tapos naalala mo siya.",
  "Mahirap mag-let go. Pero mas mahirap yung kumakapit ka pa, tinutulak ka na.",
  "May mga tao talaga na kahit napapasaya ka, kaylangan mong iwasan.",
  "Hindi na baleng siya ang bumitaw. Ang importante alam mong lumaban ka hanggang sa wala ka ng maipaglaban.",
  "Hindi mo kailangang mamili sa aming dalawa. Handa akong lumabas sa puso mo para lang sumaya ka sa piling niya.",
  "Ang hirap bitawan nung taong kahit hindi kayo, siya yung nagpapasaya at kumukumpleto ng araw mo!",
  "Pag hindi ka mahal ng mahal mo, wag ka magreklamo. Kasi may mga tao rin na di mo mahal pero mahal ka. Kaya quits lang.",
  "Alam mo kung bakit nasasaktan ka? Kasi iniisip mo na gusto ka rin niya kahit hindi naman talaga.",
  "Dapat ba akong ngumiti dahil magkaibigan tayo? O dapat ba kong malungkot dahil hanggang dun lang tayo?",
  "Hindi tamang gumamit ka ng ibang tao para maka move-on ka. Ginagago mo na nga ang sarili mo, nakasakit ka pa ng iba.",
  "Ibinigay ko na ang lahat pero hindi pa rin sapat.",
  "Lahat tayo napapagod. Wag mong hintayin na mawala pa siya sa buhay mo bago mo siya pahalagahan.",
  "Yung naghihintay ka sa isang bagay na imposible namang mangyari.",
  "Ang oras ay isang mahalagang elemento sa mundo. Bumibilis kapag masaya, at bumabagal kapag wala ka.",
  "Masakit isipin na dahil sa isang pangyayari hindi na kayo pwedeng maging tulad ng dati.",
  "Yung akala mo minahal ka niya pero hindi pala.",
  "Sana tinuruan mo ‘ko kung paano madaling makalimot tulad ng ginawa mong paglimot sa'kin.",
  "Buti pa ang ngipin nabubunot kapag masakit. Sana ang puso ganun din.",
  "Minsan kahit sabihin mong suko ka na, kapag naalala mo kung paano ka niya napasaya, bumabalik ka ulit sa pagiging tanga.",
  "Minsan kailangan tayong masaktan bago tayo matauhan.",
  "Minsan kung sino pa yung rason mo kung bakit ka masaya, siya din ang rason kung bakit masasaktan ka ng sobra.",
  "Kung talagang mahal ka nyan mageefort yan kahit di ka mag-demand.",
  "Kapag nasasaktan ka, pwede kang umiyak. Tao lang tayo hindi superhero.",
  "Tao ka kaya hindi ka exempted masaktan.",
  "Kaya may monthsary ay dahil hindi lahat ng relasyon ay umaabot ng anniversary.",
  "Bago mo ko hawakan, pwede ko bang malaman kung paano mo bibitiwan?",
  "Hindi lahat ng nagsasama ay nagmamahalan at hindi lahat ng nagmamahalan ay magkasama.",
  "Ang salitang ‘I love you' ay hindi tanong. Pero bakit masakit pag walang sagot.",
  "Tulungan mo ang sarili mo na makalimot. Wag mong tulungan ang sarili mong masaktan.",
  "Dapat matuto tayong bumitaw. Dahil mas okay ang maging malungkot ng panandalian kesa magmukhang tanga ng matagalan.",
  "Huwag kang malungkot kung iniwan ka niya ang mahalaga ay napadama mo sa kanya kung gaano mo sya kamahal.",
  "Kapag alam mong wala nang pagmamahal, wag mo nang ipagsiksikan ang sarili mo. Sa huli ikaw rin ang talo.",
  "Mas pipiliin kong ako na lang ang masaktan kaysa magkasama nga tayo pero sya naman ang hinahanap ng puso mo.",
  "Ginawa ang break-up para ilayo tayo sa maling tao na akala natin ay tama.",
  "Ang PAG-IBIG parang harutan. Minsan hindi mo maiiwasang hindi MASAKTAN.",
  "Hindi naman masamang maging selfish. May mga bagay lang talaga na hindi pwedeng may kahati.",
  "Kung hindi mo mahal ang isang tao, wag ka nang magpakita ng motibo para mahalin ka nya.",
  "Huwag mong bitawan ang bagay na hindi mo kayang makitang hawakan ng iba.",
  "Huwag mong hawakan kung alam mong bibitawan mo lang.",
  "Huwag na huwag ka hahawak kapag alam mong may hawak ka na.",
  "Wag magpakatanga sa PAG-IBIG. ‘Cause GOD gave you REAL EYES to REALIZE the REAL LIES.",
  "Wag mong gawing soccer ang pag-ibig na pagkatapos mong sipain, saka mo hahabulin.",
  "Mahal mo? Ipaglaban mo parang pangarap mo.",
  "May mga bagay na masarap ingatan kahit hindi sayo. Parang ikaw, ang sarap mahalin kahit hindi tayo",
  "Twitter ka ba? Bakit? Trending ka kasi sa puso ko.",
  "Bakit ba naman kasi maglilihim kung pwede mo namang sabihin? Hindi yung kung kelan huli na ang lahat tsaka mo aaminin.",
  "Hindi lahat ng kaya mong intindihin ay katotohanan at hindi lahat ng hindi mo kayang intindihin ay kasinungalingan",
  "Sa panahon ngayon, joke na ang totoo at promise na ang panloloko.",
  "Binabalewala mo siya tapos kapag nakita mo siyang masaya sa iba, masasaktanat magagalit ka. Ano ka, tanga?",
  "Kapag pagod ka na, bitawan mo na. Hindi yung nagpapaka-tanga ka madami pa namang mas better sa kanya.",
  "May mga feelings talaga na hanggang social media na lang.",
  "Pinakilig ka lang akala mo mahal ka na? Sige, assume pa!",
  "Hindi lahat ng nararamdaman ay dapat sabihin. Dahil hindi lahat ng sinasabi ay kayang maramdaman.",
  "Isang beses lang kitang minahal. Pagkatapos nun, hindi na natapos!",
  "Yung akala mong going strong kayao, going wrong pala kayo.",
  "Ang puso ko parang tindahan. Simula ng nalugi, nagsara na!",
  "Nagising ka na sa mahimbing mong pagtulog, pero sa katotohanang hindi ka niya mahal, hindi pa rin!",
  "Wag mong ipamuka sa akin na madali akong palitan. Dahil kong isampal sayo ang MAHAL KITA pero hindi ka kawalan!",
  "Sa likod ng ‘friends lang kami' ay may pusong bumubulong na ‘sana nga kami'.",
  "Hindi naman karelasyon lang ang mahalaga para maging masaya. Kahit inspirasyon lang ok na.",
  "Ang tunay na lalake nagbabago para sa babae, hindi yong pabago bago ng babae.",
  "Sa love, ‘di maiiwasan na may U-Turn. Yung akala mong dire-diretso na, may babalikan pa pala.",
  "Sana gawin nang herbal medicine ang MAKAHIYA, para may gamot na sa mga taong MAKAKAPAL ANG MUKHA.",
  "Lumandi ng naaayon sa ganda. Para hindi magmukang tanga. Hindi yung over ka sa kalandian, mukha ka namang paa.",
  "May shortage na ba talaga ng LALAKI ngayon, at kailangan mo pang MANG-AGAW para magkaroon.",
  "Minsan kahit ilang beses pang sabihin ng utak mo na “TAMA NA” pilit parin sinasabi ng puso mong konteng tiis pa..",
  "KARMA has no MENU but you get served for what you deserved..",
  "Gaano kalaki ang kamay mo. Para hawakan ang mundo ko.",
  "Mas okay na yung friendship na parang may something, kaysa sa relationship na parang nothing.",
  "Hindi mo pa nga ako binabato, tinamaan na ako sayo.",
  "Buti pa ang travel mo kaya mong planuhin. Ako kaya? Kelan mo paplanuhing mahalin?",
  "Matuto kang sumuko kapag nasasaktan ka na ng sobra. Minsan kasi ginagago ka na, kinikilig ka pa.",
  "May taong binigay ng Diyos para lang makilala mo at hindi para makasama mo.",
  "Lahat tayo binigyan ng pagkakataong maging tanga pero hindi porket libre ay araw-arawin mo na.",
  "Paano ko ipaglalaban ang pagmamahal ko sayo kung ako lang ang nakakaramdam nito.",
  "Bakit kita iiyakan. Kaya naman kitang palitan.",
  "Alam mo ba ang salitang pagmamahal? Hindi ko yan pinag-aralan. Pero sayo ko yan natutunan.",
  "May mga taong di payag na mawala ka. Pero di naman gumagawa ng paraan para manatili ka.",
  "Sa pag-ibig walang bulag, walang pipi, walang bingi, pero tanga madami.",
  "Hintayin mo ang true love mo. Na-traffic lang yun sa malalanding tao.",
  "Ang sakit malaman na ang taong mahal mo kaibigan lang ang turing sayo.",
  "Importante naman talaga ang pinagsamahan, pero mas mahalaga ang pagsasabi ng katotohanan.",
  "Darating yung araw kung saan masasabi mong sana hindi na lang tayo nagkakilala.",
  "May mga tao talagang hindi para sa isa't-isa. Ang masakit pinagtagpo pa.",
  "Yung feeling na in love ka sa kanya, pero in love naman siya sa iba.",
  "Yung feeling na may narinig kang kanta, tapos naalala mo siya.",
  "Minsan may mga taong iniiwasan mong pansinin pero ang puso mo gustong-gusto siyang kamustahin.",
  "Ang hirap bitawan nung taong kahit hindi kayo, siya yung nagpapasaya at kumukumpleto ng araw mo.",
  "Kung handa kang magmahal dapat handa ka ring masaktan.",
  "Sa relasyon pag konti ang nakakaalam, konti lang din ang mga nakikialam.",
  "Papayag naman akong landiin mo ang mahal ko. Basta papayag ka ring basagin ko yang pagmumukha mo",
  "Yung pinipilit mo na lang ngumiti at tumawa para hindi nila Makita kung gaano ka ba kalungkot talaga.",
  "Oo napasagot mo siya, e yung exam mo nasagot mo ba?",
  "Mabuti pa sa date nyo, lagi kang maaga. Eh sa klase, kamusta?",
  "Pag nakikita kita, parang gusto ko mag-sorry sa mga mata ko.",
  "Diba pag pangit ka dapat nice ka?",
  "Alam mo,walang ginawang panget ang Diyos eh. Eh ikaw? Sure ka ba na DIYOS ang gumawa sayo??",
  "Aanhin mo ang ang Ganda Kung retoke lang pala.",
  "Aanhin mo ang gwapo Kung ang gusto lang naman ay hubarin ang panty mo",
  "Aanhin pa ang kagandahan Kung ginagamit lang naman sa kalandian",
  "Aanhin mo ang pag-ibig na wagas Kung wala kayong pambili ng bigas",
  "Aanhin mo ang asawa Kung iba naman ang nagpapaligaya",
  "Aanhin mo naman ang ka-sweetan Kung hanggang kaibigan lang naman",
  "Aanhin mo ang marriage contract Kung sa iba naman Siya Kumocontact",
  "Aanhin mo ang sexy Kung ang mukha naman ay Scary",
  "Aanhin mo pa ang alak Kung sa akin pa lang tinatamaan ka na",
  "Aanhin mo ang magandang dress Kung mukha ka namang stressed",
  "Aanhin mo pa ang Spelling Kung 'Jejemon' ka naman",
  "Aanhin ang langit Kung nauna na ang pangit",
  "Aanhin ang palasyo Kung wala naman internet connection dito",
  "Aanhin pa ang gabi Kung pangit naman ang katabi",
  "Never say die, tomorrow is another guy.",
  "Eh ano naman sa inyo kung malandi ako, bakit, kayo ba nilalandi ko?",
  "Ay Insecure ka...Mas malakas ba ang karisma ng malandi sa maganda",
  "Sige, maglaro tayo, agawan ng yaman..... Next level na agawan ng asawa",
  "Huwag kang umasa na babalik pa siya, kung nasa piling na siya ng iba.",
  "Ang babaeng maganda, talo ng ma-appeal",
  "Ang babaeng ma-appeal, talo ng sexy",
  "Pag mahal mo, mahalin mo nang totoo para hindi na kayo umabot kay Tulfo.",
  "Pagsinabi niyang pangit ka, sapakin mo aga! Kita na nga, sasabihin pa.",
  "Ang kagandahan parang password, ikaw lang nakakaalam.",
  "Ang kutis mo parang barbie. Barbie-Q",
  "Di ba sabi nila ang tao gawa  sa putik..Bakit ikaw gawa ka sa plastic!",
  "ARTISTA KA BA?? PLASTIC KA KASI!!",
  "At least ngaun alam ko na...dba ?? hinde ka LATA.. PLASTIC ka lng.",
  "hay naku kung pwede lang itapon lahat ng mga kaibigan sa dagat. di sana matagal ko ng ginawa para lumutang kung sino tlga ang mga plastic.",
  "SOBRA INIT D2 SA PINAS..INGAT Ka ha wag ka LALABAS BKA MALUSAW ka. Plastic ka kasi!!",
  "TANDAAN mo NA ANG 'INSECURITY' at 'PLASTIC' AY MAG KAPATID..",
  "Kapag PLASTIC , basura na agad ? hindi ba pwdeng IKAW muna ?",
  "Ang tao raw ay hinulma gamit ang putik. Eh naubusan ng putik. Ayan tuloy, ang iba gawa sa Plastik!",
  "Alam mo para kang BARBIE - MAGANDA, PLASTIK at WALANG UTAK",
  "STRAW kAbA?? kasi SIPSIP kana PLASTIC kapa!!!!!",
  "Kung legal lang ang magsunog ng PLASTIC na tao, For sure, ABO ka na",
  "Hindi lang mga BAMPIRA ang takot sa ARAW. Nandyan din ang mga PLASTIC na takot MATUNAW",
  "Plastic na, Ma-Papel pa...galing Dual purpose ka pala.",
  "Feeling Gwapo? Mukha namang Kwago",
  "Pogi ka? helllllleeeer! Chura neto!",
  "Kung Pogi ka na, ano tawag mo sa amin? Artista?!",
  "SO Feeling MO pogi KA?! Kapal Naman NG Libag at Gilagid MO UY!",
  "Feeling pogi ka! Kamukha mo naman si Vice Ganda",
  "Feeling gwapo. Mukha namang basag na pugo",
  "Pogi ka? Mas pogi ka kung wala kang ulo",
  "O magkape ka muna baka nanaginip ka lang",
  "gwapo ka? ang sarap mong hampasin ng flourescent light para maliwanagan ka",
  "HOY IKAW! di'PORKET PAREHAS TAYONG BALBAS SARADO, FEELING MO GWAPO KA NA RIN ?",
  "Kung Pogi ka......wala ng panget sa mundo!",
  "Feeling Gwapo, mukha namang Impakto!",
  "Feeling gwapo mukha namang aso.",
  "Letche ka, feeling pogi, as if namang hahabulin kita",
  "Ang kutis mo parang barbie. Barbie-Q",
  "Di ba sabi nila ang tao gawa  sa putik..Bakit ikaw gawa ka sa plastic!",
  "ARTISTA KA BA?? PLASTIC KA KASI!!",
  "At least ngaun alam ko na...dba ?? hinde ka LATA.. PLASTIC ka lng.",
  "hay naku kung pwede lang itapon lahat ng mga kaibigan sa dagat. di sana matagal ko ng ginawa para lumutang kung sino tlga ang mga plastic.",
  "SOBRA INIT D2 SA PINAS..INGAT Ka ha wag ka LALABAS BKA MALUSAW ka. Plastic ka kasi!!",
  "TANDAAN mo NA ANG 'INSECURITY' at 'PLASTIC' AY MAG KAPATID..",
  "Kapag PLASTIC , basura na agad ? hindi ba pwdeng IKAW muna ?",
  "Ang tao raw ay hinulma gamit ang putik. Eh naubusan ng putik. Ayan tuloy, ang iba gawa sa Plastik!",
  "Alam mo para kang BARBIE - MAGANDA, PLASTIK at WALANG UTAK",
  "STRAW kAbA?? kasi SIPSIP kana PLASTIC kapa!!!!!",
  "Kung legal lang ang magsunog ng PLASTIC na tao, For sure, ABO ka na",
  "Hindi lang mga BAMPIRA ang takot sa ARAW. Nandyan din ang mga PLASTIC na takot MATUNAW",
  "Plastic na, Ma-Papel pa...galing Dual purpose ka pala.",
  "Feeling Gwapo? Mukha namang Kwago",
  "Pogi ka? helllllleeeer! Chura neto!",
  "Kung Pogi ka na, ano tawag mo sa amin? Artista?!",
  "SO Feeling MO pogi KA?! Kapal Naman NG Libag at Gilagid MO UY!",
  "Feeling pogi ka! Kamukha mo naman si Vice Ganda",
  "Feeling gwapo. Mukha namang basag na pugo",
  "Pogi ka? Mas pogi ka kung wala kang ulo",
  "O magkape ka muna baka nanaginip ka lang",
  "gwapo ka? ang sarap mong hampasin ng flourescent light para maliwanagan ka",
  "HOY IKAW! di'PORKET PAREHAS TAYONG BALBAS SARADO, FEELING MO GWAPO KA NA RIN ?",
  "Kung Pogi ka......wala ng panget sa mundo!",
  "Feeling Gwapo, mukha namang Impakto!",
  "Feeling gwapo mukha namang aso.",
  "Letche ka, feeling pogi, as if namang hahabulin kita",
  "Hoy! Iba ang Friendly sa Malandi",
  "Hinay-hinay lang sa paglalalandi,Baka yan ang ikamatay mo",
  "Galit ka sa malandi?! Wag ganun love yourself",
  "Ang taong malandi, sa Higad pinaglihi!",
  "If flirting is a sport, Aba Varsity ka na teh!!",
  "Hindi Nakukuntento ang Malalanding tao, Makati eh",
  "Landi here, landi there, Landi everywhere",
  "Sumalangit nawa, Ang malandi mong kaluluwa",
  "Ballpen nga nawawala, feelings pa kaya?",
  "Sick leave. Dahil nasaktan ako nung iniwan mo ko.",
  "Lahat ba ng Math major laging hinahanap si X?",
  "Huwag kang umasa na babalik pa siya, kung nasa piling na siya ng iba.",
  "Para kang exam, hindi ko na maunawaan.",
  "Sana may traffic lights din sa love, para alam natin kung kailang maghahanda, di-direstso, o hihinto.",
  "Ang jowa minsan parang sinaing rin iyan, kailangang bantayan.",
  "Mabuti pa yung kape, mainit man o malamig, hinahanap-hanap pa rin.",
  "Lahat ba ng Math major laging hinahanap si X?",
  "Sa love, ‘di maiiwasan na may U-Turn. Yung akala mong dire-diretso na, may babalikan pa pala.",
  "Walang masama magmahal basta alam mong saan ka liliko o didiretso para wala kang nasasagasaang tao.",
  "Mahal. Minsan bilihin, kadalasan ikaw.",
  "Mabuti pa sa date nyo, lagi kang maaga. Eh sa klase, kamusta?",
  "Sana yung pagmamahal mo parang hugasin rin sa bahay, hindi nauubos.",
  "Kung ayaw mong masaktan, huwag kang papatol sa alam mong expert sa kalokohan.",
  "Hindi lahat ng patama tungkol sa'yo, sadyang natatamaan ka lang kasi!",
  "Hindi ka magiging masaya kung patuloy mong babalikan ang tapos na.",
  "Ang daling matulog, ang hirap bumangon. Ang daling mahulog, ang hirap mag move on.",
  "Kung nagalit man ako nang walang dahilan, pasensya na. Nasaktan kasi ako nang wala kang alam",
  "Sa tamang panahon may isang taong magpapatunay sayo kung bakit ka para sa kanya at kung bakit hindi ka para sa iba.",
  "Di ko man maisigaw sa buong mundo kung sino ang mahal ko, sapat nang alam natin pareho na ikaw ang tinutukoy ko.",
  "Kung pwede lang maging excuse ang pagiging broken hearted, malamang marami ng absent sa high school at college.",
  "Wag mong isiksik ang sarili mo sa taong hindi marunong magpahalaga sa nararamdaman mo. Masasaktan ka lang.",
  "Mahirap kumalma lalo na kapag selos na selos ka na.",
  "Sana isinusulat na ang feelings, para madali lang burahin.",
  "Sana thesis na lang ako na ipaglalaban mo kahit hirap na hirap ka na.",
  "Balang araw makakaya ko na ulit na tingnan ka ng wala na akong nararamdaman pa.",
  "Yung feeling na may narinig kang kanta, tapos naalala mo siya.",
  "Mahirap mag-let go. Pero mas mahirap yung kumakapit ka pa, tinutulak ka na.",
  "May mga tao talaga na kahit napapasaya ka, kaylangan mong iwasan.",
  "Hindi na baleng siya ang bumitaw. Ang importante alam mong lumaban ka hanggang sa wala ka ng maipaglaban.",
  "Hindi mo kailangang mamili sa aming dalawa. Handa akong lumabas sa puso mo para lang sumaya ka sa piling niya.",
  "Ang hirap bitawan nung taong kahit hindi kayo, siya yung nagpapasaya at kumukumpleto ng araw mo!",
  "Pag hindi ka mahal ng mahal mo, wag ka magreklamo. Kasi may mga tao rin na di mo mahal pero mahal ka. Kaya quits lang.",
  "Alam mo kung bakit nasasaktan ka? Kasi iniisip mo na gusto ka rin niya kahit hindi naman talaga.",
  "Dapat ba akong ngumiti dahil magkaibigan tayo? O dapat ba kong malungkot dahil hanggang dun lang tayo?",
  "Hindi tamang gumamit ka ng ibang tao para maka move-on ka. Ginagago mo na nga ang sarili mo, nakasakit ka pa ng iba.",
  "Ibinigay ko na ang lahat pero hindi pa rin sapat.",
  "Lahat tayo napapagod. Wag mong hintayin na mawala pa siya sa buhay mo bago mo siya pahalagahan.",
  "Yung naghihintay ka sa isang bagay na imposible namang mangyari.",
  "Ang oras ay isang mahalagang elemento sa mundo. Bumibilis kapag masaya, at bumabagal kapag wala ka.",
  "Masakit isipin na dahil sa isang pangyayari hindi na kayo pwedeng maging tulad ng dati.",
  "Yung akala mo minahal ka niya pero hindi pala.",
  "Sana tinuruan mo ‘ko kung paano madaling makalimot tulad ng ginawa mong paglimot sa'kin.",
  "Buti pa ang ngipin nabubunot kapag masakit. Sana ang puso ganun din.",
  "Minsan kahit sabihin mong suko ka na, kapag naalala mo kung paano ka niya napasaya, bumabalik ka ulit sa pagiging tanga.",
  "Minsan kailangan tayong masaktan bago tayo matauhan.",
  "Minsan kung sino pa yung rason mo kung bakit ka masaya, siya din ang rason kung bakit masasaktan ka ng sobra.",
  "Kung talagang mahal ka nyan mageefort yan kahit di ka mag-demand.",
  "Kapag nasasaktan ka, pwede kang umiyak. Tao lang tayo hindi superhero.",
  "Tao ka kaya hindi ka exempted masaktan.",
  "Kaya may monthsary ay dahil hindi lahat ng relasyon ay umaabot ng anniversary.",
  "Bago mo ko hawakan, pwede ko bang malaman kung paano mo bibitiwan?",
  "Hindi lahat ng nagsasama ay nagmamahalan at hindi lahat ng nagmamahalan ay magkasama.",
  "Ang salitang ‘I love you' ay hindi tanong. Pero bakit masakit pag walang sagot.",
  "Tulungan mo ang sarili mo na makalimot. Wag mong tulungan ang sarili mong masaktan.",
  "Dapat matuto tayong bumitaw. Dahil mas okay ang maging malungkot ng panandalian kesa magmukhang tanga ng matagalan.",
  "Huwag kang malungkot kung iniwan ka niya ang mahalaga ay napadama mo sa kanya kung gaano mo sya kamahal.",
  "Kapag alam mong wala nang pagmamahal, wag mo nang ipagsiksikan ang sarili mo. Sa huli ikaw rin ang talo.",
  "Mas pipiliin kong ako na lang ang masaktan kaysa magkasama nga tayo pero sya naman ang hinahanap ng puso mo.",
  "Ginawa ang break-up para ilayo tayo sa maling tao na akala natin ay tama.",
  "Ang PAG-IBIG parang harutan. Minsan hindi mo maiiwasang hindi MASAKTAN.",
  "Hindi naman masamang maging selfish. May mga bagay lang talaga na hindi pwedeng may kahati.",
  "Kung hindi mo mahal ang isang tao, wag ka nang magpakita ng motibo para mahalin ka nya.",
  "Huwag mong bitawan ang bagay na hindi mo kayang makitang hawakan ng iba.",
  "Sana sinaing ka nalang, Para kapag nakalimutan kita, Sunog kang hayop ka.",
  "Bakit laging yung mga 'PAASA' ang sinisisi kapag may nasasaktan? Eh, paano yung ipinanganak na 'ASSUMING?'",
  "Pwede mo ba akong samahan Sa sementeryo? Bibisitahin ko yung puso kong Patay na patay sayo.",
  "Kung ako namatay wag kang pumunta sa libingan ko, Kasi baka tumibok ulit ang puso ko.",
  "Buti pa ang mga bilihin nagmahalan, Ako hindi pa.",
  "Sa mga estudyante: Hanggang crush lang muna, Wag agad mag-relasyon, Para hindi ka agad-agad nasasaktan.",
  "Ang pag- ibig parang bagyo, Mahirap ipredict kahit May PAG-ASA.",
  "Malamig lang ang panahon, JOWA agad hanap mo? Try mo lugaw, May Itlog din yon.",
  "Ang puso parang paminta, Buo talaga Pilit lang dinudurog ng iba.",
  "Pag-iniwan ka ng mahal mo, Never Say Die, Tommorow is another guy.",
  "Ang crush ay parang Math Problem, Pag di makuha, Titigan nalang.",
  "MALABO: Minsan Mata, Minsan Ikaw",
  "Bumabalik ka nanaman? Pakiusap. Ayaw ko na mating tanga ulit.",
  "Minsan natatawa ako ng walang dahilan, Pero madalas nasasaktan ako na walang nakakaalam.",
  "Hindi bale na kahit height mo ay bitin, Abot langit naman",
  "Huwag kang mag-alala kung mataba ang girlfriend mo, Kaya nga may sabihang 'True Love Weights.'",
  "Ano naman kung mataba siya? Mamahalin mo lang naman siya hindi kakargahin.",
  "Kayo advanced mag-isip, Ako ikaw lang iniisip",
  "Pangiti-ngiti lang ako pero nahuhulog na ako sayo",
  "Wag kang malungkot kung palpak ang love life mo. Sadyang malakas lang talagang manalangin ang taong pumapangarap sayo.",
  "Ang manhid parang bato yan di nasasaktan at walang nararamdaman.",
  "Hanapin mo yung taong para sayo hindi yung  para iba tapos AAGAWIN mo.",
  "Wag mong panghinayangan ang taong ikaw mismo ang sinayang.",
  "Pag ibig parang hangin di mo ito nakikita pero nararamdaman mo.",
  "KAsama talaga ang masaktan  sa pag mamahal , masasaktan ka ba KUNG DI MO SYA MAHAL",
  "Mahal mo sha mahal din nya yung isa..anong klaseng puso yan dual SIM?.",
  "Minsan mas maganda pang malungkot ng panandalian kesa magdusa habang buhay.",
  "Di ako mayaman para bilhin ang kahapon pero handa akong utangin ang ngayon makasama kalang habang panahon.",
  "Sipag naman mag mahal ng mga tao pati mahal ko mahal din nila.",
  "Pwede kalang mahalin pero di ka pwedeng angkinin.",
  "Yung feeling na ang bilis bilis ng oras pag kasama mo siya.",
  "Mahirap daw mag mahal ng taong iba ang gusto. Pero alam ba nila MAS MAHIRAP mag mahal ng taong akala mo ikaw ang gusto?",
  "Wag kang gumawa ng paraan para sumuko ako dahil sa oras na ipinaramdam mo sa aking BALEWALA ako. Kahit sobrang mahal kita, BIBITAW ako.",
  "Yung ikaw sukong-suko na pero sya lumalaban pa. Kaya ikaw pilit na lang na lumalaban para hindi na siya masaktan pa.",
  "madaling mag patawad pero mahirap makalimot.",
  "WAG MONG SABIHING PINAASA KA NYA BAKIT SINANBE BA NYA SAYO NA UMASA KA!!",
  "Ang sorry ay ginagamit sa mga bagay na hindi sinasadya di sa mga bagay na paulit-ulit na ginagawa.",
  "Ang pag kakaalam ko ang tao hinulma sa putik pero bat ganun ang daming taong plastic.",
  "Ang ex nang kaibigan dapat di pinapatulan niluwa nanya kinain mo pa patay gutom ka talaga",
  "Kung may alak may balak",
  "Dika karapat dapat na tawaging kaibigan dahil plastik ka",
  "Minsan kase dapat matuto tayong bumitaw lalo na pag nasasaktan na di yung ginagago kana kinikilig kapa.",
  "Kung sinabe mo sakin na sasaktan molang naman ako. dapat  inaya mo nalang ako ng sapakan .",
  "Alam mo ba na ang pinaka masarap na kape ay ang 'KAPE'leng ka .",
  "Sa dinami-dami ng BOOK sa mundo, isa lang talaga ang hindi ko maintindihan...... Ang tiniti-BOOK ng puso ko, para sayo!",
  "Wag mong pag selosan ang mga tao sa paligid ko dahil alam nila na ikaw ang mahal ko.",
  "Ang sarap mahulog lalo kung alam mong may sasalo sayo.",
  "Di lahat nang nagpapakilig sayo ibig sabihin mahal ka may mga tao lang talagang gawa sa asukal na nakalagay sa plastic.",
  "Sabi nila mahirap mag mahal ng taong iba ang gusto pero diba nila na isip na mas mahirap magmahal ng taong akala mo ikw ang gusto.",
  "akala ko ba mahal mo bakit hinayaan mong mapunta sa iba? -kase pinili kong maging masaya siya kahit hindi na ako ang dahilan.",
  "Baril kaba? Bakit? Kasi lakas ng putok mo!! Boom 🎆",
  "Pustiso kaba? Kasi i cant smile without you",
  "Ang kapal naman ng mukha mo!! di pa nga tayo magkakilala pumapasok kana agad sa puso ko",
  "Sa isang relasiyon Hindi naman dapat sexy,hot o maganda ka kasi love story ang gagawin niyo Hindi sex video.",
  "Ang pagiging close ng babae at lalaki as a friend ay parang camera CLICK today DEVELOP someday .",
  "Kung sa pag Ibig iibigin kita, Kung sa pagmamahalan mamahalin kita..Kung sa kamatayan mauna ka..Hindi ako TANGA para samahan ka pa.",
  "Ang PUSO ay isang maliit na parte lang ng katawan pero kapag itoy nasaktan buong pag ka tao ang naaapektuhan.",
  "'Ang hirap magtiwala sa taong paulit-ulit ka nang sinaktan.'",
  "'Bakit ba kailangan pa nilang manloko, kung mahal mo naman sila nang sobra?'",
  "'Minsan, kailangan mong maging matapang at i-let go na ang taong hindi na naman magbabago.'",
  "'Ang pag-ibig ay hindi dapat pilitin, dahil kung para sa'yo, darating at darating 'yan.'",
  "'Hindi lahat ng sakit, kayang gamutin ng mga lalaki.'",
  "'Kapag minahal mo nang sobra ang isang tao, mahirap na itong kalimutan.'",
  "'Kung magmamahal ka, dapat handa ka rin sa posibilidad na masaktan ka.'",
  "'Hindi dapat masanay sa kahit anong pagpapabalewala ng lalaki.'",
  "'Kapag mahal mo ang isang tao, dapat kayang magpakatanga pero hindi kayang magpaka-tanga.'",
  "'Ang hirap pag ipinagkatiwala mo na lahat, pero hindi pa rin sapat para sa kanya.'",
  "'Kung hindi ka mahal ng taong mahal mo, wag mo na lang siyang pilitin.'",
  "Masakit isipin na ang taong pinakamamahal mo ay hindi naman pala para sa'yo.",
  "Hindi porke't single ka, wala ka nang karapatang magmahal at magpakamahal.",
  "Masakit kapag hindi ka na naaalala ng taong minsan mong pinakamahal.",
  "Pano mapipigilan ang global warming kung pati tao plastick na rin",
  "Facebook ko ito at wapakels kung ano ipopost ko kung ayaw mo sa mga post ko pakitadyakan ang sarili mo palabas ng friend list ko",
  "Sa paglipas ng panahon isa lang ang natutunan ko.... Pahalagahan ang nandiyan at kalimutan ang nang iwan",
  "Ayoko ng ikinukumpara ako sa iba dahil kahit kailan ay hindi ako naging sila.",
  "Minsan kailangan mong tanggapin na kahit mahal ka nang  isang tao , kaya niyang lokohin kahit kailan nya gusto",
  "Ang TSISMIS ay ginagawa ng taong GALIT sayo..kinakalat ng taong LOKO-",
  "Masakit kapag ang taong mahal mo, ay masaya sa piling ng iba pero kailangan mong ipakita na masaya ka, kahit sa loob mo.. 'Sana ako nalang siya.",
  "Ang hirap tumawa kung hindi ka naman masaya Kahit ngumiti ka pa halata pa rin ang lungkot ng nadarama.",
  "Ang love parang Clash of Clans, Kailangan mong mag effort na palakasin ang pundasyon mo para maiwasan ang pagkasira nito.",
  "Hindi tanga yung taong sobrang magmahal. Mas tanga yung taong minahal ng sobra pero naghanap pa ng iba.",
  "Papayag naman akong landiin ang mahal ko. Basta payag kang basagin ang pag mumukha mo.",
  "Sana tsinelas nalang tayong dalawa.Para kung mawala ang isa,di na pedeng ipares sa iba dahil di na bagay.",
  "Ang pag-ibig parang imburnal, Nakakatakot mahulog at kapag nahulog ka,it's either by accident or talagang tanga ka.",
  "May mga taong mabilis mahulog ang loob mo,pero bigla ka na lang iiwan At kung saan nakalimot ka na,tsaka magpaparamdam.",
  "Naka ngiti ako dahil masaya ako, Ngumiti talaga ako para patunayan sayo na, Nandiyan ka man o wala itutuloy ko buhay ko.",
  "Nandiyan ka man o wala itutuloy ko buhay ko. naiintindihan HINDI KA PA RIN IIWAN.",
  "Nagmahal ka na nga ng Dyosa pinagpalit mo pa sa isang Aswang.",
  "May mga taong ayaw mawala ka. Pero di naman gumagawa para bumalik ka.",
  "Wag ka magpapa apekto sa sinasabi ng iba. Mas kilala mo ang sarili mo kesa sa kanila.",
  "Minsan lahat ng naiiwan hindi na pwede pang balikan.",
  "Sabi mo laro tayo. Akala ko tagu taguan yun pala feelings.",
  "Wag ka maghanap ng taong nakakaintindi sayo.Hanapin mo yung taong kahit hindi naiintindihan di ka pa rin iiwan.",
  "Minsan kung sino pa yung HINDI KA LUBOS KILALA sila pa ang MANGHUHUSGA.At itsi tsimis ka pa nila.",
  "Hindi mahirap gawin ang mag MOVE-ON. Nahihirapan ka lang dahil iniisip mo ikaw yung nawalan.",
  "Magkaiba ang GALIT at TAMPO. Ang galit pwede kanino at ang tampo makakaramdam mo lang sa taong ayaw mong mawala sa'yo.",
  "Wag kang magpakatanga sa taong binabalewala ka",
  "Masaya ako kahit wala ka. Sumosobra ang pag andiyan ka.",
  "Ang SECOND CHANCE ay binibigay sa taong marunong tanggapin ang kanyang kamalian.",
  "Hindi naman talaga ako nawala. Natabunan lang ako nung may dumatinng na bago sa buhay mo.",
  "Sa likod ng 'FRIENDS KAMI May pusong umaasa na ' SANA NGA KAMI",
  "Ang pagboto ay parang pag-ibig PRICELESS",
  "Wag mong I-Lang ang pagigigng Fangirl, Fangirl isn't an easy job.",
  "That 'BAGAY TAYO' pero di tayo 'MEANT TO BE'",
  "Minsan ang mga PLASTIK  ay wala sa basurahan.MInsan nasa harap mo lang.",
  "Maraming magkasintahan na ang naghiwalay dahil sa walang kakwenta-kwentang away.",
  "Nakakawalang gana kung lagi ka na lang nasasaktan.",
  "May mga taong hindi mo talaga alam kung mahal ka o sweet lang talaga sayo.",
  "Di ako naniniwala sa MU .Naniniwala ako sa Me and You.",
  "The journey of a thousand miles begins pag may pera ka. Kaya mag-ipon ka.",
  "Sana piso fare pa rin. Piso fare na lang. Piso fare na lang ulet!",
  "Ang pag-ibig parang itinerary. Madalas hindi nasusunod.",
  "Buti pa kay manong tricycle driver, 25 pesos lang special kana (Faie)",
  "Ingat sa Cliff diving. Delikado ang ma-fall lalo na kung walang sasalo sayo.",
  "Kung yung weather nga pabago-bago. Feelings mo pa kaya?",
  "Kung mahal mo ko, wag mo akong Kazakhstan.",
  "Mabuti pa ang bundok inakyat mo, eh yung pag-akyat ng ligaw sakin kelan mo gagawin?",
  "Buti pa yung guide, jahit agod na hindi ako iniwan. Ikaw, hindi naman kita pinagod pero bakit mo ko binitawan?",
  "Sabi mo dollar lang ang ipagpapalit mo. Bakit pati ako?",
  "Buti pa ang travel mo kaya mong planuhin. Ako kaya? Kelan mo paplanuhing mahalin?",
  "Basta text kita later, male-late na KUWAIT!",
  "Ang usapan natin “Leave no trace,” pero bakit ang sakit-sakit pa rin?",
  "Buti pa ang bagyo, may pag-asa",
  "Yung pag-akyat ng bundok parang tayo, nakakapagod.",
  "Sa lahat ng napuntahan ko, ikaw lang ang gusto kong balik-balikan",
  "Pag nagmahal ka dapat SAGADA",
  "Kung tent tayo, ikaw ang pole. Because I can't stand without you.",
  "Ang lamig dito sa taas. Kasing lamig ng puso mo.",
  "Sabi mo, “Laro tayo”. Akala ko “Surfing” yun pala “Feelings”.",
  "Hanggang miss you all nalang ba tayo sa Group Chat?",
  "“Buti pa ang pamasahe ng tren tumaas. Sweldo ko na lang ang hindi.”",
  "Gusto ko ng kape, yung matapang yung kaya akong ipaglaban.",
  "Para kang sweldo ko, di mo namalayang wala na pala.",
  "Buti pa nga files sinesave mo, yung relasyon natin?",
  "Monitor kaba? Kai parang ang sarp mong titigan magdamag.",
  "Keyboard kaba? Kasi type na type kita",
  "Para kang aplikante ko, nangakong darating hindi naman.",
  "Ballpen nga nawawala, feelings pa kaya?",
  "Sick leave. Dahil nasaktan ako nung iniwan mo ko.",
  "Lahat ba ng Math major laging hinahanap si X?",
  "Huwag kang umasa na babalik pa siya, kung nasa piling na siya ng iba.",
  "Para kang exam, hindi ko na maunawaan.",
  "Sana may traffic lights din sa love, para alam natin kung kailang maghahanda, di-direstso, o hihinto.",
  "Ang jowa minsan parang sinaing rin iyan, kailangang bantayan.",
  "Mabuti pa yung kape, mainit man o malamig, hinahanap-hanap pa rin.",
  "Lahat ba ng Math major laging hinahanap si X?",
  "Sa love, ‘di maiiwasan na may U-Turn. Yung akala mong dire-diretso na, may babalikan pa pala.",
  "Walang masama magmahal basta alam mong saan ka liliko o didiretso para wala kang nasasagasaang tao.",
  "Mahal. Minsan bilihin, kadalasan ikaw.",
  "Mabuti pa sa date nyo, lagi kang maaga. Eh sa klase, kamusta?",
  "Sana yung pagmamahal mo parang hugasin rin sa bahay, hindi nauubos.",
  "Kung ayaw mong masaktan, huwag kang papatol sa alam mong expert sa kalokohan.",
  "Hindi lahat ng patama tungkol sa'yo, sadyang natatamaan ka lang kasi!",
  "Hindi ka magiging masaya kung patuloy mong babalikan ang tapos na.",
  "Ang daling matulog, ang hirap bumangon. Ang daling mahulog, ang hirap mag move on.",
  "Kung nagalit man ako nang walang dahilan, pasensya na. Nasaktan kasi ako nang wala kang alam",
  "Sa tamang panahon may isang taong magpapatunay sayo kung bakit ka para sa kanya at kung bakit hindi ka para sa iba.",
  "Di ko man maisigaw sa buong mundo kung sino ang mahal ko, sapat nang alam natin pareho na ikaw ang tinutukoy ko.",
  "Kung pwede lang maging excuse ang pagiging broken hearted, malamang marami ng absent sa high school at college.",
  "Wag mong isiksik ang sarili mo sa taong hindi marunong magpahalaga sa nararamdaman mo. Masasaktan ka lang.",
  "Mahirap kumalma lalo na kapag selos na selos ka na.",
  "Sana isinusulat na ang feelings, para madali lang burahin.",
  "Sana thesis na lang ako na ipaglalaban mo kahit hirap na hirap ka na.",
  "Balang araw makakaya ko na ulit na tingnan ka ng wala na akong nararamdaman pa.",
  "Yung feeling na may narinig kang kanta, tapos naalala mo siya.",
  "Mahirap mag-let go. Pero mas mahirap yung kumakapit ka pa, tinutulak ka na.",
  "May mga tao talaga na kahit napapasaya ka, kaylangan mong iwasan.",
  "Hindi na baleng siya ang bumitaw. Ang importante alam mong lumaban ka hanggang sa wala ka ng maipaglaban.",
  "Hindi mo kailangang mamili sa aming dalawa. Handa akong lumabas sa puso mo para lang sumaya ka sa piling niya.",
  "Lagot ka, walang filter sa f2f",
  "Pag hindi ka mahal ng mahal mo, wag ka magreklamo. Kasi may mga tao rin na di mo mahal pero mahal ka. Kaya quits lang.",
  "Alam mo kung bakit nasasaktan ka? Kasi iniisip mo na gusto ka rin niya kahit hindi naman talaga.",
  "Dapat ba akong ngumiti dahil magkaibigan tayo? O dapat ba kong malungkot dahil hanggang dun lang tayo?",
  "Hindi tamang gumamit ka ng ibang tao para maka move-on ka. Ginagago mo na nga ang sarili mo, nakasakit ka pa ng iba.",
  "Ibinigay ko na ang lahat pero hindi pa rin sapat.",
  "Lahat tayo napapagod. Wag mong hintayin na mawala pa siya sa buhay mo bago mo siya pahalagahan.",
  "Yung naghihintay ka sa isang bagay na imposible namang mangyari.",
  "Ang oras ay isang mahalagang elemento sa mundo. Bumibilis kapag masaya, at bumabagal kapag wala ka.",
  "Natatakot ako mag workout baka kasi sumarap ako lalo",
  "Yung akala mo minahal ka niya pero hindi pala.",
  "Sana tinuruan mo ‘ko kung paano madaling makalimot tulad ng ginawa mong paglimot sa'kin.",
  "Buti pa ang ngipin nabubunot kapag masakit. Sana ang puso ganun din.",
  "Minsan kahit sabihin mong suko ka na, kapag naalala mo kung paano ka niya napasaya, bumabalik ka ulit sa pagiging tanga.",
  "Minsan kailangan tayong masaktan bago tayo matauhan.",
  "Minsan kung sino pa yung rason mo kung bakit ka masaya, siya din ang rason kung bakit masasaktan ka ng sobra.",
  "Kung talagang mahal ka nyan mageefort yan kahit di ka mag-demand.",
  "Kapag nasasaktan ka, pwede kang umiyak. Tao lang tayo hindi superhero.",
  "Tao ka kaya hindi ka exempted masaktan.",
  "Kaya may monthsary ay dahil hindi lahat ng relasyon ay umaabot ng anniversary.",
  "Bago mo ko hawakan, pwede ko bang malaman kung paano mo bibitiwan?",
  "Hindi lahat ng nagsasama ay nagmamahalan at hindi lahat ng nagmamahalan ay magkasama.",
  "Ang salitang ‘I love you' ay hindi tanong. Pero bakit masakit pag walang sagot.",
  "Tulungan mo ang sarili mo na makalimot. Wag mong tulungan ang sarili mong masaktan.",
  "Dapat matuto tayong bumitaw. Dahil mas okay ang maging malungkot ng panandalian kesa magmukhang tanga ng matagalan.",
  "Huwag kang malungkot kung iniwan ka niya ang mahalaga ay napadama mo sa kanya kung gaano mo sya kamahal.",
  "Kapag alam mong wala nang pagmamahal, wag mo nang ipagsiksikan ang sarili mo. Sa huli ikaw rin ang talo.",
  "Mas pipiliin kong ako na lang ang masaktan kaysa magkasama nga tayo pero sya naman ang hinahanap ng puso mo.",
  "Ginawa ang break-up para ilayo tayo sa maling tao na akala natin ay tama.",
  "Ang PAG-IBIG parang harutan. Minsan hindi mo maiiwasang hindi MASAKTAN.",
  "Hindi naman masamang maging selfish. May mga bagay lang talaga na hindi pwedeng may kahati.",
  "Kung hindi mo mahal ang isang tao, wag ka nang magpakita ng motibo para mahalin ka nya.",
  "Huwag mong bitawan ang bagay na hindi mo kayang makitang hawakan ng iba.",
  "Huwag mong hawakan kung alam mong bibitawan mo lang.",
  "Huwag na huwag ka hahawak kapag alam mong may hawak ka na.",
  "Wag magpakatanga sa PAG-IBIG. ‘Cause GOD gave you REAL EYES to REALIZE the REAL LIES.",
  "Wag mong gawing soccer ang pag-ibig na pagkatapos mong sipain, saka mo hahabulin.",
  "Mahal mo? Ipaglaban mo parang pangarap mo.",
  "May mga bagay na masarap ingatan kahit hindi sayo. Parang ikaw, ang sarap mahalin kahit hindi tayo",
  "Twitter ka ba? Bakit? Trending ka kasi sa puso ko.",
  "Bakit ba naman kasi maglilihim kung pwede mo namang sabihin? Hindi yung kung kelan huli na ang lahat tsaka mo aaminin.",
  "Hindi lahat ng kaya mong intindihin ay katotohanan at hindi lahat ng hindi mo kayang intindihin ay kasinungalingan",
  "Sa panahon ngayon, joke na ang totoo at promise na ang panloloko.",
  "Binabalewala mo siya tapos kapag nakita mo siyang masaya sa iba, masasaktanat magagalit ka. Ano ka, tanga?",
  "Kapag pagod ka na, bitawan mo na. Hindi yung nagpapaka-tanga ka madami pa namang mas better sa kanya.",
  "May mga feelings talaga na hanggang social media na lang.",
  "Pinakilig ka lang akala mo mahal ka na? Sige, assume pa!",
  "Hindi lahat ng nararamdaman ay dapat sabihin. Dahil hindi lahat ng sinasabi ay kayang maramdaman.",
  "Isang beses lang kitang minahal. Pagkatapos nun, hindi na natapos!",
  "Yung akala mong going strong kayao, going wrong pala kayo.",
  "Ang puso ko parang tindahan. Simula ng nalugi, nagsara na!",
  "Nagising ka na sa mahimbing mong pagtulog, pero sa katotohanang hindi ka niya mahal, hindi pa rin!",
  "Wag mong ipamuka sa akin na madali akong palitan. Dahil kong isampal sayo ang MAHAL KITA pero hindi ka kawalan!",
  "Sa likod ng ‘friends lang kami' ay may pusong bumubulong na ‘sana nga kami'.",
  "Hindi naman karelasyon lang ang mahalaga para maging masaya. Kahit inspirasyon lang ok na.",
  "Ang tunay na lalake nagbabago para sa babae, hindi yong pabago bago ng babae.",
  "Sa love, ‘di maiiwasan na may U-Turn. Yung akala mong dire-diretso na, may babalikan pa pala.",
  "Sana gawin nang herbal medicine ang MAKAHIYA, para may gamot na sa mga taong MAKAKAPAL ANG MUKHA.",
  "Lumandi ng naaayon sa ganda. Para hindi magmukang tanga. Hindi yung over ka sa kalandian, mukha ka namang paa.",
  "May shortage na ba talaga ng LALAKI ngayon, at kailangan mo pang MANG-AGAW para magkaroon.",
  "Minsan kahit ilang beses pang sabihin ng utak mo na “TAMA NA” pilit parin sinasabi ng puso mong konteng tiis pa..",
  "KARMA has no MENU but you get served for what you deserved..",
  "Gaano kalaki ang kamay mo. Para hawakan ang mundo ko.",
  "Mas okay na yung friendship na parang may something, kaysa sa relationship na parang nothing.",
  "Hindi mo pa nga ako binabato, tinamaan na ako sayo.",
  "Buti pa ang travel mo kaya mong planuhin. Ako kaya? Kelan mo paplanuhing mahalin?",
  "Matuto kang sumuko kapag nasasaktan ka na ng sobra. Minsan kasi ginagago ka na, kinikilig ka pa.",
  "May taong binigay ng Diyos para lang makilala mo at hindi para makasama mo.",
  "Lahat tayo binigyan ng pagkakataong maging tanga pero hindi porket libre ay araw-arawin mo na.",
  "Paano ko ipaglalaban ang pagmamahal ko sayo kung ako lang ang nakakaramdam nito.",
  "Bakit kita iiyakan. Kaya naman kitang palitan.",
  "Alam mo ba ang salitang pagmamahal? Hindi ko yan pinag-aralan. Pero sayo ko yan natutunan.",
  "May mga taong di payag na mawala ka. Pero di naman gumagawa ng paraan para manatili ka.",
  "Sa pag-ibig walang bulag, walang pipi, walang bingi, pero tanga madami.",
  "Hintayin mo ang true love mo. Na-traffic lang yun sa malalanding tao.",
  "Ang sakit malaman na ang taong mahal mo kaibigan lang ang turing sayo.",
  "Importante naman talaga ang pinagsamahan, pero mas mahalaga ang pagsasabi ng katotohanan.",
  "Darating yung araw kung saan masasabi mong sana hindi na lang tayo nagkakilala.",
  "May mga tao talagang hindi para sa isa't-isa. Ang masakit pinagtagpo pa.",
  "Yung feeling na in love ka sa kanya, pero in love naman siya sa iba.",
  "Yung feeling na may narinig kang kanta, tapos naalala mo siya.",
  "Minsan may mga taong iniiwasan mong pansinin pero ang puso mo gustong-gusto siyang kamustahin.",
  "Ang hirap bitawan nung taong kahit hindi kayo, siya yung nagpapasaya at kumukumpleto ng araw mo.",
  "Kung handa kang magmahal dapat handa ka ring masaktan.",
  "Sa relasyon pag konti ang nakakaalam, konti lang din ang mga nakikialam.",
  "Papayag naman akong landiin mo ang mahal ko. Basta papayag ka ring basagin ko yang pagmumukha mo",
  "Yung pinipilit mo na lang ngumiti at tumawa para hindi nila Makita kung gaano ka ba kalungkot talaga.",
  "Oo napasagot mo siya, e yung exam mo nasagot mo ba?",
  "Mabuti pa sa date nyo, lagi kang maaga. Eh sa klase, kamusta?",
  "Pag nakikita kita, parang gusto ko mag-sorry sa mga mata ko.",
  "Diba pag pangit ka dapat nice ka?",
  "Alam mo,walang ginawang panget ang Diyos eh. Eh ikaw? Sure ka ba na DIYOS ang gumawa sayo??",
  "Aanhin mo ang ang Ganda Kung retoke lang pala.",
  "Aanhin mo ang gwapo Kung ang gusto lang naman ay hubarin ang panty mo",
  "Aanhin pa ang kagandahan Kung ginagamit lang naman sa kalandian",
  "Aanhin mo ang pag-ibig na wagas Kung wala kayong pambili ng bigas",
  "Aanhin mo ang asawa Kung iba naman ang nagpapaligaya",
  "Aanhin mo naman ang ka-sweetan Kung hanggang kaibigan lang naman",
  "Aanhin mo ang marriage contract Kung sa iba naman Siya Kumocontact",
  "Aanhin mo ang sexy Kung ang mukha naman ay Scary",
  "Aanhin mo pa ang alak Kung sa akin pa lang tinatamaan ka na",
  "Aanhin mo ang magandang dress Kung mukha ka namang stressed",
  "Aanhin mo pa ang Spelling Kung 'Jejemon' ka naman",
  "Aanhin ang langit Kung nauna na ang pangit",
  "Aanhin ang palasyo Kung wala naman internet connection dito",
  "Aanhin pa ang gabi Kung pangit naman ang katabi",
  "Never say die, tomorrow is another guy.",
  "Eh ano naman sa inyo kung malandi ako, bakit, kayo ba nilalandi ko?",
  "Ay Insecure ka...Mas malakas ba ang karisma ng malandi sa maganda",
  "Sige, maglaro tayo, agawan ng yaman..... Next level na agawan ng asawa",
  "Huwag kang umasa na babalik pa siya, kung nasa piling na siya ng iba.",
  "Ang babaeng maganda, talo ng ma-appeal",
  "Ang babaeng ma-appeal, talo ng sexy",
  "Para ka yung sout kong damit, simple lng pero bagay sakin.",
  "Minsan sumigaw ako ng ayoko ko nang magmahal, pero nang makita kita napasigaw ulit ako nang joke lang yun.",
  "Okay lang sana kahit Quarantine, basta may Quarta rin.",
  "Pag mahal mo, mahalin mo nang totoo para hindi na kayo umabot kay Tulfo.",
  "Pagsinabi niyang pangit ka, sapakin mo aga! Kita na nga, sasabihin pa.",
  "Ang kagandahan parang password, ikaw lang nakakaalam.",
  "Ang kutis mo parang barbie. Barbie-Q",
  "Di ba sabi nila ang tao gawa  sa putik..Bakit ikaw gawa ka sa plastic!",
  "ARTISTA KA BA?? PLASTIC KA KASI!!",
  "At least ngaun alam ko na...dba ?? hinde ka LATA.. PLASTIC ka lng.",
  "hay naku kung pwede lang itapon lahat ng mga kaibigan sa dagat. di sana matagal ko ng ginawa para lumutang kung sino tlga ang mga plastic.",
  "SOBRA INIT D2 SA PINAS..INGAT Ka ha wag ka LALABAS BKA MALUSAW ka. Plastic ka kasi!!",
  "TANDAAN mo NA ANG 'INSECURITY' at 'PLASTIC' AY MAG KAPATID..",
  "Kapag PLASTIC , basura na agad ? hindi ba pwdeng IKAW muna ?",
  "Ang tao raw ay hinulma gamit ang putik. Eh naubusan ng putik. Ayan tuloy, ang iba gawa sa Plastik!",
  "Alam mo para kang BARBIE - MAGANDA, PLASTIK at WALANG UTAK",
  "STRAW kAbA?? kasi SIPSIP kana PLASTIC kapa!!!!!",
  "Kung legal lang ang magsunog ng PLASTIC na tao, For sure, ABO ka na",
  "Hindi lang mga BAMPIRA ang takot sa ARAW. Nandyan din ang mga PLASTIC na takot MATUNAW",
  "Plastic na, Ma-Papel pa...galing Dual purpose ka pala.",
  "Feeling Gwapo? Mukha namang Kwago",
  "Pogi ka? helllllleeeer! Chura neto!",
  "Kung Pogi ka na, ano tawag mo sa amin? Artista?!",
  "SO Feeling MO pogi KA?! Kapal Naman NG Libag at Gilagid MO UY!",
  "Feeling pogi ka! Kamukha mo naman si Vice Ganda",
  "Feeling gwapo. Mukha namang basag na pugo",
  "Pogi ka? Mas pogi ka kung wala kang ulo",
  "O magkape ka muna baka nanaginip ka lang",
  "gwapo ka? ang sarap mong hampasin ng flourescent light para maliwanagan ka",
  "HOY IKAW! di'PORKET PAREHAS TAYONG BALBAS SARADO, FEELING MO GWAPO KA NA RIN ?",
  "Kung Pogi ka......wala ng panget sa mundo!",
  "Feeling Gwapo, mukha namang Impakto!",
  "Feeling gwapo mukha namang aso.",
  "Letche ka, feeling pogi, as if namang hahabulin kita",
  "Hoy! Iba ang Friendly sa Malandi",
  "Hinay-hinay lang sa paglalalandi,Baka yan ang ikamatay mo",
  "Galit ka sa malandi?! Wag ganun love yourself",
  "Ang taong malandi, sa Higad pinaglihi!",
  "If flirting is a sport, Aba Varsity ka na teh!!",
  "Hindi Nakukuntento ang Malalanding tao, Makati eh",
  "Landi here, landi there, Landi everywhere",
  "Sumalangit nawa, Ang malandi mong kaluluwa",
  "Hindi ako ‘to! Pero ginagawa ko to para sa iyo.",
  "Mahal mo ba ako dahil kailangan mo ako? O kailangan mo ako kaya mahal mo ako?",
  "She had me at my worst. You had at me at my best. At binalewala mo lang lahat iyon.",
  "Hindi lahat ng nagpapasaya sa atin ay tama.",
  "Diyan ka naman magaling e! Magaling ka magpaasa.",
  "Sabihin mo sa akin—may dahilan pa ba ako para hindi umalis?",
  "May nararamdaman ka pa ba sakin? Meron. Sama ng loob.",
  "Dati syota ko siya. Ngayon wala, shuta na lang siya.",
  "Akala ko love. Sana sinabi mo na laro-laro lang pala ‘to, edi sana nag-PE uniform ako",
  "My favorite part of my daily routine is haroutine ka.",
  "Bakit wala kang jowa?  Kasi wala ka pa sakin.",
  "Happy Teacher's Day sa lahat ng mga guro, pati na rin sa crush ko na tinuruan ako magmahal.",
  "Your LOVE is not weak because your LOVE is weak. Your LOVE is weak because the KABIT is strong",
  "Tama si Jessa Zaragosa. Parang ‘di ko nga yata kaya.",
  "Mamatay na lang ako sa virus… kesa makita kang masaya sa iba.",
  "Oo, naka-face shield at mask ako. Nag-dodoble ingat ako kasi baka mahulog ulit ako sa maling tao.",
  "Hindi ako ‘to! Pero ginagawa ko to para sa iyo.",
  "Mahal mo ba ako dahil kailangan mo ako? O kailangan mo ako kaya mahal mo ako?",
  "She had me at my worst. You had at me at my best. At binalewala mo lang lahat iyon.",
  "Hindi lahat ng nagpapasaya sa atin ay tama.",
  "Diyan ka naman magaling e! Magaling ka magpaasa.",
  "Sabihin mo sa akin—may dahilan pa ba ako para hindi umalis?",
  "May nararamdaman ka pa ba sakin? Meron. Sama ng loob.",
  "Dati syota ko siya. Ngayon wala, shuta na lang siya.",
  "Akala ko love. Sana sinabi mo na laro-laro lang pala ‘to, edi sana nag-PE uniform ako",
  "My favorite part of my daily routine is haroutine ka.",
  "Bakit wala kang jowa?  Kasi wala ka pa sakin.",
  "Happy Teacher's Day sa lahat ng mga guro, pati na rin sa crush ko na tinuruan ako magmahal.",
  "Hindi tayo pinalaki ng Sexbomb Girls para bumawi.",
  "Tama si Jessa Zaragosa. Parang ‘di ko nga yata kaya.",
  "Mamatay na lang ako sa virus… kesa makita kang masaya sa iba.",
  "Oo, naka-face shield at mask ako. Nag-dodoble ingat ako kasi baka mahulog ulit ako sa maling tao.",
  "Mahal kita, Mahal mo siya, Oh Diba ang saya , Muka kang tanga",
  "Hindi mo matatawag na past and nakaraan kung lagi mo itong binabalikan tandaan mo you can never finish a game kung lagi kang bumabalik sa level 1",
  "Aanhin mo ang ganda,kung puti lang naman and nagdadala diyan sa muka mong retukada..mas okay pa ang morena at least nasa muka ang ebidensiya.",
  "Kung tatabi ako sayo..gusto KO sa kanan mo para masabi nila na ......I'm the right person for you and I will never be like the other person who left you.",
  "Hindi ko gustong maging akin ka para lang ipagyabang sa iba .Gusto kong imaging akin dahil sayo ako magiging masaya.",
  "Ang RELASIYON ay Parang INUMAN gaano man Ito kasaya sa umpisa.. matatapos padin I to sa salitang 'di KO na kaya'.",
  "Sa isang relasiyon Hindi naman dapat sexy,hot o maganda ka kasi love story ang gagawin niyo Hindi sex video.",
  "Ang pagiging close ng babae at lalaki as a friend ay parang camera CLICK today DEVELOP someday .",
  "Ang PUSO ay isang maliit na parte lang ng katawan pero kapag itoy nasaktan buong pag ka tao ang naaapektuhan.",
  "Ang LOVE parang SIGARILYO bakit pa naimbento kung sakit din lang naman ang epekto.",
  "Ang tunay na estudyante maingay pag DISCUSSION, Tahimik pag RECITATION.",
  "Ang crush ay parang kalabasa Nagpapalinaw ng Mata,kaya kahit malayo pa kitang kita mo na.",
  "Dahil ba mahal kita noon..Mahal pa rin kita ngayon?.. Hindi ba pwedeng..nasiraan lang noon at natauhan na ngayon.",
  "Huwag kang mangako kung hindi mo kayang panindigan..mas mabuti nang sabihing susubukan kaysa mag paasa ng lubusan.",
  "And qoutes parang ligaw na bala kahit Hindi para sayo natatamaan ka",
  "Sabi nila true love can be measure by spark yung tipo na kapag nagkiss kayo mararamdaman mo yung kuryenteng dumadaloy sa buong katawan mo kaya try mo halikan yung wire ng meralco kapag nakuryente ka true love yun Kinikilig kana nag gimie gimie ka pa ayos diba👍",
  "Sumama ka sa mga kaibigan mong MATATAG Hindi sa mga kaibigan mong NANLALAGLAG",
  "Pwede ka namang maging masaya kahit wala ka sa isang relasiyon....dahil pwede ka naman sumaya sa simpleng inspirasiyon.",
  "Ang PANLOLOKO ay Hindi isang NEGOSIYO kaya wag mung ulit ulitin kasi Hindi ka AASENSO.",
  "Ang PAGIBIG ay parang sipon why do you keep pulling it back when its better to let go",
  "Hindi mo kailangan mag pakatanga para mahalin ka nang taong mahal mo pero may mahal ding iba.",
  "Wag mong isiping natalo mo ako,dahil sa tinanggap ko lahat ng sinabi mo.maniwala ka,Hindi lang isang daang beses kitang pinatay sa utak ko inilibing pa kita habang pinagmamalaki mo kung gaano ka kabobo.",
  "SELOS Hindi Ito karapatan ito ay emosiyong kailan man ay di mo mapipigilan",
  "Sana una palang sinabi mo na sasaktan mo lang ako para inaya kita at nag sapakan nalang tayo.",
  "Pag isipan man AKO ng masama dahil sa mga taong NANINIRA wala akong magawa kundi ang TUMAWA sa mga TANGANG naniniwala",
  "Kung minahal mo lang ako ng totoo at tama. Hindi sana ako mawawala at mag sasawa.",
  "Minsan isipin mo muna kung may masasaktan ka sa gagawin mo. Dahil ang sorry ay nagbubura lang ng galit at hindi nagtatama ng “MALI”.",
  "Kung pwede lang maging excuse ang pagiging “BROKEN HEARTED,” malamang marami ng absent sa High School at College.",
  "Hindi tamang gumamit ka ng ibang tao para maka move-on ginago mo na nga ang sarili mo, nakakasakit ka pa ng “IBA”.",
  "Wala naman masama pag-magmahal ka ng sobra-sobra basta ba, wag lang sosobra ng “ISA”.",
  "Bakit kapag may boyfriend ka ang unang tinatanong lagi ay kung gwapo ba? bakit di nila unang itanong kung matino ba? “BAKIT”.",
  "Bakit alak ang sagot sa mga taong nasasaktan? Simple lang dahil sanay tayong alcohol ang gamot pag tayo ay “NASUSUGATAN”.",
  "Hindi naman masama maging single ka, ang masama In Relationship ka nga, “KABET” ka naman pala.",
  "Wag na wag kang maiinlove sa taong walang pakialam dahil para ka lang  nagwawalis habang nakabukas ang electric fan lahat ng effort “NASASAYANG”.",
  "Wag na wag mo akong pakawalan kung ayaw mo akong makitang “PINAG-AAGAWAN”.",
  "Pag tinawag kang Plastik tawagin mo siyang Papel bakit? Kasi hindi ka naman makikipag Plastikan kung walang “PUMAPAPEL”.",
  "Sana maisip mo na yung mga panahong wala kang matawag na “kaibigan” ako yung nandito.",
  "Mahirap mawalan ng kaibigang katulad mo. Kaya kahit ano pa ang mangyari sana magkaibigan pa rin tayo. Wag na wag mo akong iiwan kasi alam kong di ko kaya.",
  "Aminin mo, may mga kaibigan kang sobrang kulet pero pag nawala… sila pa yong mas nakakamis.",
  "Sabi nila kapag mahal mo ang kaibigan mo friends lang daw kayo. Paano kung sa kanya umikot ang mundo mo? Kaibigan pa rin ba ang turing mo sa kanya?",
  "Di ba pag friend kayo… Madalas mag biruan ng “I love you”.. Minsan tinatawag mo pang “loves” o “hon”. Paano mo sasabihing seryoso ka na.. Kung para sa kanya biro pa?",
  "Bakit masakit magmahal ng kaibigan? Kasi kahit kasama mo sya, nakakausap, nakaka tawanan. Di parin maiiwasan na kung love na ang pinag… bang pangalan na ang binabanngit nya…",
  "Mahirap makipaghiwalay sa taong mahal mo sabay sabing “FRIEND” na lang tayo. Pero ang mas mahirap magquit sa isang pagkakaibigan at sabihing “Friend” in love ako sayo.",
  "It's hard to keep your feeling to the one you love. Lalo na kung friend mo sya. But it hurts more if your friend loves you too but can't express it. Kasi kala nya hanggang friends lang kayo.",
  "Natatakot akong mahalin ka dahil kaibigan kita…Kailangan kong mamili sa dalawa… Sasaya ba ako kung pipiliin kong kaibigan lang kita O habang buhay kong pagsisisihan dahil Hindi ko nasabing mahal kita?",
  "Miss, Google ka ba? Kasi, nasa iyo ang lahat ng hinahanap ko.",
  "Miss, album ka ba? Kasi, single ako, eh.",
  "Para kang traffic sa EDSA! ‘Coz I just can't move on!",
  "Apoy ka ba? Kasi ‘alab' you.",
  "Tatakbo ka ba sa eleksyon? Kasi, botong-boto sa yo ang parents ko.",
  "Para kang tindera ng sigarilyo. You give me ‘hope' and ‘more'…",
  "Calculator ka ba? Kasi, sa ‘yo pa lang, solved na ko.",
  "Pustiso ka ba? ‘Coz I can't smile without you.",
  "Kung posporo ka at posporo ako, eh di, match tayo!",
  "Di mo pa nga ako binabato, tinatamaan na ‘ko sa yo.",
  "Pulis ba tatay mo? Kasi, nahuli mo ang puso ko.",
  "Matalino ka ba talaga? Sige nga, sagutin mo ‘ko!",
  "Di ka naman camera, pero tuwing nakikita kita, napapangiti ako.",
  "Dalawang beses lang naman kita gusto makasama… ‘now' and ‘forever.'",
  "Hindi lahat ng buhay ay buhay. Tingnan mo ‘ko – buhay nga pero patay na patay naman sa ‘yo!",
  "Kodigo ka ba? Kasi, ikaw ang sagot sa lahat ng tanong ko, eh.",
  "Kakapagod kasing umupo, eh. Pwede bang tayo na lang?",
  "Hindi ka ba nalulungkot, babe? Nag-iisa ka lang kase sa puso ko eh.",
  "Top view, side view, bottom view, kahit anong view, I love view.",
  "Tulisan ba tatay mo? Kasi nabihag mo puso ko.",
  "Bugtong ka ba, ang hirap mo intindihin.",
  "Magaling ka ba sa algebra? Can you substitute my 'x'?",
  "Masasabi mo bang bobo ako, kung ikaw lamang ang laman ng utak ko?",
  "Amo ba kita? Bakit inaalila mo ang puso ko?",
  "Centrum ka ba? Kasi, you make my life complete!",
  "Kahit ilang beses pa akong masaktan dahil sayo, di kita iiwan, di ako susuko. Dahil kung may 100 dahilan para iwan ka, hahanap pa rin ako ng isang dahilan para ipaglaban ka.",
  "Wag kang iiyak kahit mahalata mong masaya siya sa piling ng iba. Ni ang malungkot, iwasan mo. Malay mo, hiniling din niyang maging happy ka kahit na alam niyang hindi na pwede kasi wala na siya.",
  "Minsan ang sinasabi ng isip, iba sa nilalaman ng puso kaya pati damdamin, nalilito! Hindi malaman kung alin ang dapat sundin. Ang isip na nagsasabi ng dapat? O ang pusong nagmamahal ng tapat?",
  "Noon minahal ka niya. Akala mo forever pero iniwan ka rin niya. Pinipilit mong ibalik ang noon pero hindi mo kaya. Sino ngayun ang manhid? Siya dahil hindi niya maramdamang mahal mo siya? O ikaw kasi hindi mo matanggap na ayaw na niya?",
  "oo, alam ko na nagkamali ako, pero ngaun alm ko na un, lam kong iniwan kta, pero matatanggap mo ba ko? khit na sbrang sakit ang nbgay ko sau? mtatanggap mo pa b ko?",
  "love m pa ba ako? hindi na… siryoso k b… pero bakit…? pero gusto ko lang malaman mo mahal n mahal parin kita… ….tang*na…",
  "kaya kong tuyuin ang iyong mga luha sa bawat sakit na iyong mararamdaman ngunit kailang mo kaya mapupuna ang aking luha? pareho lang tayong nasasaktan ikaw sa kanya at ako sa yo",
  "hbang nasau ang taong mahal mo, alagaan mo…wag mo hayaan dmatng un araw na pagcchan mo na nawala na xa, at sbhin ña sa ung,”kaw kc eh, pnabayaan mo ko…”",
  "Lam mO hrap pag nwala ung mhal mo.. nakakalungkot, masakit,nakakamiss.. bkt ganun noh? Pgkatapos ng saya ddting din ung time na iiwan ka nia.. dun pa sa part na sobrang mahal mo na siya..",
  "mpt p b ako sau? Kc d ka na tulad ng dati.. ung swit, thoughtful, at lagi akong naaalala.. teka.. ibahin ko nlng tanong ko.. mhl m p ba ako?",
  "KARMA has no MENU but you get served for what you deserved",
  "Ang tunay na lalake nagbabago para sa babae, hindi yong pabago bago ng babae.",
  "Single siya. Single ka. Wala siyang pake sayo. Wag ka ng umasang magiging 'kayo'",
  "Magkaiba ang nagmamahalan sa naglalandian.",
  "Sa panahon ngayon, hindi na masyadong common ang common sense!",
  "Post ka ng post tungkol sa kanya, eh wala naman syang pake sayo.",
  "Minsan sarili mo lang talaga ang makakaintindi ng sitwasyon at nararamdaman mo.",
  "Kapag kasama mo ang mga kaibigan mo at nag reklamo ka na sobrang init, hindi pwedeng walang sasagot ng 'ay, sorry ha?'",
  "May mga tao talagang nakakairita kahit walang ginagawa sa'yo.",
  "Hirap na hirap kang sabihin yung feelings mo, natatakot ka kasing ma'reject.",
  "Hindi niya kelangan mamili, dahil kung talagang mahal ka niya hinding hindi ka magiging option.",
  "Galing mag-advice pero single.",
  "Yung parehas kayong nagmamahal, Ikaw sa kanya. Siya sa iba.",
  "Ang pagmamahal ko ay parang Research Title, Laging na-rereject.",
  "Sa sobrang likot mo, Natabig mo ang puso ko, Nahulog pa sayo.",
  "Keyboard ka ba? Kasi type na type kita!",
  "Ang relasyon parang kape, Lumalamig kapag pinapabayaan.",
  "Buti pa ang sinaing, Binabantayan, Binabalikan, Hindi Iniiwan.",
  "Sana sinaing ka nalang, Para kapag nakalimutan kita, Sunog kang hayop ka.",
  "Bakit laging yung mga 'PAASA' ang sinisisi kapag may nasasaktan? Eh, paano yung ipinanganak na 'ASSUMING?'",
  "Pwede mo ba akong samahan Sa sementeryo? Bibisitahin ko yung puso kong Patay na patay sayo.",
  "Kung ako namatay wag kang pumunta sa libingan ko, Kasi baka tumibok ulit ang puso ko.",
  "Buti pa ang mga bilihin nagmahalan, Ako hindi pa.",
  "Sa mga estudyante: Hanggang crush lang muna, Wag agad mag-relasyon, Para hindi ka agad-agad nasasaktan.",
  "Ang pag- ibig parang bagyo, Mahirap ipredict kahit May PAG-ASA.",
  "Malamig lang ang panahon, JOWA agad hanap mo? Try mo lugaw, May Itlog din yon.",
  "Ang puso parang paminta, Buo talaga Pilit lang dinudurog ng iba.",
  "Pag-iniwan ka ng mahal mo, Never Say Die, Tommorow is another guy.",
  "Ang crush ay parang Math Problem, Pag di makuha, Titigan nalang.",
  "MALABO: Minsan Mata, Minsan Ikaw",
  "Bumabalik ka nanaman? Pakiusap. Ayaw ko na mating tanga ulit.",
  "Minsan natatawa ako ng walang dahilan, Pero madalas nasasaktan ako na walang nakakaalam.",
  "Hindi bale na kahit height mo ay bitin, Abot langit naman",
  "Huwag kang mag-alala kung mataba ang girlfriend mo, Kaya nga may sabihang 'True Love Weights.'",
  "Ano naman kung mataba siya? Mamahalin mo lang naman siya hindi kakargahin.",
  "Kayo advanced mag-isip, Ako ikaw lang iniisip",
  "Pangiti-ngiti lang ako pero nahuhulog na ako sayo",
  "Wag kang malungkot kung palpak ang love life mo. Sadyang malakas lang talagang manalangin ang taong pumapangarap sayo.",
  "Ang manhid parang bato yan di nasasaktan at walang nararamdaman.",
  "Hanapin mo yung taong para sayo hindi yung  para iba tapos AAGAWIN mo.",
  "Wag mong panghinayangan ang taong ikaw mismo ang sinayang.",
  "Pag ibig parang hangin di mo ito nakikita pero nararamdaman mo.",
  "KAsama talaga ang masaktan  sa pag mamahal , masasaktan ka ba KUNG DI MO SYA MAHAL",
  "Mahal mo sha mahal din nya yung isa..anong klaseng puso yan dual SIM?.",
  "Minsan mas maganda pang malungkot ng panandalian kesa magdusa habang buhay.",
  "Di ako mayaman para bilhin ang kahapon pero handa akong utangin ang ngayon makasama kalang habang panahon.",
  "Sipag naman mag mahal ng mga tao pati mahal ko mahal din nila.",
  "Pwede kalang mahalin pero di ka pwedeng angkinin.",
  "Yung feeling na ang bilis bilis ng oras pag kasama mo siya.",
  "Mahirap daw mag mahal ng taong iba ang gusto. Pero alam ba nila MAS MAHIRAP mag mahal ng taong akala mo ikaw ang gusto?",
  "Wag kang gumawa ng paraan para sumuko ako dahil sa oras na ipinaramdam mo sa aking BALEWALA ako. Kahit sobrang mahal kita, BIBITAW ako.",
  "Yung ikaw sukong-suko na pero sya lumalaban pa. Kaya ikaw pilit na lang na lumalaban para hindi na siya masaktan pa.",
  "madaling mag patawad pero mahirap makalimot.",
  "WAG MONG SABIHING PINAASA KA NYA BAKIT SINANBE BA NYA SAYO NA UMASA KA!!",
  "Ang sorry ay ginagamit sa mga bagay na hindi sinasadya di sa mga bagay na paulit-ulit na ginagawa.",
  "Ang pag kakaalam ko ang tao hinulma sa putik pero bat ganun ang daming taong plastic.",
  "Ang ex nang kaibigan dapat di pinapatulan niluwa nanya kinain mo pa patay gutom ka talaga",
  "Kung may alak may balak",
  "Dika karapat dapat na tawaging kaibigan dahil plastik ka",
  "Minsan kase dapat matuto tayong bumitaw lalo na pag nasasaktan na di yung ginagago kana kinikilig kapa.",
  "Kung sinabe mo sakin na sasaktan molang naman ako. dapat  inaya mo nalang ako ng sapakan .",
  "Alam mo ba na ang pinaka masarap na kape ay ang 'KAPE'leng ka .",
  "Sa dinami-dami ng BOOK sa mundo, isa lang talaga ang hindi ko maintindihan...... Ang tiniti-BOOK ng puso ko, para sayo!",
  "Wag mong pag selosan ang mga tao sa paligid ko dahil alam nila na ikaw ang mahal ko.",
  "Ang sarap mahulog lalo kung alam mong may sasalo sayo.",
  "Di lahat nang nagpapakilig sayo ibig sabihin mahal ka may mga tao lang talagang gawa sa asukal na nakalagay sa plastic.",
  "Sabi nila mahirap mag mahal ng taong iba ang gusto pero diba nila na isip na mas mahirap magmahal ng taong akala mo ikw ang gusto.",
  "akala ko ba mahal mo bakit hinayaan mong mapunta sa iba? -kase pinili kong maging masaya siya kahit hindi na ako ang dahilan.",
  "Baril kaba? Bakit? Kasi lakas ng putok mo!! Boom 🎆",
  "Pustiso kaba? Kasi i cant smile without you",
  "Ang kapal naman ng mukha mo!! di pa nga tayo magkakilala pumapasok kana agad sa puso ko",
  "Sa isang relasiyon Hindi naman dapat sexy,hot o maganda ka kasi love story ang gagawin niyo Hindi sex video.",
  "Ang pagiging close ng babae at lalaki as a friend ay parang camera CLICK today DEVELOP someday .",
  "Kung sa pag Ibig iibigin kita, Kung sa pagmamahalan mamahalin kita..Kung sa kamatayan mauna ka..Hindi ako TANGA para samahan ka pa.",
  "Ang PUSO ay isang maliit na parte lang ng katawan pero kapag itoy nasaktan buong pag ka tao ang naaapektuhan.",
  "Ang hirap magtiwala sa taong paulit-ulit ka nang sinaktan.",
  "Bakit ba kailangan pa nilang manloko, kung mahal mo naman sila nang sobra?",
  "Minsan, kailangan mong maging matapang at i-let go na ang taong hindi na naman magbabago.",
  "Ang pag-ibig ay hindi dapat pilitin, dahil kung para sa'yo, darating at darating 'yan.",
  "Hindi lahat ng sakit, kayang gamutin ng mga lalaki.",
  "Kapag minahal mo nang sobra ang isang tao, mahirap na itong kalimutan.",
  "Kung magmamahal ka, dapat handa ka rin sa posibilidad na masaktan ka.",
  "Hindi dapat masanay sa kahit anong pagpapabalewala ng lalaki.",
  "Kapag mahal mo ang isang tao, dapat kayang magpakatanga pero hindi kayang magpaka-tanga.",
  "Ang hirap pag ipinagkatiwala mo na lahat, pero hindi pa rin sapat para sa kanya.",
  "Kung hindi ka mahal ng taong mahal mo, wag mo na lang siyang pilitin.",
  "Masakit isipin na ang taong pinakamamahal mo ay hindi naman pala para sa'yo.",
  "Hindi porke't single ka, wala ka nang karapatang magmahal at magpakamahal.",
  "Masakit kapag hindi ka na naaalala ng taong minsan mong pinakamahal.",
  "Pano mapipigilan ang global warming kung pati tao plastick na rin",
  "Facebook ko ito at wapakels kung ano ipopost ko kung ayaw mo sa mga post ko pakitadyakan ang sarili mo palabas ng friend list ko",
  "Sa paglipas ng panahon isa lang ang natutunan ko.... Pahalagahan ang nandiyan at kalimutan ang nang iwan",
  "Ayoko ng ikinukumpara ako sa iba dahil kahit kailan ay hindi ako naging sila.",
  "Minsan kailangan mong tanggapin na kahit mahal ka nang  isang tao , kaya niyang lokohin kahit kailan nya gusto",
  "Ang TSISMIS ay ginagawa ng taong GALIT sayo..kinakalat ng taong LOKO-",
  "Masakit kapag ang taong mahal mo, ay masaya sa piling ng iba pero kailangan mong ipakita na masaya ka, kahit sa loob mo.. 'Sana ako nalang siya.'",
  "Ang hirap tumawa kung hindi ka naman masaya Kahit ngumiti ka pa halata pa rin ang lungkot ng nadarama.",
  "Ang love parang Clash of Clans, Kailangan mong mag effort na palakasin ang pundasyon mo para maiwasan ang pagkasira nito.",
  "Hindi tanga yung taong sobrang magmahal. Mas tanga yung taong minahal ng sobra pero naghanap pa ng iba.",
  "Papayag naman akong landiin ang mahal ko. Basta payag kang basagin ang pag mumukha mo.",
  "Sana tsinelas nalang tayong dalawa.Para kung mawala ang isa,di na pedeng ipares sa iba dahil di na bagay.",
  "Ang pag-ibig parang imburnal, Nakakatakot mahulog at kapag nahulog ka,it's either by accident or talagang tanga ka.",
  "May mga taong mabilis mahulog ang loob mo,pero bigla ka na lang iiwan At kung saan nakalimot ka na,tsaka magpaparamdam.",
  "Naka ngiti ako dahil masaya ako, Ngumiti talaga ako para patunayan sayo na, Nandiyan ka man o wala itutuloy ko buhay ko.",
  "Nandiyan ka man o wala itutuloy ko buhay ko. naiintindihan HINDI KA PA RIN IIWAN.",
  "Nagmahal ka na nga ng Dyosa pinagpalit mo pa sa isang Aswang.",
  "May mga taong ayaw mawala ka. Pero di naman gumagawa para bumalik ka.",
  "Wag ka magpapa apekto sa sinasabi ng iba. Mas kilala mo ang sarili mo kesa sa kanila.",
  "Minsan lahat ng naiiwan hindi na pwede pang balikan.",
  "Sabi mo laro tayo. Akala ko tagu taguan yun pala feelings.",
  "Wag ka maghanap ng taong nakakaintindi sayo.Hanapin mo yung taong kahit hindi naiintindihan di ka pa rin iiwan.",
  "Minsan kung sino pa yung HINDI KA LUBOS KILALA sila pa ang MANGHUHUSGA.At itsi tsimis ka pa nila.",
  "Hindi mahirap gawin ang mag MOVE-ON. Nahihirapan ka lang dahil iniisip mo ikaw yung nawalan.",
  "Magkaiba ang GALIT at TAMPO. Ang galit pwede kanino at ang tampo makakaramdam mo lang sa taong ayaw mong mawala sa'yo.",
  "Wag kang magpakatanga sa taong binabalewala ka",
  "Masaya ako kahit wala ka. Sumosobra ang pag andiyan ka.",
  "Ang SECOND CHANCE ay binibigay sa taong marunong tanggapin ang kanyang kamalian.",
  "Hindi naman talaga ako nawala. Natabunan lang ako nung may dumatinng na bago sa buhay mo.",
  "Sa likod ng 'FRIENDS KAMI May pusong umaasa na ' SANA NGA KAMI",
  "Ang pagboto ay parang pag-ibig PRICELESS",
  "Wag mong I-Lang ang pagigigng Fangirl, Fangirl isn't an easy job.",
  "That 'BAGAY TAYO' pero di tayo 'MEANT TO BE'",
  "Minsan ang mga PLASTIK  ay wala sa basurahan.MInsan nasa harap mo lang.",
  "Maraming magkasintahan na ang naghiwalay dahil sa walang kakwenta-kwentang away.",
  "Nakakawalang gana kung lagi ka na lang nasasaktan.",
  "May mga taong hindi mo talaga alam kung mahal ka o sweet lang talaga sayo.",
  "Di ako naniniwala sa MU .Naniniwala ako sa Me and You.",
  "Lahat ng bahay pwede ipaglaban.Pero hindi lahat pwede ipagpilitan.",
  "Walang lalakeng masasabihang Paasa kung wala namang babaeng Assumera",
  "Tahimik lang ako pero ilang beses na kita pinatay sa isip ko.",
  "Gusto mong lumaban pero binibigyan ka niya ng dahilan para sumuko ka na.",
  "Minahal ka daw niya,pinahalagan ka daw niya ang tanong? Naramdaman mo ba?",
  "Kahit Anong Libang Mo Sa Sarili Mo, Hangga't May Namimiss Ang Puso Mo Hindi Magiging Kampante Ang Utak Mo",
  "Dahan-dahan sa pagpili ng mamahalin, baka malagpasan mo ko!",
  "Hindi ginawa ang break up para masaktan at lumuha. Ginawa ito para ilayo ka sa maling tao na akala mo ay tama",
  "Hindi ko kailangan ng taong mamahalin ako ng sobra. Ang kailangan ko ay ang taong hindi ako iiwan kahit nakakaubos na ako ng pasensiya",
  "Hindi ko naman ginustong mahalin ka, kaso anong magagawa ko, kung ikaw talaga ang target ng puso ko!",
  "Paki CHECK nga yung ORAS ng PHONE mo, Baka kasi ORAS na, para MAALALA MO naman AKO! :(",
  "Yung tipo na LAHAT ng TINIDOR sa bahay ninyo, inihulog mo na! Wala pa rin lalaking dumarating sa buhay mo! >.<",
  "Hindi Ka Pwedeng Magselos Kasi Wala Kang Karapatan, Pero Di Mo Mapigilan Kasi Meron Kang Nararamdaman </3",
  "Hindi Lahat Ng Tao Sinasaktan Ka, Kaya Nga Ako Nandito Para Mahalin Ka",
  "May Mga Tao Na Puro Kwento, Puro Salita! Pero WaLang Gawa. Mas Mabuti Nang Puro Gawa Kaysa Salita Lang Ng Salita!",
  "ANO ORAS NA? Timer ka diba?",
  "Siguro Kailangan Ko Nang Itigil Itong Bisyo Ko, Ang Araw Araw Na Pagbisita Sa Profile Mo Para Lang Saktan Ang Sarili Ko. </3",
  "Mawala Na Ang ReLasyon Natin, Huwag Lang Ang Wifi Ng Kapitbahay Namin.",
  "Minsan kapag masyado kang palaban, hindi ka na nagmumukang matapang. Nagmumuka ka ng walang pinag-aralan",
  "Wag mong ipilit ang sarili mo sa taong napipilitan lang na mahalin ka. Isda lang ang sumisiksik sa lata! SARDINAS ka ba?",
  "Minsan may mga taong nasasaktan na, pero pinapakita nila na parang walang problema :3",
  "May mga tao talagang sweet lang sa umpisa, pero kapag nagtagal hindi ka na pahahalagahan T_T",
  "Darating din ang Tamang Panahon na ipapakilala sa iyo ni Lord, yung tamang tao na dapat mong mahalin :)",
  "Hindi lahat ng tao, pwede mong balikan. Kaya bago ka mang-iwan siguraduhin mo munang kaya mo itong PANINDIGAN :P",
  "Huwag mong ipakita sa akin na MADALI AKONG PALITAN, dahil kaya kong isampal sayo ang salitang ' LANG KITA PERO DI KA KAWALAN' -_-",
  "Walang busy sa taong nagmamahal ng tunay, pwera na lang kung mas mahal niya yung dahilan ng pagiging busy niya :P",
  "Masaya Kapag May Minamahal Ka , Pero Mas Masaya Kung Mahal Ka Rin Niya XD",
  "SELOS, nararamdaman yan kahit wala kayong relasyon basta nasanay ka na laging nasa iyo ang atensyon niya :)",
  "Huwag kang gumawa ng paraan para sumuko ako dahil sa oras na ipinaramdam mo sa aking BALEWALA ako? Kahit sobrang mahal kita, BIBITAW ako.",
  "Hindi ko hiniling na dumating yung matalinong tao sa buhay ko, ang tanging gusto ko lang ay yung taong BOBO pagdating sa Panloloko!",
  "Kahit na ilang beses nilang ulit-ulitin na 'marami pa dyan.' Paulit-ulit ko din ipapaintindi sa kanila na IKAW LANG ang katumas ng lahat ng yan.",
  "Nagmahal ako at nasakatan. Pero kahit ganoon, hindi pa rin ako magsasawang magmahal dahil sa likod ng nadama kong sakit at pagkabigo ay natuto ako at masasabi kong NAGMAHAL AKO NG TOTOO.",
  "Umayaw ako hindi dahil ayoko na. Umayaw ako para maging masaya ka. . .",
  "Kung hindi mo kayang Panindigan Sa una pa lang wag mo ng umpisahan para Wala kang masaktan.",
  "Kapag ba malungkot Broken hearted na agad? Hindi ba pwedeng WALANG PERA?",
  "Twitter ka ba? Bakit? Trending ka kasi sa puso ko.",
  "Handa akong takbuhin ang buong mundo. . . . Basta ang Finish line ay sa puso mo. . . .",
  "Ang PAG IBIG parang Malinaw na tubig.Lumalabo kapag Maraming nakikisawsaw",
  "Wag mong ipilit Sa akin ang sarili mo Kasi hindi kita FEEL",
  "Minsan kailangan mong Magpaka busy para makalimot",
  "Ang pag-ibig ay hindi hadlang para maging matagumpay sa buhay.",
  "Kapag mahal mo ang isang tao, dapat kayang magbigay pero hindi kayang magpakatanga.",
  "Hindi lahat ng tao ay worth it para sa'yo, kaya huwag mong sayangin ang oras mo sa kanila.",
  "Kapag hindi na kayo nag-uusap, wag mong ipilit na kayo pa rin.",
  "Hindi lahat ng umiiwas ay galit, minsan nagmamahal lang ng sobra.",
  "Kapag nagmahal ka, wag mo nang hanapin pa ang iba pa, dahil siya na lang ang nakikita mong tama.",
  "Hindi lahat ng tao ay maaasahan, kaya mahalin mo rin ang sarili mo.",
  "Ang hirap magmahal ng taong hindi ka naman kayang mahalin.",
  "Kapag mahal mo, dapat kayang magtiis pero hindi kayang magpaka-bobo.",
  "Hindi lahat ng pagkakamali ay dapat pinaparusahan, lalo na kung ang pagkakamali mo ay magmahal ng sobra.",
  "Kapag nagmahal ka, dapat handa ka rin sa sakit na pwedeng idulot nito.",
  "Huwag mong hanapin sa iba ang kahalagahan na dapat ay nakikita mo sa sarili mo.",
  "Mahal kita, pero hindi sapat ang pagmamahal ko para sa dalawang tao.",
  "Masakit kapag ikaw na lang lagi ang nagmamahal, at hindi ka na mahal ng taong mahal mo.",
  "Bakit kailangan pa ng ibang babae kung ako naman ang magmamahal sa'yo ng totoo?",
  "Hindi ako madaling magpakatanga, pero para sa'yo, handa akong gawin ang lahat.",
  "Sana ay nagbago ka na, kasi ang hirap umasa sa taong hindi nagbabago.",
  "Hindi ako nagtatanong kung may iba ka nang mahal, kasi alam ko na.",
  "Ang hirap magmahal ng taong nagmamahal na ng iba.",
  "Bakit kailangan pang magpakipot kung alam mo namang mahal mo na ako?",
  "Mahal kita kahit alam kong hindi mo ako kayang mahalin pabalik.",
  "Alam kong hindi ako perpekto, pero sana ay nakikita mo pa rin ang halaga ko bilang tao.",
  "Hindi lahat ng tao ay para sa'yo, kaya kailangan mo munang masaktan bago makahanap ng tamang tao para sa'yo.",
  "Mahirap magmahal ng taong hindi ka mahal, pero mas mahirap magmahal ng taong hindi marunong magmahal.",
  "Masakit maghintay sa taong mahal mo, pero mas masakit ang mawalan ng taong hindi mo na mahal.",
  "Sa tuwing nagtatampo ka sa akin, alam kong mahal mo pa rin ako dahil kung hindi, wala kang pakialam.",
  "Sana ay nakikita mo ang puso ko na nagmamahal sa'yo, kahit hindi ko masabi sa'yo nang direkta.",
  "Hindi lahat ng tao ay may puso, kaya kung nakahanap ka ng taong may puso, alagaan mo na.",
  "Hindi mo alam kung gaano ako kasaya kapag kasama kita, kaya sana ay hindi mo na ako iiwan.",
  "Hindi ko alam kung paano i-explain, pero kapag kasama kita, parang nawawala lahat ng problema ko.",
  "Sana ay magkaalaman na tayo, kung mahal mo pa ba ako o hindi na.",
  "Kahit anong gawin ko, hindi ko maalis sa isip ko na mahal kita.",
  "Mahal kita, pero hindi ako desperado na magpakatanga sa'yo.",
  "Masakit man tanggapin, pero hindi ako sapat para sa'yo.",
  "Sana ay nag-iisa ka rin at nagmamahal sa akin ng totoo.",
  "Hindi ka man nagmamahal sa akin ngayon, alam kong darating ang panahon na magbabago ang lahat.",
  "Masakit isipin na may ibang mahal ang taong mahal mo, pero mas masakit kapag alam mong hindi mo na mahal ang taong mahal mo.",
  "Ang hirap magmahal nang sobra, kasi kapag iniwan ka, sobrang sakit din.",
  "Masakit man sa una, pero kailangan mong tanggapin na hindi lahat ng tao ay para sa'yo.",
  "Hindi lahat ng lalaki ay manloloko, pero kailangan mong maging maingat pa rin.",
  "Bakit ba kailangang magpakatanga sa pag-ibig, kung alam mong hindi ka naman mahal?",
  "Kapag nasaktan ka na ng sobra, mahirap nang bumalik sa dating ikaw.",
  "Hindi naman kailangan na laging may ka-partner, mas masaya pa nga minsan mag-isa.",
  "Masakit man na hindi ka mahal ng taong mahal mo, mas masakit kung magpakatanga ka pa rin.",
  "Hindi mo kailangan ng taong nagpapakatanga sa'yo, kailangan mo ng taong magpapahalaga sa'yo.",
  "Bakit ba ang pag-ibig, kapag masarap, kinakain mo na parang candy, pero kapag masakit, iiyak mo na lang?",
  "Ang pag-ibig ay parang lottery, kapag hindi swerte, hindi ka mananalo.",
  "Hindi lahat ng mahal natin ay makakatagal sa atin, pero kailangan natin silang pakawalan kung kailangan na.",
  "Hindi naman kailangang magmukmok dahil sa isang lalaki, marami pang ibang pwedeng magpakilig sa'yo.",
  "Masakit man sa una, pero kapag naghiwalay kayo, mas magiging malaya ka.",
  "Ang pag-ibig ay hindi lang puro saya, mayroon ding lungkot at sakit.",
  "Hindi mo kailangan ng taong maraming pera, kailangan mo ng taong may puso.",
  "Bakit ba kailangang magpakatanga sa taong hindi ka naman mahal, kung mayroon namang ibang nagmamahal sa'yo?",
  "Hindi naman lahat ng magagandang bagay ay para sa'yo, kailangan mong tanggapin na mayroong mga bagay na hindi meant to be.",
  "Hindi ka magiging malungkot kung mag-iingat ka sa mga taong pwede kang saktan.",
  "Hindi lahat ng lalaki ay para sa'yo, kailangan mong hanapin yung tamang tao para sa'yo.",
  "Masakit man na hindi ka mahal ng taong mahal mo, mas masakit kung patuloy kang magpapakatanga.",
  "Hindi naman kailangan na laging may ka-date, mas masaya pa nga minsan na mag-stay sa bahay.",
  "Kapag may gusto ka sa isang lalaki, huwag ka nang magpakatanga kung hindi ka rin naman mahal.",
  "Hindi naman lahat ng maganda ay magaling, kailangan mong hanapin yung totoo at may puso.",
  "Hindi naman kailangan na magmukmok dahil sa isang lalaki, kailangan mong bumangon",
  "Masakit magmahal ng taong hindi ka naman kayang mahalin.",
  "Kapag sinaktan mo ang isang babae, hindi mo na siya mababalikan.",
  "Hindi lahat ng babae ay manhid, mayroon ding marunong magpakatanga.",
  "Masarap magmahal, pero mas masarap magmahal ng taong nagmamahal din sa'yo.",
  "Hindi porket hindi ka nakatagpo ng 'the one' ay hindi ka na magmamahal ulit.",
  "Hindi ka naman talaga nila mahal kung ang gusto nila ay yung nakikita kang masaya sa iba.",
  "Hindi ka dapat magmahal para sa iba, dapat para sa sarili mo.",
  "Mahirap mag-move on, pero mas mahirap mag-stay sa isang relationship na walang pag-asa.",
  "Ang love life mo ay hindi base sa kung ilang beses ka na nasaktan o niloko, kundi kung ilang beses ka na nagmahal.",
  "Hindi porke't single ka ay hindi ka na masaya.",
  "Hindi porke't single ka ay maghihintay ka na lang, kailangan mo rin mag-effort para sa sarili mo.",
  "Hindi lahat ng nagpapakita ng interes ay nagmamahal, kadalasan curiosity lang yan.",
  "Hindi mo kailangang magpakatanga para lang magpakita ng pagmamahal.",
  "Hindi porket may nagmamahal sa'yo ay hindi mo na kailangang mag-improve sa sarili mo.",
  "Ang pag-ibig ay hindi lang sa maganda o mayaman, pwede rin sa pangit at mahirap.",
  "Ang love life ay hindi lang sa social media, kundi sa totoong buhay.",
  "Kung mahal mo talaga, maghihintay ka at mag-e-effort.",
  "Masakit kapag nasaktan ka ng taong mahal mo, pero mas masakit kapag nasaktan ka ng taong hindi mo naman mahal.",
  "Hindi porket sinabi niyang mahal ka, ay tunay na mahal ka na niya.",
  "Kung hindi ka na mahal, wag ka nang magpakatanga.",
  "Hindi ka dapat magpakatanga para lang sa pag-ibig, dapat para sa sarili mo.",
  "Hindi porke't maganda ka ay hindi ka na nasasaktan.",
  "Hindi mo kailangang magpaka-bitter para lang maging masaya.",
  "Kung hindi ka mahal ng taong mahal mo, wag kang magpakatanga.",
  "Hindi mo kailangang magpakatanga para lang mapansin ng taong mahal mo.",
  "Hindi ka dapat magtiwala agad, dahil ang tiwala ay pinaghihirapan.",
  "Paano ko ipaglalaban ang pagmamahal ko sayo kung ako lang ang nakakaramdam nito.",
  "Bakit kita iiyakan. Kaya naman kitang palitan.",
  "Alam mo ba ang salitang pagmamahal? Hindi ko yan pinag-aralan. Pero sayo ko yan natutunan.",
  "May mga taong di payag na mawala ka. Pero di naman gumagawa ng paraan para manatili ka.",
  "Sa pag-ibig walang bulag, walang pipi, walang bingi, pero tanga madami.",
  "Hintayin mo ang true love mo. Na-traffic lang yun sa malalanding tao.",
  "Hindi porke't iniwan ka, hindi na siya mahal.",
  "Kung mahal mo talaga, hindi ka magpapakatanga.",
  "Kung hindi mo naman mahal, wag ka na lang makipaglaro ng puso.",
  "Kung maghihintay ka, dapat may dahilan.",
  "Hindi porke't hindi ka maganda ay hindi ka na mahalaga.",
  "Hindi mo kailangang magpaka-biktima para lang makalimot.",
  "Bakit ba ang hirap mag-move on? Kasi masarap ang alaala.",
  "Kung alam ko lang na magiging ganito, hindi ko na sana pinili.",
  "Hindi ako nagmamahal para lang magpakatanga. Pero bakit kailangan kong magpakatanga para sa kanya?",
  "Masakit maghintay, pero mas masakit mag-antay sa wala.",
  "Ayoko na sa mga lalaki na manloloko at nang-iiwan ng mga babae.",
  "Hindi lahat ng nagmamahal ay masaya. Minsan, ang pagmamahal ay may sakit na kasama.",
  "Masakit maging pangalawa sa puso ng taong mahal mo.",
  "Ang hirap magtiwala sa taong paulit-ulit ka nang nasaktan.",
  "Kung mahal mo talaga, hahayaan mo siyang lumayo kahit masakit.",
  "Masakit isipin na mahal mo siya, pero hindi ka niya kayang mahalin pabalik.",
  "Alam mo yung pakiramdam na mahal mo siya pero hindi mo alam kung mahal ka rin niya?",
  "Kapag nagmahal ka, hindi lang yung kasiyahan ang kasama. Kasama rin ang sakit at pighati.",
  "Hindi ako bitter, nagtatanong lang. Bakit hindi ako ang napili?",
  "Masakit magpaka-tanga para lang magmahal.",
  "Bakit ba ang hirap mag-let go, lalo na kapag mahal mo pa rin siya?",
  "Ang hirap maging mabait sa taong wala kang kasiguraduhan kung mamahalin ka rin niya.",
  "Sa love, walang perfect. May mga pagkakamali pero kailangan natin itong tanggapin.",
  "Mahal mo siya pero alam mo sa sarili mo na hindi ikaw ang para sa kanya.",
  "Kung may magbabago sa relasyon natin, sana hindi ikaw ang magbago.",
  "Alam ko na mahal mo siya, pero sana mahalin mo rin ang sarili mo.",
  "Ang hirap magtiwala sa taong may maraming tinatago.",
  "Kapag hindi ka masaya, kailangan mong magdesisyon para sa sarili mo.",
  "Hindi mo na kailangang magpaka-bitter kung tapos na ang lahat. Move on na.",
  "Kapag naiwan ka ng mahal mo, hindi ka nag-iisa. Marami pa ring taong handang magmahal sa'yo.",
  "Hindi porke't mahal mo, bibigyan mo na ng lahat. Kailangan mo rin ng respeto at pagpapahalaga sa sarili mo.",
  "Masakit magtiis sa taong hindi naman talaga mahal ka.",
  "Minsan, kailangan nating mag-let go ng taong mahal natin para lang sa kaligayahan nila.",
  "Hindi ko kailangan ng lalaki para maging masaya.",
  "Hindi ka naman talaga mahal kung kailangan mong magpakatanga para sa kanya."
];

    
    const tagalogAuthors = [
      "Karunungang Pilipino", "Kasabihan", "Inspirasyon", "Karunungan",
      "Pag-asa", "Sipag at Tiyaga", "Karanasan", "Positibong Pag-iisip",
      "Aral ng Buhay", "Pangarap"
    ];

    // Hugot quotes for random generation
    const hugotQuotes = [
  "Sa tamang panahon may isang taong magpapatunay sayo kung bakit ka para sa kanya at kung bakit hindi ka para sa iba.",
  "Di ko man maisigaw sa buong mundo kung sino ang mahal ko, sapat nang alam natin pareho na ikaw ang tinutukoy ko.",
  "Kung pwede lang maging excuse ang pagiging broken hearted, malamang marami ng absent sa high school at college.",
  "Wag mong isiksik ang sarili mo sa taong hindi marunong magpahalaga sa nararamdaman mo. Masasaktan ka lang.",
  "Mahirap kumalma lalo na kapag selos na selos ka na.",
  "Sana isinusulat na ang feelings, para madali lang burahin.",
  "Sana thesis na lang ako na ipaglalaban mo kahit hirap na hirap ka na.",
  "Balang araw makakaya ko na ulit na tingnan ka ng wala na akong nararamdaman pa.",
  "Mahirap mag-let go. Pero mas mahirap yung kumakapit ka pa, tinutulak ka na.",
  "May mga tao talaga na kahit napapasaya ka, kaylangan mong iwasan.",
  "Hindi na baleng siya ang bumitaw. Ang importante alam mong lumaban ka hanggang sa wala ka ng maipaglaban.",
  "Hindi mo kailangang mamili sa aming dalawa. Handa akong lumabas sa puso mo para lang sumaya ka sa piling niya.",
  "Ang hirap bitawan nung taong kahit hindi kayo, siya yung nagpapasaya at kumukumpleto ng araw mo!",
  "Pag hindi ka mahal ng mahal mo, wag ka magreklamo. Kasi may mga tao rin na di mo mahal pero mahal ka. Kaya quits lang.",
  "Alam mo kung bakit nasasaktan ka? Kasi iniisip mo na gusto ka rin niya kahit hindi naman talaga.",
  "Dapat ba akong ngumiti dahil magkaibigan tayo? O dapat ba kong malungkot dahil hanggang dun lang tayo?",
  "Hindi tamang gumamit ka ng ibang tao para maka move-on ka. Ginagago mo na nga ang sarili mo, nakasakit ka pa ng iba.",
  "Ibinigay ko na ang lahat pero hindi pa rin sapat.",
  "Lahat tayo napapagod. Wag mong hintayin na mawala pa siya sa buhay mo bago mo siya pahalagahan.",
  "Yung naghihintay ka sa isang bagay na imposible namang mangyari.",
  "Ang oras ay isang mahalagang elemento sa mundo. Bumibilis kapag masaya, at bumabagal kapag wala ka.",
  "Masakit isipin na dahil sa isang pangyayari hindi na kayo pwedeng maging tulad ng dati.",
  "Yung akala mo minahal ka niya pero hindi pala.",
  "Sana tinuruan mo 'ko kung paano madaling makalimot tulad ng ginawa mong paglimot sa'kin.",
  "Buti pa ang ngipin nabubunot kapag masakit. Sana ang puso ganun din.",
  "Minsan kahit sabihin mong suko ka na, kapag naalala mo kung paano ka niya napasaya, bumabalik ka ulit sa pagiging tanga.",
  "Minsan kailangan tayong masaktan bago tayo matauhan.",
  "Minsan kung sino pa yung rason mo kung bakit ka masaya, siya din ang rason kung bakit masasaktan ka ng sobra.",
  "Kung talagang mahal ka nyan mageefort yan kahit di ka mag-demand.",
  "Kapag nasasaktan ka, pwede kang umiyak. Tao lang tayo hindi superhero.",
  "Tao ka kaya hindi ka exempted masaktan.",
  "Kaya may monthsary ay dahil hindi lahat ng relasyon ay umaabot ng anniversary.",
  "Bago mo ko hawakan, pwede ko bang malaman kung paano mo bibitiwan?",
  "Hindi lahat ng nagsasama ay nagmamahalan at hindi lahat ng nagmamahalan ay magkasama.",
  "Ang salitang 'I love you' ay hindi tanong. Pero bakit masakit pag walang sagot.",
  "Tulungan mo ang sarili mo na makalimot. Wag mong tulungan ang sarili mong masaktan.",
  "Dapat matuto tayong bumitaw. Dahil mas okay ang maging malungkot ng panandalian kesa magmukhang tanga ng matagalan.",
  "Huwag kang malungkot kung iniwan ka niya ang mahalaga ay napadama mo sa kanya kung gaano mo sya kamahal.",
  "Kapag alam mong wala nang pagmamahal, wag mo nang ipagsiksikan ang sarili mo. Sa huli ikaw rin ang talo.",
  "Mas pipiliin kong ako na lang ang masaktan kaysa magkasama nga tayo pero sya naman ang hinahanap ng puso mo.",
  "Ginawa ang break-up para ilayo tayo sa maling tao na akala natin ay tama.",
  "Ang PAG-IBIG parang harutan. Minsan hindi mo maiiwasang hindi MASAKTAN.",
  "Hindi naman masamang maging selfish. May mga bagay lang talaga na hindi pwedeng may kahati.",
  "Kung hindi mo mahal ang isang tao, wag ka nang magpakita ng motibo para mahalin ka nya.",
  "Huwag mong bitawan ang bagay na hindi mo kayang makitang hawakan ng iba.",
  "Huwag mong hawakan kung alam mong bibitawan mo lang.",
  "Huwag na huwag ka hahawak kapag alam mong may hawak ka na.",
  "Wag magpakatanga sa PAG-IBIG. 'Cause GOD gave you REAL EYES to REALIZE the REAL LIES.",
  "Wag mong gawing soccer ang pag-ibig na pagkatapos mong sipain, saka mo hahabulin.",
  "Mahal mo? Ipaglaban mo parang pangarap mo.",
  "May mga bagay na masarap ingatan kahit hindi sayo. Parang ikaw, ang sarap mahalin kahit hindi tayo.",
  "Bakit ba naman kasi maglilihim kung pwede mo namang sabihin? Hindi yung kung kelan huli na ang lahat tsaka mo aaminin.",
  "Hindi lahat ng kaya mong intindihin ay katotohanan at hindi lahat ng hindi mo kayang intindihin ay kasinungalingan.",
  "Sa panahon ngayon, joke na ang totoo at promise na ang panloloko.",
  "Binabalewala mo siya tapos kapag nakita mo siyang masaya sa iba, masasaktan at magagalit ka. Ano ka, tanga?",
  "Kapag pagod ka na, bitawan mo na. Hindi yung nagpapaka-tanga ka madami pa namang mas better sa kanya.",
  "May mga feelings talaga na hanggang social media na lang.",
  "Pinakilig ka lang akala mo mahal ka na? Sige, assume pa!",
  "Hindi lahat ng nararamdaman ay dapat sabihin. Dahil hindi lahat ng sinasabi ay kayang maramdaman.",
  "Yung feeling na may narinig kang kanta, tapos naalala mo siya.",
  "Twitter ka ba? Bakit? Trending ka kasi sa puso ko.",
  "Sana gawin nang herbal medicine ang MAKAHIYA, para may gamot na sa mga taong MAKAKAPAL ANG MUKHA.",
  "Mas okay na yung friendship na parang may something, kaysa sa relationship na parang nothing.",
  "Matuto kang sumuko kapag nasasaktan ka na ng sobra. Minsan kasi ginagago ka na, kinikilig ka pa.",
  "May taong binigay ng Diyos para lang makilala mo at hindi para makasama mo.",
  "Lahat tayo binigyan ng pagkakataong maging tanga pero hindi porket libre ay araw-arawin mo na.",
  "Ang tunay na lalake nagbabago para sa babae, hindi yong pabago-bago ng babae.",
  "Sa love, 'di maiiwasan na may U-Turn. Yung akala mong dire-diretso na, may babalikan pa pala.",
  "Hintayin mo ang true love mo. Na-traffic lang yun sa malalanding tao.",
  "Hindi lahat ng patama tungkol sa'yo, sadyang natatamaan ka lang kasi!",
  "Ang daling matulog, ang hirap bumangon. Ang daling mahulog, ang hirap mag move on.",

  // Newly merged quotes (latest batch you added)
  "Hindi lahat ng gusto mo, makukuha mo.",
  "Pagdating sa pag-ibig, dapat handa ka sa posibilidad ng pagkakamali.",
  "Hindi lahat ng pangako ay natutupad, pero kailangan pa rin natin magtiwala.",
  "Kung may dahilan kung bakit hindi kayo pwede, dapat may dahilan din kung bakit kayo pwede.",
  "Ang sakit ng kailangan mong i-let go ang taong mahal mo.",
  "Ang pag-ibig ay parang laro, may nanalo, may natatalo.",
  "Kung hindi kayo para sa isa't isa, dapat malaman ninyong pareho para di na kayo magkulang pa.",
  "Hindi lahat ng pag-ibig ay nagtatagal, pero kung talagang mahal mo ang isang tao, dapat kayong magtulungan para magtagal.",
  "Sa mundo ng pag-ibig, walang rules, walang assurance, walang dapat mong asahan.",
  "Hindi lahat ng tao, pinapahalagahan ang pag-ibig.",
  "Hindi mo kailangang magpakatanga para lang mahalin.",
  "Mas masarap ang magmahal kapag alam mong mahal ka rin.",
  "Hindi ka man naging sila, pero sa puso mo sila pa rin.",
  "Ang pinakamasakit na parte ng pag-ibig ay yung alam mong masaya na siya kahit wala ka na sa kanyang buhay.",
  "Hindi lahat ng hugot ay tungkol sa pag-ibig.",
  "Sa pag-ibig, dapat may respeto at pagpapahalaga.",
  "Hindi porket masaya ka, dapat lahat masaya.",
  "Hindi lahat ng tao na mahal mo ay para sa iyo.",
  "Kung mahal mo talaga, kaya mong maghintay.",
  "Sa pag-ibig, dapat handa ka sa posibilidad na masaktan ka.",
  "Kung mahal mo, kailangan mo ring magpaka-totoo.",
  "Mahal mo man o hindi, dapat mong tanggapin ang katotohanan.",
  "Sa pag-ibig, hindi ka laging magiging priority.",
  "Minsan, kailangan mong magpaka-strong para sa sarili mo.",
  "Hindi ka man bagay sa kanya, pero sa iba ay baka mag-fit ka.",
  "Sa pag-ibig, kailangan ng effort at compromise.",
  "Kung hindi ka mahal ng taong mahal mo, wag ka magtiwala na mahal ka niya.",
  "Ang love parang bayad sa jeep, minsan hindi mo namamalayan, nasobrahan ka na pala.",
  "Hindi porket umiwas ako, hindi na kita mahal. Mahal kita, pero mahal ko rin ang sarili ko.",
  "Kapag mahal mo, laging handa kang magpakatanga.",
  "Ang pinakamasakit na breakup ay yung hindi kayo, pero feeling mo kayo.",
  "Masakit mawalan ng taong mahal mo, pero mas masakit mawalan ng sarili mo para sa kanya.",
  "Ang love hindi nauubos, nagmamahal lang ng iba.",
  "Huwag mong hayaang magtiis ang puso mo sa taong hindi ka naman kayang mahalin ng buo.",
  "Minsan ang taong akala mo sasalo sa'yo, siya pa ang magpapabagsak sa'yo.",
  "Kapag pinagbigyan mo ang lahat ng hiling ng mahal mo, baka naman sa huli, wala ka na ring matira para sa sarili mo.",
  "Kapag mahal mo ang isang tao, kaya mong ibigay ang lahat-lahat para sa kanya, kahit pa ang sarili mo.",
  "Hindi lahat ng tao sa buhay mo ay para sa'yo, kaya kailangan mong magpaka-inteligente at magpaka-mature.",
  "Kapag iniwan ka ng taong mahal mo, wag mong hingin ang dahilan kung bakit, dahil minsan, wala naman talagang dahilan.",
  "Mahal ko siya, pero hindi niya ako mahal. Masakit man, pero kailangan kong mag-move on.",
  "Kapag mahal mo ang isang tao, kailangan mo ring tanggapin ang kanyang mga pagkukulang at hindi lang ang mga kabutihan niya.",
  "Ang mga mata mo, parang cellphone load lang yan, kailangan mong mag-iingat sa paggamit dahil hindi ito unlimited.",
  "Kapag hindi ka mahal ng taong mahal mo, wag mong ipagpilitan ang sarili mo sa kanya.",
  "Mahal ko siya pero hindi na ko magpapakatanga pa sa kanya. Mas mahalaga na ang pagmamahal sa sarili ko.",
  "Ang pag-ibig ay parang sugal, hindi mo alam kung mananalo ka o matalo.",
  "Kapag nagmahal ka, dapat handa kang masaktan. Pero wag mo naman sanang ipagkait sa sarili mo ang pagkakataon na magmahal.",
  "Hindi lahat ng tao sa paligid mo ay totoo, kaya mag-ingat ka sa pagtitiwala.",
  "Kung mahal ka ng taong mahal mo, hindi mo na kailangan pang magpakatanga para sa kanya.",
  "Ang love parang math, kung hindi mo maintindihan, wag mo nang pilitin.",
  "Hindi lahat ng relasyon, dapat ipilit. May mga bagay talaga na hindi dapat pinipilit.",
  "Mas mahirap magmahal ng taong hindi nagpapakita ng pagmamahal sayo.",
  "Masakit maging pangalawa sa puso ng taong mahal mo.",
  "Ang puso ko ay nag-iisa, naghihintay ng taong magmamahal nang totoo.",
  "Kapag wala na, dun mo pa lang malalaman kung gaano siya kahalaga sa buhay mo.",
  "Hindi mo kailangang magpakatanga sa pag-ibig, dahil hindi yun ang tunay na pagmamahal.",
  "Mas maganda pang maging single kaysa maging miserable sa isang relasyon.",
  "Masakit kapag ikaw yung nagmamahal nang sobra, pero hindi ka naman pinapahalagahan.",
  "Kung mahal mo ang isang tao, bakit hindi mo siya ipaglaban?",
  "Kung hindi ka na masaya, huwag kang magpakatanga. Maraming ibang tao sa mundo na magmamahal sayo nang totoo.",
  "Ang sakit kapag ikaw yung iniiwan. Pero mas masakit kapag ikaw yung umaalis, pero hindi mo gusto.",
  "Hindi lahat ng pangako, dapat pinaniniwalaan. Kailangan mo ring mag-isip nang mabuti.",
  "Ang pinakamasakit na part sa pag-ibig, ay ang magmahal ng taong hindi ka kayang mahalin.",
  "Kung hindi ka masaya, huwag kang magpakasaya para lang sa kanya. Dahil hindi yun tunay na pagmamahal.",
  "Kapag nagmahal ka, huwag kang matakot magpakatotoo. Kailangan ng tao ng totoo at walang halong kasinungalingan.",
  "Sa pag-ibig, hindi sapat ang pagmamahal lang. Kailangan mo rin ng respeto at tiwala.",
  "Kapag may mahal ka, dapat mong alagaan at pahalagahan. Dahil hindi lahat ng pag-ibig, ibinibigay ng libre.",
  "Hindi lahat ng bagay, pwede mong makuha. Kailangan mo rin ng tiyaga at paghihirap.",
  "Kapag hindi ka na mahal ng taong mahal mo, mas mabuti nang magpaka-tanga sa umpisa pa lang.",
  "Masakit man, kailangan mong tanggapin na hindi kayo para sa isa't isa.",
  "Ang love parang laro, kung hindi ka marunong maglaro, hindi ka rin mananalo.",
  "Kapag mahal mo ang isang tao, dapat mong alamin kung anong kailangan niya. Hindi yung ikaw lang lagi ang nakikinabang.",
  "Sa pag-ibig, dapat walang tinatago. Kailangan ng tao ng transparency at honesty.",
  "Ang puso ko'y nagdurusa sa sobrang pagmamahal sa'yo.",
  "Walang magbabago kung hindi mo aaminin ang totoo sa sarili mo.",
  "Hindi lahat ng nakikita mo ay totoo, lalo na sa mga taong nasa paligid mo.",
  "Bakit ba ang hirap magmahal ng taong hindi ka naman kayang mahalin?",
  "Sana hindi mo na lang sinabi kung hindi mo rin naman pala kayang panindigan.",
  "Ang pag-ibig ay parang isang laro, hindi mo alam kung sino ang mananalo at mawawala.",
  "Minsan, kahit gaano mo kamahal ang isang tao, hindi pa rin sapat.",
  "Mahirap mag-move on kapag hindi mo pa rin kayang bitawan ang kahapon.",
  "Sana hindi na lang tayo nagtagpo kung alam mong magiging ganito lang ang ending.",
  "Nagpakatanga ako dahil sa'yo, pero ngayon alam kong hindi naman ako importante sa'yo.",
  "Hindi ko na alam kung saan ako lulugar kasi hindi ko na alam kung saan ako nagkulang.",
  "Hindi lahat ng tanong may sagot, lalo na kung tungkol sa pag-ibig.",
  "Ang pagmamahal ay hindi dapat pilitin, dahil darating at darating 'yon kung para sa'yo.",
  "Ang mga pangarap ko, lahat ng ito ay para sa'yo. Pero hindi ko alam kung gusto mo rin ba ako.",
  "Nakakapagod din naman maging magalang at maalaga sa taong hindi naman nagbibigay ng halaga sa'yo.",
  "Sana hindi na lang tayo nag-umpisang magkaibigan kung alam mong magiging masakit lang sa'kin.",
  "Hindi lahat ng pagkakamali ay dapat pinaparusahan, lalo na kung ang pagkakamali mo ay magmahal ng sobra.",
  "Napapagod na ako sa paulit-ulit na pag-asa sa taong hindi naman nagbibigay ng halaga sa'kin.",
  "Masakit isipin na ang taong pinakamamahal mo ay hindi naman pala para sa'yo.",
  "Kahit gaano mo pa kamahal ang isang tao, kung hindi ka naman kayang mahalin, wala ring kwenta.",
  "Minsan, hindi mo alam na mahal mo na pala ang isang tao hanggang sa wala na siya sa'yo.",
  "Hindi mo maaaring mahalin ang isang tao nang sobra-sobra, dahil sa bandang huli, ikaw rin ang masasaktan.",
  "Hindi ko alam kung paano ko maiiwasan na mahalin ka pa rin kahit hindi ka naman para sa'kin.",
  "Ang pagmamahal ay hindi dapat pinipilit, dahil kung hindi para sa'yo, hindi talaga para sa'yo.",

  // Latest additional batch you asked to add (kept original order, duplicates removed)
  "Lahat tayo napapagod. Wag mong hintayin na mawala pa siya sa buhay mo bago mo siya pahalagahan.",
  "Yung naghihintay ka sa isang bagay na imposible namang mangyari.",
  "Masakit isipin na dahil sa isang pangyayari hindi na kayo pwedeng maging tulad ng dati.",
  "Yung akala mo minahal ka niya pero hindi pala.",
  "Sana tinuruan mo 'ko kung paano madaling makalimot tulad ng ginawa mong paglimot sa'kin.",
  "Buti pa ang ngipin nabubunot kapag masakit. Sana ang puso ganun din.",
  "Umiiyak ka na naman? I-break mo na kasi!",
  "Ayaw ko nang magmahal masasaktan lang ulet ako.",
  "Di magatatagal yan! Lahat kaya may hangganan.",
  "Di naman siya mahal niyan. Assuming lang talaga yan!",
  "Ba't naman sinagot mo? Lolokohin ka lang niyan!",
  "Naku po hindi ka nyan mahal! Piniperahan ka lang niyan!",
  "Niloloko ka na ang saya mo pa? Binobola ka na lang nyan nagpapaloko ka naman! Tsk!",
  "Sus! Walang poreber uy! Maghihiwalay lang din kayo. (Advance ako mag-isip eh!)",
  "Hindi ba sila nahihiya? Can they have some privacy? PDA pa more!",
  "Yan panay kasi FB bagsak ka tuloy. Break mo na yan!",
  "Yikes! Makapaglandian to the highest level! Di na nahiya!",
  "Gawing mong posible ang imposible. Kumilos kung gusto mong mangyare, ganun lang ka simple.",
  "Tatlong salita lang ang kailangan mo para sa buhay kahit gaano kahirap: It Goes On.",
  "Alam ko marami akong naging pagkakamali sa buhay ko, pero salamat LORD kasi hindi mo ako pinabayaan at hinding-hindi mo ako iniwan.",
  "Nararapat lamang na mahalin ang tao at gamitin ang mga bagay, at wag na wag mong gagamitin ang tao dahil mahal mo ang mga bagay.",
  "Wag kang mag-alala kung sa tingin mo maraming naninira sayo, isipin mo na lang na sadyang INGGIT lang sila sa kung anong narating mo.",
  "Nalaman kong habang lumalaki ka, maraming beses kang madadapa. Bumangon ka man ulit o hindi, magpapatuloy ang buhay, iikot ang mundo, at mauubos ang oras.",
  "Wag kang matakot magkamali. Walang mawawala kung di ka magbabakasakali.",
  "Lahat ng PROBLEMA, may SOLUSYON, kaya SMILE lang.",
  "Ang buhay ay parang Adidas at Nike lang… “Nothing is impossible” so “Just Do It”.",
  "Ang buhay, parang gulong, minsan nasa itaas ka, minsan naman ay nasa ilalim.",
  "Walang mangyayari sa buhay natin kung papairalin ang hiya at takot sa paggawa ng mga bagay na kaya naman nating gawin.",
  "Lagi mong tandaan kahit gaano pa ka USELESS ang tingin mo sa sarili mo, isa ka pa rin sa mga rason kung bakit may mga masayang tao.",
  "Matuto kang PUMIKIT ng hindi MAINGGIT. Hindi yung lait ka ng lait.",
  "Lahat tayo ay may problema, pagandahan na lang ng pagdadala.",
  "Kapag hinusgahan ka nila, Hayaan mo sila! Gawin mo na lang itong inspirasyon para maging mas matatag ka.",
  "Ang pinakamalaking pagkakamali na maaaring gawin ng isang tao, ay ang patuloy na isipin na gagawa siya ng mali.",
  "Kapag nadapa ka, Bumangon ka! Tandaan mo, May pagkakataon ka pa para ipakita sa kanila na hindi sa lahat ng pagkakataon, TAMA sila!",
  "Wag mong sanayin ang sarili mo sa pagsisinungaling, kasi baka dumting yung araw na ikaw mismo sa sarili mo di ka na naniniwala.",
  "Hndi dapat laging nagmamadali, dahil lahat ay may tamang panahon. Ang mga bagay na madaling makuha ay ang mga bagay na madali ding mawala.",
  "Sa mundong ito, gumawa ka man ng mabuti o masama may ipupuna sila. So do what makes you happy!",
  "Lahat ng bagay, pinaghihirapan. ‘Di matamis ang tagumpay kapag walang paghihirap na naranasan.",
  "Kung wala kang nagagawa sa kinatatayuan mo ngayon, wala ka ring magagawa sa kung saan mo man gusto pumunta.",
  "Wag kang magpapaapekto sa sinasabi ng iba, tuloy lang ang buhay.",
  "Magpahinga kung kelangan, pero wag kang susuko.",
  "Hindi ako nagbago. Natututo lang ako. Hindi kasi pwedeng habambuhay tanga tayo.",
  "Hindi mo kailangang magpakita ng pusod at hindi mo kailangang naka-todo make up. Dahil ang tunay na maganda, ngiti palang, pamatay na.",
  "Hindi mo kailangan makipagsabayan sa iba para masabing gwapo ka. Dahil ang tunay na gwapo, ugali muna ang inaayos bago ang itsura.",
  "Wag kang mag-alala kung sa tingin mo maraming naninira sa'yo. Isipin mo na lang na sadyang inggit sila sa kung anong narating mo.",
  "Hindi lahat ng tahimik ay nasa loob ang kulo. Sila kasi yung tipo ng tao na marunong mag-isip bago muna kumibo.",
  "Kung normal kang tao dapat aware ka sa nararamdaman ng iba. Kapag alam mong nakakasakit ka na, titigil ka na.",
  "Ang tunay na kaibigan, magalit man hindi nangbubunyag ng sekreto yan.",
  "Ang pagkakaibigan hindi nasusukat sa haba ng pinagsamahan kundi sa mga panahong hinding-hindi ka iiwan kapag kailangan.",
  "Hindi sa lahat ng pagkakataon BAD INFLUENCE ang TROPA! Sadyang may mga bagay lang na masarap gawin kapag sila ang KASAMA.",
  "Ang mga KAIBIGAN ay parang mga prutas. May dalawang klase yan, ang SEASONAL at FOR ALL SEASONS.",
  "Ang tunay na kaibigan, mas bitter pa sayo kapag nalamang sinaktan ka ng taong mahal mo.",
  "Hindi lahat ng kaibigan, dapat pinapayuhan. Minsan kailangan mo lang silang batukan para matauhan.",
  "Ang tunay na kaibigan kahit busog pa yan, pag nanglibre ka, kakain at kakain yan.",
  "Ang tunay na kaibigan ay hindi nagagalit kapag ininsulto mo. Sa halip ay mag-iisip sila ng mas nakaka-insultong salita na ibabato sayo.",
  "Ang tunay na kaibigan ay parang magnet. Didikit sa bakal pero hindi sa plastik.",
  "Ang tunay na kaibigan ay alam na alam kung paano ka sisirain pero hinding-hindi niya gagawin.",
  "Lahat naman tayo dumadaan sa problema. Pero dapat dumaan ka lang, wag kang tumambay.",
  "Wag mo hayaang sumasabay ka lang sa agos ng dagat, minsan, dapat ikaw mismo ang kokontrol ng direksyon nito.",
  "Kung lahat ng makakaya mo ay iyong ibinibigay, tagumpay mo'y walang kapantay.",
  "Hindi mahalaga kung gaano ka katagal nabuhay, ang mahalaga ay kung paano ka nabuhay.",
  "Ang negatibong tao ay nakakakita ng problema sa bawat pagkakataon. Ang positibong tao ay nakikita ang pagkakataon sa bawat problema.",
  "Wag kang matakot na maging ikaw. Tandaan mo: ang pagiging orig ay mas maganda kaysa sa fake.",
  "Hindi mo na kailangan ng ibang tao para magkusa ka, kung gusto mo talagang magtagumpay, sapat na yung ikaw mismo ang magkusa para sa ikabubuti mo.",
  "Ang mga taong agad sumusuko ay hindi nananalo. Ang mga taong laging panalo ay hindi kailan man sumusuko.",
  "Lahat ng problema nasusulusyunan, kailangan mo lang tumayo at harapin yung mga bagay na dapat dati mo pa hinarap.",
  "“Tapusin ang dapat tapusin nang may masimulan namang bago.” —Eros S. Atalia",
  "Ang bawat kabiguan sa buhay ay paraan para patuloy kang magpursigi kahit na sa tingin mo naabot mo na lahat ng yong mga pangarap.",
  "Ang tunay na sikreto sa tagumpay ay pagsisikap at patuloy na pagbangon sa bawat pagkakamali.",
  "Huwag kang malungkot kapag may pagsubok, dahil pagkatapos nito ay may tagumpay.",
  "Ang pagkabigo ginagamit yan para matuto hindi para muling magpauto.",
  "Kapag may problema, iiyak mo lang tapos tama na. Punas luha. Ayos damit. Suklay buhok. Tapos smile. Tuloy ang ikot ng mundo.",
  "Ang tagumpay ay hindi nasusukat sa dami ng karangalan na iyong natamo, kundi sa dami ng pagsubok na iyong nalalagpasan sa araw-araw.",
  "Lahat kaya mong abutin kung magtitiwala ka sa sarili mong kakayahan.",
  "Lahat tayo ay may problema, pagandahan na lang ng pagdadala. Lahat ng problema, may solusyon, kaya smile lang.",
  "Lagi mong tandaan kahit gaano pa ka useless ang tingin mo sa sarili mo, isa ka pa rin sa mga rason kung bakit may mga masayang tao.",
  "Kapag hinusgahan ka nila, hayaan mo sila! Gawin mo na lang itong inspirasyon para maging mas matatag ka.",
  "Kapag nadapa ka, bumangon ka! Tandaan mo, may pagkakataon ka pa para ipakita sa kanila na hindi sa lahat ng pagkakataon, tama sila!",
  "Hindi dapat laging nagmamadali, dahil lahat ay may tamang panahon. Ang mga bagay na madaling makuha ay ang mga bagay na madali ding mawala.",
  "Hindi mawawala sa buhay ng tao ang masaktan. Dahil dyan ka magiging matatag at matututo sa mga bagay-bagay.",
  "Pahalagahan mo ang pamilyang meron ka dahil hindi sa lahat ng pagkakataon ay nariyan sila.",
  "Ipagpasalamat sa Diyos ang iyong pamilya.",
  "Sa panahon ng kagipitan, may pamilya kang masasandalan.",
  "Ipagtanggol ang dangal iyong pamilya sa abot ng iyong makakaya.",
  "ABROAD. Salitang masarap pakinggan pero dyan mo din mararanasan ang paghihirap na di mo inaasahan.",
  "Ang aking anak ang syang dahilan bakit ako nakipagsasapalaran sa ibang bansa. Para mabigyan ko siya ng magandang kinabukasan.",
  "Pagod at hirap na kaming magtrabaho dito sa abroad! Ang pamilya pa ang nagtatanong bakit wala ka naipon?",
  "Kapag nasa abroad akala nila ang dami mong pera. Ang di nila alam resibo na lang ang nasa iyo tapos yung kamay mo pa puro kalyo.",
  "Hindi lahat ng OFW mayaman. Yung iba kasi inuuna yung yabang at nagmamayaman lang.",
  "Kapag umuwi ang OFW wag ka agad mag-expect ng pasalubong. Bakit nung umalis ba sila may hiningi sila sa'yo?",
  "Hindi ATM o money transfer ang OFW na lalapitan mo lang pag may kailangan ka.",
  "Walang salitang PAGOD NA AKO sa isang magulang na OFW. Basta para sa kinabukasan nang ANAK lahat kinakaya gaano man kahirap.",
  "Babuti pa ang salary buwan-buwan umuwi sa pamilya. Samantalang ang nagtattabaho aboad minsanan lang umuwi.",
  "Nag-abroad ka para guminhawa ang buhay ng iyong pamilya hindi para magkaroon ng ibang pamilya!",
  "Congrats nga pala sa career mong wagi. Good luck na lang sa lovelife mong sawi.",
  "Bakit pag umiinom tayo ng isang basong tubig parang ang hirap? Pero pag umiinom tayo ng redhorse kahit isang case parang kulang pa? Bakit ganon?",
  "Wala naman talagang taong panget. Nagkataon lang na ang mukha nila ay di pa uso sa panahon ngayon.",
  "Bakit pag late ka, pumapasok yung prof mo? Pero pag hindi ka late wala naman yung prof mo? Bakit ganon? Unfair!!!!!",
  "Nakakainis kayo lagi niyo na lang ako tinatapakan. Hindi na ba magbabago ang pagtingin niyo sakin? —Doormat",
  "Kapag mahal na araw, wag kang lalabas ng bahay. Baka may masalubong kang pusang itim, mamalasin ka! Advance ako magisip.",
  "Sinabihan ka lang ng maganda, naniwala ka naman? Mangungutang lang yan!",
  "Yung ugali, hindi required iterno sa mukha. Kung panget mukha mo, pwede bang gandahan mo naman ugali mo?",
  "Pag nagka amnesia ang bakla, makakalimutan ba niyang bading siya?",
  "Na-Columbia Kala mo sa'yo yun pala hindi.",
  "Mahirap magpaalam sa taong mahal mo, pero mas mahirap magpaalam pag galit ang nanay mo.",
  "Kamote. Minsan halaman, minsan ikaw!",
  "Simple lang naman ang paraan para hindi ka na mahirapan sa job interview: Wag kang mag apply! Diyan ka na lang sa bahay at maging palamunin ni nanay.",
  "Dati ang magaganda pinagkakaguluhan ng mga lalaki. Ngayon ang magaganda kinikilatis muna. Baka kasi BEKI!",
  "Kapag may gusto ka sa isang tao, dapat sabihin mo na habang maaga pa. Kasi pag gabi na tulog na yun!",
  "Feel na feel i-post yung picture niya sa harap ng salamin sa CR. Anong gusto mong iparating? Na pretty ka pa rin pagkatapos mong jumebs???",
  "Yung katawan ang tindi ng alindog. Pero yung mukha nakakausog!",
  "Ang common sense minsan parang deodorant; kung sino pa yung mas higit na nangangailangan, sila pa ang hindi gumagamit.",
  "Mahirap talaga pag Linggo ko lang o kaya isang araw lang ang pahinga. Pag nagpahinga ka kasi iisipin mo hindi ka man lang nakapasyal. Pag namasyal ka naman, iisipin mo hindi ka man lang nakapahinga.",
  "…"
];

    const hugotAuthors = [
      "Lalake Po Ako"
    ];
    
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
        const apiParams = ['title', 'website', 'design', 'w', 'h', 'imageData', 'val'];
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
              case 'imageData': imageData = decodeURIComponent(paramValue); break;
              case 'val': val = paramValue; break;
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
      try {
        title = decodeURIComponent(rawParams.title || 'Sample Title');
      } catch (e) {
        // If decodeURIComponent fails, try double decode or use as-is
        try {
          title = decodeURIComponent(decodeURIComponent(rawParams.title || 'Sample Title'));
        } catch (e2) {
          title = rawParams.title || 'Sample Title';
        }
      }
    }
    if (website === '') {
      try {
        website = decodeURIComponent(rawParams.website || '');
      } catch (e) {
        try {
          website = decodeURIComponent(decodeURIComponent(rawParams.website || ''));
        } catch (e2) {
          website = rawParams.website || '';
        }
      }
    }
    if (design === 'default') {
      design = rawParams.design || 'default';
    }
    if (imageData === '') {
      imageData = rawParams.imageData || '';
    }
    if (val === '') {
      val = rawParams.val || '';
    }
    // Support both 'image' and 'imgurl' parameters
    if (imageUrl === 'https://picsum.photos/800/600') {
      imageUrl = rawParams.image || rawParams.imgurl || imageUrl;
    }
    
    // Parse highlight colors parameter (comma-separated hex colors or color names)
    const hlParam = rawParams.hl || '';
    let highlightColors = [];
    if (hlParam) {
      highlightColors = hlParam.split(',').map(c => c.trim());
    }
    
    // Parse website color parameter (single color name or hex)
    const wcParam = rawParams.wc || '';
    let websiteColorOverride = '';
    if (wcParam) {
      // Color name mapping
      const colorMap = {
        'gold': '#FFD700',
        'orange': '#FF8C00',
        'cyan': '#00FFFF',
        'electricblue': '#1E90FF',
        'electric-blue': '#1E90FF',
        'softyellow': '#F4E04D',
        'soft-yellow': '#F4E04D',
        'lavender': '#C084FC',
        'limegreen': '#00FF4C',
        'lime-green': '#00FF4C',
        'lime': '#00FF4C',
        'red': '#FF0000',
        'royalblue': '#003CFF',
        'royal-blue': '#003CFF',
        'magenta': '#FF00C8',
        'vibrantyellow': '#FFEA00',
        'vibrant-yellow': '#FFEA00',
        'gray': '#E0E0E0',
        'grey': '#E0E0E0',
        'lightgray': '#D3D3D3',
        'lightgrey': '#D3D3D3',
        'silver': '#C0C0C0',
        'white': '#FFFFFF'
      };
      
      const normalizedColor = wcParam.toLowerCase().replace(/\s+/g, '');
      websiteColorOverride = colorMap[normalizedColor] || wcParam.trim();
    }
    
    // Parse border color parameter (bc) for image border
    const bcParam = rawParams.bc || '';
    let borderColor = '#FFD700'; // Default to gold/yellow
    if (bcParam) {
      // Use same color mapping as website color
      const colorMap = {
        'gold': '#FFD700',
        'orange': '#FF8C00',
        'cyan': '#00FFFF',
        'electricblue': '#1E90FF',
        'electric-blue': '#1E90FF',
        'softyellow': '#F4E04D',
        'soft-yellow': '#F4E04D',
        'lavender': '#C084FC',
        'limegreen': '#00FF4C',
        'lime-green': '#00FF4C',
        'lime': '#00FF4C',
        'red': '#FF0000',
        'royalblue': '#003CFF',
        'royal-blue': '#003CFF',
        'magenta': '#FF00C8',
        'vibrantyellow': '#FFEA00',
        'vibrant-yellow': '#FFEA00',
        'gray': '#E0E0E0',
        'grey': '#E0E0E0',
        'lightgray': '#D3D3D3',
        'lightgrey': '#D3D3D3',
        'silver': '#C0C0C0',
        'white': '#FFFFFF'
      };
      
      const normalizedColor = bcParam.toLowerCase().replace(/\s+/g, '');
      borderColor = colorMap[normalizedColor] || bcParam.trim();
    }
    
    // Parse line color parameter (lc) for horizontal lines around website text
    const lcParam = rawParams.lc || '';
    let lineColor = '#FF8C00'; // Default to orange
    if (lcParam) {
      // Use same color mapping as website color
      const colorMap = {
        'gold': '#FFD700',
        'orange': '#FF8C00',
        'cyan': '#00FFFF',
        'electricblue': '#1E90FF',
        'electric-blue': '#1E90FF',
        'softyellow': '#F4E04D',
        'soft-yellow': '#F4E04D',
        'lavender': '#C084FC',
        'limegreen': '#00FF4C',
        'lime-green': '#00FF4C',
        'lime': '#00FF4C',
        'red': '#FF0000',
        'royalblue': '#003CFF',
        'royal-blue': '#003CFF',
        'magenta': '#FF00C8',
        'vibrantyellow': '#FFEA00',
        'vibrant-yellow': '#FFEA00',
        'gray': '#E0E0E0',
        'grey': '#E0E0E0',
        'lightgray': '#D3D3D3',
        'lightgrey': '#D3D3D3',
        'silver': '#C0C0C0',
        'white': '#FFFFFF'
      };
      
      const normalizedColor = lcParam.toLowerCase().replace(/\s+/g, '');
      lineColor = colorMap[normalizedColor] || lcParam.trim();
    }
    
    // Parse show border parameter (sb) - true by default, set to false or 0 to hide
    const sbParam = rawParams.sb || 'true';
    const showBorder = sbParam !== 'false' && sbParam !== '0' && sbParam !== 'no';
    
    // Check if we should use quote designs and generate random quotes
    // This will generate a NEW quote on every request/refresh when val parameter is present
    const isQuoteDesign = ['quote1', 'quote2', 'quote3'].includes(design);
    if (isQuoteDesign && val === 'InspirationTagalog') {
      const randomIndex = Math.floor(Math.random() * tagalogQuotes.length);
      title = tagalogQuotes[randomIndex];
      website = tagalogAuthors[randomIndex];
      console.log('🇵🇭 Generated random Tagalog inspirational quote on request:', title);
    } else if (isQuoteDesign && val === 'HugotTagalog') {
      const randomIndex = Math.floor(Math.random() * hugotQuotes.length);
      title = hugotQuotes[randomIndex];
      website = hugotAuthors[randomIndex % hugotAuthors.length];
      console.log('💔 Generated random Hugot quote on request:', title);
    } else if (isQuoteDesign && val === 'babaeTagalog') {
      const randomIndex = Math.floor(Math.random() * tagalogQuotes.length);
      title = tagalogQuotes[randomIndex];
      website = tagalogAuthors[randomIndex];
      console.log('💕 Generated random Babae Tagalog quote on request:', title);
    }
    
    console.log('🔗 Reconstructed image URL:', imageUrl);
    console.log('📦 Image Data parameter length:', imageData ? imageData.length : 0);
    console.log('📝 Parameters:', { title, website, design, val, w, h });
    console.log('🎨 Highlight colors:', highlightColors.length > 0 ? highlightColors : 'Using default palette');
    console.log('🎨 Website color override:', websiteColorOverride || 'Using design default');
    
    // CRITICAL DIAGNOSTIC: Verify font cache at request time
    // CRITICAL FIX: Read Bebas Neue font directly from filesystem for Vercel compatibility
    const bebasNeueFontPath = path.join(process.cwd(), 'public', 'fonts', 'BebasNeue-Regular.ttf');
    console.log('🔍 Bebas Neue font path:', bebasNeueFontPath);
    console.log('🔍 Bebas Neue font exists:', fs.existsSync(bebasNeueFontPath));
    
    let bebasNeueBase64 = fontBase64Cache.bebasNeue;
    if (fs.existsSync(bebasNeueFontPath)) {
      bebasNeueBase64 = `data:font/ttf;base64,${fs.readFileSync(bebasNeueFontPath).toString('base64')}`;
      console.log('✅ Bebas Neue loaded from filesystem, base64 length:', bebasNeueBase64.length);
    } else {
      console.log('⚠️ Bebas Neue file not found, using cache');
    }
    
    console.log('🔍 Font cache status at request time:');
    console.log('  - bebasNeue cached:', !!fontBase64Cache.bebasNeue);
    console.log('  - bebasNeue runtime:', !!bebasNeueBase64);
    console.log('  - anton cached:', !!fontBase64Cache.anton);
    if (bebasNeueBase64) {
      console.log('  - bebasNeue length:', bebasNeueBase64.length, 'chars');
      console.log('  - bebasNeue starts with:', bebasNeueBase64.substring(0, 50));
    } else {
      console.log('  ❌ WARNING: bebasNeue font NOT loaded!');
    }
    
    const image = imageData ? null : (imageUrl.startsWith('http') ? imageUrl : decodeURIComponent(imageUrl));

    // Get design theme configuration
    const selectedDesign = DESIGN_THEMES[design] || DESIGN_THEMES['default'];
    
    // Apply website color override if provided
    if (websiteColorOverride) {
      selectedDesign.websiteColor = websiteColorOverride;
      console.log('🎨 Selected Design Theme:', selectedDesign.name, '(with custom website color:', websiteColorOverride + ')');
    } else {
      console.log('🎨 Selected Design Theme:', selectedDesign.name);
    }

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

    console.log('📥 Processing image input...');
    let imageBuffer;
    let useBlankBackground = false;
    
    // Special handling for blank and antonTransparent designs - always create transparent background
    if (design === 'blank' || design === 'antonTransparent') {
      console.log('🎨 Creating transparent background for transparent design (text-only overlay)');
      useBlankBackground = true;
      imageBuffer = await sharp({
        create: {
          width: targetWidth,
          height: targetHeight,
          channels: 4, // RGBA for transparency
          background: { r: 0, g: 0, b: 0, alpha: 0 } // Fully transparent
        }
      }).png().toBuffer();
      console.log('✅ Transparent background created:', imageBuffer.length, 'bytes');
    } else if (imageData) {
      // Priority: imageData > image URL > blank background for quotes
      console.log('📦 Processing base64 image data:', imageData.substring(0, 50) + '...');
      try {
        // Handle base64 data with or without data URI prefix
        let base64Data = imageData;
        if (imageData.startsWith('data:')) {
          // Extract base64 part from data URI (e.g., "data:image/jpeg;base64,/9j/4AAQ...")
          const base64Match = imageData.match(/^data:image\/[^;]+;base64,(.+)$/);
          if (base64Match) {
            base64Data = base64Match[1];
            console.log('📦 Extracted base64 data from data URI');
          } else {
            throw new Error('Invalid data URI format');
          }
        }
        
        imageBuffer = Buffer.from(base64Data, 'base64');
        console.log('✅ Binary data processed:', imageBuffer.length, 'bytes');
      } catch (error) {
        console.log('⚠️ Failed to process binary data:', error.message);
        throw new Error('Invalid base64 image data: ' + error.message);
      }
    } else {
      // Check if image URL is empty or just whitespace for quote designs
      const isQuoteDesign = ['quote1', 'quote2', 'quote3'].includes(design);
      const isEmptyImage = !image || image.trim() === '' || image === 'undefined' || image === 'null';
      
      if (isQuoteDesign && isEmptyImage) {
        console.log('🎨 Creating blank background for quote design:', design);
        useBlankBackground = true;
        
        // Define background colors for each quote design
        let backgroundColor;
        switch (design) {
          case 'quote1':
            backgroundColor = { r: 0, g: 0, b: 0 }; // Pure black
            break;
          case 'quote2':
            backgroundColor = { r: 30, g: 30, b: 30 }; // Dark charcoal
            break;
          case 'quote3':
            backgroundColor = { r: 10, g: 10, b: 10 }; // Very dark for gradient effect
            break;
          default:
            backgroundColor = { r: 0, g: 0, b: 0 }; // Default black
        }
        
        imageBuffer = await sharp({
          create: {
            width: targetWidth,
            height: targetHeight,
            channels: 3,
            background: backgroundColor
          }
        }).jpeg().toBuffer();
        console.log('✅ Blank background created for', design, ':', imageBuffer.length, 'bytes');
      } else {
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
      }
    }

    // Debug: Check imageBuffer before processing
    console.log('🔍 Debug imageBuffer:', {
      isDefined: imageBuffer !== undefined,
      isNull: imageBuffer === null,
      type: typeof imageBuffer,
      isBuffer: Buffer.isBuffer(imageBuffer),
      length: imageBuffer ? imageBuffer.length : 0
    });

    if (!imageBuffer) {
      throw new Error('Image buffer is undefined or null. Image URL: ' + image + ', imageData: ' + (imageData ? 'present' : 'not present'));
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
    const padding = (design === 'entertainment' || design === 'antonBlack' || design === 'antonBlack1' || design === 'antonTransparent' || design === 'antonTransparent2' || design === 'antonWhite' || design === 'bebas') ? 15 : (design === 'cinematic' || design === 'vintage') ? 30 : 80; // Minimal padding for entertainment, antonBlack, antonBlack1, antonTransparent, antonTransparent2, antonWhite, and bebas to maximize text spread
    const contentWidth = targetWidth - (padding * 2); // Available width for text
    
    // Function to detect emphasis keywords and create highlight segments with multi-color support
    function parseHighlights(text, maxHighlights = 3) {
      // Common emphasis keywords to automatically highlight (fallback list)
   const emphasisKeywords = [
  '120HZ', '144HZ', '5G READY', 'ADVANCED', 'AI CAMERA', 'AI ENHANCED', 'AI FEATURES',
  'AI POWERED', 'AI SMART MODE', 'AI-READY', 'AI-GENERATED', 'COPYRIGHTED', 'COPYRIGHT', 'PROBE', 'PROBES', 'ALERT', 'AMAZING', 'AMOLED', 'ANTUTU SCORE',
  'BATTERY BOOST', 'BATTERY DRAIN TEST', 'BATTERY TEST', 'BENCHMARK', 'BETA', 'BEST',
  'BEZEL-LESS DISPLAY', 'BIG UPDATE', 'BLUETOOTH 5.4', 'BONUS', 'BOOSTED', 'BREAKING',
  'BREAKING TECH', 'BREAKTHROUGH', 'BUDGET KING', 'CAMERA SAMPLES', 'CAMERA TEST',
  'CAMERA UPGRADE', 'CERTIFICATION SPOTTED', 'CHARGING TEST', 'CHIPSET UPGRADE',
  'CHROMEBOOK', 'COMING SOON', 'CONFIRMED', 'CRITICAL UPDATE', 'CURVED DISPLAY',
  'CLOUD POWERED', 'CPU BOOST', 'DEVICE', 'DISPLAY TECH', 'DOLBY ATMOS', 'DONT MISS',
  'DURABILITY', 'EARLY ACCESS', 'ECO TECH', 'ENHANCED', 'ESPORTS READY', 'EXCLUSIVE',
  'FAST CHARGING', 'FEATURED', 'FCC LISTING', 'FIRMWARE', 'FIRST IMPRESSIONS',
  'FIRST LOOK', 'FIRST SALE', 'FIRST IN PH', 'FLASH DEAL', 'FOLDABLE TECH', 'FREE',
  'FULL REVIEW', 'GADGET', 'GAMING MODE', 'GAMING RIG', 'GAMING TEST', 'GAME CHANGER',
  'GEEKBENCH SCORE', 'GEN', 'GLOBAL LAUNCH', 'GRAPHICS POWER', 'GREEN TECH',
  'HANDS-ON', 'HANDS-ON REVIEW', 'HDR10+', 'HIGHLIGHT', 'HI-RES AUDIO', 'HOT', 
  'HOT DEAL', 'HOT UPDATE', 'INCREDIBLE', 'INNOVATION', 'INSANE', 'IP68 WATERPROOF',
  'IP54 DUSTPROOF', 'IR BLASTER', 'JUST IN', 'LAUNCH', 'LAUNCH EVENT', 'LEAKED',
  'LEAKED PHOTOS', 'LEAKED RENDERS', 'LATEST TECH', 'LATEST UPDATE', 'LAPTOP',
  'LIMITED', 'LIMITED STOCK', 'LIVE', 'MAJOR UPGRADE', 'MAX', 'MEGA SALE', 'MEDIATEK',
  'MODEL APPROVED', 'MUST SEE', 'NFC', 'NEW', 'NEW FEATURE', 'NEW MODEL APPROVED',
  'NEW UPDATE', 'NEXT GEN', 'NIGHT MODE BOOST', 'NOW', 'OFFICIAL', 'OFFICIAL IMAGES',
  'ON-DEVICE AI', 'OPTIMIZED', 'PATCH', 'PATCH NOTES', 'PC-LEVEL POWER',
  'PERFORMANCE', 'PERFORMANCE MODE', 'PERISCOPE CAMERA', 'PH LAUNCH', 'PLUS',
  'PREORDER', 'PRICE DROP', 'PRO', 'RAY TRACING', 'REAL-WORLD TEST', 'REVEALED',
  'REVOLUTIONARY', 'ROLLING OUT', 'RTX POWERED', 'SALE', 'SATELLITE CONNECTIVITY',
  'SATELLITE SOS', 'SECURITY PATCH', 'SLIM BEZELS', 'SMARTPHONE', 'SMARTWATCH',
  'SNAPDRAGON', 'SOFTWARE UPDATE', 'SPECS', 'SPECIAL', 'SPOTLIGHT', 'STABLE',
  'STARTS NOW', 'STEAL PRICE', 'STEREO SPEAKERS', 'SUPERCHARGE', 'SUPERCHARGED',
  'SUSTAINABLE TECH', 'SYSTEM UPDATE', 'TABLET', 'TECH', 'TECH ALERT',
  'TEARDOWN', 'TENAA LISTING', 'THERMAL BOOST', 'THERMAL TEST', 'TOP', 'TRENDING',
  'TRENDING TECH', 'TURBO CHARGE', 'TURBO MODE', 'TYPE-C', 'UFS 4.0', 'ULTRA',
  'ULTRA CLEAR', 'ULTRA WIDE', 'ULTIMATE', 'UNBELIEVABLE', 'UNBOXING', 'UPDATE',
  'URGENT', 'USB-C', 'VIRAL', 'WATERPROOF', 'WEARABLE', 'WIFI 7', 'WIN', 
  
  
   'APPLE', 'SAMSUNG', 'HUAWEI', 'OPPO', 'VIVO', 'XIAOMI', 'ONEPLUS', 'REALME', 'LENOVO', 'ASUS', 'DELL', 'HP', 'MICROSOFT', 'GOOGLE', 'SONY', 'LG', 'ACER', 'NOKIA', 'MOTOROLA', 'AMAZON', 'META', 'TESLA', 'INTEL', 'AMD', 'NVIDIA', 'ROG', 'RAZER', 'PULSAR', 'ALCATEL', 'BLACKBERRY',
   'BROADCOM', 'HTC', 'ZTE', 'SIEGE', 'HONOR', 'VODAFONE', 'TCL', 'FUJITSU', 'PANASONIC', 'SHARP', 'SPECK', 'LOGITECH', 'KINGSTON', 'SANDISK', 'SEAGATE', 'WD', 'CRUCIAL', 'TP-LINK', 'NETGEAR',
   'TRUMP','ORACLE','SHELL','EXXON','CHEVRON','BP','TOTALENERGIES','SAUDIARAMCO','IBM','SAP','SIEMENS','BOEING','LOCKHEEDMARTIN','RAYTHEON','NORTHROPCORP','GENERALDYNAMICS','BAE','BAIDU','ALIBABA','JD.COM','TENCENT','NETEASE',
   'CRYPTO', 'BITCOIN', 'ETHEREUM', 'BLOCKCHAIN', 'NFT', 'METAVERSE', 'DEFI', 'WEB3',
   'DOORDASH', 'UBER', 'LYFT', 'SPOTIFY', 'NETFLIX', 'DISNEY+', 'HULU', 'AMAZON PRIME', 'HBO MAX', 'PEACOCK',
   'TESLA', 'SPACE-X', 'NEURALINK', 'THE BORING COMPANY',
   'RIVIAN', 'LUCID', 'NIRO', 'FISKER', 'BYD', 'XPENG', 'NIO',
   'CHATGPT', 'DALLE', 'MIDJOURNEY', 'STABLEDIFFUSION', 'OPENAI',
   'DISNEY', 'PIXAR', 'MARVEL', 'STAR WARS', 'LUCASFILM',
   'ADOBE', 'PHOTOSHOP', 'ILLUSTRATOR', 'PREMIERE PRO', 'AFTER EFFECTS',
   'LIGHTROOM', 'INDESIGN', 'XD', 'ACROBAT',
   'GOOGLE MAPS', 'YOUTUBE', 'GMAIL', 'GOOGLE DRIVE', 'GOOGLE DOCS',
   'MICROSOFT OFFICE', 'WORD', 'EXCEL', 'POWERPOINT', 'OUTLOOK',
   'CISCO', 'VMWARE', 'REDHAT', 'UBUNTU', 'DEBIAN',
   'KUBERNETES', 'DOCKER', 'JENKINS', 'GITHUB', 'GITLAB',
   'AWS', 'AZURE', 'GOOGLE CLOUD', 'CLOUDFLARE',
   '4K', '8K', 'HDR', 'OLED', 'QLED', 'MINILED',
   '5NM', '3NM', 'NANOMETER', 'FINFET', 'GAAFET',
   'LITHIUM-ION', 'SOLID-STATE', 'GRAPHENE BATTERY',
   'HOME CREDIT', 'NUBIA', 'INFINIX', 'TECNO', 'ITEL',

    'AI-RELATED', 'AI-DRIVEN', 'AI-POWERED', 'AI-ENHANCED', 'AI-ASSISTED',
    'MACHINE LEARNING', 'DEEP LEARNING', 'NEURAL NETWORKS', 'NATURAL LANGUAGE PROCESSING',
    'COMPUTER VISION', 'GENERATIVE AI', 'AI MODELS', 'AI ALGORITHMS',
    'ETHICAL AI', 'EXPLAINABLE AI', 'AI SAFETY', 'AI GOVERNANCE',

    'BITGO', 'COINBASE', 'BINANCE', 'KRAKEN', 'FTX', 'BLOCKFI', 'CELSIUS',
    'CRYPTO.COM', 'LEDGER', 'TREZOR',

    'WHITE HOUSE', 'CONGRESS', 'SENATE', 'HOUSE OF REPRESENTATIVES', 'SUPREME COURT',
    'UNITED NATIONS', 'NATO', 'WORLD BANK', 'IMF',

    'WEALTHFRONT', 'ROBINHOOD', 'ETRADE', 'SCHWAB', 'Fidelity', 'VANGUARD',
    'CHEGG', 'COURSE HERO', 'UDACITY', 'COURSERA', 'EDX',

    'GERMANY', 'FRANCE', 'ITALY', 'SPAIN', 'PORTUGAL', 'NETHERLANDS', 'BELGIUM',
    'SWITZERLAND', 'AUSTRIA', 'SWEDEN', 'NORWAY', 'DENMARK', 'FINLAND', 'POLAND',
    'CZECHIA', 'HUNGARY', 'GREECE', 'TURKEY', 'RUSSIA', 'UKRAINE',

    'GCASH', 'PAYMAYA', 'GRABPAY', 'LAZADA PAY', 'SHOPEE PAY',
    'NFTS', 'METAVERSES', 'DEFI PLATFORMS', 'WEB3 APPLICATIONS',

    'MAYA', 'GCASH', 'PAYMAYA', 'LAZADA PAY', 'SHOPEE PAY',
    'K-DRAMA', 'K-POP', 'WEBTOONS', 'MANHWA', 'MANHUA',

   'WOW'
];
      
      // Stopwords to ignore
      const stopwords = new Set([
        'THE', 'A', 'AN', 'AND', 'OR', 'BUT', 'IN', 'ON', 'AT', 'TO', 'FOR',
        'OF', 'WITH', 'BY', 'FROM', 'AS', 'IS', 'WAS', 'ARE', 'BEEN', 'BE',
        'HAVE', 'HAS', 'HAD', 'DO', 'DOES', 'DID', 'WILL', 'WOULD', 'COULD',
        'SHOULD', 'MAY', 'MIGHT', 'CAN', 'THIS', 'THAT', 'THESE', 'THOSE'
      ]);
      
      // High-impact words with semantic weight scores
      const impactWords = {
        // Power words (weight: 10)
        'LIMITLESS': 10, 'UNLIMITED': 10, 'REVOLUTIONARY': 10, 'BREAKTHROUGH': 10,
        'EXCLUSIVE': 10, 'PREMIUM': 10, 'ULTIMATE': 10, 'GUARANTEED': 10,
        
        // Tech/Modern (weight: 9)
        'AI': 9, 'SMART': 9, 'INSTANT': 9, 'SECURE': 9, 'ADVANCED': 9,
        'INNOVATIVE': 9, 'CUTTING-EDGE': 9, 'NEXT-GEN': 9, 'AUTOMATED': 9,
        
        // Urgency (weight: 8)
        'NOW': 8, 'TODAY': 8, 'URGENT': 8, 'BREAKING': 8, 'ALERT': 8,
        'LIVE': 8, 'IMMEDIATE': 8, 'FLASH': 8, 'LIMITED': 8,
        
        // Value (weight: 8)
        'FREE': 8, 'SAVE': 8, 'BONUS': 8, 'SPECIAL': 8, 'DEAL': 8,
        'DISCOUNT': 8, 'OFFER': 8, 'PROMO': 8, 'SALE': 8,
        
        // Quality (weight: 7)
        'BEST': 7, 'TOP': 7, 'PREMIER': 7, 'ELITE': 7, 'PRO': 7,
        'PROFESSIONAL': 7, 'CERTIFIED': 7, 'VERIFIED': 7, 'TRUSTED': 7,
        
        // Emotion/Impact (weight: 7)
        'AMAZING': 7, 'INCREDIBLE': 7, 'STUNNING': 7, 'POWERFUL': 7,
        'EPIC': 7, 'LEGENDARY': 7, 'VIRAL': 7, 'TRENDING': 7,
        
        // Scale (weight: 6)
        'MASSIVE': 6, 'HUGE': 6, 'MEGA': 6, 'SUPER': 6, 'EXTREME': 6,
        'MAXIMUM': 6, 'TOTAL': 6, 'COMPLETE': 6, 'FULL': 6,
        
        // Achievement (weight: 6)
        'WIN': 6, 'WINNER': 6, 'SUCCESS': 6, 'ACHIEVE': 6, 'MASTER': 6,
        'EXPERT': 6, 'CHAMPION': 6, 'LEADER': 6,
        
        // Experience (weight: 5)
        'EXPERIENCE': 5, 'DISCOVER': 5, 'EXPLORE': 5, 'UNLOCK': 5,
        'TRANSFORM': 5, 'UPGRADE': 5, 'ENHANCE': 5, 'OPTIMIZE': 5
      };
      
      // Function to score a phrase
      function scorePhrase(phrase) {
        const words = phrase.split(' ').filter(w => w.length > 0);
        let score = 0;
        let hasImpact = false;
        let maxWordScore = 0;
        
        for (const word of words) {
          const upper = word.toUpperCase();
          
          // Skip stopwords
          if (stopwords.has(upper)) continue;
          
          let wordScore = 0;
          
          // Add impact word score
          if (impactWords[upper]) {
            wordScore = impactWords[upper];
            hasImpact = true;
          } else if (emphasisKeywords.includes(upper)) {
            wordScore = 5;
            hasImpact = true;
          } else {
            // Base score for non-stopwords
            wordScore = 2;
          }
          
          // Track highest individual word score
          maxWordScore = Math.max(maxWordScore, wordScore);
          
          // Bonus for longer meaningful words
          if (word.length >= 6) wordScore += 1;
          if (word.length >= 8) wordScore += 1;
          
          score += wordScore;
        }
        
        // CRITICAL: For single words with high impact (8+), boost score significantly
        // This ensures "LIMITLESS" alone beats "LIMITLESS POTENTIAL TODAY"
        if (words.length === 1 && maxWordScore >= 8) {
          score = score * 2.0; // Moderate boost for single high-impact words
        }
        
        // For 2-word phrases, check if they form a semantic unit
        if (words.length === 2) {
          const phrase2 = phrase.toUpperCase();
          // Semantic pairs that work better together
          const semanticPairs = [
            'SECURE PAYMENT', 'PAYMENT SYSTEM', 'BEST DEALS', 'SALE PRICE',
            'FREE SHIPPING', 'LIMITED TIME', 'BREAKING NEWS', 'FLASH SALE',
            'TOP RATED', 'PREMIUM QUALITY', 'EXCLUSIVE OFFER', 'SPECIAL DISCOUNT'
          ];
          
          if (semanticPairs.includes(phrase2)) {
            score = score * 2.2; // Very strong boost for semantic pairs (beats single words)
          } else {
            // Penalty for non-semantic pairs
            score = score * 0.7;
          }
        }
        
        // Penalty for 3+ words (usually too long)
        if (words.length >= 3) {
          score = score * 0.5; // Heavy penalty for long phrases
        }
        
        // Penalty for too long character-wise
        if (phrase.length > 18) score -= 3;
        
        return hasImpact ? score : 0;
      }
      
      // Clean text for processing (remove special chars but keep structure)
      const cleanText = text.replace(/[%$#@!]/g, '').trim();
      
      // Split by colon or dash to prioritize right segment
      let textSegments = [cleanText];
      if (cleanText.includes(':')) {
        textSegments = cleanText.split(':').map(s => s.trim());
      } else if (cleanText.includes(' - ')) {
        textSegments = cleanText.split(' - ').map(s => s.trim());
      } else if (cleanText.includes(' – ')) {
        textSegments = cleanText.split(' – ').map(s => s.trim());
      }
      
      // Prioritize right-hand segment if split (e.g., "Amazing Sale: Save Up to 50" -> prioritize "Save Up to 50")
      if (textSegments.length > 1) {
        textSegments = [textSegments[textSegments.length - 1], ...textSegments.slice(0, -1)];
      }
      
      // Find top N phrases across all segments
      const phraseCandidates = [];
      
      for (const segment of textSegments) {
        const words = segment.split(' ').filter(w => w.length > 0);
        
        // Try 1-word, 2-word, and 3-word phrases (prioritize shorter)
        for (let len = 1; len <= Math.min(3, words.length); len++) {
          for (let i = 0; i <= words.length - len; i++) {
            const phrase = words.slice(i, i + len).join(' ');
            const score = scorePhrase(phrase);
            
            if (score >= 5) { // Only consider phrases with meaningful impact
              phraseCandidates.push({
                phrase: phrase,
                score: score,
                startIndex: cleanText.indexOf(phrase),
                length: len
              });
            }
          }
        }
      }
      
      // Sort by score (descending) and remove overlapping phrases
      phraseCandidates.sort((a, b) => b.score - a.score);
      
      // Convert text to words array for proper word-based indexing
      const allWords = cleanText.split(' ').filter(w => w.length > 0);
      
      const selectedPhrases = [];
      const usedWordIndices = new Set();
      
      for (const candidate of phraseCandidates) {
        // Check if this phrase overlaps with already selected phrases
        const phraseWords = candidate.phrase.split(' ').filter(w => w.length > 0);
        
        // Find word index position of this phrase in the text
        let phraseWordIndex = -1;
        for (let i = 0; i <= allWords.length - phraseWords.length; i++) {
          const potentialMatch = allWords.slice(i, i + phraseWords.length).join(' ').toUpperCase();
          if (potentialMatch === candidate.phrase.toUpperCase()) {
            phraseWordIndex = i;
            break;
          }
        }
        
        if (phraseWordIndex === -1) continue;
        
        // Check if any word in this phrase is already used
        let overlaps = false;
        for (let i = 0; i < phraseWords.length; i++) {
          if (usedWordIndices.has(phraseWordIndex + i)) {
            overlaps = true;
            break;
          }
        }
        
        if (!overlaps) {
          selectedPhrases.push({
            ...candidate,
            wordIndex: phraseWordIndex
          });
          
          // Mark all words in this phrase as used
          for (let i = 0; i < phraseWords.length; i++) {
            usedWordIndices.add(phraseWordIndex + i);
          }
          
          if (selectedPhrases.length >= maxHighlights) break;
        }
      }
      
      // Fallback: if no phrases found, get single best
      const bestPhrase = selectedPhrases.length > 0 ? selectedPhrases[0].phrase : null;
      const bestScore = selectedPhrases.length > 0 ? selectedPhrases[0].score : 0;
      
      // If no good phrase found (score < 5), fallback to old keyword-based
      if (bestScore < 5) {
        const words = text.split(' ').filter(w => w.length > 0);
        const fallbackSegments = [];
        
        words.forEach((word, index) => {
          const isEmphasis = emphasisKeywords.includes(word.toUpperCase().replace(/[%$#@!]/g, ''));
          fallbackSegments.push({
            text: word,
            highlight: isEmphasis,
            isLastWord: index === words.length - 1
          });
        });
        
        return fallbackSegments;
      }
      
      // Build segments with multiple phrases highlighted, each with its own color index
      // Use original text for display, but clean for comparison
      const words = text.split(' ').filter(w => w.length > 0);
      const resultSegments = [];
      
      let i = 0;
      while (i < words.length) {
        let matched = false;
        
        // Check each selected phrase for a match at this position
        for (let phraseIdx = 0; phraseIdx < selectedPhrases.length; phraseIdx++) {
          const phrase = selectedPhrases[phraseIdx].phrase;
          const phraseWords = phrase.split(' ').filter(w => w.length > 0);
          
          // Clean current words for comparison (remove special chars, case-insensitive)
          const currentSlice = words.slice(i, i + phraseWords.length);
          const cleanedSlice = currentSlice.map(w => w.replace(/[%$#@!]/g, '').toUpperCase()).join(' ');
          const cleanedPhrase = phrase.toUpperCase();
          
          if (cleanedSlice === cleanedPhrase && currentSlice.length === phraseWords.length) {
            // Highlight the entire phrase with its color index (using original words with special chars)
            for (let j = 0; j < currentSlice.length; j++) {
              resultSegments.push({
                text: words[i + j],
                highlight: true,
                colorIndex: phraseIdx, // Assign color based on phrase ranking
                isLastWord: (i + j) === words.length - 1
              });
            }
            i += phraseWords.length;
            matched = true;
            break;
          }
        }
        
        if (!matched) {
          // Regular word
          resultSegments.push({
            text: words[i],
            highlight: false,
            colorIndex: -1,
            isLastWord: i === words.length - 1
          });
          i++;
        }
      }
      
      return resultSegments;
    }
    
    // Function to wrap text into multiple lines - NO ELLIPSIS, accept all text
    function wrapText(text, maxWidth, fontSize) {
      const words = text.split(' ');
      const lines = [];
      let currentLine = '';
      
      // More accurate character width estimation for Noto Sans
      // For entertainment, antonBlack, antonTransparent, antonTransparent2, antonWhite, and bebas designs, use narrower char width for better spreading
      const avgCharWidth = (design === 'entertainment' || design === 'antonBlack' || design === 'antonBlack1' || design === 'antonTransparent' || design === 'antonTransparent2' || design === 'antonWhite' || design === 'bebas') ? fontSize * 0.45 : fontSize * 0.55;
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
    const gapBetweenTitleAndWebsite = website ? 25 : 0; // No gap if no website
    const websiteTextSize = website ? selectedDesign.websiteSize : 0; // No size if no website
    
    // Calculate title start position (ensure integers)
    let titleStartY, websiteY, svgHeight, titleEndY;
    
    if (design === 'quote1' || design === 'quote2' || design === 'quote3') {
      // Center the text vertically in the middle of the image for quote overlay
      const totalContentHeight = totalTitleHeight + gapBetweenTitleAndWebsite + websiteTextSize;
      const centerY = Math.round(targetHeight / 2);
      titleStartY = Math.round(centerY - (totalContentHeight / 2) + (lineHeight * 0.8));
      websiteY = website ? Math.round(titleStartY + totalTitleHeight + gapBetweenTitleAndWebsite) : 0;
      titleEndY = Math.round(titleStartY + totalTitleHeight);
      svgHeight = targetHeight; // Use full image height for quote overlay
    } else {
      // Default positioning - text at bottom
      titleStartY = Math.round(topMargin + (lineHeight * 0.8)); // Start from top with margin
      
      // Calculate website position based on where title ends (ensure integers)
      titleEndY = Math.round(titleStartY + totalTitleHeight);
      
      // Adjust website positioning for designs with accent elements
      if (website) {
        websiteY = Math.round(titleEndY + gapBetweenTitleAndWebsite);
        if (design === 'anime') {
          // For anime design, add extra space after the accent line (15px line position + 20px gap)
          websiteY = Math.round(titleEndY + 15 + 25); // accent line at +15, website at +40 from title end
        }
      } else {
        websiteY = titleEndY; // No extra space if no website
      }
      
      // Calculate dynamic SVG height to fit all content (ensure integers)
      const bottomMargin = 20;
      const contentBottom = website ? websiteY + bottomMargin + 10 : titleEndY + bottomMargin;
      svgHeight = Math.round(Math.max(200, contentBottom)); // Minimum 200px, or calculated height
    }
    
    // Generate design-specific gradient stops
    const gradientStops = selectedDesign.gradientColors && selectedDesign.gradientColors.length > 0 
      ? selectedDesign.gradientColors.map((color, index) => {
          // Distribute gradient stops evenly from 0% to 100%
          const offset = selectedDesign.gradientColors.length === 1 
            ? '100%' 
            : `${Math.round((index / (selectedDesign.gradientColors.length - 1)) * 100)}%`;
          return `<stop offset="${offset}" style="stop-color:${color}"/>`;
        }).join('')
      : ''; // Empty for transparent designs

    // Generate embedded font-face declarations with explicit family names for Sharp
    const fontFaceDeclarations = `
      @font-face {
        font-family: 'Noto Sans';
        font-weight: 400;
        font-style: normal;
        font-display: block;
        src: url('${fontBase64Cache.notoRegular || ''}') format('truetype');
      }
      @font-face {
        font-family: 'Noto Sans';
        font-weight: 700;
        font-style: normal;
        font-display: block;
        src: url('${fontBase64Cache.notoBold || ''}') format('truetype');
      }
      @font-face {
        font-family: 'Inter';
        font-weight: 400;
        font-style: normal;
        font-display: block;
        src: url('${fontBase64Cache.interRegular || ''}') format('truetype');
      }
      @font-face {
        font-family: 'Inter';
        font-weight: 700;
        font-style: normal;
        font-display: block;
        src: url('${fontBase64Cache.interBold || ''}') format('truetype');
      }
      @font-face {
        font-family: 'Bebas Neue';
        font-weight: 400;
        font-style: normal;
        font-display: block;
        src: url('${bebasNeueBase64 || fontBase64Cache.bebasNeue || ''}') format('truetype');
      }
      @font-face {
        font-family: 'Anton';
        font-weight: 400;
        font-style: normal;
        font-display: block;
        src: url('${fontBase64Cache.anton || ''}') format('truetype');
      }
      @font-face {
        font-family: 'Impact';
        font-weight: 400;
        font-style: normal;
        font-display: block;
        src: url('${fontBase64Cache.impact || ''}') format('truetype');
      }
      @font-face {
        font-family: 'Oswald';
        font-weight: 700;
        font-style: normal;
        font-display: block;
        src: url('${fontBase64Cache.oswaldBold || ''}') format('truetype');
      }
      @font-face {
        font-family: 'Montserrat';
        font-weight: 800;
        font-style: normal;
        font-display: block;
        src: url('${fontBase64Cache.montserratExtraBold || ''}') format('truetype');
      }
      @font-face {
        font-family: 'League Spartan';
        font-weight: 800;
        font-style: normal;
        font-display: block;
        src: url('${fontBase64Cache.leagueSpartanBold || ''}') format('truetype');
      }
      @font-face {
        font-family: 'Raleway';
        font-weight: 900;
        font-style: normal;
        font-display: block;
        src: url('${fontBase64Cache.ralewayHeavy || ''}') format('truetype');
      }
      @font-face {
        font-family: 'Roboto Condensed';
        font-weight: 700;
        font-style: normal;
        font-display: block;
        src: url('${fontBase64Cache.robotoCondensedBold || ''}') format('truetype');
      }
      @font-face {
        font-family: 'Poppins';
        font-weight: 800;
        font-style: normal;
        font-display: block;
        src: url('${fontBase64Cache.poppinsExtraBold || ''}') format('truetype');
      }
      @font-face {
        font-family: 'Playfair Display';
        font-weight: 900;
        font-style: normal;
        font-display: block;
        src: url('${fontBase64Cache.playfairDisplayBlack || ''}') format('truetype');
      }
    `;

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
          ${fontBase64Cache.notoBold || fontBase64Cache.notoRegular ? fontFaceDeclarations : ''}
          
          .title-text { 
            font-family: "${selectedDesign.fontFamily || 'Noto Sans'}", "Bebas Neue", "Anton", "Noto Sans Bold", "Inter Bold", "Noto Sans", "Inter", Arial, sans-serif; 
            font-size: ${selectedDesign.titleSize}px; 
            font-weight: ${selectedDesign.fontWeight || '700'};
            font-style: normal;
            fill: ${selectedDesign.titleColor}; 
            text-anchor: middle;
            dominant-baseline: middle;
            word-spacing: normal;
            letter-spacing: ${design === 'tech' ? '2px' : '1px'};
            ${design === 'tech' ? 'filter: url(#glow);' : ''}
          }
          
          /* Generate dynamic highlight color classes from URL parameter or use defaults */
          ${(() => {
            const defaultColors = ['#FFD700', '#FF8C00', '#00FFFF', '#1E90FF', '#F4E04D', '#C084FC', '#00FF4C', '#FF0000', '#003CFF', '#FF00C8', '#FFEA00'];
            const colors = highlightColors.length > 0 ? highlightColors : defaultColors;
            return colors.slice(0, 11).map((color, idx) => {
              // Extract RGB for glow effect
              const hexToRgb = (hex) => {
                const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
                return result ? {
                  r: parseInt(result[1], 16),
                  g: parseInt(result[2], 16),
                  b: parseInt(result[3], 16)
                } : { r: 255, g: 215, b: 0 };
              };
              const rgb = hexToRgb(color);
              return `
          .highlight-${idx} {
            font-family: "${selectedDesign.fontFamily || 'Bebas Neue'}", "Bebas Neue", "Anton", "Noto Sans Bold", "Inter Bold", Arial, sans-serif;
            font-weight: ${selectedDesign.fontWeight || '900'};
            fill: ${color};
            filter: drop-shadow(0 0 8px rgba(${rgb.r},${rgb.g},${rgb.b},0.6));
          }`;
            }).join('');
          })()}
          
          .website-text { 
            font-family: "${selectedDesign.fontFamily || 'Noto Sans'}", "Bebas Neue", "Anton", "Noto Sans Bold", "Inter Bold", "Noto Sans", "Inter", Arial, sans-serif; 
            font-size: ${selectedDesign.websiteSize}px; 
            font-weight: ${selectedDesign.fontWeight || '700'};
            font-style: normal;
            fill: ${selectedDesign.websiteColor}; 
            text-anchor: middle;
            dominant-baseline: middle;
            letter-spacing: ${design === 'sports' ? '3px' : '2px'};
            text-transform: uppercase;
          }
          .bold-text {
            font-family: "Noto Sans Bold", "Inter Bold", "Noto Sans", "Inter", Arial, sans-serif;
            font-weight: 700;
            font-style: normal;
            stroke: rgba(0,0,0,0.3);
            stroke-width: 1.5px;
            paint-order: stroke fill;
            filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));
          }
          ${design === 'boldblue' ? `
          .boldblue-title {
            font-family: "Noto Sans", "Inter", Arial, sans-serif;
            font-weight: 700;
            stroke: rgba(0,0,0,0.4);
            stroke-width: 2px;
            paint-order: stroke fill;
            filter: drop-shadow(0 3px 10px rgba(0,0,0,0.6));
            letter-spacing: 1px;
          }
          .boldblue-website {
            font-family: "Noto Sans", "Inter", Arial, sans-serif;
            font-weight: 700;
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
          ${design === 'antonTransparent' ? `
          .anton-transparent-shadow {
            filter: drop-shadow(7px 6px 14px rgba(0,0,0,1));
          }` : ''}
          ${design === 'antonTransparent2' ? `
          .anton-transparent2-shadow {
            filter: drop-shadow(7px 6px 14px rgba(0,0,0,1));
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
            font-family: "Noto Sans", "Inter", Arial, sans-serif;
            font-weight: 700;
            stroke: rgba(0,0,0,0.4);
            stroke-width: 2px;
            paint-order: stroke fill;
            filter: drop-shadow(0 6px 16px rgba(0,0,0,0.6));
            letter-spacing: 1px;
          }
          .bold-website {
            font-family: "Noto Sans", "Inter", Arial, sans-serif;
            font-weight: 700;
            letter-spacing: 3px;
          }
          .bold-vignette {
            fill: url(#boldVignette);
            opacity: 0.4;
          }` : ''}
          
          /* Critical: Force font-family on tspan elements for Sharp/librsvg compatibility on Linux */
          tspan {
            font-family: "${selectedDesign.fontFamily || 'Bebas Neue'}", "Bebas Neue", "Anton", Arial, sans-serif;
            font-style: normal;
            font-weight: ${selectedDesign.fontWeight || '400'};
          }
        </style>
        
        <!-- Dynamic Design Gradient Background -->
        ${design === 'antonTransparent' || design === 'blank' ? '' : 
          (useBlankBackground && ['quote1', 'quote2', 'quote3'].includes(design)) ? 
            (design === 'quote3' ? '<rect width="100%" height="100%" fill="url(#dynamicGradient)"/>' : '') : // quote3 gets subtle gradient even on blank, others get none
            '<rect width="100%" height="100%" fill="url(#dynamicGradient)"/>' // Normal gradient overlay for images
        }
        
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

        <!-- Breaking News Label (above title) with white background -->
        <rect x="${Math.round(targetWidth / 2 - 180)}" y="${Math.round(titleStartY - 110)}" width="360" height="50" fill="#FFFFFF" rx="4"/>
        <text x="${Math.round(targetWidth / 2)}" y="${Math.round(titleStartY - 63)}" fill="#FF0000" font-family="Anton, Bebas Neue, Arial, sans-serif" font-size="32" font-weight="900" text-anchor="middle" letter-spacing="2px">BREAKING NEWS</text>

        <!-- Title Text Lines - Center aligned with design-specific styling -->
        ${titleLines.map((line, index) => {
          // Determine classes for bold designs
          const boldDesigns = ['boldblue', 'bold', 'energetic', 'popart', 'viral'];
          const isBoldDesign = boldDesigns.includes(design);
          const classes = [
            'title-text',
            design === 'neon' ? 'neon-glow' : '',
            design === 'warmbrown' ? 'warm-shadow' : '',
            design === 'antonTransparent' ? 'anton-transparent-shadow' : '',
            design === 'antonTransparent2' ? 'anton-transparent2-shadow' : '',
            design === 'pokemon' ? 'pokemon-title' : '',
            design === 'bold' ? 'bold-title' : '',
            design === 'boldblue' ? 'boldblue-title' : '',
            isBoldDesign ? 'bold-text' : ''
          ].filter(Boolean).join(' ');
          
          // For bebas design with highlights enabled, parse and render with tspan
          if (design === 'bebas' && selectedDesign.enableHighlight) {
            // Extended color palette with more vibrant emphasis colors
            // Gold, Orange, Cyan, Electric Blue, Soft Yellow, Lavender, Lime Green, Red, Royal Blue, Magenta, Vibrant Yellow
            const defaultColors = ['#FFD700', '#FF8C00', '#00FFFF', '#1E90FF', '#F4E04D', '#C084FC', '#00FF4C', '#FF0000', '#003CFF', '#FF00C8', '#FFEA00'];
            const colors = highlightColors.length > 0 ? highlightColors : defaultColors;
            const maxHighlights = Math.min(colors.length, 11); // Increased to support more highlights
            
            // Get font attributes from design config for explicit tspan attributes
            const fontFamily = selectedDesign.fontFamily || 'Bebas Neue';
            const fontWeight = selectedDesign.fontWeight || '400';
            
            const segments = parseHighlights(line, maxHighlights);
            const tspanContent = segments.map(seg => {
              let className = '';
              if (seg.highlight && seg.colorIndex >= 0 && seg.colorIndex < maxHighlights) {
                className = `highlight-${seg.colorIndex}`;
              }
              const space = seg.isLastWord ? '' : ' ';
              // CRITICAL FIX: Add explicit font-family="Anton" to every tspan
              // This ensures Sharp/librsvg on Linux (Vercel) renders the correct embedded font
              // Anton font is more compatible than Bebas Neue on production environments
              return `<tspan class="${className}" font-family="Anton" font-style="normal" font-weight="400">${seg.text}</tspan>${space}`;
            }).join('');
            return `<text x="${Math.round(targetWidth / 2)}" y="${Math.round(titleStartY + (index * lineHeight))}" class="${classes}">${tspanContent}</text>`;
          }
          
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
        
        <!-- Website Text with Horizontal Lines - Centered with decorative lines -->
        ${website ? (() => {
          // Calculate text width estimation for centering
          const estimatedTextWidth = websiteText.length * selectedDesign.websiteSize * 0.6;
          const lineY = Math.round(websiteY);
          const lineThickness = 3; // Thickness of the lines
          const gapFromText = 10; // Gap between line and text (reduced for tighter spacing)
          const borderInset = 10; // Match the border inset
          
          // Calculate positions - lines stretch from border to border
          const textX = Math.round(targetWidth / 2);
          const leftLineStart = borderInset; // Start at border edge
          const leftLineEnd = Math.round(textX - estimatedTextWidth / 2 - gapFromText);
          const rightLineStart = Math.round(textX + estimatedTextWidth / 2 + gapFromText);
          const rightLineEnd = targetWidth - borderInset; // End at border edge

          return `
        <!-- Decorative lines around website text - stretching to borders -->
        <line x1="${leftLineStart}" y1="${lineY}" x2="${leftLineEnd}" y2="${lineY}" stroke="${lineColor}" stroke-width="${lineThickness}" stroke-linecap="round"/>
        <line x1="${rightLineStart}" y1="${lineY}" x2="${rightLineEnd}" y2="${lineY}" stroke="${lineColor}" stroke-width="${lineThickness}" stroke-linecap="round"/>
        
        <text x="${textX}" y="${Math.round(websiteY)}" class="website-text ${design === 'pokemon' ? 'pokemon-website' : ''} ${design === 'bold' ? 'bold-website' : ''} ${design === 'boldblue' ? 'boldblue-website' : ''} ${['boldblue', 'bold', 'energetic', 'popart', 'viral'].includes(design) ? 'bold-text' : ''}" text-anchor="middle">${websiteText}</text>
        `;
        })() : ''}
        
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
    console.log('🔍 SVG total length:', svg.length, 'chars');
    
    // CRITICAL DIAGNOSTIC: Check if base64 fonts are in SVG
    const fontDataIndex = svg.indexOf('data:font');
    console.log('🔍 Font data position in SVG:', fontDataIndex);
    if (fontDataIndex > -1) {
      console.log('🔍 Font data sample:', svg.substring(fontDataIndex, fontDataIndex + 150));
    } else {
      console.log('❌ WARNING: No base64 font data found in SVG!');
    }
    
    // Check for Bebas Neue specifically
    const bebasIndex = svg.indexOf('Bebas Neue');
    console.log('🔍 "Bebas Neue" occurrences in SVG:', (svg.match(/Bebas Neue/g) || []).length);
    console.log('🔍 First "Bebas Neue" at position:', bebasIndex);
    
    // Log tspan structure for bebas design
    if (design === 'bebas') {
      const tspanMatches = svg.match(/<tspan[^>]*>/g);
      console.log('🔍 Number of tspan elements:', tspanMatches ? tspanMatches.length : 0);
      if (tspanMatches && tspanMatches.length > 0) {
        console.log('🔍 First tspan:', tspanMatches[0]);
        console.log('🔍 Last tspan:', tspanMatches[tspanMatches.length - 1]);
      }
    }
    
    // Convert SVG to buffer
    const svgBuffer = Buffer.from(svg, 'utf-8');
    console.log('🔍 SVG buffer size:', svgBuffer.length, 'bytes');
    
    console.log('⚡ Compositing with Sharp...');
    
    // For blank and antonTransparent designs, create transparent PNG instead of compositing on image
    let finalImage;
    if (design === 'blank' || design === 'antonTransparent') {
      console.log('🎨 Creating transparent PNG for transparent design...');
      // Create just the SVG as transparent PNG (no background image)
      finalImage = await sharp(svgBuffer)
        .png()
        .toBuffer();
      console.log('✅ Transparent PNG generated:', finalImage.length, 'bytes');
    } else {
      // Composite the SVG onto the image (ensure integer positioning)
      const compositeTop = (design === 'quote1' || design === 'quote2' || design === 'quote3') ? 0 : Math.round(targetHeight - svgHeight);
      
      // Prepare composite layers array
      const compositeLayers = [
        {
          input: svgBuffer,
          left: 0,
          top: compositeTop,
          blend: 'over'
        }
      ];
      
      // Add border layer only if showBorder is true
      if (showBorder) {
        const borderSvg = `<svg width="${targetWidth}" height="${targetHeight}" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="${targetWidth - 20}" height="${targetHeight - 20}" fill="none" stroke="${borderColor}" stroke-width="2" rx="0"/>
        </svg>`;
        const borderBuffer = Buffer.from(borderSvg, 'utf-8');
        
        compositeLayers.push({
          input: borderBuffer,
          left: 0,
          top: 0,
          blend: 'over'
        });
      }
      
      finalImage = await processedImage
        .composite(compositeLayers)
        .jpeg({ quality: 90 })
        .toBuffer();
        
      console.log('✅ Final image generated:', finalImage.length, 'bytes');
    }
    
    // Set response headers with proper filename and content length
    const contentType = (design === 'blank' || design === 'antonTransparent') ? 'image/png' : 'image/jpeg';
    const fileExtension = (design === 'blank' || design === 'antonTransparent') ? 'png' : 'jpg';
    
    // Generate unique filename with timestamp and random string
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const uniqueFilename = `${design}-overlay-${timestamp}-${randomString}.${fileExtension}`;
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${uniqueFilename}"`);
    res.setHeader('Content-Length', String(finalImage.length));
    
    // Cache control based on val parameter
    if (val === 'InspirationTagalog' || val === 'HugotTagalog') {
      // Disable caching for random quote generation to ensure fresh content on every refresh
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    } else if (val === 'igpost') {
      // Cache for 60 seconds for Instagram posts
      res.setHeader('Cache-Control', 'public, max-age=60');
    } else {
      // Default cache for 5 minutes
      res.setHeader('Cache-Control', 'public, max-age=300');
    }
    
    res.setHeader('X-Font-System', 'bundled-fonts');
    res.setHeader('X-Design-Theme', selectedDesign.name);
    
    // Log successful usage (disabled while authentication is off)
    /*
    await logUsage({
      apiKeyId: key.id,
      endpoint: '/api/bundled-font-overlay',
      method: req.method,
      status: 200,
      latencyMs: Date.now() - startTime,
      bytesOut: finalImage.length,
      metadata: {
        theme: design,
        hasCustomImage: !!imageUrl,
        width: w,
        height: h,
        outputFormat: contentType
      }
    });
    */
    
    console.log(`✅ Request completed in ${Date.now() - startTime}ms`);
    
    // Send the image
    res.send(finalImage);
    
  } catch (error) {
    console.error('❌ Font overlay generation failed:', error);
    
    // Log failed usage (disabled while authentication is off)
    /*
    await logUsage({
      apiKeyId: key.id,
      endpoint: '/api/bundled-font-overlay',
      method: req.method,
      status: 500,
      latencyMs: Date.now() - startTime,
      errorMessage: error.message,
      metadata: {
        theme: design || 'unknown',
        error: error.stack?.substring(0, 500)
      }
    });
    */
    
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