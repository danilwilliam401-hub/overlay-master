import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { protectApiRoute } from '../../../lib/apiKeyAuth';

// Runtime configuration for Node.js (required for Sharp)
export const runtime = 'nodejs';

// Disable body parsing to handle both JSON and query params
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

/**
 * Secure Overlay API Endpoint
 * 
 * Authentication: API Key in Authorization header
 * Format: Authorization: Bearer sk_live_xxxxxxxxxxxxxxxxxxxx
 * 
 * Parameters (GET query string or POST JSON body):
 * - title: Text for the overlay title
 * - website: Website text (optional)
 * - design: Design theme (default, tech, entertainment, bebas, etc.)
 * - image: Image URL (optional)
 * - imageData: Base64 image data (optional)
 * - w: Width in pixels (default: 1080)
 * - h: Height in pixels (default: 1350)
 * - hl: Highlight colors (comma-separated hex codes, e.g., "FFD700,FF8C00")
 * - wc: Website color override (hex code or color name)
 * 
 * Example GET Request:
 * GET /api/v1/secure-overlay?title=AMAZING%20SALE&website=SHOP.COM&design=bebas&w=1080&h=1350&hl=FFD700,FF8C00&wc=FF0000
 * Headers: Authorization: Bearer sk_live_xxxxxxxxxxxxxxxxxxxx
 * 
 * Example POST Request:
 * POST /api/v1/secure-overlay
 * Headers: 
 *   Authorization: Bearer sk_live_xxxxxxxxxxxxxxxxxxxx
 *   Content-Type: application/json
 * Body: {
 *   "title": "AMAZING SALE",
 *   "website": "SHOP.COM",
 *   "design": "bebas",
 *   "w": 1080,
 *   "h": 1350,
 *   "hl": "FFD700,FF8C00",
 *   "wc": "FF0000"
 * }
 */
export default async function handler(req, res) {
  const startTime = Date.now();
  
  try {
    // ========================================
    // STEP 1: API KEY AUTHENTICATION
    // ========================================
    // TEMPORARILY DISABLED FOR LOCALHOST TESTING
    // Uncomment the lines below to enable API key authentication
    /*
    console.log('🔐 Validating API key...');
    const { valid, key, error } = await protectApiRoute(req);
    
    if (!valid) {
      console.log('❌ Authentication failed:', error);
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: error || 'Invalid or missing API key',
        hint: 'Include API key in Authorization header: Bearer sk_live_xxxxxxxxxxxxxxxxxxxx'
      });
    }
    
    console.log(`✅ Authenticated: ${key.user.email} (Key: ${key.keyPrefix}...)`);
    */
    
    // Mock key for testing (remove when enabling auth)
    const key = {
      id: 'test-key-id',
      keyPrefix: 'sk_test_local',
      user: { email: 'test@localhost.com' }
    };
    console.log('⚠️ Running in TEST MODE without authentication');
    
    // ========================================
    // STEP 2: EXTRACT PARAMETERS
    // ========================================
    const isPost = req.method === 'POST';
    const params = isPost ? req.body : req.query;
    
    const title = params.title || 'Sample Title';
    const website = params.website || '';
    const design = params.design || 'default';
    const imageUrl = params.image || params.imageUrl || '';
    const imageData = params.imageData || '';
    const w = parseInt(params.w || '1080');
    const h = parseInt(params.h || '1350');
    const hlParam = params.hl || '';
    const wcParam = params.wc || '';
    const watermark = params.watermark || ''; // Watermark text for preview images
    const keywords = params.keywords || ''; // Comma-separated custom keywords for highlighting
    const titleColorParam = params.titleColor || params.tc || ''; // Custom title color
    const titleBgColorParam = params.titleBgColor || params.tbc || ''; // Title background color
    const titleBgGradientParam = params.titleBgGradient || params.tbg || ''; // Title background gradient (comma-separated)
    const borderEnabled = params.borderEnabled === 'true' || params.borderEnabled === true; // Border toggle
    const borderWidth = parseInt(params.borderWidth || '10'); // Border width in pixels
    const borderColor = params.borderColor || '000000'; // Border color (hex)
    const borderInset = parseInt(params.borderInset || '0'); // Border inset from edges (px)
    const logoUrl = params.logoUrl || ''; // Logo image URL
    const logoPosition = params.logoPosition || 'top-center'; // Logo position: top-left, top-center, top-right
    const logoSize = parseInt(params.logoSize || '150'); // Logo width in pixels
    const topText = params.topText || ''; // Top label text (e.g., "BREAKING NEWS")
    const topTextPosition = params.topTextPosition || 'left'; // Position: left, center, right
    const topTextBgColor = params.topTextBgColor || 'FF0000'; // Background color (hex)
    const topTextColor = params.topTextColor || 'FFFFFF'; // Text color (hex)
    const topTextSize = parseInt(params.topTextSize || '28'); // Font size in pixels
    const titleFontSize = params.titleFontSize ? parseInt(params.titleFontSize) : null; // Custom title font size
    const titleAlign = params.titleAlign || 'center'; // Title alignment: left, center, right
    const websiteFontSize = params.websiteFontSize ? parseInt(params.websiteFontSize) : null; // Custom website font size
    const websiteAlign = params.websiteAlign || 'center'; // Website alignment: left, center, right
    
    console.log('📝 Request Parameters:', {
      title,
      website,
      design,
      hasImage: !!imageUrl,
      hasImageData: !!imageData,
      dimensions: `${w}x${h}`,
      highlightColors: hlParam || 'default',
      websiteColor: wcParam || 'default',
      hasWatermark: !!watermark,
      borderEnabled,
      borderWidth: borderEnabled ? borderWidth : 'disabled',
      borderColor: borderEnabled ? borderColor : 'disabled',
      borderInset: borderEnabled ? borderInset : 'disabled',
      hasLogo: !!logoUrl,
      logoPosition: logoUrl ? logoPosition : 'disabled',
      logoSize: logoUrl ? logoSize : 'disabled',
      hasTopText: !!topText,
      topTextPosition: topText ? topTextPosition : 'disabled'
    });
    
    // ========================================
    // STEP 3: LOAD DESIGN CONFIGURATION (All themes from bundled-font-overlay)
    // ========================================
    const DESIGN_THEMES = {
      'default': { name: 'Breaking News Boldness', titleColor: '#FFFFFF', websiteColor: '#FFD700', gradientColors: ['rgba(0,31,63,0.0)', 'rgba(0,31,63,0.0)', 'rgba(0,31,63,0.05)', 'rgba(0,31,63,0.10)', 'rgba(0,31,63,0.15)', 'rgba(0,31,63,0.20)', 'rgba(0,31,63,0.25)', 'rgba(0,31,63,0.30)', 'rgba(0,31,63,0.35)', 'rgba(0,31,63,0.40)', 'rgba(0,31,63,0.45)', 'rgba(0,31,63,0.50)', 'rgba(0,31,63,0.55)', 'rgba(0,31,63,0.60)', 'rgba(0,31,63,0.65)', 'rgba(0,31,63,0.70)', 'rgba(0,31,63,0.75)', 'rgba(0,31,63,0.80)', 'rgba(0,31,63,0.85)', 'rgba(0,31,63,0.90)', 'rgba(0,31,63,0.95)', 'rgba(0,31,63,1.0)', 'rgba(0,31,63,1.0)', 'rgba(0,31,63,1.0)', 'rgba(0,31,63,1.0)', 'rgba(0,31,63,1.0)', 'rgba(0,31,63,1.0)', 'rgba(0,31,63,1.0)', 'rgba(0,31,63,1.0)', 'rgba(0,31,63,1.0)', 'rgba(0,31,63,1.0)', 'rgba(0,31,63,1.0)', 'rgba(0,31,63,1.0)', 'rgba(0,31,63,1.0)', 'rgba(0,31,63,1.0)', 'rgba(0,31,63,1.0)', 'rgba(0,31,63,1.0)', 'rgba(0,31,63,1.0)', 'rgba(0,31,63,1.0)'], titleSize: 48, websiteSize: 24, fontWeight: '700', fontFamily: 'Bebas Neue' },
      'tech': { name: 'Professional Editorial', titleColor: '#FFFFFF', websiteColor: '#E0E0E0', gradientColors: ['rgba(38,50,56,0.0)', 'rgba(38,50,56,0.0)', 'rgba(38,50,56,0.05)', 'rgba(38,50,56,0.10)', 'rgba(38,50,56,0.15)', 'rgba(38,50,56,0.20)', 'rgba(38,50,56,0.25)', 'rgba(38,50,56,0.30)', 'rgba(38,50,56,0.35)', 'rgba(38,50,56,0.40)', 'rgba(38,50,56,0.45)', 'rgba(38,50,56,0.50)', 'rgba(38,50,56,0.55)', 'rgba(38,50,56,0.60)', 'rgba(38,50,56,0.65)', 'rgba(38,50,56,0.70)', 'rgba(38,50,56,0.75)', 'rgba(38,50,56,0.80)', 'rgba(38,50,56,0.85)', 'rgba(38,50,56,0.90)', 'rgba(38,50,56,0.95)', 'rgba(38,50,56,1.0)', 'rgba(38,50,56,1.0)', 'rgba(38,50,56,1.0)', 'rgba(38,50,56,1.0)', 'rgba(38,50,56,1.0)', 'rgba(38,50,56,1.0)', 'rgba(38,50,56,1.0)', 'rgba(38,50,56,1.0)', 'rgba(38,50,56,1.0)', 'rgba(38,50,56,1.0)', 'rgba(38,50,56,1.0)', 'rgba(38,50,56,1.0)', 'rgba(38,50,56,1.0)', 'rgba(38,50,56,1.0)', 'rgba(38,50,56,1.0)', 'rgba(38,50,56,1.0)', 'rgba(38,50,56,1.0)', 'rgba(38,50,56,1.0)'], titleSize: 52, websiteSize: 26, fontWeight: '700', fontFamily: 'Oswald' },
      'entertainment': { name: 'Viral & Loud', titleColor: '#FFFFFF', websiteColor: '#FFB347', gradientColors: ['rgba(230,81,0,0.0)', 'rgba(230,81,0,0.0)', 'rgba(230,81,0,0.05)', 'rgba(230,81,0,0.10)', 'rgba(230,81,0,0.15)', 'rgba(230,81,0,0.20)', 'rgba(230,81,0,0.25)', 'rgba(230,81,0,0.30)', 'rgba(230,81,0,0.35)', 'rgba(230,81,0,0.40)', 'rgba(230,81,0,0.45)', 'rgba(230,81,0,0.50)', 'rgba(230,81,0,0.55)', 'rgba(230,81,0,0.60)', 'rgba(230,81,0,0.65)', 'rgba(230,81,0,0.70)', 'rgba(230,81,0,0.75)', 'rgba(230,81,0,0.80)', 'rgba(230,81,0,0.85)', 'rgba(230,81,0,0.90)', 'rgba(230,81,0,0.95)', 'rgba(230,81,0,1.0)', 'rgba(230,81,0,1.0)', 'rgba(230,81,0,1.0)', 'rgba(230,81,0,1.0)', 'rgba(230,81,0,1.0)', 'rgba(230,81,0,1.0)', 'rgba(230,81,0,1.0)', 'rgba(230,81,0,1.0)', 'rgba(230,81,0,1.0)', 'rgba(230,81,0,1.0)', 'rgba(230,81,0,1.0)', 'rgba(230,81,0,1.0)', 'rgba(230,81,0,1.0)', 'rgba(230,81,0,1.0)', 'rgba(230,81,0,1.0)', 'rgba(230,81,0,1.0)', 'rgba(230,81,0,1.0)', 'rgba(230,81,0,1.0)'], titleSize: 78, websiteSize: 32, fontWeight: '900', fontFamily: 'Anton' },
      'antonBlack': { name: 'Anton Black', titleColor: '#FFFFFF', websiteColor: '#FFFFFF', gradientColors: ['rgba(0,0,0,0.0)', 'rgba(0,0,0,0.0)', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0.10)', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0.20)', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.30)', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.40)', 'rgba(0,0,0,0.45)', 'rgba(0,0,0,0.50)', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.60)', 'rgba(0,0,0,0.65)', 'rgba(0,0,0,0.70)', 'rgba(0,0,0,0.75)', 'rgba(0,0,0,0.80)', 'rgba(0,0,0,0.85)', 'rgba(0,0,0,0.90)', 'rgba(0,0,0,0.95)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)'], titleSize: 78, websiteSize: 32, fontWeight: '900', fontFamily: 'Anton' },
      'bebas': { name: 'Bebas Black Gradient', titleColor: '#FFFFFF', websiteColor: '#FFFFFF', gradientColors: ['rgba(0,0,0,0.0)', 'rgba(0,0,0,0.0)', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0.10)', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0.20)', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.30)', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.40)', 'rgba(0,0,0,0.45)', 'rgba(0,0,0,0.50)', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.60)', 'rgba(0,0,0,0.65)', 'rgba(0,0,0,0.70)', 'rgba(0,0,0,0.75)', 'rgba(0,0,0,0.80)', 'rgba(0,0,0,0.85)', 'rgba(0,0,0,0.90)', 'rgba(0,0,0,0.95)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)', 'rgba(0,0,0,1.0)'], titleSize: 78, websiteSize: 32, fontWeight: '900', fontFamily: 'Anton', enableHighlight: true },
      'sports': { name: 'Impact Headlines', titleColor: '#FFFFFF', websiteColor: '#90EE90', gradientColors: ['rgba(0,77,64,0.0)', 'rgba(0,77,64,0.0)', 'rgba(0,77,64,0.05)', 'rgba(0,77,64,0.10)', 'rgba(0,77,64,0.15)', 'rgba(0,77,64,0.20)', 'rgba(0,77,64,0.25)', 'rgba(0,77,64,0.30)', 'rgba(0,77,64,0.35)', 'rgba(0,77,64,0.40)', 'rgba(0,77,64,0.45)', 'rgba(0,77,64,0.50)', 'rgba(0,77,64,0.55)', 'rgba(0,77,64,0.60)', 'rgba(0,77,64,0.65)', 'rgba(0,77,64,0.70)', 'rgba(0,77,64,0.75)', 'rgba(0,77,64,0.80)', 'rgba(0,77,64,0.85)', 'rgba(0,77,64,0.90)', 'rgba(0,77,64,0.95)', 'rgba(0,77,64,1.0)', 'rgba(0,77,64,1.0)', 'rgba(0,77,64,1.0)', 'rgba(0,77,64,1.0)', 'rgba(0,77,64,1.0)', 'rgba(0,77,64,1.0)', 'rgba(0,77,64,1.0)', 'rgba(0,77,64,1.0)', 'rgba(0,77,64,1.0)', 'rgba(0,77,64,1.0)', 'rgba(0,77,64,1.0)', 'rgba(0,77,64,1.0)', 'rgba(0,77,64,1.0)', 'rgba(0,77,64,1.0)', 'rgba(0,77,64,1.0)', 'rgba(0,77,64,1.0)', 'rgba(0,77,64,1.0)', 'rgba(0,77,64,1.0)'], titleSize: 50, websiteSize: 25, fontWeight: '900', fontFamily: 'Impact' },
      'anime': { name: 'Friendly & Trustworthy', titleColor: '#FFFFFF', websiteColor: '#FFB347', gradientColors: ['rgba(255,111,0,0.0)', 'rgba(255,111,0,0.0)', 'rgba(255,111,0,0.05)', 'rgba(255,111,0,0.10)', 'rgba(255,111,0,0.15)', 'rgba(255,111,0,0.20)', 'rgba(255,111,0,0.25)', 'rgba(255,111,0,0.30)', 'rgba(255,111,0,0.35)', 'rgba(255,111,0,0.40)', 'rgba(255,111,0,0.45)', 'rgba(255,111,0,0.50)', 'rgba(255,111,0,0.55)', 'rgba(255,111,0,0.60)', 'rgba(255,111,0,0.65)', 'rgba(255,111,0,0.70)', 'rgba(255,111,0,0.75)', 'rgba(255,111,0,0.80)', 'rgba(255,111,0,0.85)', 'rgba(255,111,0,0.90)', 'rgba(255,111,0,0.95)', 'rgba(255,111,0,1.0)', 'rgba(255,111,0,1.0)', 'rgba(255,111,0,1.0)', 'rgba(255,111,0,1.0)', 'rgba(255,111,0,1.0)', 'rgba(255,111,0,1.0)', 'rgba(255,111,0,1.0)', 'rgba(255,111,0,1.0)', 'rgba(255,111,0,1.0)', 'rgba(255,111,0,1.0)', 'rgba(255,111,0,1.0)', 'rgba(255,111,0,1.0)', 'rgba(255,111,0,1.0)', 'rgba(255,111,0,1.0)', 'rgba(255,111,0,1.0)', 'rgba(255,111,0,1.0)', 'rgba(255,111,0,1.0)', 'rgba(255,111,0,1.0)'], titleSize: 46, websiteSize: 23, fontWeight: '800', fontFamily: 'Poppins' },
      'modern': { name: 'Modern Authority', titleColor: '#FFFFFF', websiteColor: '#E6E6FA', gradientColors: ['rgba(0,51,153,0.0)', 'rgba(0,51,153,0.0)', 'rgba(0,51,153,0.05)', 'rgba(0,51,153,0.10)', 'rgba(0,51,153,0.15)', 'rgba(0,51,153,0.20)', 'rgba(0,51,153,0.25)', 'rgba(0,51,153,0.30)', 'rgba(0,51,153,0.35)', 'rgba(0,51,153,0.40)', 'rgba(0,51,153,0.45)', 'rgba(0,51,153,0.50)', 'rgba(0,51,153,0.55)', 'rgba(0,51,153,0.60)', 'rgba(0,51,153,0.65)', 'rgba(0,51,153,0.70)', 'rgba(0,51,153,0.75)', 'rgba(0,51,153,0.80)', 'rgba(0,51,153,0.85)', 'rgba(0,51,153,0.90)', 'rgba(0,51,153,0.95)', 'rgba(0,51,153,1.0)', 'rgba(0,51,153,1.0)', 'rgba(0,51,153,1.0)', 'rgba(0,51,153,1.0)', 'rgba(0,51,153,1.0)', 'rgba(0,51,153,1.0)', 'rgba(0,51,153,1.0)', 'rgba(0,51,153,1.0)', 'rgba(0,51,153,1.0)', 'rgba(0,51,153,1.0)', 'rgba(0,51,153,1.0)', 'rgba(0,51,153,1.0)', 'rgba(0,51,153,1.0)', 'rgba(0,51,153,1.0)', 'rgba(0,51,153,1.0)', 'rgba(0,51,153,1.0)', 'rgba(0,51,153,1.0)', 'rgba(0,51,153,1.0)'], titleSize: 60, websiteSize: 24, fontWeight: '800', fontFamily: 'Montserrat' },
      'bold': { name: 'Stylish Credibility', titleColor: '#FFFFFF', websiteColor: '#F5DEB3', gradientColors: ['rgba(62,39,35,0.0)', 'rgba(62,39,35,0.0)', 'rgba(62,39,35,0.05)', 'rgba(62,39,35,0.10)', 'rgba(62,39,35,0.15)', 'rgba(62,39,35,0.20)', 'rgba(62,39,35,0.25)', 'rgba(62,39,35,0.30)', 'rgba(62,39,35,0.35)', 'rgba(62,39,35,0.40)', 'rgba(62,39,35,0.45)', 'rgba(62,39,35,0.50)', 'rgba(62,39,35,0.55)', 'rgba(62,39,35,0.60)', 'rgba(62,39,35,0.65)', 'rgba(62,39,35,0.70)', 'rgba(62,39,35,0.75)', 'rgba(62,39,35,0.80)', 'rgba(62,39,35,0.85)', 'rgba(62,39,35,0.90)', 'rgba(62,39,35,0.95)', 'rgba(62,39,35,1.0)', 'rgba(62,39,35,1.0)', 'rgba(62,39,35,1.0)', 'rgba(62,39,35,1.0)', 'rgba(62,39,35,1.0)', 'rgba(62,39,35,1.0)', 'rgba(62,39,35,1.0)', 'rgba(62,39,35,1.0)', 'rgba(62,39,35,1.0)', 'rgba(62,39,35,1.0)', 'rgba(62,39,35,1.0)', 'rgba(62,39,35,1.0)', 'rgba(62,39,35,1.0)', 'rgba(62,39,35,1.0)', 'rgba(62,39,35,1.0)', 'rgba(62,39,35,1.0)', 'rgba(62,39,35,1.0)', 'rgba(62,39,35,1.0)'], titleSize: 85, websiteSize: 35, fontWeight: '900', fontFamily: 'Raleway' },
      'luxury': { name: 'Luxury Burgundy', titleColor: '#FFFFFF', websiteColor: '#FFD700', gradientColors: ['rgba(128,0,32,0.0)', 'rgba(128,0,32,0.0)', 'rgba(128,0,32,0.05)', 'rgba(128,0,32,0.10)', 'rgba(128,0,32,0.15)', 'rgba(128,0,32,0.20)', 'rgba(128,0,32,0.25)', 'rgba(128,0,32,0.30)', 'rgba(128,0,32,0.35)', 'rgba(128,0,32,0.40)', 'rgba(128,0,32,0.45)', 'rgba(128,0,32,0.50)', 'rgba(128,0,32,0.55)', 'rgba(128,0,32,0.60)', 'rgba(128,0,32,0.65)', 'rgba(128,0,32,0.70)', 'rgba(128,0,32,0.75)', 'rgba(128,0,32,0.80)', 'rgba(128,0,32,0.85)', 'rgba(128,0,32,0.90)', 'rgba(128,0,32,0.95)', 'rgba(128,0,32,1.0)', 'rgba(128,0,32,1.0)', 'rgba(128,0,32,1.0)', 'rgba(128,0,32,1.0)', 'rgba(128,0,32,1.0)', 'rgba(128,0,32,1.0)', 'rgba(128,0,32,1.0)', 'rgba(128,0,32,1.0)', 'rgba(128,0,32,1.0)', 'rgba(128,0,32,1.0)', 'rgba(128,0,32,1.0)', 'rgba(128,0,32,1.0)', 'rgba(128,0,32,1.0)', 'rgba(128,0,32,1.0)', 'rgba(128,0,32,1.0)', 'rgba(128,0,32,1.0)', 'rgba(128,0,32,1.0)', 'rgba(128,0,32,1.0)'], titleSize: 63, websiteSize: 26, fontWeight: '700', fontFamily: 'Playfair Display' }
    };
    
    const selectedDesign = DESIGN_THEMES[design] || DESIGN_THEMES['default'];
    
    // Apply website color override if provided
    if (wcParam) {
      const colorMap = {
        'gold': '#FFD700', 'orange': '#FF8C00', 'red': '#FF0000',
        'blue': '#0000FF', 'green': '#00FF00', 'purple': '#800080',
        'cyan': '#00FFFF', 'white': '#FFFFFF', 'yellow': '#FFFF00'
      };
      selectedDesign.websiteColor = colorMap[wcParam.toLowerCase()] || `#${wcParam}`;
    }
    
    // Apply title color override if provided
    if (titleColorParam) {
      const colorMap = {
        'gold': '#FFD700', 'orange': '#FF8C00', 'red': '#FF0000',
        'blue': '#0000FF', 'green': '#00FF00', 'purple': '#800080',
        'cyan': '#00FFFF', 'white': '#FFFFFF', 'yellow': '#FFFF00', 'black': '#000000'
      };
      selectedDesign.titleColor = colorMap[titleColorParam.toLowerCase()] || `#${titleColorParam}`;
    }
    
    // Apply title background color/gradient
    let titleBgColors = [];
    if (titleBgGradientParam) {
      // Parse gradient colors (comma-separated hex codes)
      titleBgColors = titleBgGradientParam.split(',').map(c => {
        const hex = c.trim().replace('#', '');
        return `#${hex}`;
      });
    } else if (titleBgColorParam) {
      // Single background color
      const colorMap = {
        'gold': '#FFD700', 'orange': '#FF8C00', 'red': '#FF0000',
        'blue': '#0000FF', 'green': '#00FF00', 'purple': '#800080',
        'cyan': '#00FFFF', 'white': '#FFFFFF', 'yellow': '#FFFF00', 'black': '#000000'
      };
      const bgColor = colorMap[titleBgColorParam.toLowerCase()] || `#${titleBgColorParam}`;
      titleBgColors = [bgColor];
    }
    
    // Parse highlight colors
    let highlightColors = [];
    if (hlParam) {
      highlightColors = hlParam.split(',').map(c => `#${c.replace('#', '')}`);
    }
    
    // ========================================
    // STEP 4: LOAD IMAGE
    // ========================================
    console.log('📥 Processing image...');
    let imageBuffer;
    
    if (imageData) {
      // Handle base64 data
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      imageBuffer = Buffer.from(base64Data, 'base64');
      console.log('✅ Loaded base64 image:', imageBuffer.length, 'bytes');
    } else if (imageUrl) {
      // Fetch from URL
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      imageBuffer = Buffer.from(await response.arrayBuffer());
      console.log('✅ Fetched image from URL:', imageBuffer.length, 'bytes');
    } else {
      // Create blank gradient background
      const bgColor = selectedDesign.gradientColors[0].match(/rgba?\((\d+),(\d+),(\d+)/);
      const rgb = bgColor ? { 
        r: parseInt(bgColor[1]), 
        g: parseInt(bgColor[2]), 
        b: parseInt(bgColor[3]) 
      } : { r: 0, g: 0, b: 0 };
      
      imageBuffer = await sharp({
        create: {
          width: w,
          height: h,
          channels: 3,
          background: rgb
        }
      }).jpeg().toBuffer();
      console.log('✅ Created blank background');
    }
    
    // ========================================
    // STEP 5: GENERATE OVERLAY SVG
    // ========================================
    console.log('🎨 Generating overlay SVG...');
    
    const padding = design === 'bebas' || design === 'entertainment' ? 15 : 80;
    const contentWidth = w - (padding * 2);
    
    // Simple text wrapping
    function wrapText(text, maxWidth, fontSize) {
      const words = text.split(' ');
      const lines = [];
      const avgCharWidth = fontSize * 0.55;
      const maxCharsPerLine = Math.floor(maxWidth / avgCharWidth);
      
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
    
    // Use custom font sizes or defaults from design theme
    const actualTitleSize = titleFontSize || selectedDesign.titleSize;
    const actualWebsiteSize = websiteFontSize || selectedDesign.websiteSize;
    
    const titleLines = wrapText(title.toUpperCase(), contentWidth, actualTitleSize);
    const lineHeight = Math.round(actualTitleSize + 8); // Ensure integer
    const totalTitleHeight = Math.round(titleLines.length * lineHeight);
    
    // Calculate top text dimensions if provided
    let topTextHeight = 0;
    let topTextY = 0;
    let topTextX = padding;
    let topTextBoxWidth = 0;
    let topTextBoxHeight = 0;
    
    if (topText) {
      const topTextPadding = 12;
      topTextBoxHeight = Math.round(topTextSize + topTextPadding * 2);
      
      // Estimate text width (rough calculation)
      const avgCharWidth = topTextSize * 0.6;
      topTextBoxWidth = Math.round((topText.length * avgCharWidth) + (topTextPadding * 2));
      
      // Calculate X position based on alignment
      if (topTextPosition === 'center') {
        topTextX = Math.round((w - topTextBoxWidth) / 2);
      } else if (topTextPosition === 'right') {
        topTextX = w - topTextBoxWidth - padding;
      }
      
      topTextY = 15; // Top margin for the label
      topTextHeight = topTextBoxHeight + 20; // Add spacing below
    }
    
    const topMargin = topTextHeight > 0 ? topTextHeight + 10 : 20;
    const titleStartY = Math.round(topMargin + (lineHeight * 0.8));
    const titleEndY = Math.round(titleStartY + totalTitleHeight);
    const websiteY = website ? Math.round(titleEndY + 25) : 0;
    const svgHeight = Math.round(website ? websiteY + 50 : titleEndY + 40);
    
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${w}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
      ${selectedDesign.gradientColors.map((color, idx) => {
        const offset = selectedDesign.gradientColors.length === 1 ? '0%' : `${Math.round((idx / (selectedDesign.gradientColors.length - 1)) * 100)}%`;
        return `<stop offset="${offset}" style="stop-color:${color}"/>`;
      }).join('\n      ')}
    </linearGradient>
    ${titleBgColors.length > 0 ? `
    <linearGradient id="titleBgGrad" x1="0%" y1="0%" x2="${titleBgColors.length === 1 ? '0%' : '100%'}" y2="${titleBgColors.length === 1 ? '0%' : '0%'}">
      ${titleBgColors.map((color, idx) => {
        const offset = titleBgColors.length === 1 ? '0%' : `${Math.round((idx / (titleBgColors.length - 1)) * 100)}%`;
        return `<stop offset="${offset}" style="stop-color:${color}"/>`;
      }).join('\n      ')}
    </linearGradient>` : ''}
  </defs>
  
  <style>
    .title-text {
      font-family: "${selectedDesign.fontFamily}", Arial, sans-serif;
      font-size: ${actualTitleSize}px;
      font-weight: ${selectedDesign.fontWeight};
      fill: ${selectedDesign.titleColor};
      text-anchor: ${titleAlign === 'left' ? 'start' : titleAlign === 'right' ? 'end' : 'middle'};
      dominant-baseline: middle;
    }
    .website-text {
      font-family: "${selectedDesign.fontFamily}", Arial, sans-serif;
      font-size: ${actualWebsiteSize}px;
      font-weight: ${selectedDesign.fontWeight};
      fill: ${selectedDesign.websiteColor};
      text-anchor: ${websiteAlign === 'left' ? 'start' : websiteAlign === 'right' ? 'end' : 'middle'};
      dominant-baseline: middle;
      letter-spacing: 2px;
    }
    ${highlightColors.map((color, idx) => `
    .highlight-${idx} {
      fill: ${color};
      filter: drop-shadow(0 0 8px ${color});
    }`).join('')}
  </style>
  
  <rect width="100%" height="100%" fill="url(#grad)"/>
  
  ${topText ? `
  <!-- Top Text Label (e.g., Breaking News) -->
  <rect x="${topTextX}" y="${topTextY}" width="${topTextBoxWidth}" height="${topTextBoxHeight}" fill="#${topTextBgColor}" rx="4"/>
  <text x="${topTextX + topTextBoxWidth / 2}" y="${topTextY + topTextBoxHeight / 2}" 
        font-family="Arial, sans-serif" 
        font-size="${topTextSize}" 
        font-weight="900" 
        fill="#${topTextColor}" 
        text-anchor="middle" 
        dominant-baseline="middle"
        letter-spacing="1">${topText.toUpperCase()}</text>
  ` : ''}
  
  ${titleBgColors.length > 0 ? `<rect x="${padding}" y="${Math.round(titleStartY - lineHeight * 0.9)}" width="${contentWidth}" height="${Math.round(totalTitleHeight + lineHeight * 0.4)}" fill="${titleBgColors.length === 1 ? titleBgColors[0] : 'url(#titleBgGrad)'}" rx="8"/>` : ''}
  
  ${titleLines.map((line, idx) => {
    const yPos = Math.round(titleStartY + (idx * lineHeight));
    // Calculate X position based on alignment
    let titleX;
    if (titleAlign === 'left') {
      titleX = padding;
    } else if (titleAlign === 'right') {
      titleX = w - padding;
    } else {
      titleX = Math.round(w / 2);
    }
    
    // If keywords provided (works on all designs now), highlight custom keywords
    if (keywords && highlightColors.length > 0) {
      const keywordList = keywords.split(',').map(k => k.trim().toUpperCase());
      const words = line.split(' ');
      const segments = words.map((word, wordIdx) => {
        const isHighlighted = keywordList.some(kw => word.includes(kw));
        const colorIdx = keywordList.findIndex(kw => word.includes(kw)) % highlightColors.length;
        const className = isHighlighted ? `highlight-${colorIdx}` : '';
        return `<tspan class="${className}" font-family="${selectedDesign.fontFamily}">${word}</tspan>${wordIdx < words.length - 1 ? ' ' : ''}`;
      }).join('');
      return `<text x="${titleX}" y="${yPos}" class="title-text">${segments}</text>`;
    }
    return `<text x="${titleX}" y="${yPos}" class="title-text">${line}</text>`;
  }).join('\n  ')}
  
  ${website ? (() => {
    // Calculate X position based on website alignment
    let websiteX;
    if (websiteAlign === 'left') {
      websiteX = padding;
    } else if (websiteAlign === 'right') {
      websiteX = w - padding;
    } else {
      websiteX = Math.round(w / 2);
    }
    return `<text x="${websiteX}" y="${Math.round(websiteY)}" class="website-text">${website.toUpperCase()}</text>`;
  })() : ''}
</svg>`;
    
    // ========================================
    // STEP 6: COMPOSITE IMAGE
    // ========================================
    console.log('⚡ Compositing final image...');
    
    let processedImage = sharp(imageBuffer)
      .resize(w, h, { fit: 'cover', position: 'center' });
    
    // Prepare composite inputs (text overlay first)
    let compositeInputs = [{
      input: Buffer.from(svg, 'utf-8'),
      left: 0,
      top: Math.round(h - svgHeight), // Ensure integer value for Sharp
      blend: 'over'
    }];
    
    // Add logo if provided
    if (logoUrl) {
      try {
        console.log(`🏷️ Fetching logo from: ${logoUrl}`);
        const logoResponse = await fetch(logoUrl);
        if (logoResponse.ok) {
          const logoBuffer = Buffer.from(await logoResponse.arrayBuffer());
          
          // Resize logo to specified width (maintaining aspect ratio)
          const resizedLogo = await sharp(logoBuffer)
            .resize(logoSize, null, { 
              fit: 'inside',
              withoutEnlargement: true 
            })
            .toBuffer();
          
          // Get logo metadata to calculate position
          const logoMetadata = await sharp(resizedLogo).metadata();
          const logoWidth = logoMetadata.width;
          const logoHeight = logoMetadata.height;
          
          // Calculate position
          const margin = 20; // Margin from edges
          let logoLeft, logoTop;
          
          switch (logoPosition) {
            case 'top-left':
              logoLeft = margin;
              logoTop = margin;
              break;
            case 'top-center':
              logoLeft = Math.round((w - logoWidth) / 2);
              logoTop = margin;
              break;
            case 'top-right':
              logoLeft = w - logoWidth - margin;
              logoTop = margin;
              break;
            default:
              logoLeft = Math.round((w - logoWidth) / 2);
              logoTop = margin;
          }
          
          // Add logo to composite inputs
          compositeInputs.push({
            input: resizedLogo,
            left: logoLeft,
            top: logoTop,
            blend: 'over'
          });
          
          console.log(`✅ Logo added at ${logoPosition}: ${logoWidth}x${logoHeight}px at (${logoLeft}, ${logoTop})`);
        } else {
          console.error(`❌ Failed to fetch logo: ${logoResponse.statusText}`);
        }
      } catch (logoError) {
        console.error('❌ Error processing logo:', logoError.message);
      }
    }
    
    if (watermark) {
      const watermarkSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="rgba(0,0,0,0.02)"/>
  ${Array.from({length: 15}, (_, i) => {
    const row = Math.floor(i / 3);
    const col = i % 3;
    const xPos = Math.round((w / 4) + (col * w / 3));
    const yPos = Math.round((h / 6) + (row * h / 5));
    return `<text 
    x="${xPos}" 
    y="${yPos}" 
    text-anchor="middle" 
    font-family="Arial, sans-serif" 
    font-size="40" 
    font-weight="700" 
    fill="rgba(255,255,255,0.25)" 
    stroke="rgba(0,0,0,0.25)" 
    stroke-width="1.5" 
    transform="rotate(-30 ${xPos} ${yPos})"
    style="letter-spacing: 3px;"
  >${watermark}</text>`;
  }).join('\n  ')}
</svg>`;
      
      compositeInputs.push({
        input: Buffer.from(watermarkSvg, 'utf-8'),
        left: 0,
        top: 0,
        blend: 'over'
      });
    }
    
    // Add border if enabled (add as last composite so it's on top)
    if (borderEnabled) {
      console.log(`🖼️ Adding border: ${borderWidth}px, color: #${borderColor}, inset: ${borderInset}px`);
      
      // Parse border color (hex to RGB)
      const borderColorHex = borderColor.replace('#', '');
      const r = parseInt(borderColorHex.substring(0, 2), 16) || 0;
      const g = parseInt(borderColorHex.substring(2, 4), 16) || 0;
      const b = parseInt(borderColorHex.substring(4, 6), 16) || 0;
      
      if (borderInset === 0) {
        // If inset is 0, add border around the entire image using extend
        processedImage = processedImage.extend({
          top: borderWidth,
          bottom: borderWidth,
          left: borderWidth,
          right: borderWidth,
          background: { r, g, b }
        });
      } else {
        // If inset > 0, create border rectangle as SVG overlay
        const insetWidth = w - (borderInset * 2);
        const insetHeight = h - (borderInset * 2);
        
        // Create border rectangle SVG
        const borderSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <rect x="${borderInset + borderWidth/2}" y="${borderInset + borderWidth/2}" 
        width="${insetWidth - borderWidth}" height="${insetHeight - borderWidth}" 
        fill="none" 
        stroke="rgb(${r},${g},${b})" 
        stroke-width="${borderWidth}"/>
</svg>`;
        
        // Add border to composite inputs
        compositeInputs.push({
          input: Buffer.from(borderSvg, 'utf-8'),
          left: 0,
          top: 0,
          blend: 'over'
        });
      }
    }
    
    const finalImage = await processedImage
      .composite(compositeInputs)
      .jpeg({ quality: 90 })
      .toBuffer();
    
    console.log('✅ Final image generated:', finalImage.length, 'bytes');
    
    // ========================================
    // STEP 7: SEND RESPONSE
    // ========================================
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const filename = `${design}-overlay-${timestamp}-${randomString}.jpg`;
    
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Content-Length', String(finalImage.length));
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.setHeader('X-API-Key-Used', key.keyPrefix);
    res.setHeader('X-Design-Theme', selectedDesign.name);
    res.setHeader('X-Processing-Time', `${Date.now() - startTime}ms`);
    
    console.log(`✅ Request completed in ${Date.now() - startTime}ms`);
    
    res.send(finalImage);
    
  } catch (error) {
    console.error('❌ Error generating overlay:', error);
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to generate overlay',
      details: error.message
    });
  }
}
