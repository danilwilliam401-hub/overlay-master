import sharp from 'sharp';
import https from 'https';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { protectApiRoute } from '../../lib/apiKeyAuth';
import { logUsage } from './usage/log';

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

function loadFontAsBase64(fontPath, fontName) {
  try {
    if (fs.existsSync(fontPath)) {
      const fontBuffer = fs.readFileSync(fontPath);
      const base64Font = fontBuffer.toString('base64');
      console.log(`✅ Loaded ${fontName}: ${Math.round(base64Font.length / 1024)}KB`);
      return `data:font/truetype;charset=utf-8;base64,${base64Font}`;
    } else {
      console.log(`❌ Font not found: ${fontPath}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Error loading ${fontName}:`, error.message);
    return null;
  }
}

console.log('🔤 Loading fonts as base64...');
fontBase64Cache = {
  notoRegular: loadFontAsBase64(fontFiles.notoRegular, 'Noto Sans Regular'),
  notoBold: loadFontAsBase64(fontFiles.notoBold, 'Noto Sans Bold'),
  interRegular: loadFontAsBase64(fontFiles.interRegular, 'Inter Regular'),
  interBold: loadFontAsBase64(fontFiles.interBold, 'Inter Bold'),
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

console.log('📊 Font Loading Results:');
Object.entries(fontBase64Cache).forEach(([key, value]) => {
  console.log(`  ${key}: ${value ? '✅ Loaded' : '❌ Failed'} (${value ? `${Math.round(value.length / 1024)}KB` : 'N/A'})`);
});

const hasBoldFonts = fontBase64Cache.notoBold || fontBase64Cache.interBold || fontBase64Cache.bebasNeue || fontBase64Cache.anton || fontBase64Cache.impact || fontBase64Cache.oswaldBold || fontBase64Cache.montserratExtraBold || fontBase64Cache.leagueSpartanBold || fontBase64Cache.ralewayHeavy || fontBase64Cache.robotoCondensedBold || fontBase64Cache.poppinsExtraBold || fontBase64Cache.playfairDisplayBlack;
console.log(`🔤 Bold fonts available: ${hasBoldFonts ? '✅ YES' : '❌ NO'}`);

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

// Design configurations for different styles (cloned from bundled-font-overlay.js)
const DESIGN_THEMES = {
  'default': {
    name: 'Breaking News Boldness',
    titleColor: '#FFFFFF',
    websiteColor: '#FFD700',
    gradientColors: ['rgba(0,31,63,0.95)', 'rgba(0,31,63,0.98)'],
    titleSize: 48,
    websiteSize: 24,
    fontWeight: '700',
    fontFamily: 'Bebas Neue'
  },
  'tech': {
    name: 'Professional Editorial',
    titleColor: '#FFFFFF',
    websiteColor: '#E0E0E0',
    gradientColors: ['rgba(38,50,56,0.95)', 'rgba(38,50,56,0.98)'],
    titleSize: 52,
    websiteSize: 26,
    fontWeight: '700',
    fontFamily: 'Oswald'
  },
  'entertainment': {
    name: 'Viral & Loud',
    titleColor: '#FFFFFF',
    websiteColor: '#FFB347',
    gradientColors: ['rgba(230,81,0,0.95)', 'rgba(230,81,0,0.98)'],
    titleSize: 78,
    websiteSize: 32,
    fontWeight: '900',
    fontFamily: 'Anton'
  },
  'antonBlack': {
    name: 'Anton Black',
    titleColor: '#FFFFFF',
    websiteColor: '#FFFFFF',
    gradientColors: ['rgba(0,0,0,0.95)', 'rgba(0,0,0,0.98)'],
    titleSize: 78,
    websiteSize: 32,
    fontWeight: '900',
    fontFamily: 'Anton'
  },
  'antonTransparent': {
    name: 'Anton Transparent',
    titleColor: '#FFFFFF',
    websiteColor: '#FFD700',
    gradientColors: [],
    titleSize: 78,
    websiteSize: 32,
    fontWeight: '900',
    fontFamily: 'Anton',
    transparent: true
  },
  'antonTransparent2': {
    name: 'Anton White Background',
    titleColor: '#FFFFFF',
    websiteColor: '#FFB347',
    gradientColors: ['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.98)'],
    titleSize: 78,
    websiteSize: 32,
    fontWeight: '900',
    fontFamily: 'Anton'
  },
  'antonWhite': {
    name: 'Anton White with Black Text',
    titleColor: '#000000',
    websiteColor: '#000000',
    gradientColors: ['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.98)'],
    titleSize: 78,
    websiteSize: 32,
    fontWeight: '900',
    fontFamily: 'Anton'
  },
  'sports': {
    name: 'Impact Headlines',
    titleColor: '#FFFFFF',
    websiteColor: '#90EE90',
    gradientColors: ['rgba(0,77,64,0.95)', 'rgba(0,77,64,0.98)'],
    titleSize: 50,
    websiteSize: 25,
    fontWeight: '900',
    fontFamily: 'Impact'
  },
  'anime': {
    name: 'Friendly & Trustworthy',
    titleColor: '#FFFFFF',
    websiteColor: '#FFB347',
    gradientColors: ['rgba(255,111,0,0.95)', 'rgba(255,111,0,0.98)'],
    titleSize: 46,
    websiteSize: 23,
    fontWeight: '800',
    fontFamily: 'Poppins'
  },
  'eco': {
    name: 'Smart & Minimal',
    titleColor: '#FFFFFF',
    websiteColor: '#90EE90',
    gradientColors: ['rgba(0,77,77,0.95)', 'rgba(0,77,77,0.98)'],
    titleSize: 48,
    websiteSize: 24,
    fontWeight: '800',
    fontFamily: 'League Spartan'
  },
  'news': {
    name: 'Breaking News Crimson',
    titleColor: '#FFFFFF',
    websiteColor: '#FFD700',
    gradientColors: ['rgba(139,0,0,0.95)', 'rgba(139,0,0,0.98)'],
    titleSize: 44,
    websiteSize: 22,
    fontWeight: '400',
    fontFamily: 'Bebas Neue'
  },
  'minimal': {
    name: 'Editorial Prestige',
    titleColor: '#FFFFFF',
    websiteColor: '#D4AF37',
    gradientColors: ['rgba(0,0,0,0.95)', 'rgba(0,0,0,0.98)'],
    titleSize: 42,
    websiteSize: 20,
    fontWeight: '900',
    fontFamily: 'Playfair Display'
  },
  'modern': {
    name: 'Modern Authority',
    titleColor: '#FFFFFF',
    websiteColor: '#E6E6FA',
    gradientColors: ['rgba(0,51,153,0.95)', 'rgba(0,51,153,0.98)'],
    titleSize: 60,
    websiteSize: 24,
    fontWeight: '800',
    fontFamily: 'Montserrat'
  },
  'bold': {
    name: 'Stylish Credibility',
    titleColor: '#FFFFFF',
    websiteColor: '#F5DEB3',
    gradientColors: ['rgba(62,39,35,0.95)', 'rgba(62,39,35,0.98)'],
    titleSize: 85,
    websiteSize: 35,
    fontWeight: '900',
    fontFamily: 'Raleway'
  },
  'viral': {
    name: 'Versatile & Balanced',
    titleColor: '#FFFFFF',
    websiteColor: '#FFB6C1',
    gradientColors: ['rgba(43,43,43,0.95)', 'rgba(43,43,43,0.98)'],
    titleSize: 67,
    websiteSize: 28,
    fontWeight: '700',
    fontFamily: 'Roboto Condensed'
  },
  'breaking': {
    name: 'Breaking News Alert',
    titleColor: '#FFFFFF',
    websiteColor: '#FFD700',
    gradientColors: ['rgba(139,0,0,0.95)', 'rgba(139,0,0,0.98)'],
    titleSize: 57,
    websiteSize: 25,
    fontWeight: '400',
    fontFamily: 'Bebas Neue'
  },
  'thoughtful': {
    name: 'Thoughtful Deep Purple',
    titleColor: '#FFFFFF',
    websiteColor: '#E6E6FA',
    gradientColors: ['rgba(74,20,140,0.95)', 'rgba(74,20,140,0.98)'],
    titleSize: 53,
    websiteSize: 22,
    fontWeight: '700',
    fontFamily: 'Montserrat'
  },
  'colorful': {
    name: 'Colorful Amber',
    titleColor: '#FFFFFF',
    websiteColor: '#FFE4B5',
    gradientColors: ['rgba(255,111,0,0.95)', 'rgba(255,111,0,0.98)'],
    titleSize: 63,
    websiteSize: 26,
    fontWeight: '900',
    fontFamily: 'Anton'
  },
  'overlay': {
    name: 'Photo Overlay Dark Gray',
    titleColor: '#FFFFFF',
    websiteColor: '#D3D3D3',
    gradientColors: ['rgba(18,18,18,0.95)', 'rgba(18,18,18,0.98)'],
    titleSize: 60,
    websiteSize: 24,
    fontWeight: '800',
    fontFamily: 'Roboto Condensed'
  },
  'aesthetic': {
    name: 'Aesthetic Sea Green',
    titleColor: '#FFFFFF',
    websiteColor: '#AFEEEE',
    gradientColors: ['rgba(46,139,87,0.95)', 'rgba(46,139,87,0.98)'],
    titleSize: 57,
    websiteSize: 23,
    fontWeight: '700',
    fontFamily: 'Poppins'
  },
  'monochrome': {
    name: 'Monochrome Graphite',
    titleColor: '#FFFFFF',
    websiteColor: '#D3D3D3',
    gradientColors: ['rgba(43,43,43,0.95)', 'rgba(43,43,43,0.98)'],
    titleSize: 60,
    websiteSize: 24,
    fontWeight: '700',
    fontFamily: 'Impact'
  },
  'vintage': {
    name: 'Vintage Copper',
    titleColor: '#FFFFFF',
    websiteColor: '#F5DEB3',
    gradientColors: ['rgba(184,115,51,0.95)', 'rgba(184,115,51,0.98)'],
    titleSize: 68,
    websiteSize: 26,
    fontWeight: '900',
    fontFamily: 'Playfair Display'
  },
  'luxury': {
    name: 'Luxury Burgundy',
    titleColor: '#FFFFFF',
    websiteColor: '#FFD700',
    gradientColors: ['rgba(128,0,32,0.95)', 'rgba(128,0,32,0.98)'],
    titleSize: 63,
    websiteSize: 26,
    fontWeight: '700',
    fontFamily: 'Playfair Display'
  },
  'cinematic': {
    name: 'Cinematic Steel Blue',
    titleColor: '#FFFFFF',
    websiteColor: '#B0C4DE',
    gradientColors: ['rgba(38,50,56,0.95)', 'rgba(38,50,56,0.98)'],
    titleSize: 56,
    websiteSize: 30,
    fontWeight: '900',
    fontFamily: 'Anton'
  },
  'neon': {
    name: 'Neon Indigo',
    titleColor: '#FFFFFF',
    websiteColor: '#87CEEB',
    gradientColors: ['rgba(63,81,181,0.95)', 'rgba(63,81,181,0.98)'],
    titleSize: 60,
    websiteSize: 26,
    fontWeight: '800',
    fontFamily: 'Bebas Neue'
  },
  'inspire': {
    name: 'Inspirational Olive',
    titleColor: '#FFFFFF',
    websiteColor: '#F0E68C',
    gradientColors: ['rgba(61,153,112,0.95)', 'rgba(61,153,112,0.98)'],
    titleSize: 63,
    websiteSize: 26,
    fontWeight: '900',
    fontFamily: 'League Spartan'
  },
  'cute': {
    name: 'Cute Royal Violet',
    titleColor: '#FFFFFF',
    websiteColor: '#DDA0DD',
    gradientColors: ['rgba(94,53,177,0.95)', 'rgba(94,53,177,0.98)'],
    titleSize: 67,
    websiteSize: 28,
    fontWeight: '800',
    fontFamily: 'Poppins'
  },
  'warmbrown': {
    name: 'Warm Espresso',
    titleColor: '#FFFFFF',
    websiteColor: '#D2B48C',
    gradientColors: ['rgba(62,39,35,0.95)', 'rgba(62,39,35,0.98)'],
    titleSize: 67,
    websiteSize: 28,
    fontWeight: '800',
    fontFamily: 'Montserrat'
  },
  'pokemon': {
    name: 'Pokémon Wine',
    titleColor: '#FFFFFF',
    websiteColor: '#FFD700',
    gradientColors: ['rgba(81,45,168,0.95)', 'rgba(81,45,168,0.98)'],
    titleSize: 73,
    websiteSize: 30,
    fontWeight: '900',
    fontFamily: 'Impact'
  },
  'quote1': {
    name: 'Bold Quote Overlay',
    titleColor: '#FFFFFF',
    websiteColor: '#CCCCCC',
    gradientColors: ['rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)'],
    titleSize: 64,
    websiteSize: 28,
    fontWeight: '900',
    fontFamily: 'Anton'
  },
  'quote2': {
    name: 'Elegant Quote Overlay',
    titleColor: '#FFFFFF',
    websiteColor: '#E0E0E0',
    gradientColors: ['rgba(30,30,30,1.0)', 'rgba(30,30,30,1.0)'],
    titleSize: 58,
    websiteSize: 26,
    fontWeight: '900',
    fontFamily: 'Playfair Display'
  },
  'quote3': {
    name: 'Impact Quote Overlay',
    titleColor: '#FFFFFF',
    websiteColor: '#FFD700',
    gradientColors: ['rgba(0,0,0,1.0)', 'rgba(20,20,20,1.0)'],
    titleSize: 68,
    websiteSize: 30,
    fontWeight: '900',
    fontFamily: 'Impact'
  },
  'blank': {
    name: 'Transparent Blank',
    titleColor: '#FFFFFF',
    websiteColor: '#E0E0E0',
    gradientColors: ['rgba(0,0,0,0)', 'rgba(0,0,0,0)'],
    titleSize: 60,
    websiteSize: 28,
    fontWeight: '900',
    fontFamily: 'Anton'
  }
};

export default async function handler(req, res) {
  const startTime = Date.now();
  console.log('\n🎨 === IG OVERLAY GENERATOR (CLONED) ===');
  console.log('Method:', req.method);
  console.log('Query:', req.query);
  console.log('Body:', req.body);
  console.log('Full URL:', req.url);
  console.log('⚠️ Running in PUBLIC mode (no authentication required)');
  try {
    let rawParams = req.method === 'POST' ? (req.body || {}) : req.query;
    let imageUrl = 'https://picsum.photos/800/600';
    let imageData = '';
    let title = 'Sample Title';
    let website = '';
    let design = 'default';
    let val = '';
    let w = '1080';
    let h = '1350';

    // (Quote arrays & logic retained exactly from original clone - copy from source if needed)

    const originalUrl = req.url;
    const imageStartMatch = originalUrl.match(/[?&]image=([^&]*)/);
    if (imageStartMatch) {
      let reconstructedImageUrl = decodeURIComponent(imageStartMatch[1]);
      if (reconstructedImageUrl.includes('?')) {
        const apiParams = ['title', 'website', 'design', 'w', 'h', 'imageData', 'val'];
        const urlParts = originalUrl.split(/[?&]/);
        let imageQueryParams = [];
        let foundApiParam = false;
        for (let i = 0; i < urlParts.length; i++) {
          const part = urlParts[i];
          if (part.startsWith('image=')) continue;
          const isApiParam = apiParams.some(param => part.startsWith(param + '='));
          if (isApiParam) {
            foundApiParam = true;
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
            imageQueryParams.push(part);
          }
        }
        imageUrl = imageQueryParams.length > 0 ? reconstructedImageUrl + '&' + imageQueryParams.join('&') : reconstructedImageUrl;
      } else {
        imageUrl = reconstructedImageUrl;
      }
    }

    if (title === 'Sample Title') title = decodeURIComponent(rawParams.title || 'Sample Title');
    if (website === '') website = decodeURIComponent(rawParams.website || '');
    if (design === 'default') design = rawParams.design || 'default';
    if (imageData === '') imageData = rawParams.imageData || '';
    if (val === '') val = rawParams.val || '';

    const image = imageData ? null : (imageUrl.startsWith('http') ? imageUrl : decodeURIComponent(imageUrl));
    const selectedDesign = DESIGN_THEMES[design] || DESIGN_THEMES['default'];
    const targetWidth = parseInt(w);
    const targetHeight = parseInt(h);

    let imageBuffer;
    let useBlankBackground = false;
    if (design === 'blank' || design === 'antonTransparent') {
      useBlankBackground = true;
      imageBuffer = await sharp({ create: { width: targetWidth, height: targetHeight, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).png().toBuffer();
    } else if (imageData) {
      let base64Data = imageData;
      if (imageData.startsWith('data:')) {
        const base64Match = imageData.match(/^data:image\/[^;]+;base64,(.+)$/);
        if (base64Match) base64Data = base64Match[1]; else throw new Error('Invalid data URI format');
      }
      imageBuffer = Buffer.from(base64Data, 'base64');
    } else {
      const isQuoteDesign = ['quote1', 'quote2', 'quote3'].includes(design);
      const isEmptyImage = !image || image.trim() === '' || image === 'undefined' || image === 'null';
      if (isQuoteDesign && isEmptyImage) {
        let backgroundColor = { r: 0, g: 0, b: 0 };
        if (design === 'quote2') backgroundColor = { r: 30, g: 30, b: 30 };
        if (design === 'quote3') backgroundColor = { r: 10, g: 10, b: 10 };
        imageBuffer = await sharp({ create: { width: targetWidth, height: targetHeight, channels: 3, background: backgroundColor } }).jpeg().toBuffer();
      } else {
        try {
          imageBuffer = await fetchImageBuffer(image);
        } catch {
          imageBuffer = await sharp({ create: { width: targetWidth, height: targetHeight, channels: 3, background: { r: 70, g: 130, b: 180 } } }).jpeg().toBuffer();
        }
      }
    }

    const processedImage = sharp(imageBuffer).resize(targetWidth, targetHeight, { fit: 'cover', position: 'center' });

    function escapeXml(text) {
      return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    const titleText = escapeXml(Buffer.from(title, 'utf-8').toString('utf-8').toUpperCase());
    const websiteText = escapeXml(Buffer.from(website, 'utf-8').toString('utf-8').toUpperCase());

    const padding = (design === 'entertainment' || design === 'antonBlack' || design === 'antonTransparent' || design === 'antonTransparent2' || design === 'antonWhite') ? 15 : (design === 'cinematic' || design === 'vintage') ? 30 : 80;
    const contentWidth = targetWidth - (padding * 2);

    function wrapText(text, maxWidth, fontSize) {
      const words = text.split(' ');
      const lines = [];
      let currentLine = '';
      const avgCharWidth = (design === 'entertainment' || design === 'antonBlack' || design === 'antonTransparent' || design === 'antonTransparent2' || design === 'antonWhite') ? fontSize * 0.45 : fontSize * 0.55;
      const maxCharsPerLine = Math.floor(maxWidth / avgCharWidth);
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (testLine.length <= maxCharsPerLine) currentLine = testLine; else { if (currentLine) { lines.push(currentLine); currentLine = word; } else { lines.push(word); currentLine = ''; } }
      }
      if (currentLine) lines.push(currentLine);
      return lines;
    }

    const titleLines = wrapText(titleText, contentWidth, selectedDesign.titleSize);
    const lineHeight = Math.round(selectedDesign.titleSize + 8);
    const totalTitleHeight = Math.round(titleLines.length * lineHeight);
    const topMargin = 20;
    const gapBetweenTitleAndWebsite = website ? 25 : 0;

    let titleStartY, websiteY, svgHeight, titleEndY;
    if (['quote1', 'quote2', 'quote3'].includes(design)) {
      const totalContentHeight = totalTitleHeight + gapBetweenTitleAndWebsite + (website ? selectedDesign.websiteSize : 0);
      const centerY = Math.round(targetHeight / 2);
      titleStartY = Math.round(centerY - (totalContentHeight / 2) + (lineHeight * 0.8));
      websiteY = website ? Math.round(titleStartY + totalTitleHeight + gapBetweenTitleAndWebsite) : 0;
      titleEndY = Math.round(titleStartY + totalTitleHeight);
      svgHeight = targetHeight;
    } else {
      titleStartY = Math.round(topMargin + (lineHeight * 0.8));
      titleEndY = Math.round(titleStartY + totalTitleHeight);
      if (website) {
        websiteY = Math.round(titleEndY + gapBetweenTitleAndWebsite);
        if (design === 'anime') websiteY = Math.round(titleEndY + 15 + 25);
      } else {
        websiteY = titleEndY;
      }
      const bottomMargin = 20;
      const contentBottom = website ? websiteY + bottomMargin + 10 : titleEndY + bottomMargin;
      svgHeight = Math.round(Math.max(200, contentBottom));
    }

    // Generate design-specific gradient stops
    const gradientStops = selectedDesign.gradientColors && selectedDesign.gradientColors.length > 0 
      ? selectedDesign.gradientColors.map((color, index) => {
          const offset = index === 0 ? '0%' : '100%';
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
        src: url('${fontBase64Cache.bebasNeue || ''}') format('truetype');
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
            font-family: "${selectedDesign.fontFamily || 'Noto Sans'}", "Noto Sans Bold", "Inter Bold", "Noto Sans", "Inter", Arial, sans-serif; 
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
          .website-text { 
            font-family: "${selectedDesign.fontFamily || 'Noto Sans'}", "Noto Sans Bold", "Inter Bold", "Noto Sans", "Inter", Arial, sans-serif; 
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
        ${website ? `<text x="${Math.round(targetWidth / 2)}" y="${Math.round(websiteY)}" class="website-text ${design === 'pokemon' ? 'pokemon-website' : ''} ${design === 'bold' ? 'bold-website' : ''} ${design === 'boldblue' ? 'boldblue-website' : ''} ${['boldblue', 'bold', 'energetic', 'popart', 'viral'].includes(design) ? 'bold-text' : ''}">${websiteText}</text>` : ''}
        
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

    const svgBuffer = Buffer.from(svg, 'utf-8');
    let finalImage;
    if (design === 'blank' || design === 'antonTransparent') {
      finalImage = await sharp(svgBuffer).png().toBuffer();
    } else {
      const compositeTop = ['quote1', 'quote2', 'quote3'].includes(design) ? 0 : Math.round(targetHeight - svgHeight);
      finalImage = await processedImage.composite([{ input: svgBuffer, left: 0, top: compositeTop, blend: 'over' }]).jpeg({ quality: 90 }).toBuffer();
    }

    const contentType = (design === 'blank' || design === 'antonTransparent') ? 'image/png' : 'image/jpeg';
    const fileExtension = (design === 'blank' || design === 'antonTransparent') ? 'png' : 'jpg';
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const uniqueFilename = `${design}-overlay-${timestamp}-${randomString}.${fileExtension}`;

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${uniqueFilename}"`);
    res.setHeader('Content-Length', String(finalImage.length));

    if (val === 'InspirationTagalog' || val === 'HugotTagalog') {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    } else if (val === 'igpost') {
      res.setHeader('Cache-Control', 'public, max-age=60');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=300');
    }

    res.setHeader('X-Font-System', 'bundled-fonts');
    res.setHeader('X-Design-Theme', selectedDesign.name);

    // OPTIONAL usage logging (disabled by default)
    /*
    await logUsage({
      apiKeyId: key.id,
      endpoint: '/api/ig-overlay',
      method: req.method,
      status: 200,
      latencyMs: Date.now() - startTime,
      bytesOut: finalImage.length,
      metadata: { theme: design, hasCustomImage: !!imageUrl, width: w, height: h, outputFormat: contentType }
    });
    */

    res.send(finalImage);
  } catch (error) {
    console.error('❌ IG overlay generation failed:', error);
    res.status(500).json({
      error: 'IG overlay generation failed',
      message: error.message,
      fontconfig: {
        FONTCONFIG_PATH: process.env.FONTCONFIG_PATH,
        FONTCONFIG_FILE: process.env.FONTCONFIG_FILE,
        exists: require('fs').existsSync(process.env.FONTCONFIG_FILE || '')
      }
    });
  }
}
