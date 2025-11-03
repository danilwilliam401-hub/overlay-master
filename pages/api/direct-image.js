import sharp from 'sharp';

// Function to clean problematic Unicode characters commonly found in URLs
function cleanUnicodeText(text) {
  if (!text) return text;
  
  return text
    // Handle encoded smart quotes and special characters
    .replace(/%E2%80%9C/g, '"')  // Left double quotation mark
    .replace(/%E2%80%9D/g, '"')  // Right double quotation mark
    .replace(/%E2%80%98/g, "'")  // Left single quotation mark
    .replace(/%E2%80%99/g, "'")  // Right single quotation mark
    .replace(/%E2%80%93/g, '-')  // En dash
    .replace(/%E2%80%94/g, '-')  // Em dash
    .replace(/%C2%A0/g, ' ')     // Non-breaking space
    // Handle already decoded versions
    .replace(/[\u201C\u201D]/g, '"')  // Smart double quotes
    .replace(/[\u2018\u2019]/g, "'")  // Smart single quotes
    .replace(/[\u2013\u2014]/g, '-')  // En/em dashes
    .replace(/\u00A0/g, ' ')          // Non-breaking space
    .replace(/\u2026/g, '...')        // Ellipsis
    // Remove or replace problematic characters
    .replace(/\uFFFD/g, '')           // Remove replacement characters
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

// Robust image fetching for Vercel compatibility
async function fetchImageWithBuiltins(url) {
  try {
    // Try native fetch first (works well on Vercel)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ImageBot/1.0)',
        'Accept': 'image/*,*/*;q=0.8'
      },
      // Add timeout
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    console.error('Fetch error:', error.message);
    
    // Fallback to Node.js modules for local development
    if (typeof window === 'undefined') {
      const { fetchImageWithBuiltins: fallback } = await import('../../lib/fetchUtils.js');
      return await fallback(url);
    }
    
    throw error;
  }
}

// Function to generate different design variants
function generateDesignVariant(design, params) {
  const { width, height, gradientHeight, titleLines, decodedWebsite, startY, lineHeight, fontSize, totalTextHeight, titleWebsiteGap } = params;
  
  switch (design) {
    case 'design1': // 🚨 Classic Red Alert
      return `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="redGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#FF0000;stop-opacity:0"/>
              <stop offset="30%" style="stop-color:#FF0000;stop-opacity:0.2"/>
              <stop offset="70%" style="stop-color:#FF0000;stop-opacity:0.7"/>
              <stop offset="100%" style="stop-color:#B00000;stop-opacity:0.95"/>
            </linearGradient>
          </defs>
          <rect x="0" y="${height - gradientHeight}" width="${width}" height="${gradientHeight}" fill="url(#redGradient)"/>
          <!-- White motion stripe -->
          <rect x="0" y="${startY - 20}" width="${width}" height="4" fill="white" opacity="0.9"/>
          ${titleLines.map((line, index) => `
            <text x="${width/2}" y="${startY + (index * lineHeight) + fontSize}" 
                  text-anchor="middle" 
                  dominant-baseline="middle"
                  font-family="Arial Black, Arial, sans-serif" 
                  font-weight="900" 
                  font-size="${fontSize}" 
                  fill="white" 
                  stroke="rgba(0,0,0,0.8)" 
                  stroke-width="2"
                  paint-order="stroke fill"
                  style="letter-spacing: -1px; text-transform: uppercase;">
              ${line}
            </text>
          `).join('')}
          ${decodedWebsite ? `
            <rect x="0" y="${startY + totalTextHeight + titleWebsiteGap}" width="${width}" height="30" fill="#FFD700" opacity="0.9"/>
            <text x="${width/2}" y="${startY + totalTextHeight + titleWebsiteGap + 20}" 
                  text-anchor="middle" 
                  dominant-baseline="middle"
                  font-family="Arial, sans-serif" 
                  font-weight="700" 
                  font-size="${Math.min(width * 0.018, 20)}" 
                  fill="#B00000" 
                  style="letter-spacing: 2px;">
              ${decodedWebsite.toUpperCase()}
            </text>
          ` : ''}
        </svg>
      `;

    case 'design2': // ⚡ Blue Pulse
      return `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#007BFF;stop-opacity:0"/>
              <stop offset="25%" style="stop-color:#007BFF;stop-opacity:0.1"/>
              <stop offset="60%" style="stop-color:#0056B3;stop-opacity:0.6"/>
              <stop offset="100%" style="stop-color:#001F3F;stop-opacity:0.9"/>
            </linearGradient>
          </defs>
          <rect x="0" y="${height - gradientHeight}" width="${width}" height="${gradientHeight}" fill="url(#blueGradient)"/>
          ${titleLines.map((line, index) => `
            <text x="${width/2}" y="${startY + (index * lineHeight) + fontSize}" 
                  text-anchor="middle" 
                  dominant-baseline="middle"
                  font-family="Arial, sans-serif" 
                  font-weight="800" 
                  font-size="${fontSize}" 
                  fill="white" 
                  stroke="rgba(0,123,255,0.7)" 
                  stroke-width="1.5"
                  paint-order="stroke fill"
                  style="letter-spacing: 3px; text-transform: uppercase;">
              ${line}
            </text>
          `).join('')}
          ${decodedWebsite ? `
            <text x="${width/2}" y="${startY + totalTextHeight + titleWebsiteGap + 20}" 
                  text-anchor="middle" 
                  dominant-baseline="middle"
                  font-family="Arial, sans-serif" 
                  font-weight="500" 
                  font-size="${Math.min(width * 0.02, 22)}" 
                  fill="#FFE347" 
                  stroke="rgba(0,0,0,0.8)" 
                  stroke-width="1"
                  paint-order="stroke fill"
                  style="letter-spacing: 1px; font-style: italic;">
              ${decodedWebsite.toUpperCase()}
            </text>
          ` : ''}
        </svg>
      `;

    case 'design3': // 🟡 Yellow Flash
      return `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="yellowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#000000;stop-opacity:0"/>
              <stop offset="20%" style="stop-color:#000000;stop-opacity:0.3"/>
              <stop offset="70%" style="stop-color:#000000;stop-opacity:0.8"/>
              <stop offset="100%" style="stop-color:#000000;stop-opacity:0.95"/>
            </linearGradient>
          </defs>
          <rect x="0" y="${height - gradientHeight}" width="${width}" height="${gradientHeight}" fill="url(#yellowGradient)"/>
          <rect x="0" y="${startY - 30}" width="${width}" height="${totalTextHeight + 60}" fill="#FFD500" opacity="0.9"/>
          ${titleLines.map((line, index) => `
            <text x="${width/2}" y="${startY + (index * lineHeight) + fontSize}" 
                  text-anchor="middle" 
                  dominant-baseline="middle"
                  font-family="Arial Black, Arial, sans-serif" 
                  font-weight="900" 
                  font-size="${fontSize}" 
                  fill="#000000" 
                  stroke="rgba(255,255,255,0.8)" 
                  stroke-width="1"
                  paint-order="stroke fill"
                  style="text-transform: uppercase;">
              ${line}
            </text>
          `).join('')}
          ${decodedWebsite ? `
            <text x="${width/2}" y="${startY + totalTextHeight + titleWebsiteGap + 20}" 
                  text-anchor="middle" 
                  dominant-baseline="middle"
                  font-family="Arial, sans-serif" 
                  font-weight="700" 
                  font-size="${Math.min(width * 0.02, 22)}" 
                  fill="#EAEAEA" 
                  stroke="rgba(0,0,0,0.9)" 
                  stroke-width="1.5"
                  paint-order="stroke fill"
                  style="letter-spacing: 1px;">
              ⚠️ ${decodedWebsite.toUpperCase()}
            </text>
          ` : ''}
        </svg>
      `;

    case 'design4': // 🟥 Gradient Burst Red-Orange
      return `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="burstGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#FF4500;stop-opacity:0"/>
              <stop offset="20%" style="stop-color:#FF4500;stop-opacity:0.2"/>
              <stop offset="60%" style="stop-color:#FF2E2E;stop-opacity:0.7"/>
              <stop offset="100%" style="stop-color:#8B0000;stop-opacity:0.95"/>
            </linearGradient>
          </defs>
          <rect x="0" y="${height - gradientHeight}" width="${width}" height="${gradientHeight}" fill="url(#burstGradient)"/>
          <!-- BREAKING tag -->
          <rect x="${width * 0.1}" y="${startY - 50}" width="180" height="30" fill="#FFD54F" rx="4"/>
          <text x="${width * 0.1 + 90}" y="${startY - 35}" 
                text-anchor="middle" 
                dominant-baseline="middle"
                font-family="Arial Black, Arial, sans-serif" 
                font-weight="900" 
                font-size="16" 
                fill="#8B0000">
            BREAKING 🔥
          </text>
          ${titleLines.map((line, index) => `
            <text x="${width/2}" y="${startY + (index * lineHeight) + fontSize}" 
                  text-anchor="middle" 
                  dominant-baseline="middle"
                  font-family="Arial Black, Arial, sans-serif" 
                  font-weight="900" 
                  font-size="${fontSize}" 
                  fill="white" 
                  stroke="rgba(0,0,0,1)" 
                  stroke-width="3"
                  paint-order="stroke fill"
                  style="text-transform: uppercase;">
              ${line}
            </text>
          `).join('')}
          ${decodedWebsite ? `
            <text x="${width/2}" y="${startY + totalTextHeight + titleWebsiteGap + 20}" 
                  text-anchor="middle" 
                  dominant-baseline="middle"
                  font-family="Arial, sans-serif" 
                  font-weight="600" 
                  font-size="${Math.min(width * 0.02, 22)}" 
                  fill="#FFD54F" 
                  stroke="rgba(139,0,0,0.8)" 
                  stroke-width="1"
                  paint-order="stroke fill"
                  style="letter-spacing: 2px;">
              ${decodedWebsite.toUpperCase()}
            </text>
          ` : ''}
        </svg>
      `;

    case 'design5': // 📰 White Noise Professional
      return `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grayGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#202020;stop-opacity:0"/>
              <stop offset="30%" style="stop-color:#303030;stop-opacity:0.3"/>
              <stop offset="70%" style="stop-color:#404040;stop-opacity:0.7"/>
              <stop offset="100%" style="stop-color:#484848;stop-opacity:0.9"/>
            </linearGradient>
            <pattern id="noise" width="4" height="4" patternUnits="userSpaceOnUse">
              <rect width="4" height="4" fill="#404040"/>
              <circle cx="2" cy="2" r="0.3" fill="#505050"/>
            </pattern>
          </defs>
          <rect x="0" y="${height - gradientHeight}" width="${width}" height="${gradientHeight}" fill="url(#grayGradient)"/>
          <rect x="0" y="${height - gradientHeight}" width="${width}" height="${gradientHeight}" fill="url(#noise)" opacity="0.05"/>
          ${titleLines.map((line, index) => `
            <text x="${width/2}" y="${startY + (index * lineHeight) + fontSize}" 
                  text-anchor="middle" 
                  dominant-baseline="middle"
                  font-family="Arial, Helvetica, sans-serif" 
                  font-weight="900" 
                  font-size="${fontSize}" 
                  fill="white" 
                  style="font-stretch: condensed; text-transform: uppercase;">
              ${line}
            </text>
          `).join('')}
          <!-- Red underline bar -->
          <rect x="${width * 0.15}" y="${startY + totalTextHeight + 10}" width="${width * 0.7}" height="4" fill="#FF0000"/>
          ${decodedWebsite ? `
            <!-- Red ticker bar -->
            <rect x="0" y="${startY + totalTextHeight + titleWebsiteGap}" width="${width}" height="28" fill="#FF0000"/>
            <text x="${width/2}" y="${startY + totalTextHeight + titleWebsiteGap + 18}" 
                  text-anchor="middle" 
                  dominant-baseline="middle"
                  font-family="Arial, sans-serif" 
                  font-weight="600" 
                  font-size="${Math.min(width * 0.018, 20)}" 
                  fill="white" 
                  style="letter-spacing: 2px;">
              ${decodedWebsite.toUpperCase()}
            </text>
          ` : ''}
        </svg>
      `;

    case 'design6': // 🧨 Cyber Alert
      return `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="cyberGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#FF004D;stop-opacity:0"/>
              <stop offset="25%" style="stop-color:#FF004D;stop-opacity:0.2"/>
              <stop offset="65%" style="stop-color:#CC0039;stop-opacity:0.6"/>
              <stop offset="100%" style="stop-color:#1A0033;stop-opacity:0.9"/>
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <rect x="0" y="${height - gradientHeight}" width="${width}" height="${gradientHeight}" fill="url(#cyberGradient)"/>
          <!-- Glitch scanlines -->
          <rect x="0" y="${startY - 10}" width="${width}" height="2" fill="#00FFFF" opacity="0.6"/>
          <rect x="0" y="${startY + 20}" width="${width}" height="1" fill="#FF004D" opacity="0.4"/>
          ${titleLines.map((line, index) => `
            <text x="${width/2}" y="${startY + (index * lineHeight) + fontSize}" 
                  text-anchor="middle" 
                  dominant-baseline="middle"
                  font-family="monospace" 
                  font-weight="700" 
                  font-size="${fontSize}" 
                  fill="white" 
                  stroke="#FF004D" 
                  stroke-width="1"
                  paint-order="stroke fill"
                  filter="url(#glow)"
                  style="text-transform: uppercase; letter-spacing: 2px;">
              ${line}
            </text>
          `).join('')}
          ${decodedWebsite ? `
            <text x="${width/2}" y="${startY + totalTextHeight + titleWebsiteGap + 20}" 
                  text-anchor="middle" 
                  dominant-baseline="middle"
                  font-family="monospace" 
                  font-weight="400" 
                  font-size="${Math.min(width * 0.02, 22)}" 
                  fill="#00FFFF" 
                  stroke="rgba(0,255,255,0.3)" 
                  stroke-width="0.5"
                  paint-order="stroke fill"
                  style="letter-spacing: 1px; font-style: italic;">
              ${decodedWebsite.toUpperCase()}
            </text>
          ` : ''}
        </svg>
      `;

    case 'design7': // Red Flash Impact
      return `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="redFlashGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#FF1E00;stop-opacity:0"/>
              <stop offset="20%" style="stop-color:#FF1E00;stop-opacity:0.3"/>
              <stop offset="60%" style="stop-color:#CC1500;stop-opacity:0.7"/>
              <stop offset="100%" style="stop-color:#7A0000;stop-opacity:0.95"/>
            </linearGradient>
          </defs>
          <rect x="0" y="${height - gradientHeight}" width="${width}" height="${gradientHeight}" fill="url(#redFlashGradient)"/>
          ${titleLines.map((line, index) => `
            <text x="${width/2}" y="${startY + (index * lineHeight) + fontSize}" 
                  text-anchor="middle" 
                  dominant-baseline="middle"
                  font-family="Impact, Arial Black, sans-serif" 
                  font-weight="900" 
                  font-size="${fontSize}" 
                  fill="white" 
                  stroke="rgba(0,0,0,1)" 
                  stroke-width="2.5"
                  paint-order="stroke fill"
                  style="text-transform: uppercase; font-stretch: condensed;">
              ${line}
            </text>
          `).join('')}
          ${decodedWebsite ? `
            <text x="${width/2}" y="${startY + totalTextHeight + titleWebsiteGap + 20}" 
                  text-anchor="middle" 
                  dominant-baseline="middle"
                  font-family="Arial, sans-serif" 
                  font-weight="700" 
                  font-size="${Math.min(width * 0.02, 22)}" 
                  fill="#FFD700" 
                  stroke="rgba(122,0,0,0.8)" 
                  stroke-width="1"
                  paint-order="stroke fill"
                  style="letter-spacing: 1px; font-stretch: condensed;">
              ${decodedWebsite.toUpperCase()}
            </text>
          ` : ''}
        </svg>
      `;

    case 'design8': // Electric Cyan Pop
      return `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#00E5FF;stop-opacity:0"/>
              <stop offset="25%" style="stop-color:#00E5FF;stop-opacity:0.2"/>
              <stop offset="60%" style="stop-color:#0099CC;stop-opacity:0.6"/>
              <stop offset="100%" style="stop-color:#001F3F;stop-opacity:0.9"/>
            </linearGradient>
          </defs>
          <rect x="0" y="${height - gradientHeight}" width="${width}" height="${gradientHeight}" fill="url(#cyanGradient)"/>
          ${titleLines.map((line, index) => `
            <text x="${width/2}" y="${startY + (index * lineHeight) + fontSize}" 
                  text-anchor="middle" 
                  dominant-baseline="middle"
                  font-family="Arial Black, sans-serif" 
                  font-weight="900" 
                  font-size="${fontSize}" 
                  fill="white" 
                  stroke="rgba(0,31,63,0.8)" 
                  stroke-width="2"
                  paint-order="stroke fill"
                  style="text-transform: uppercase; letter-spacing: 2px;">
              ${line}
            </text>
          `).join('')}
          ${decodedWebsite ? `
            <text x="${width/2}" y="${startY + totalTextHeight + titleWebsiteGap + 20}" 
                  text-anchor="middle" 
                  dominant-baseline="middle"
                  font-family="Arial, sans-serif" 
                  font-weight="600" 
                  font-size="${Math.min(width * 0.02, 22)}" 
                  fill="#0FFFC6" 
                  stroke="rgba(0,31,63,0.7)" 
                  stroke-width="1"
                  paint-order="stroke fill"
                  style="letter-spacing: 1.5px;">
              ${decodedWebsite.toUpperCase()}
            </text>
          ` : ''}
        </svg>
      `;

    case 'design9': // Black + Red Pulse
      return `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="blackRedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#000000;stop-opacity:0"/>
              <stop offset="30%" style="stop-color:#000000;stop-opacity:0.4"/>
              <stop offset="70%" style="stop-color:#8B0000;stop-opacity:0.7"/>
              <stop offset="100%" style="stop-color:#D60000;stop-opacity:0.95"/>
            </linearGradient>
          </defs>
          <rect x="0" y="${height - gradientHeight}" width="${width}" height="${gradientHeight}" fill="url(#blackRedGradient)"/>
          ${titleLines.map((line, index) => `
            <text x="${width/2}" y="${startY + (index * lineHeight) + fontSize}" 
                  text-anchor="middle" 
                  dominant-baseline="middle"
                  font-family="Arial, sans-serif" 
                  font-weight="700" 
                  font-size="${fontSize}" 
                  fill="white" 
                  stroke="rgba(0,0,0,0.9)" 
                  stroke-width="2"
                  paint-order="stroke fill"
                  style="text-transform: uppercase; letter-spacing: 1px;">
              ${line}
            </text>
          `).join('')}
          ${decodedWebsite ? `
            <text x="${width/2}" y="${startY + totalTextHeight + titleWebsiteGap + 20}" 
                  text-anchor="middle" 
                  dominant-baseline="middle"
                  font-family="Arial, sans-serif" 
                  font-weight="400" 
                  font-size="${Math.min(width * 0.02, 22)}" 
                  fill="#FFB703" 
                  stroke="rgba(0,0,0,0.8)" 
                  stroke-width="1"
                  paint-order="stroke fill"
                  style="letter-spacing: 1px; font-style: italic;">
              ${decodedWebsite.toUpperCase()}
            </text>
          ` : ''}
        </svg>
      `;

    case 'design10': // Amber Alert
      return `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="amberGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#FF8C00;stop-opacity:0"/>
              <stop offset="25%" style="stop-color:#FF8C00;stop-opacity:0.2"/>
              <stop offset="65%" style="stop-color:#CC6600;stop-opacity:0.6"/>
              <stop offset="100%" style="stop-color:#800000;stop-opacity:0.9"/>
            </linearGradient>
          </defs>
          <rect x="0" y="${height - gradientHeight}" width="${width}" height="${gradientHeight}" fill="url(#amberGradient)"/>
          ${titleLines.map((line, index) => `
            <text x="${width/2}" y="${startY + (index * lineHeight) + fontSize}" 
                  text-anchor="middle" 
                  dominant-baseline="middle"
                  font-family="Arial Black, sans-serif" 
                  font-weight="900" 
                  font-size="${fontSize}" 
                  fill="white" 
                  stroke="rgba(128,0,0,0.9)" 
                  stroke-width="2"
                  paint-order="stroke fill"
                  style="text-transform: uppercase; font-stretch: condensed;">
              ${line}
            </text>
          `).join('')}
          ${decodedWebsite ? `
            <text x="${width/2}" y="${startY + totalTextHeight + titleWebsiteGap + 20}" 
                  text-anchor="middle" 
                  dominant-baseline="middle"
                  font-family="Arial, sans-serif" 
                  font-weight="700" 
                  font-size="${Math.min(width * 0.02, 22)}" 
                  fill="#FFD54F" 
                  stroke="rgba(128,0,0,0.7)" 
                  stroke-width="1"
                  paint-order="stroke fill"
                  style="letter-spacing: 1px; font-style: italic;">
              ${decodedWebsite.toUpperCase()}
            </text>
          ` : ''}
        </svg>
      `;

    case 'design11': // Blue Ribbon News
      return `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="blueRibbonGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#0055FF;stop-opacity:0"/>
              <stop offset="20%" style="stop-color:#0055FF;stop-opacity:0.2"/>
              <stop offset="60%" style="stop-color:#003399;stop-opacity:0.6"/>
              <stop offset="100%" style="stop-color:#000C66;stop-opacity:0.9"/>
            </linearGradient>
          </defs>
          <rect x="0" y="${height - gradientHeight}" width="${width}" height="${gradientHeight}" fill="url(#blueRibbonGradient)"/>
          ${titleLines.map((line, index) => `
            <text x="${width/2}" y="${startY + (index * lineHeight) + fontSize}" 
                  text-anchor="middle" 
                  dominant-baseline="middle"
                  font-family="Arial, sans-serif" 
                  font-weight="900" 
                  font-size="${fontSize}" 
                  fill="white" 
                  stroke="rgba(0,12,102,0.8)" 
                  stroke-width="1.5"
                  paint-order="stroke fill"
                  style="text-transform: uppercase; letter-spacing: 2px;">
              ${line}
            </text>
          `).join('')}
          ${decodedWebsite ? `
            <text x="${width/2}" y="${startY + totalTextHeight + titleWebsiteGap + 20}" 
                  text-anchor="middle" 
                  dominant-baseline="middle"
                  font-family="Arial, sans-serif" 
                  font-weight="700" 
                  font-size="${Math.min(width * 0.02, 22)}" 
                  fill="#9DC9FF" 
                  stroke="rgba(0,12,102,0.7)" 
                  stroke-width="1"
                  paint-order="stroke fill"
                  style="letter-spacing: 1px; font-style: italic;">
              ${decodedWebsite.toUpperCase()}
            </text>
          ` : ''}
        </svg>
      `;

    case 'design12': // Metallic Red Signal
      return `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="metallicGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#C70039;stop-opacity:0"/>
              <stop offset="25%" style="stop-color:#C70039;stop-opacity:0.3"/>
              <stop offset="70%" style="stop-color:#8B0029;stop-opacity:0.7"/>
              <stop offset="100%" style="stop-color:#2C2C2C;stop-opacity:0.9"/>
            </linearGradient>
            <filter id="softShadow">
              <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3"/>
            </filter>
          </defs>
          <rect x="0" y="${height - gradientHeight}" width="${width}" height="${gradientHeight}" fill="url(#metallicGradient)"/>
          ${titleLines.map((line, index) => `
            <text x="${width/2}" y="${startY + (index * lineHeight) + fontSize}" 
                  text-anchor="middle" 
                  dominant-baseline="middle"
                  font-family="Arial Black, sans-serif" 
                  font-weight="900" 
                  font-size="${fontSize}" 
                  fill="white" 
                  filter="url(#softShadow)"
                  style="text-transform: uppercase; letter-spacing: 1px;">
              ${line}
            </text>
          `).join('')}
          ${decodedWebsite ? `
            <text x="${width/2}" y="${startY + totalTextHeight + titleWebsiteGap + 20}" 
                  text-anchor="middle" 
                  dominant-baseline="middle"
                  font-family="Arial, sans-serif" 
                  font-weight="500" 
                  font-size="${Math.min(width * 0.02, 22)}" 
                  fill="#CCCCCC" 
                  stroke="rgba(44,44,44,0.6)" 
                  stroke-width="0.5"
                  paint-order="stroke fill"
                  style="letter-spacing: 1px;">
              ${decodedWebsite.toUpperCase()}
            </text>
          ` : ''}
        </svg>
      `;

    default: // Default design (original)
      return `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:rgb(0,0,0);stop-opacity:0"/>
              <stop offset="15%" style="stop-color:rgb(0,0,0);stop-opacity:0.1"/>
              <stop offset="40%" style="stop-color:rgb(0,0,0);stop-opacity:0.4"/>
              <stop offset="70%" style="stop-color:rgb(0,0,0);stop-opacity:0.7"/>
              <stop offset="100%" style="stop-color:rgb(0,0,0);stop-opacity:0.95"/>
            </linearGradient>
          </defs>
          <rect x="0" y="${height - gradientHeight}" width="${width}" height="${gradientHeight}" fill="url(#gradient)"/>
          ${titleLines.map((line, index) => `
            <text x="${width/2}" y="${startY + (index * lineHeight) + fontSize}" 
                  text-anchor="middle" 
                  dominant-baseline="middle"
                  font-family="Arial, sans-serif" 
                  font-weight="900" 
                  font-size="${fontSize}" 
                  fill="white" 
                  stroke="rgba(0,0,0,0.9)" 
                  stroke-width="1.5"
                  paint-order="stroke fill">
              ${line}
            </text>
          `).join('')}
          ${decodedWebsite ? `
            <text x="${width/2}" y="${startY + totalTextHeight + titleWebsiteGap + 20}" 
                  text-anchor="middle" 
                  dominant-baseline="middle"
                  font-family="Arial, sans-serif" 
                  font-weight="700" 
                  font-size="${Math.min(width * 0.02, 22)}" 
                  fill="#FFD700" 
                  stroke="rgba(0,0,0,0.7)" 
                  stroke-width="0.8"
                  paint-order="stroke fill"
                  style="letter-spacing: 1.5px;">
              ${decodedWebsite.toUpperCase()}
            </text>
          ` : ''}
        </svg>
      `;
  }
}

export default async function handler(req, res) {
  // Handle both query parameters and URL-encoded parameters
  let { image, title = "", website = "", format = "jpeg", w = "1080", h = "1350", design = "default", textCase = "upper" } = req.query;
  
  // Additional parameter extraction for edge cases and Vercel compatibility
  if (!title && req.url) {
    try {
      const urlParams = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      title = urlParams.searchParams.get('title') || '';
      website = urlParams.searchParams.get('website') || '';
      
      console.log('URL parsing fallback used:', { 
        originalTitle: req.query.title, 
        urlTitle: title,
        originalWebsite: req.query.website,
        urlWebsite: website
      });
    } catch (urlError) {
      console.warn('URL parsing error:', urlError.message);
    }
  }

  // Raw parameter inspection for debugging
  console.log('Raw parameter types and values:', {
    titleType: typeof title,
    titleLength: title ? title.length : 0,
    titleBytes: title ? Buffer.from(title, 'utf8').length : 0,
    websiteType: typeof website,
    websiteLength: website ? website.length : 0,
    websiteBytes: website ? Buffer.from(website, 'utf8').length : 0,
    titleFirstChars: title ? Array.from(title.slice(0, 10)).map(c => ({ char: c, code: c.charCodeAt(0) })) : [],
    requestMethod: req.method,
    userAgent: req.headers['user-agent']
  });

  // Debug logging for Vercel
  console.log('Query parameters received:', { 
    image, 
    title: title ? `"${title}"` : 'empty', 
    website: website ? `"${website}"` : 'empty', 
    format, 
    w, 
    h, 
    design,
    textCase
  });
  
  console.log('Environment:', process.env.VERCEL ? 'Vercel' : 'Local');

  // Validate required parameters
  if (!image) {
    res.status(400).json({ 
      error: "Missing required parameter 'image'",
      usage: "?image=IMAGE_URL&title=TITLE&website=WEBSITE&format=jpeg|png&w=WIDTH&h=HEIGHT&design=default|design1-12&textCase=upper|lower|title|sentence|original",
      example: "/api/direct-image?image=https://picsum.photos/800/600&title=Your%20Title&website=YourSite.com&design=design7&textCase=title",
      designs: {
        "default": "Modern gradient with clean typography",
        "design1": "🚨 Classic Red Alert - Breaking news style",
        "design2": "⚡ Blue Pulse - Modern tech-news feel", 
        "design3": "🟡 Yellow Flash - Social-media viral style",
        "design4": "🟥 Gradient Burst - Red-orange YouTube style",
        "design5": "📰 White Noise - Professional newsroom look",
        "design6": "🧨 Cyber Alert - Futuristic breaking trend",
        "design7": "🔥 Red Flash Impact - Urgent viral alert style",
        "design8": "⚡ Electric Cyan Pop - Fresh futuristic tech vibe",
        "design9": "🖤 Black + Red Pulse - Energetic attention-grabber",
        "design10": "🟠 Amber Alert - Authoritative newsroom alert",
        "design11": "🔵 Blue Ribbon News - Reliable corporate news",
        "design12": "🔴 Metallic Red Signal - Modern polished breaking update"
      },
      textCaseOptions: {
        "upper/uppercase": "ALL CAPS - Traditional urgent news style (default)",
        "title/titlecase": "Title Case - Each Word Capitalized For Modern Look",
        "sentence": "Sentence case - Only first word capitalized for readability", 
        "lower/lowercase": "all lowercase - modern minimalist style",
        "original/normal": "Preserves original text case as provided"
      }
    });
    return;
  }

  try {
    console.log('Direct image request for:', image);
    
    // Fetch the base image
    const imageResponse = await fetchImageWithBuiltins(image);
    
    if (!imageResponse || !imageResponse.ok) {
      console.error('Failed to fetch image response for:', image);
      res.status(404).json({ error: "Failed to fetch image from URL" });
      return;
    }

    // Extract buffer from response
    const arrayBuffer = await imageResponse.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    if (!imageBuffer || imageBuffer.length === 0) {
      console.error('Empty image buffer for:', image);
      res.status(404).json({ error: "Received empty image data" });
      return;
    }

    console.log('Image buffer size:', imageBuffer.length, 'bytes');

    // Parse dimensions
    const width = parseInt(w) || 1080;
    const height = parseInt(h) || 1350;
    
    console.log('Target dimensions:', width, 'x', height);
    
    // Process image with sharp - resize and crop to fit aspect ratio
    let processedImage = sharp(imageBuffer)
      .resize(width, height, { 
        fit: 'cover',
        position: 'center' 
      });

    // Add text overlay if title is provided
    if (title && title.trim()) {
      try {
        // Handle potential double encoding issues on Vercel
        let decodedTitle;
        let decodedWebsite = '';
        
        // Enhanced decoding with multiple strategies for different environments
        try {
          // Strategy 1: Try direct usage if it looks clean
          if (title && /^[a-zA-Z0-9\s\-_.,!?]+$/.test(title)) {
            decodedTitle = title;
            console.log('Using title directly (clean ASCII):', decodedTitle);
          } else {
            // Strategy 2: Pre-clean the title before decoding
            let cleanTitle = cleanUnicodeText(title);
            
            // Strategy 3: Try multiple decoding approaches
            try {
              decodedTitle = decodeURIComponent(cleanTitle);
            } catch (firstDecodeError) {
              console.warn('First decode failed, trying alternative methods');
              
              // Strategy 4: Try without cleaning
              try {
                decodedTitle = decodeURIComponent(title);
              } catch (secondDecodeError) {
                // Strategy 5: Use raw title if all else fails
                console.warn('All decode attempts failed, using raw title');
                decodedTitle = title;
              }
            }
          }
          
          // Second attempt: handle double encoding (common on Vercel)
          if (decodedTitle.includes('%')) {
            try {
              decodedTitle = decodeURIComponent(decodedTitle);
            } catch {
              // Keep first decode result if second fails
            }
          }
          
          // Third attempt: handle HTML entities
          if (decodedTitle.includes('&#x')) {
            decodedTitle = decodedTitle.replace(/&#x([0-9A-F]+);/gi, (match, hex) => 
              String.fromCharCode(parseInt(hex, 16))
            );
          }
          
          // Fourth attempt: handle common HTML entities
          decodedTitle = decodedTitle
            .replace(/&quot;/g, '"')
            .replace(/&#8220;/g, '"')
            .replace(/&#8221;/g, '"')
            .replace(/&#8216;/g, "'")
            .replace(/&#8217;/g, "'")
            .replace(/&#8211;/g, '–')
            .replace(/&#8212;/g, '—')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');
            
          // Handle Unicode replacement characters (the squares you're seeing)
          decodedTitle = decodedTitle.replace(/\uFFFD/g, '?'); // Replace Unicode replacement character
          
          // Convert problematic Unicode characters to safe alternatives
          decodedTitle = decodedTitle
            .replace(/[""]/g, '"')  // Smart quotes to regular quotes
            .replace(/['']/g, "'")  // Smart apostrophes to regular apostrophe
            .replace(/[—–]/g, '-')  // Em/en dashes to regular dash
            .replace(/…/g, '...')   // Ellipsis to three dots
            .replace(/[^\x00-\x7F]/g, (char) => {
              // Replace non-ASCII characters with closest ASCII equivalent
              const code = char.charCodeAt(0);
              if (code === 0x2013 || code === 0x2014) return '-'; // En/em dash
              if (code === 0x2018 || code === 0x2019) return "'"; // Smart quotes
              if (code === 0x201C || code === 0x201D) return '"'; // Smart double quotes
              return char; // Keep other characters as-is
            });
          
        } catch (decodeError) {
          console.warn('Title decode error, using raw value:', decodeError.message);
          decodedTitle = title;
        }
        
        // Clean up potential quote wrapping and extra characters
        decodedTitle = decodedTitle.replace(/^["']|["']$/g, '').trim();
        
        // Additional cleanup for encoding artifacts
        decodedTitle = decodedTitle.replace(/\s+/g, ' ').trim(); // Normalize whitespace
        
        // Final validation and cleanup
        if (!decodedTitle || decodedTitle === '' || decodedTitle === 'undefined' || decodedTitle === 'null') {
          console.warn('Title appears empty after decoding, using fallback');
          decodedTitle = 'Breaking News';
        } else {
          // Ensure we don't have any remaining Unicode issues
          const finalCleanTitle = decodedTitle
            .replace(/\uFFFD/g, '') // Remove replacement characters
            .replace(/[^\x20-\x7E\u00A0-\u024F]/g, '') // Keep only printable ASCII + Latin Extended
            .trim();
          
          if (finalCleanTitle !== decodedTitle) {
            console.log('Applied final Unicode cleanup to title');
            decodedTitle = finalCleanTitle;
          }
          
          // If title became empty after cleaning, use fallback
          if (!decodedTitle.trim()) {
            console.warn('Title became empty after Unicode cleanup, using fallback');
            decodedTitle = 'Breaking News';
          }
        }
        
        if (website) {
          try {
            // Strategy 1: Try direct usage if it looks clean
            if (/^[a-zA-Z0-9\s\-_.,!?]+$/.test(website)) {
              decodedWebsite = website;
              console.log('Using website directly (clean ASCII):', decodedWebsite);
            } else {
              // Strategy 2: Pre-clean the website before decoding
              let cleanWebsite = cleanUnicodeText(website);
              
              // Strategy 3: Try decoding
              try {
                decodedWebsite = decodeURIComponent(cleanWebsite);
              } catch (firstDecodeError) {
                console.warn('Website decode failed, trying alternative');
                try {
                  decodedWebsite = decodeURIComponent(website);
                } catch (secondDecodeError) {
                  console.warn('All website decode attempts failed, using raw');
                  decodedWebsite = website;
                }
              }
            }
            
            if (decodedWebsite.includes('%')) {
              try {
                decodedWebsite = decodeURIComponent(decodedWebsite);
              } catch {
                // Keep first decode result if second fails
              }
            }
            
            // Handle HTML entities
            if (decodedWebsite.includes('&#x')) {
              decodedWebsite = decodedWebsite.replace(/&#x([0-9A-F]+);/gi, (match, hex) => 
                String.fromCharCode(parseInt(hex, 16))
              );
            }
            
            // Apply same cleaning as title
            decodedWebsite = decodedWebsite
              .replace(/&quot;/g, '"')
              .replace(/&#8220;/g, '"')
              .replace(/&#8221;/g, '"')
              .replace(/&#8216;/g, "'")
              .replace(/&#8217;/g, "'")
              .replace(/&#8211;/g, '–')
              .replace(/&#8212;/g, '—')
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>');
              
            // Handle Unicode replacement characters
            decodedWebsite = decodedWebsite.replace(/\uFFFD/g, '?');
            
            // Convert problematic Unicode characters
            decodedWebsite = decodedWebsite
              .replace(/[""]/g, '"')
              .replace(/['']/g, "'")
              .replace(/[—–]/g, '-')
              .replace(/…/g, '...')
              .replace(/[^\x00-\x7F]/g, (char) => {
                const code = char.charCodeAt(0);
                if (code === 0x2013 || code === 0x2014) return '-';
                if (code === 0x2018 || code === 0x2019) return "'";
                if (code === 0x201C || code === 0x201D) return '"';
                return char;
              });
            
          } catch (decodeError) {
            console.warn('Website decode error, using raw value:', decodeError.message);
            decodedWebsite = website;
          }
          
          // Clean up potential quote wrapping and validate
          decodedWebsite = decodedWebsite.replace(/^["']|["']$/g, '').trim();
          decodedWebsite = decodedWebsite.replace(/\s+/g, ' ').trim(); // Normalize whitespace
          
          if (decodedWebsite === '' || decodedWebsite === 'undefined' || decodedWebsite === 'null') {
            decodedWebsite = '';
          } else {
            // Apply same final cleanup to website
            const finalCleanWebsite = decodedWebsite
              .replace(/\uFFFD/g, '') // Remove replacement characters
              .replace(/[^\x20-\x7E\u00A0-\u024F]/g, '') // Keep only printable ASCII + Latin Extended
              .trim();
            
            if (finalCleanWebsite !== decodedWebsite) {
              console.log('Applied final Unicode cleanup to website');
              decodedWebsite = finalCleanWebsite;
            }
          }
        }
        
        // Apply text case transformation based on textCase parameter
        let processedTitle = decodedTitle;
        switch (textCase.toLowerCase()) {
          case 'upper':
          case 'uppercase':
            processedTitle = decodedTitle.toUpperCase();
            break;
          case 'lower':
          case 'lowercase':
            processedTitle = decodedTitle.toLowerCase();
            break;
          case 'title':
          case 'titlecase':
            processedTitle = decodedTitle.replace(/\w\S*/g, (txt) => 
              txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
            );
            break;
          case 'sentence':
            processedTitle = decodedTitle.charAt(0).toUpperCase() + decodedTitle.slice(1).toLowerCase();
            break;
          case 'normal':
          case 'original':
          default:
            if (textCase.toLowerCase() !== 'upper' && textCase.toLowerCase() !== 'uppercase') {
              processedTitle = decodedTitle; // Keep original case
            } else {
              processedTitle = decodedTitle.toUpperCase(); // Default to uppercase
            }
            break;
        }

        console.log('Final decoded values:', { 
          originalTitle: title,
          decodedTitle, 
          originalWebsite: website,
          decodedWebsite, 
          processedTitle: processedTitle !== decodedTitle ? processedTitle : 'same as original',
          textCase,
          titleLength: decodedTitle.length,
          websiteLength: decodedWebsite.length,
          hasUnicodeIssues: decodedTitle.includes('\uFFFD') || decodedWebsite.includes('\uFFFD'),
          titleCharCodes: Array.from(decodedTitle.slice(0, 20)).map(c => c.charCodeAt(0)),
          websiteCharCodes: decodedWebsite ? Array.from(decodedWebsite.slice(0, 20)).map(c => c.charCodeAt(0)) : []
        });
        
        // Create a gradient overlay using Sharp - make it higher for default design
        const gradientHeight = Math.floor(height * (design === 'default' ? 0.55 : 0.35)); // Higher coverage for default design
        
        // Function to wrap text into multiple lines - display full text without truncation
        const wrapText = (text, maxWidth, fontSize) => {
          const words = text.split(' ');
          const lines = [];
          let currentLine = '';
          
          // More accurate character width calculation based on font weight
          const charWidth = fontSize * 0.55;
          const maxChars = Math.floor(maxWidth / charWidth);
          
          for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            
            // Check if adding this word would exceed the character limit
            if (testLine.length <= maxChars) {
              currentLine = testLine;
            } else {
              // If we have content in current line, save it and start new line
              if (currentLine) {
                lines.push(currentLine);
                currentLine = word;
              } else {
                // Single word is too long, but don't truncate - just add it
                lines.push(word);
                currentLine = '';
              }
            }
          }
          
          // Add any remaining content
          if (currentLine) {
            lines.push(currentLine);
          }
          
          // Return all lines - no maximum limit, display complete text
          return lines;
        };
        
        // Calculate font size and text area with dynamic adaptation for any number of lines
        const textPadding = width * 0.1; // Optimized padding for maximum text space
        const maxTextWidth = width - (textPadding * 2);
        
        // Start with a base font size and adjust based on content length
        let fontSize = Math.min(width * 0.045, 44);
        let titleLines = wrapText(processedTitle, maxTextWidth, fontSize);
        
        // Dynamically adjust font size based on number of lines to ensure everything fits
        if (titleLines.length >= 5) {
          fontSize = Math.min(width * 0.032, 32); // Very small for 5+ lines
        } else if (titleLines.length === 4) {
          fontSize = Math.min(width * 0.036, 36); // Small for 4 lines
        } else if (titleLines.length === 3) {
          fontSize = Math.min(width * 0.04, 38); // Medium-small for 3 lines
        }
        
        // Recalculate lines with the adjusted font size
        titleLines = wrapText(processedTitle, maxTextWidth, fontSize);
        
        // Dynamic line height based on number of lines
        const lineHeight = titleLines.length >= 4 ? fontSize * 1.05 : fontSize * 1.1;
        const totalTextHeight = titleLines.length * lineHeight;
        
        // Adaptive spacing and positioning based on number of lines
        const baseGap = decodedWebsite ? Math.max(20, 50 - (titleLines.length * 5)) : 15;
        const titleWebsiteGap = baseGap;
        
        // Calculate available space and ensure text fits
        const availableHeight = height * 0.5; // Use bottom 50% for text
        const requiredHeight = totalTextHeight + titleWebsiteGap + (decodedWebsite ? 30 : 0);
        
        let startY;
        if (requiredHeight > availableHeight) {
          // If text is too tall, position it higher and compress slightly
          startY = height - availableHeight + 20;
        } else {
          // Normal positioning
          const baseBottomMargin = Math.max(100, 160 - (titleLines.length * 10));
          startY = height - baseBottomMargin - (totalTextHeight / 2) - titleWebsiteGap;
        }
        
        // Enhanced sanitization for SVG with better Unicode handling
        const sanitizedTitleLines = titleLines.map(line => {
          // First, ensure we have clean text
          let cleanLine = line.replace(/\uFFFD/g, '?'); // Remove replacement characters
          
          // Convert to safe characters and then XML escape
          cleanLine = cleanLine.replace(/[<>&"']/g, (match) => {
            const entities = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' };
            return entities[match];
          });
          
          // Ensure no problematic Unicode sequences remain
          cleanLine = cleanLine.replace(/[\u0000-\u001F\u007F-\u009F]/g, ''); // Remove control characters
          
          return cleanLine;
        });
        
        let sanitizedWebsite = decodedWebsite.replace(/\uFFFD/g, '?'); // Remove replacement characters
        sanitizedWebsite = sanitizedWebsite.replace(/[<>&"']/g, (match) => {
          const entities = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' };
          return entities[match];
        });
        sanitizedWebsite = sanitizedWebsite.replace(/[\u0000-\u001F\u007F-\u009F]/g, ''); // Remove control characters

        // Create SVG with design-specific styling
        const svgOverlay = generateDesignVariant(design, {
          width,
          height,
          gradientHeight,
          titleLines: sanitizedTitleLines,
          decodedWebsite: sanitizedWebsite,
          startY,
          lineHeight,
          fontSize,
          totalTextHeight,
          titleWebsiteGap
        });
        
        console.log('Text layout calculated:', {
          titleLines: titleLines.length,
          fontSize,
          lineHeight,
          totalTextHeight,
          startY,
          titleWebsiteGap,
          availableHeight: height * 0.5,
          requiredHeight: totalTextHeight + titleWebsiteGap + (decodedWebsite ? 30 : 0)
        });

        console.log('Adding text overlay with title:', decodedTitle.substring(0, 20) + '...');
        console.log('Text wrapped into', titleLines.length, 'lines:', titleLines);
        console.log('SVG overlay length:', svgOverlay.length, 'characters');
        
        // Validate SVG before using it
        if (!svgOverlay || svgOverlay.length === 0) {
          throw new Error('Generated SVG is empty');
        }
        
        // Enhanced SVG buffer creation with explicit UTF-8 encoding
        let svgWithEncoding = svgOverlay;
        
        // Ensure SVG has proper encoding declaration
        if (!svgWithEncoding.includes('encoding="UTF-8"')) {
          svgWithEncoding = svgWithEncoding.replace(
            /<svg([^>]*)>/,
            '<svg$1 encoding="UTF-8">'
          );
        }
        
        // Create buffer with explicit UTF-8 encoding
        const svgBuffer = Buffer.from(svgWithEncoding, 'utf8');
        console.log('SVG buffer size:', svgBuffer.length, 'bytes');
        
        // Validate buffer content
        const bufferString = svgBuffer.toString('utf8');
        if (bufferString.includes('\uFFFD')) {
          console.warn('SVG buffer contains replacement characters, may indicate encoding issues');
        }
        
        processedImage = processedImage.composite([{
          input: svgBuffer,
          blend: 'over'
        }]);
        
      } catch (overlayError) {
        console.error('Error creating text overlay:', overlayError.message);
        console.error('Overlay error details:', overlayError);
        
          // Try a simpler overlay as fallback
          try {
            console.log('Attempting fallback simple overlay...');
            
            // Create simple multi-line text for fallback - adapt to content length
            let fallbackFontSize = 32;
            const fallbackLines = wrapText(processedTitle, maxTextWidth, fallbackFontSize);
            
            // Adjust font size based on number of lines
            if (fallbackLines.length >= 4) {
              fallbackFontSize = 28;
            }
            
            const fallbackLineHeight = fallbackFontSize + 4;
            const fallbackTotalHeight = fallbackLines.length * fallbackLineHeight;
            const fallbackStartY = height - Math.max(150, fallbackTotalHeight + 50);
            
            const fallbackSvg = `
              <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="fallbackGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:rgb(0,0,0);stop-opacity:0"/>
                    <stop offset="70%" style="stop-color:rgb(0,0,0);stop-opacity:0.7"/>
                    <stop offset="100%" style="stop-color:rgb(0,0,0);stop-opacity:0.9"/>
                  </linearGradient>
                </defs>
                <rect x="0" y="${height * 0.6}" width="${width}" height="${height * 0.4}" fill="url(#fallbackGradient)"/>
                ${fallbackLines.map((line, index) => `
                  <text x="${width/2}" y="${fallbackStartY + (index * fallbackLineHeight)}" 
                        text-anchor="middle" 
                        font-family="Arial, sans-serif" 
                        font-weight="700" 
                        font-size="32" 
                        fill="white">
                    ${line.replace(/[<>&"']/g, '')}
                  </text>
                `).join('')}
                ${decodedWebsite ? `
                  <text x="${width/2}" y="${fallbackStartY + (fallbackLines.length * fallbackLineHeight) + 25}" 
                        text-anchor="middle" 
                        font-family="Arial, sans-serif" 
                        font-weight="500" 
                        font-size="18" 
                        fill="#FFD700">
                    ${decodedWebsite.replace(/[<>&"']/g, '').substring(0, 30)}
                  </text>
                ` : ''}
              </svg>
            `;          processedImage = processedImage.composite([{
            input: Buffer.from(fallbackSvg, 'utf8'),
            blend: 'over'
          }]);
          
          console.log('Fallback overlay applied successfully');
        } catch (fallbackError) {
          console.error('Fallback overlay also failed:', fallbackError.message);
          // Continue without any overlay
        }
      }
    } else {
      console.log('Processing image without overlay - no title provided');
    }

    // Convert to final format
    let outputBuffer;
    const outputFormat = format.toLowerCase() === 'png' ? 'png' : 'jpeg';
    
    console.log('Converting to format:', outputFormat);
    
    if (outputFormat === 'png') {
      outputBuffer = await processedImage.png({ 
        compressionLevel: 6,
        quality: 90 
      }).toBuffer();
    } else {
      outputBuffer = await processedImage.jpeg({ 
        quality: 90,
        progressive: true
      }).toBuffer();
    }

    console.log('Output buffer size:', outputBuffer.length, 'bytes');

    // Set appropriate headers
    res.setHeader('Content-Type', `image/${outputFormat}`);
    res.setHeader('Content-Length', outputBuffer.length);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow cross-origin requests
    
    // Send the image directly
    res.send(outputBuffer);

  } catch (error) {
    console.error('Error generating direct image:', error);
    res.status(500).json({ 
      error: "Failed to generate image",
      details: error.message 
    });
  }
}