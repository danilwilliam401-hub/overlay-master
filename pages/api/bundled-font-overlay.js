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
      `Sick leave. Dahil nasaktan ako nung iniwan mo ko.`,
      `Lahat ba ng Math major laging hinahanap si X?`,
      `Huwag kang umasa na babalik pa siya, kung nasa piling na siya ng iba.`,
      `Para kang exam, hindi ko na maunawaan.`,
      `Sana may traffic lights din sa love, para alam natin kung kailang maghahanda, di-direstso, o hihinto.`,
      `Ang jowa minsan parang sinaing rin iyan, kailangang bantayan.`,
      `Mabuti pa yung kape, mainit man o malamig, hinahanap-hanap pa rin.`,
      `Sa love, 'di maiiwasan na may U-Turn. Yung akala mong dire-diretso na, may babalikan pa pala.`,
      `Walang masama magmahal basta alam mong Saan ka liliko o didiretso para wala kang nasasagasaang tao`,
      `Mahal. Minsan bilihin, kadalasan ikaw.`
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
  "Sa love, ‘di maiiwasan na may U-Turn. Yung akala mong dire-diretso na, may babalikan pa pala.",
  "Hintayin mo ang true love mo. Na-traffic lang yun sa malalanding tao.",
  "Hindi lahat ng patama tungkol sa’yo, sadyang natatamaan ka lang kasi!",
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
  "Sana tinuruan mo ‘ko kung paano madaling makalimot tulad ng ginawa mong paglimot sa’kin.",
  "Buti pa ang ngipin nabubunot kapag masakit. Sa ang puso ganun din.",
  "Umiiyak ka na naman? I-break mo na kasi!",
  "Ayaw ko nang magmahal masasaktan lang ulet ako.",
  "Di magatatagal yan! Lahat kaya may hangganan.",
  "Di naman siya mahal niyan. Assuming lang talaga yan!",
  "Ba’t naman sinagot mo? Lolokohin ka lang niyan!",
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
  "Wag kang mag-alala kung sa tingin mo maraming naninira sa’yo. Isipin mo na lang na sadyang inggit sila sa kung anong narating mo.",
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
  "Kung lahat ng makakaya mo ay iyong ibinibigay, tagumpay mo’y walang kapantay.",
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
  "Kapag umuwi ang OFW wag ka agad mag-expect ng pasalubong. Bakit nung umalis ba sila may hiningi sila sa’yo?",
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
  "Na-Columbia Kala mo sa’yo yun pala hindi.",
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
      "Hugot", "Pag-ibig", "Broken", "Heartbreak", "Hugot Lines",
      "Pinoy Hugot", "Love Quotes", "Sad Quotes", "Tagalog Quotes", "Bitter"
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
      title = decodeURIComponent(rawParams.title || 'Sample Title');
    }
    if (website === '') {
      website = decodeURIComponent(rawParams.website || '');
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
    
    const image = imageData ? null : (imageUrl.startsWith('http') ? imageUrl : decodeURIComponent(imageUrl));

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
    const padding = (design === 'entertainment' || design === 'antonBlack' || design === 'antonTransparent' || design === 'antonTransparent2' || design === 'antonWhite') ? 15 : (design === 'cinematic' || design === 'vintage') ? 30 : 80; // Minimal padding for entertainment, antonBlack, antonTransparent, antonTransparent2, and antonWhite to maximize text spread
    const contentWidth = targetWidth - (padding * 2); // Available width for text
    
    // Function to wrap text into multiple lines - NO ELLIPSIS, accept all text
    function wrapText(text, maxWidth, fontSize) {
      const words = text.split(' ');
      const lines = [];
      let currentLine = '';
      
      // More accurate character width estimation for Noto Sans
      // For entertainment, antonBlack, antonTransparent, antonTransparent2, and antonWhite designs, use narrower char width for better spreading
      const avgCharWidth = (design === 'entertainment' || design === 'antonBlack' || design === 'antonTransparent' || design === 'antonTransparent2' || design === 'antonWhite') ? fontSize * 0.45 : fontSize * 0.55;
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
    
    console.log('🔤 SVG created with font references');
    console.log('📊 SVG preview (first 200 chars):', svg.substring(0, 200));
    
    // Convert SVG to buffer
    const svgBuffer = Buffer.from(svg, 'utf-8');
    
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
      finalImage = await processedImage
        .composite([{
          input: svgBuffer,
          left: 0,
          top: compositeTop,
          blend: 'over'
        }])
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