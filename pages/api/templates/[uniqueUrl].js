import { PrismaClient } from '@prisma/client';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

// Prisma singleton
const globalForPrisma = global;
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Runtime configuration - MUST use Node.js for Sharp and fontconfig
export const runtime = 'nodejs';

// Font loading system - Load fonts as base64 at module startup
const fontBase64Cache = {};
const fontDir = path.join(process.cwd(), 'fonts');
const fontFiles = {
  bebasNeue: 'BebasNeue-Regular.ttf',
  anton: 'Anton-Regular.ttf',
  impact: 'impact.ttf',
  oswald: 'Oswald-Bold.ttf',
  poppins: 'Poppins-Bold.ttf',
  montserrat: 'Montserrat-Black.ttf',
  raleway: 'Raleway-Black.ttf',
  playfairDisplay: 'PlayfairDisplay-Black.ttf'
};

// Load all fonts at startup
Object.keys(fontFiles).forEach(fontKey => {
  try {
    const fontPath = path.join(fontDir, fontFiles[fontKey]);
    const fontBuffer = fs.readFileSync(fontPath);
    fontBase64Cache[fontKey] = `data:font/truetype;charset=utf-8;base64,${fontBuffer.toString('base64')}`;
    console.log(`✅ Loaded ${fontFiles[fontKey]}`);
  } catch (error) {
    console.error(`❌ Failed to load ${fontFiles[fontKey]}:`, error.message);
  }
});

// Design themes configuration
const DESIGN_THEMES = {
  default: {
    name: 'Breaking News Boldness',
    titleColor: '#FFFFFF',
    websiteColor: '#FFD700',
    gradientColors: ['rgba(0,31,63,0.0)', 'rgba(0,31,63,0.0)', 'rgba(0,31,63,0.05)', 'rgba(0,31,63,0.10)', 'rgba(0,31,63,0.15)', 'rgba(0,31,63,0.20)', 'rgba(0,31,63,0.25)', 'rgba(0,31,63,0.30)', 'rgba(0,31,63,0.35)', 'rgba(0,31,63,0.40)', 'rgba(0,31,63,0.45)', 'rgba(0,31,63,0.50)', 'rgba(0,31,63,0.55)', 'rgba(0,31,63,0.60)', 'rgba(0,31,63,0.65)', 'rgba(0,31,63,0.70)', 'rgba(0,31,63,0.75)', 'rgba(0,31,63,0.80)', 'rgba(0,31,63,0.85)', 'rgba(0,31,63,0.90)', 'rgba(0,31,63,0.95)', 'rgba(0,31,63,1.0)', 'rgba(0,31,63,1.0)', 'rgba(0,31,63,1.0)', 'rgba(0,31,63,1.0)', 'rgba(0,31,63,1.0)', 'rgba(0,31,63,1.0)', 'rgba(0,31,63,1.0)', 'rgba(0,31,63,1.0)', 'rgba(0,31,63,1.0)', 'rgba(0,31,63,1.0)', 'rgba(0,31,63,1.0)', 'rgba(0,31,63,1.0)', 'rgba(0,31,63,1.0)', 'rgba(0,31,63,1.0)', 'rgba(0,31,63,1.0)', 'rgba(0,31,63,1.0)', 'rgba(0,31,63,1.0)', 'rgba(0,31,63,1.0)'],
    titleSize: 60,
    websiteSize: 28,
    fontWeight: '900',
    fontFamily: 'Anton'
  },
  tech: {
    name: 'Professional Editorial',
    titleColor: '#FFFFFF',
    websiteColor: '#00D9FF',
    gradientColors: ['rgba(38,50,56,0.0)', 'rgba(38,50,56,0.0)', 'rgba(38,50,56,0.05)', 'rgba(38,50,56,0.10)', 'rgba(38,50,56,0.15)', 'rgba(38,50,56,0.20)', 'rgba(38,50,56,0.25)', 'rgba(38,50,56,0.30)', 'rgba(38,50,56,0.35)', 'rgba(38,50,56,0.40)', 'rgba(38,50,56,0.45)', 'rgba(38,50,56,0.50)', 'rgba(38,50,56,0.55)', 'rgba(38,50,56,0.60)', 'rgba(38,50,56,0.65)', 'rgba(38,50,56,0.70)', 'rgba(38,50,56,0.75)', 'rgba(38,50,56,0.80)', 'rgba(38,50,56,0.85)', 'rgba(38,50,56,0.90)', 'rgba(38,50,56,0.95)', 'rgba(38,50,56,1.0)', 'rgba(38,50,56,1.0)', 'rgba(38,50,56,1.0)', 'rgba(38,50,56,1.0)', 'rgba(38,50,56,1.0)', 'rgba(38,50,56,1.0)', 'rgba(38,50,56,1.0)', 'rgba(38,50,56,1.0)', 'rgba(38,50,56,1.0)', 'rgba(38,50,56,1.0)', 'rgba(38,50,56,1.0)', 'rgba(38,50,56,1.0)', 'rgba(38,50,56,1.0)', 'rgba(38,50,56,1.0)', 'rgba(38,50,56,1.0)', 'rgba(38,50,56,1.0)', 'rgba(38,50,56,1.0)', 'rgba(38,50,56,1.0)'],
    titleSize: 52,
    websiteSize: 26,
    fontWeight: '700',
    fontFamily: 'Montserrat'
  },
  entertainment: {
    name: 'Viral & Loud',
    titleColor: '#FFFFFF',
    websiteColor: '#FFD700',
    gradientColors: ['rgba(230,81,0,0.0)', 'rgba(230,81,0,0.0)', 'rgba(230,81,0,0.05)', 'rgba(230,81,0,0.10)', 'rgba(230,81,0,0.15)', 'rgba(230,81,0,0.20)', 'rgba(230,81,0,0.25)', 'rgba(230,81,0,0.30)', 'rgba(230,81,0,0.35)', 'rgba(230,81,0,0.40)', 'rgba(230,81,0,0.45)', 'rgba(230,81,0,0.50)', 'rgba(230,81,0,0.55)', 'rgba(230,81,0,0.60)', 'rgba(230,81,0,0.65)', 'rgba(230,81,0,0.70)', 'rgba(230,81,0,0.75)', 'rgba(230,81,0,0.80)', 'rgba(230,81,0,0.85)', 'rgba(230,81,0,0.90)', 'rgba(230,81,0,0.95)', 'rgba(230,81,0,1.0)', 'rgba(230,81,0,1.0)', 'rgba(230,81,0,1.0)', 'rgba(230,81,0,1.0)', 'rgba(230,81,0,1.0)', 'rgba(230,81,0,1.0)', 'rgba(230,81,0,1.0)', 'rgba(230,81,0,1.0)', 'rgba(230,81,0,1.0)', 'rgba(230,81,0,1.0)', 'rgba(230,81,0,1.0)', 'rgba(230,81,0,1.0)', 'rgba(230,81,0,1.0)', 'rgba(230,81,0,1.0)', 'rgba(230,81,0,1.0)', 'rgba(230,81,0,1.0)', 'rgba(230,81,0,1.0)', 'rgba(230,81,0,1.0)'],
    titleSize: 64,
    websiteSize: 32,
    fontWeight: '900',
    fontFamily: 'Anton'
  },
  antonBlack: {
    name: 'Anton Black',
    titleColor: '#FFFFFF',
    websiteColor: '#FFD700',
    gradientColors: ['rgba(0,0,0,0.0)', 'rgba(0,0,0,0.0)', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0.10)', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0.20)', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.30)', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.40)', 'rgba(0,0,0,0.45)', 'rgba(0,0,0,0.50)', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.60)', 'rgba(0,0,0,0.65)', 'rgba(0,0,0,0.70)', 'rgba(0,0,0,0.75)', 'rgba(0,0,0,0.80)', 'rgba(0,0,0,0.85)', 'rgba(0,0,0,0.90)', 'rgba(0,0,0,0.95)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)'],
    titleSize: 60,
    websiteSize: 28,
    fontWeight: '900',
    fontFamily: 'Anton'
  },
  bebas: {
    name: 'Bebas Black Gradient',
    titleColor: '#FFFFFF',
    websiteColor: '#FFD700',
    gradientColors: ['rgba(0,0,0,0.0)', 'rgba(0,0,0,0.0)', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0.10)', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0.20)', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.30)', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.40)', 'rgba(0,0,0,0.45)', 'rgba(0,0,0,0.50)', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.60)', 'rgba(0,0,0,0.65)', 'rgba(0,0,0,0.70)', 'rgba(0,0,0,0.75)', 'rgba(0,0,0,0.80)', 'rgba(0,0,0,0.85)', 'rgba(0,0,0,0.90)', 'rgba(0,0,0,0.95)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)'],
    titleSize: 62,
    websiteSize: 30,
    fontWeight: '400',
    fontFamily: 'Bebas Neue'
  },
  sports: {
    name: 'Impact Headlines',
    titleColor: '#FFFFFF',
    websiteColor: '#00FFD1',
    gradientColors: ['rgba(0,77,64,0.0)', 'rgba(0,77,64,0.0)', 'rgba(0,77,64,0.05)', 'rgba(0,77,64,0.10)', 'rgba(0,77,64,0.15)', 'rgba(0,77,64,0.20)', 'rgba(0,77,64,0.25)', 'rgba(0,77,64,0.30)', 'rgba(0,77,64,0.35)', 'rgba(0,77,64,0.40)', 'rgba(0,77,64,0.45)', 'rgba(0,77,64,0.50)', 'rgba(0,77,64,0.55)', 'rgba(0,77,64,0.60)', 'rgba(0,77,64,0.65)', 'rgba(0,77,64,0.70)', 'rgba(0,77,64,0.75)', 'rgba(0,77,64,0.80)', 'rgba(0,77,64,0.85)', 'rgba(0,77,64,0.90)', 'rgba(0,77,64,0.95)', 'rgba(0,77,64,1.0)', 'rgba(0,77,64,1.0)', 'rgba(0,77,64,1.0)', 'rgba(0,77,64,1.0)', 'rgba(0,77,64,1.0)', 'rgba(0,77,64,1.0)', 'rgba(0,77,64,1.0)', 'rgba(0,77,64,1.0)', 'rgba(0,77,64,1.0)', 'rgba(0,77,64,1.0)', 'rgba(0,77,64,1.0)', 'rgba(0,77,64,1.0)', 'rgba(0,77,64,1.0)', 'rgba(0,77,64,1.0)', 'rgba(0,77,64,1.0)', 'rgba(0,77,64,1.0)', 'rgba(0,77,64,1.0)', 'rgba(0,77,64,1.0)'],
    titleSize: 68,
    websiteSize: 32,
    fontWeight: '900',
    fontFamily: 'Impact'
  },
  anime: {
    name: 'Friendly & Trustworthy',
    titleColor: '#FFFFFF',
    websiteColor: '#FFD700',
    gradientColors: ['rgba(255,111,0,0.0)', 'rgba(255,111,0,0.0)', 'rgba(255,111,0,0.05)', 'rgba(255,111,0,0.10)', 'rgba(255,111,0,0.15)', 'rgba(255,111,0,0.20)', 'rgba(255,111,0,0.25)', 'rgba(255,111,0,0.30)', 'rgba(255,111,0,0.35)', 'rgba(255,111,0,0.40)', 'rgba(255,111,0,0.45)', 'rgba(255,111,0,0.50)', 'rgba(255,111,0,0.55)', 'rgba(255,111,0,0.60)', 'rgba(255,111,0,0.65)', 'rgba(255,111,0,0.70)', 'rgba(255,111,0,0.75)', 'rgba(255,111,0,0.80)', 'rgba(255,111,0,0.85)', 'rgba(255,111,0,0.90)', 'rgba(255,111,0,0.95)', 'rgba(255,111,0,1.0)', 'rgba(255,111,0,1.0)', 'rgba(255,111,0,1.0)', 'rgba(255,111,0,1.0)', 'rgba(255,111,0,1.0)', 'rgba(255,111,0,1.0)', 'rgba(255,111,0,1.0)', 'rgba(255,111,0,1.0)', 'rgba(255,111,0,1.0)', 'rgba(255,111,0,1.0)', 'rgba(255,111,0,1.0)', 'rgba(255,111,0,1.0)', 'rgba(255,111,0,1.0)', 'rgba(255,111,0,1.0)', 'rgba(255,111,0,1.0)', 'rgba(255,111,0,1.0)', 'rgba(255,111,0,1.0)', 'rgba(255,111,0,1.0)'],
    titleSize: 56,
    websiteSize: 28,
    fontWeight: '700',
    fontFamily: 'Poppins'
  },
  modern: {
    name: 'Modern Authority',
    titleColor: '#FFFFFF',
    websiteColor: '#00D4FF',
    gradientColors: ['rgba(0,51,153,0.0)', 'rgba(0,51,153,0.0)', 'rgba(0,51,153,0.05)', 'rgba(0,51,153,0.10)', 'rgba(0,51,153,0.15)', 'rgba(0,51,153,0.20)', 'rgba(0,51,153,0.25)', 'rgba(0,51,153,0.30)', 'rgba(0,51,153,0.35)', 'rgba(0,51,153,0.40)', 'rgba(0,51,153,0.45)', 'rgba(0,51,153,0.50)', 'rgba(0,51,153,0.55)', 'rgba(0,51,153,0.60)', 'rgba(0,51,153,0.65)', 'rgba(0,51,153,0.70)', 'rgba(0,51,153,0.75)', 'rgba(0,51,153,0.80)', 'rgba(0,51,153,0.85)', 'rgba(0,51,153,0.90)', 'rgba(0,51,153,0.95)', 'rgba(0,51,153,1.0)', 'rgba(0,51,153,1.0)', 'rgba(0,51,153,1.0)', 'rgba(0,51,153,1.0)', 'rgba(0,51,153,1.0)', 'rgba(0,51,153,1.0)', 'rgba(0,51,153,1.0)', 'rgba(0,51,153,1.0)', 'rgba(0,51,153,1.0)', 'rgba(0,51,153,1.0)', 'rgba(0,51,153,1.0)', 'rgba(0,51,153,1.0)', 'rgba(0,51,153,1.0)', 'rgba(0,51,153,1.0)', 'rgba(0,51,153,1.0)', 'rgba(0,51,153,1.0)', 'rgba(0,51,153,1.0)', 'rgba(0,51,153,1.0)'],
    titleSize: 54,
    websiteSize: 26,
    fontWeight: '900',
    fontFamily: 'Raleway'
  },
  bold: {
    name: 'Stylish Credibility',
    titleColor: '#FFFFFF',
    websiteColor: '#D4AF37',
    gradientColors: ['rgba(62,39,35,0.0)', 'rgba(62,39,35,0.0)', 'rgba(62,39,35,0.05)', 'rgba(62,39,35,0.10)', 'rgba(62,39,35,0.15)', 'rgba(62,39,35,0.20)', 'rgba(62,39,35,0.25)', 'rgba(62,39,35,0.30)', 'rgba(62,39,35,0.35)', 'rgba(62,39,35,0.40)', 'rgba(62,39,35,0.45)', 'rgba(62,39,35,0.50)', 'rgba(62,39,35,0.55)', 'rgba(62,39,35,0.60)', 'rgba(62,39,35,0.65)', 'rgba(62,39,35,0.70)', 'rgba(62,39,35,0.75)', 'rgba(62,39,35,0.80)', 'rgba(62,39,35,0.85)', 'rgba(62,39,35,0.90)', 'rgba(62,39,35,0.95)', 'rgba(62,39,35,1.0)', 'rgba(62,39,35,1.0)', 'rgba(62,39,35,1.0)', 'rgba(62,39,35,1.0)', 'rgba(62,39,35,1.0)', 'rgba(62,39,35,1.0)', 'rgba(62,39,35,1.0)', 'rgba(62,39,35,1.0)', 'rgba(62,39,35,1.0)', 'rgba(62,39,35,1.0)', 'rgba(62,39,35,1.0)', 'rgba(62,39,35,1.0)', 'rgba(62,39,35,1.0)', 'rgba(62,39,35,1.0)', 'rgba(62,39,35,1.0)', 'rgba(62,39,35,1.0)', 'rgba(62,39,35,1.0)', 'rgba(62,39,35,1.0)'],
    titleSize: 58,
    websiteSize: 28,
    fontWeight: '900',
    fontFamily: 'Playfair Display'
  },
  luxury: {
    name: 'Luxury Burgundy',
    titleColor: '#FFFFFF',
    websiteColor: '#FFD700',
    gradientColors: ['rgba(128,0,32,0.0)', 'rgba(128,0,32,0.0)', 'rgba(128,0,32,0.05)', 'rgba(128,0,32,0.10)', 'rgba(128,0,32,0.15)', 'rgba(128,0,32,0.20)', 'rgba(128,0,32,0.25)', 'rgba(128,0,32,0.30)', 'rgba(128,0,32,0.35)', 'rgba(128,0,32,0.40)', 'rgba(128,0,32,0.45)', 'rgba(128,0,32,0.50)', 'rgba(128,0,32,0.55)', 'rgba(128,0,32,0.60)', 'rgba(128,0,32,0.65)', 'rgba(128,0,32,0.70)', 'rgba(128,0,32,0.75)', 'rgba(128,0,32,0.80)', 'rgba(128,0,32,0.85)', 'rgba(128,0,32,0.90)', 'rgba(128,0,32,0.95)', 'rgba(128,0,32,1.0)', 'rgba(128,0,32,1.0)', 'rgba(128,0,32,1.0)', 'rgba(128,0,32,1.0)', 'rgba(128,0,32,1.0)', 'rgba(128,0,32,1.0)', 'rgba(128,0,32,1.0)', 'rgba(128,0,32,1.0)', 'rgba(128,0,32,1.0)', 'rgba(128,0,32,1.0)', 'rgba(128,0,32,1.0)', 'rgba(128,0,32,1.0)', 'rgba(128,0,32,1.0)', 'rgba(128,0,32,1.0)', 'rgba(128,0,32,1.0)', 'rgba(128,0,32,1.0)', 'rgba(128,0,32,1.0)', 'rgba(128,0,32,1.0)'],
    titleSize: 56,
    websiteSize: 28,
    fontWeight: '900',
    fontFamily: 'Oswald'
  }
};

export default async function handler(req, res) {
  const { uniqueUrl } = req.query;

  try {
    // Fetch template from database
    const template = await prisma.template.findUnique({
      where: { uniqueUrl }
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Parse stored parameters
    const savedParams = JSON.parse(template.parameters);
    
    // Allow override via query params (GET) or body (POST)
    const overrideParams = req.method === 'POST' ? req.body : req.query;
    
    // Merge: saved params as base, overrides on top
    const finalParams = { ...savedParams, ...overrideParams };
    
    // Extract parameters
    const title = finalParams.title || savedParams.title || '';
    const website = finalParams.website || savedParams.website || '';
    const design = finalParams.design || template.design || 'default';
    const w = parseInt(finalParams.w || savedParams.w || '1080');
    const h = parseInt(finalParams.h || savedParams.h || '1350');
    const image = finalParams.image || savedParams.image || '';
    const hl = finalParams.hl || savedParams.hl || '';
    const wc = finalParams.wc || savedParams.wc || '';
    const keywords = finalParams.keywords || savedParams.keywords || '';
    const titleColor = finalParams.titleColor || savedParams.titleColor || '';
    const titleBgColor = finalParams.titleBgColor || savedParams.titleBgColor || '';
    const titleBgGradient = finalParams.titleBgGradient || savedParams.titleBgGradient || '';

    console.log(`🎨 Template API called: ${template.name} (${uniqueUrl})`);
    console.log(`📊 Parameters: title="${title}", design="${design}", ${w}x${h}`);

    // Get selected design theme
    const selectedDesign = DESIGN_THEMES[design] || DESIGN_THEMES.default;
    
    // Parse highlight colors and keywords
    const highlightColors = hl ? hl.split(',').map(c => `#${c.replace('#', '')}`) : [];
    const keywordList = keywords ? keywords.split(',').map(k => k.trim().toUpperCase()) : [];
    
    // Color name mapping
    const colorNames = {
      gold: 'FFD700', orange: 'FF8C00', red: 'FF0000', blue: '0000FF',
      green: '00FF00', purple: '800080', cyan: '00FFFF', white: 'FFFFFF',
      yellow: 'FFFF00', black: '000000'
    };
    
    // Apply color overrides
    let titleColorFinal = selectedDesign.titleColor;
    let websiteColorFinal = selectedDesign.websiteColor;
    let titleBgColorFinal = titleBgColor;
    let titleBgGradientFinal = titleBgGradient;
    
    if (wc) {
      const wcLower = wc.toLowerCase();
      websiteColorFinal = colorNames[wcLower] ? `#${colorNames[wcLower]}` : `#${wc.replace('#', '')}`;
    }
    
    if (titleColor) {
      const tcLower = titleColor.toLowerCase();
      titleColorFinal = colorNames[tcLower] ? `#${colorNames[tcLower]}` : `#${titleColor.replace('#', '')}`;
    }
    
    if (titleBgColor) {
      const bgLower = titleBgColor.toLowerCase();
      titleBgColorFinal = colorNames[bgLower] ? `#${colorNames[bgLower]}` : `#${titleBgColor.replace('#', '')}`;
    }
    
    // Font selection
    const fontMap = {
      'Anton': fontBase64Cache.anton,
      'Bebas Neue': fontBase64Cache.bebasNeue,
      'Impact': fontBase64Cache.impact,
      'Oswald': fontBase64Cache.oswald,
      'Poppins': fontBase64Cache.poppins,
      'Montserrat': fontBase64Cache.montserrat,
      'Raleway': fontBase64Cache.raleway,
      'Playfair Display': fontBase64Cache.playfairDisplay
    };
    
    const selectedFont = fontMap[selectedDesign.fontFamily] || fontBase64Cache.bebasNeue;
    
    // Fetch background image if provided
    let imageBuffer;
    if (image) {
      const imageResponse = await fetch(image);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
      }
      imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    } else {
      // Create blank image with gradient
      const blankBg = selectedDesign.gradientColors[selectedDesign.gradientColors.length - 1];
      imageBuffer = await sharp({
        create: {
          width: w,
          height: h,
          channels: 3,
          background: blankBg
        }
      }).jpeg().toBuffer();
    }
    
    // Text wrapping function
    function wrapText(text, maxWidth, fontSize) {
      if (!text) return [];
      const avgCharWidth = fontSize * 0.55;
      const maxCharsPerLine = Math.floor(maxWidth / avgCharWidth);
      const words = text.split(' ');
      const lines = [];
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (testLine.length <= maxCharsPerLine) {
          currentLine = testLine;
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        }
      }
      if (currentLine) lines.push(currentLine);
      return lines;
    }
    
    // XML escape
    function escapeXml(text) {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }
    
    // Layout calculations
    const padding = 40;
    const maxTitleWidth = w - (padding * 2);
    const titleLines = wrapText(title, maxTitleWidth, selectedDesign.titleSize);
    const lineHeight = Math.round(selectedDesign.titleSize * 1.2);
    const totalTitleHeight = Math.round(titleLines.length * lineHeight);
    const websiteHeight = selectedDesign.websiteSize;
    const gap = 20;
    
    const titleStartY = Math.round(h - padding - websiteHeight - gap - totalTitleHeight);
    const titleEndY = Math.round(titleStartY + totalTitleHeight);
    const websiteY = Math.round(h - padding - websiteHeight);
    const svgHeight = Math.round(h - titleStartY + padding);
    
    // Generate SVG gradient
    const gradientStops = selectedDesign.gradientColors.map((color, idx) => {
      const offset = Math.round((idx / (selectedDesign.gradientColors.length - 1)) * 100);
      return `<stop offset="${offset}%" style="stop-color:${color}" />`;
    }).join('\n');
    
    // Generate title with keyword highlighting
    let titleSvg = '';
    if (keywords && highlightColors.length > 0) {
      const titleWords = title.split(' ');
      let currentY = titleStartY;
      
      titleLines.forEach((line, lineIdx) => {
        const lineWords = line.split(' ');
        let currentX = padding;
        const lineY = currentY + (lineIdx * lineHeight);
        
        lineWords.forEach((word, wordIdx) => {
          const wordUpper = word.toUpperCase();
          const keywordIndex = keywordList.findIndex(kw => wordUpper.includes(kw));
          const wordColor = keywordIndex >= 0 ? highlightColors[keywordIndex % highlightColors.length] : titleColorFinal;
          
          titleSvg += `<text x="${currentX}" y="${lineY}" font-family="${selectedDesign.fontFamily}" font-size="${selectedDesign.titleSize}" font-weight="${selectedDesign.fontWeight}" fill="${wordColor}">${escapeXml(word)}</text>`;
          currentX += (word.length * selectedDesign.titleSize * 0.55) + 10;
        });
      });
    } else {
      titleLines.forEach((line, idx) => {
        const lineY = titleStartY + (idx * lineHeight);
        titleSvg += `<text x="${padding}" y="${lineY}" font-family="${selectedDesign.fontFamily}" font-size="${selectedDesign.titleSize}" font-weight="${selectedDesign.fontWeight}" fill="${titleColorFinal}">${escapeXml(line)}</text>`;
      });
    }
    
    // Title background
    let titleBgSvg = '';
    if (titleBgGradientFinal) {
      const bgColors = titleBgGradientFinal.split(',').map(c => `#${c.replace('#', '')}`);
      const bgStops = bgColors.map((color, idx) => {
        const offset = Math.round((idx / (bgColors.length - 1)) * 100);
        return `<stop offset="${offset}%" style="stop-color:${color};stop-opacity:0.8" />`;
      }).join('\n');
      
      titleBgSvg = `
        <defs>
          <linearGradient id="titleBgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            ${bgStops}
          </linearGradient>
        </defs>
        <rect x="${padding}" y="${titleStartY - 20}" width="${w - (padding * 2)}" height="${totalTitleHeight + 40}" fill="url(#titleBgGrad)" />
      `;
    } else if (titleBgColorFinal) {
      titleBgSvg = `<rect x="${padding}" y="${titleStartY - 20}" width="${w - (padding * 2)}" height="${totalTitleHeight + 40}" fill="${titleBgColorFinal}" opacity="0.8" />`;
    }
    
    // Build final SVG
    const svgOverlay = `
    <svg width="${w}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          @font-face {
            font-family: '${selectedDesign.fontFamily}';
            src: url('${selectedFont}') format('truetype');
          }
        </style>
        <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
          ${gradientStops}
        </linearGradient>
      </defs>
      <rect width="${w}" height="${svgHeight}" fill="url(#grad)" />
      ${titleBgSvg}
      ${titleSvg}
      <text x="${padding}" y="${websiteY}" font-family="${selectedDesign.fontFamily}" font-size="${selectedDesign.websiteSize}" font-weight="${selectedDesign.fontWeight}" fill="${websiteColorFinal}">${escapeXml(website)}</text>
    </svg>`;
    
    // Composite final image
    const finalImage = await sharp(imageBuffer)
      .resize(w, h, { fit: 'cover', position: 'center' })
      .composite([{
        input: Buffer.from(svgOverlay),
        top: Math.round(h - svgHeight),
        left: 0
      }])
      .jpeg({ quality: 90 })
      .toBuffer();
    
    console.log(`✅ Image generated successfully for template: ${template.name}`);
    
    // Return image
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Disposition', `inline; filename="${uniqueUrl}-${Date.now()}.jpg"`);
    res.setHeader('Content-Length', finalImage.length);
    res.setHeader('X-Template-Name', template.name);
    res.setHeader('X-Design-Theme', design);
    return res.status(200).send(finalImage);
    
  } catch (error) {
    console.error('❌ Error generating image from template:', error);
    return res.status(500).json({
      error: 'Failed to generate image',
      message: error.message
    });
  }
}
