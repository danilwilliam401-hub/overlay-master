import sharp from 'sharp';
import path from 'path';

// Force Node.js runtime (crucial for Sharp + fontconfig)
export const runtime = 'nodejs';

// Set up fontconfig paths at module load time
const fontConfigPath = path.join(process.cwd(), 'fontconfig');
const fontConfigFile = path.join(fontConfigPath, 'fonts.conf');

process.env.FONTCONFIG_PATH = fontConfigPath;
process.env.FONTCONFIG_FILE = fontConfigFile;
process.env.FC_DEBUG = "1";

console.log('🔤 Simple Font Test - Paths:', {
  FONTCONFIG_PATH: process.env.FONTCONFIG_PATH,
  FONTCONFIG_FILE: process.env.FONTCONFIG_FILE
});

export default async function handler(req, res) {
  console.log('\n🧪 === NOTO SANS FONT TEST ===');
  
  try {
    // Test multiple font scenarios
    const testTexts = [
      'HELLO WORLD', 
      'Test123!@#',
      'áéíóú çñü',  // accented characters
      '你好世界'      // Chinese characters (if Noto supports them)
    ];
    
    const testText = req.query.text || testTexts[0];
    
    console.log('📝 Testing with text:', testText);
    console.log('📝 Character codes:', [...testText].map(c => `${c}(${c.charCodeAt(0)})`));
    
    // Create SVG testing multiple fonts
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
      <svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
        <style>
          .noto-regular { 
            font-family: "Noto Sans", sans-serif; 
            font-size: 32px; 
            font-weight: 400;
            fill: black; 
            text-anchor: start;
            dominant-baseline: middle;
          }
          .noto-bold { 
            font-family: "Noto Sans", sans-serif; 
            font-size: 32px; 
            font-weight: 700;
            fill: darkgreen; 
            text-anchor: start;
            dominant-baseline: middle;
          }
          .inter-regular { 
            font-family: "Inter", sans-serif; 
            font-size: 32px; 
            font-weight: 400;
            fill: blue; 
            text-anchor: start;
            dominant-baseline: middle;
          }
          .inter-bold { 
            font-family: "Inter", sans-serif; 
            font-size: 32px; 
            font-weight: 700;
            fill: navy; 
            text-anchor: start;
            dominant-baseline: middle;
          }
          .generic-text { 
            font-family: sans-serif; 
            font-size: 32px; 
            font-weight: 400;
            fill: red; 
            text-anchor: start;
            dominant-baseline: middle;
          }
        </style>
        
        <!-- White background -->
        <rect width="100%" height="100%" fill="white"/>
        
        <!-- Labels -->
        <text x="20" y="40" style="font-size: 14px; fill: gray;">Noto Sans Regular (400):</text>
        <text x="20" y="90" style="font-size: 14px; fill: gray;">Noto Sans Bold (700):</text>
        <text x="20" y="140" style="font-size: 14px; fill: gray;">Inter Regular (400):</text>
        <text x="20" y="190" style="font-size: 14px; fill: gray;">Inter Bold (700):</text>
        <text x="20" y="240" style="font-size: 14px; fill: gray;">Generic sans-serif:</text>
        <text x="20" y="290" style="font-size: 14px; fill: gray;">All test characters:</text>
        
        <!-- Test texts with different fonts and weights -->
        <text x="20" y="65" class="noto-regular">${testText}</text>
        <text x="20" y="115" class="noto-bold">${testText}</text>
        <text x="20" y="165" class="inter-regular">${testText}</text>
        <text x="20" y="215" class="inter-bold">${testText}</text>
        <text x="20" y="265" class="generic-text">${testText}</text>
        <text x="20" y="315" class="noto-regular" style="font-size: 20px;">${testTexts.join(' • ')}</text>
      </svg>
    `;
    
    console.log('🔤 Multi-font SVG generated, length:', svg.length);
    
    // Convert SVG to image buffer
    const svgBuffer = Buffer.from(svg, 'utf-8');
    
    console.log('⚡ Processing with Sharp...');
    const image = await sharp(svgBuffer)
      .png()
      .toBuffer();
      
    console.log('✅ Image generated:', image.length, 'bytes');
    
    // Set response headers
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Font-Test', 'noto-sans-comparison');
    
    // Send the image
    res.send(image);
    
  } catch (error) {
    console.error('❌ Font test failed:', error);
    
    res.status(500).json({
      error: 'Font test failed',
      message: error.message,
      stack: error.stack,
      fontConfig: {
        FONTCONFIG_PATH: process.env.FONTCONFIG_PATH,
        FONTCONFIG_FILE: process.env.FONTCONFIG_FILE
      }
    });
  }
}