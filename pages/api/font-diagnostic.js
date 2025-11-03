import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

// Force Node.js runtime
export const runtime = 'nodejs';

// Set up fontconfig paths
const fontConfigPath = path.join(process.cwd(), 'fontconfig');
const fontConfigFile = path.join(fontConfigPath, 'fonts.conf');
const fontsDir = path.join(process.cwd(), 'fonts');

process.env.FONTCONFIG_PATH = fontConfigPath;
process.env.FONTCONFIG_FILE = fontConfigFile;
process.env.FONTCONFIG_CACHE = '/tmp/fontconfig-cache';
process.env.FC_DEBUG = "1";

const execAsync = promisify(exec);

export default async function handler(req, res) {
  console.log('\n🔍 === FONTCONFIG DIAGNOSTIC ===');
  
  try {
    // Check file system
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        FONTCONFIG_PATH: process.env.FONTCONFIG_PATH,
        FONTCONFIG_FILE: process.env.FONTCONFIG_FILE,
        FONTCONFIG_CACHE: process.env.FONTCONFIG_CACHE,
        cwd: process.cwd()
      },
      filesystem: {
        fontConfigExists: fs.existsSync(fontConfigFile),
        fontsDir: fontsDir,
        fontsDirExists: fs.existsSync(fontsDir)
      },
      fonts: {}
    };
    
    // List font files
    try {
      const fontFiles = fs.readdirSync(fontsDir);
      diagnostics.fonts.available = fontFiles;
      
      // Get file stats for each font
      fontFiles.forEach(file => {
        const fontPath = path.join(fontsDir, file);
        const stats = fs.statSync(fontPath);
        diagnostics.fonts[file] = {
          size: stats.size,
          path: fontPath,
          exists: true
        };
      });
    } catch (err) {
      diagnostics.fonts.error = err.message;
    }
    
    // Read fontconfig file content
    try {
      diagnostics.fontconfig = {
        content: fs.readFileSync(fontConfigFile, 'utf-8'),
        exists: true
      };
    } catch (err) {
      diagnostics.fontconfig = {
        error: err.message,
        exists: false
      };
    }
    
    // Try to run fontconfig commands (if available)
    try {
      const { stdout, stderr } = await execAsync('fc-list', { timeout: 5000 });
      diagnostics.fcList = {
        stdout: stdout,
        stderr: stderr
      };
    } catch (err) {
      diagnostics.fcList = {
        error: 'fc-list not available: ' + err.message
      };
    }
    
    // Test simple SVG rendering with exact weights
    const testSvg = `<?xml version="1.0" encoding="UTF-8"?>
      <svg width="500" height="250" xmlns="http://www.w3.org/2000/svg">
        <style>
          .noto-400 { font-family: "Noto Sans", sans-serif; font-size: 20px; font-weight: 400; fill: black; }
          .noto-700 { font-family: "Noto Sans", sans-serif; font-size: 20px; font-weight: 700; fill: darkgreen; }
          .inter-400 { font-family: "Inter", sans-serif; font-size: 20px; font-weight: 400; fill: blue; }
          .inter-700 { font-family: "Inter", sans-serif; font-size: 20px; font-weight: 700; fill: navy; }
        </style>
        <rect width="100%" height="100%" fill="white"/>
        <text x="20" y="30" class="noto-400">Noto Sans Regular (400): HELLO WORLD 123</text>
        <text x="20" y="60" class="noto-700">Noto Sans Bold (700): HELLO WORLD 123</text>
        <text x="20" y="90" class="inter-400">Inter Regular (400): HELLO WORLD 123</text>
        <text x="20" y="120" class="inter-700">Inter Bold (700): HELLO WORLD 123</text>
        <text x="20" y="150" style="font-family: sans-serif; font-size: 20px; font-weight: 400; fill: red;">Generic Sans (400): HELLO WORLD 123</text>
        <text x="20" y="180" style="font-family: serif; font-size: 20px; font-weight: 400; fill: purple;">Generic Serif (400): HELLO WORLD 123</text>
        <text x="20" y="210" style="font-family: monospace; font-size: 18px; font-weight: 400; fill: brown;">Generic Mono (400): HELLO WORLD 123</text>
      </svg>
    `;
    
    console.log('🧪 Testing SVG rendering with current fontconfig...');
    
    try {
      const svgBuffer = Buffer.from(testSvg, 'utf-8');
      const imageBuffer = await sharp(svgBuffer).png().toBuffer();
      
      diagnostics.svgTest = {
        success: true,
        svgLength: testSvg.length,
        imageSize: imageBuffer.length
      };
      
      // Return the diagnostic image
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('X-Diagnostics', JSON.stringify(diagnostics));
      return res.send(imageBuffer);
      
    } catch (svgError) {
      diagnostics.svgTest = {
        success: false,
        error: svgError.message,
        stack: svgError.stack
      };
    }
    
    // If SVG test failed, return JSON diagnostics
    res.setHeader('Content-Type', 'application/json');
    res.json(diagnostics);
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error);
    
    res.status(500).json({
      error: 'Diagnostic failed',
      message: error.message,
      stack: error.stack
    });
  }
}