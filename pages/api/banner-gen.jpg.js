import sharp from 'sharp';
import https from 'https';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { logUsage } from './usage/log';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Initialize Prisma Client
const prisma = new PrismaClient();

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

// Enable debug logging for fontconfig
process.env.FC_DEBUG = "1";

// Load and encode fonts as base64 at module load time
const fontFiles = {
  notoRegular: path.join(fontsDir, 'NotoSans-Regular.ttf'),
  notoBold: path.join(fontsDir, 'NotoSans-Bold.ttf'),
  interRegular: path.join(fontsDir, 'Inter-Regular.ttf'),
  interBold: path.join(fontsDir, 'Inter-Bold.ttf'),
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

// Load all fonts at startup
console.log('🔤 Loading fonts for banner-gen.jpg...');
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

// Design configurations (copied from bundled-font-overlay for consistency)
const DESIGN_THEMES = {
  'default': { name: 'Breaking News Boldness', titleColor: '#FFFFFF', websiteColor: '#FFD700', gradientColors: ['rgba(0,31,63,0.95)', 'rgba(0,31,63,0.98)'], titleSize: 48, websiteSize: 24, fontWeight: '700', fontFamily: 'Bebas Neue' },
  'tech': { name: 'Professional Editorial', titleColor: '#FFFFFF', websiteColor: '#E0E0E0', gradientColors: ['rgba(38,50,56,0.95)', 'rgba(38,50,56,0.98)'], titleSize: 52, websiteSize: 26, fontWeight: '700', fontFamily: 'Oswald' },
  'entertainment': { name: 'Viral & Loud', titleColor: '#FFFFFF', websiteColor: '#FFB347', gradientColors: ['rgba(230,81,0,0.95)', 'rgba(230,81,0,0.98)'], titleSize: 78, websiteSize: 32, fontWeight: '900', fontFamily: 'Anton' },
  'antonBlack': { name: 'Anton Black', titleColor: '#FFFFFF', websiteColor: '#FFFFFF', gradientColors: ['rgba(0,0,0,0.95)', 'rgba(0,0,0,0.98)'], titleSize: 78, websiteSize: 32, fontWeight: '900', fontFamily: 'Anton' },
  'antonTransparent': { name: 'Anton Transparent', titleColor: '#FFFFFF', websiteColor: '#FFD700', gradientColors: [], titleSize: 78, websiteSize: 32, fontWeight: '900', fontFamily: 'Anton', transparent: true },
  'sports': { name: 'Impact Headlines', titleColor: '#FFFFFF', websiteColor: '#90EE90', gradientColors: ['rgba(0,77,64,0.95)', 'rgba(0,77,64,0.98)'], titleSize: 50, websiteSize: 25, fontWeight: '900', fontFamily: 'Impact' },
  'anime': { name: 'Friendly & Trustworthy', titleColor: '#FFFFFF', websiteColor: '#FFB347', gradientColors: ['rgba(255,111,0,0.95)', 'rgba(255,111,0,0.98)'], titleSize: 46, websiteSize: 23, fontWeight: '800', fontFamily: 'Poppins' },
  'news': { name: 'Breaking News Crimson', titleColor: '#FFFFFF', websiteColor: '#FFD700', gradientColors: ['rgba(139,0,0,0.95)', 'rgba(139,0,0,0.98)'], titleSize: 44, websiteSize: 22, fontWeight: '400', fontFamily: 'Bebas Neue' },
  'minimal': { name: 'Editorial Prestige', titleColor: '#FFFFFF', websiteColor: '#D4AF37', gradientColors: ['rgba(0,0,0,0.95)', 'rgba(0,0,0,0.98)'], titleSize: 42, websiteSize: 20, fontWeight: '900', fontFamily: 'Playfair Display' }
};

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
  const startTime = Date.now();
  
  console.log('\n🔐 === SECURE BANNER GENERATOR (API KEY REQUIRED) ===');
  console.log('Method:', req.method);
  console.log('Query:', req.query);
  
  // ============================================================================
  // API KEY AUTHENTICATION - REQUIRED VIA TOKEN PARAMETER
  // ============================================================================
  
  try {
    // Extract token from query parameter
    const token = req.query.token || req.body?.token;
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'API key required. Provide your API key via token parameter: ?token=YOUR_API_KEY'
      });
    }
    
    console.log('🔍 Verifying API key:', token.substring(0, 12) + '...');
    
    // Find all non-revoked API keys
    const apiKeys = await prisma.apiKey.findMany({
      where: {
        revokedAt: null
      },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    });
    
    // Compare token with hashed keys
    let validKey = null;
    for (const key of apiKeys) {
      const isValid = await bcrypt.compare(token, key.keyHash);
      if (isValid) {
        validKey = key;
        break;
      }
    }
    
    if (!validKey) {
      console.log('❌ Invalid API key');
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid API key. Please check your token and try again.'
      });
    }
    
    // Update last used timestamp
    await prisma.apiKey.update({
      where: { id: validKey.id },
      data: { lastUsedAt: new Date() }
    });
    
    console.log(`✅ Authenticated: ${validKey.user.email} (${validKey.name})`);
    
    // ============================================================================
    // Generate banner using same logic as bundled-font-overlay
    // ============================================================================
    
    // Extract parameters
    let rawParams = req.method === 'POST' ? (req.body || {}) : req.query;
    
    let imageUrl = rawParams.image ? decodeURIComponent(rawParams.image) : 'https://picsum.photos/800/600';
    let imageData = rawParams.imageData || '';
    let title = decodeURIComponent(rawParams.title || 'Sample Title');
    let website = decodeURIComponent(rawParams.website || '');
    let design = rawParams.design || 'default';
    let w = rawParams.w || '1080';
    let h = rawParams.h || '1350';
    
    console.log('📝 Parameters:', { title, website, design, w, h });
    
    const targetWidth = parseInt(w);
    const targetHeight = parseInt(h);
    const selectedDesign = DESIGN_THEMES[design] || DESIGN_THEMES['default'];
    
    // Process image
    console.log('📥 Processing image input...');
    let imageBuffer;
    
    if (design === 'blank' || design === 'antonTransparent') {
      console.log('🎨 Creating transparent background');
      imageBuffer = await sharp({
        create: {
          width: targetWidth,
          height: targetHeight,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
      }).png().toBuffer();
    } else if (imageData) {
      let base64Data = imageData;
      if (imageData.startsWith('data:')) {
        const base64Match = imageData.match(/^data:image\/[^;]+;base64,(.+)$/);
        if (base64Match) base64Data = base64Match[1];
      }
      imageBuffer = Buffer.from(base64Data, 'base64');
    } else {
      try {
        imageBuffer = await fetchImageBuffer(imageUrl);
      } catch (error) {
        imageBuffer = await sharp({
          create: { width: targetWidth, height: targetHeight, channels: 3, background: { r: 70, g: 130, b: 180 } }
        }).jpeg().toBuffer();
      }
    }
    
    const processedImage = sharp(imageBuffer).resize(targetWidth, targetHeight, { fit: 'cover', position: 'center' });
    
    // Generate SVG overlay (simplified version - you can expand this)
    function escapeXml(text) {
      return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }
    
    const titleText = escapeXml(Buffer.from(title, 'utf-8').toString('utf-8').toUpperCase());
    const websiteText = escapeXml(Buffer.from(website, 'utf-8').toString('utf-8').toUpperCase());
    
    const padding = 80;
    const titleSize = selectedDesign.titleSize;
    const lineHeight = Math.round(titleSize + 8);
    
    // Simple single-line layout
    const svgHeight = 300;
    const titleY = Math.round(svgHeight / 2);
    const websiteY = titleY + 60;
    
    const gradientStops = selectedDesign.gradientColors && selectedDesign.gradientColors.length > 0 
      ? selectedDesign.gradientColors.map((color, index) => `<stop offset="${index === 0 ? '0%' : '100%'}" style="stop-color:${color}"/>`).join('')
      : '';
    
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
      <svg width="${targetWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">${gradientStops}</linearGradient>
        </defs>
        <style>
          .title { font-family: "${selectedDesign.fontFamily}", Arial, sans-serif; font-size: ${titleSize}px; font-weight: ${selectedDesign.fontWeight}; fill: ${selectedDesign.titleColor}; text-anchor: middle; }
          .website { font-family: "${selectedDesign.fontFamily}", Arial, sans-serif; font-size: ${selectedDesign.websiteSize}px; font-weight: ${selectedDesign.fontWeight}; fill: ${selectedDesign.websiteColor}; text-anchor: middle; }
        </style>
        ${design === 'antonTransparent' || design === 'blank' ? '' : '<rect width="100%" height="100%" fill="url(#gradient)"/>'}
        <text x="${Math.round(targetWidth / 2)}" y="${titleY}" class="title">${titleText}</text>
        ${website ? `<text x="${Math.round(targetWidth / 2)}" y="${websiteY}" class="website">${websiteText}</text>` : ''}
      </svg>`;
    
    const svgBuffer = Buffer.from(svg, 'utf-8');
    
    // Composite
    let finalImage;
    if (design === 'blank' || design === 'antonTransparent') {
      finalImage = await sharp(svgBuffer).png().toBuffer();
    } else {
      finalImage = await processedImage
        .composite([{ input: svgBuffer, left: 0, top: Math.round(targetHeight - svgHeight), blend: 'over' }])
        .jpeg({ quality: 90 })
        .toBuffer();
    }
    
    // Send response
    const contentType = (design === 'blank' || design === 'antonTransparent') ? 'image/png' : 'image/jpeg';
    const fileExtension = (design === 'blank' || design === 'antonTransparent') ? 'png' : 'jpg';
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const uniqueFilename = `banner-${design}-${timestamp}-${randomString}.${fileExtension}`;
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${uniqueFilename}"`);
    res.setHeader('Content-Length', String(finalImage.length));
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.setHeader('X-Design-Theme', selectedDesign.name);
    res.setHeader('X-Secured-With', 'API-Key');
    
    console.log(`✅ Banner generated in ${Date.now() - startTime}ms`);
    
    res.send(finalImage);
    
    // Log successful usage
    await logUsage({
      apiKeyId: validKey.id,
      endpoint: '/api/banner-gen.jpg',
      method: req.method,
      status: 200,
      latencyMs: Date.now() - startTime,
      bytesOut: finalImage.length,
      metadata: {
        design: design,
        hasCustomImage: !!imageUrl,
        width: w,
        height: h
      }
    });
    
  } catch (error) {
    console.error('❌ Banner generation failed:', error);
    
    res.status(500).json({
      error: 'Banner generation failed',
      message: error.message
    });
  }
}
