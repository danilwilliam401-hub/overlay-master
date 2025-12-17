# Font Rendering Issue - Bebas Design on Vercel

## Problem Statement
The `bebas` design does not render Bebas Neue font correctly when deployed to Vercel, but works perfectly on localhost. The `antonWhite` and `antonBlack` designs using Anton font work correctly in both environments.

## Environment Details
- **Local**: Works perfectly with Bebas Neue font
- **Vercel**: Font falls back to system font (likely Arial/sans-serif)
- **Framework**: Next.js 14 (Pages Router)
- **Image Processing**: Sharp library with SVG compositing
- **Runtime**: Node.js (not Edge)

## Font Loading System

### 1. Font Files Location
```
/fonts/
  ├── BebasNeue-Regular.ttf
  ├── Anton-Regular.ttf
  └── [other fonts...]
```

### 2. Module-Level Font Loading (Lines 51-134)
Fonts are loaded as base64 data URLs at module initialization:

```javascript
const fontFiles = {
  bebasNeue: path.join(fontsDir, 'BebasNeue-Regular.ttf'),
  anton: path.join(fontsDir, 'Anton-Regular.ttf'),
  // ... other fonts
};

let fontBase64Cache = {};

function loadFontAsBase64(fontPath, fontName) {
  try {
    if (fs.existsSync(fontPath)) {
      const fontBuffer = fs.readFileSync(fontPath);
      const base64Font = fontBuffer.toString('base64');
      return `data:font/truetype;charset=utf-8;base64,${base64Font}`;
    }
    return null;
  } catch (error) {
    console.log(`❌ Error loading ${fontName}:`, error.message);
    return null;
  }
}

// Loaded at startup
fontBase64Cache = {
  bebasNeue: loadFontAsBase64(fontFiles.bebasNeue, 'Bebas Neue'),
  anton: loadFontAsBase64(fontFiles.anton, 'Anton'),
  // ... other fonts
};
```

### 3. Design Theme Configuration (Lines 144-290)

**Bebas Design (BROKEN on Vercel):**
```javascript
'bebas': {
  name: 'Bebas Black Gradient',
  titleColor: '#FFFFFF',
  websiteColor: '#FFFFFF',
  gradientColors: [/* gradient array */],
  titleSize: 78,
  websiteSize: 32,
  fontWeight: '900',
  fontFamily: 'Bebas Neue',  // ← Font family name
  enableHighlight: true       // ← Uses tspan elements for multi-color text
}
```

**Anton Designs (WORKING on Vercel):**
```javascript
'antonWhite': {
  name: 'Anton White with Black Text',
  titleColor: '#000000',
  websiteColor: '#000000',
  gradientColors: ['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.98)'],
  titleSize: 78,
  websiteSize: 32,
  fontWeight: '900',
  fontFamily: 'Anton'  // ← Same pattern, but NO enableHighlight
}
```

**Key Difference**: `bebas` has `enableHighlight: true`, Anton designs do not.

### 4. SVG Font-Face Declaration (Lines 2770-2860)
Fonts embedded in SVG via @font-face with base64 data URLs:

```javascript
const fontFaceDeclarations = `
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
  // ... other fonts
`;
```

### 5. CSS Classes in SVG (Lines 2906-2960)

**Main Title Class:**
```css
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
}
```

**Highlight Classes (for bebas design):**
```css
.highlight-0 {
  font-family: "${selectedDesign.fontFamily || 'Bebas Neue'}", "Bebas Neue", "Anton", "Noto Sans Bold", "Inter Bold", Arial, sans-serif;
  font-weight: ${selectedDesign.fontWeight || '900'};
  fill: #FFD700;  /* Gold */
  filter: drop-shadow(0 0 8px rgba(255,215,0,0.6));
}
/* .highlight-1 through .highlight-5 follow same pattern */
```

### 6. SVG Text Rendering (Lines 3090-3128)

**For Anton Designs (WORKING):**
```xml
<!-- Simple text element, no tspan -->
<text x="540" y="1200" class="title-text">
  5 TOP WASHINGTON, D.C., HOTEL HOLIDAY TEAS
</text>
```

**For Bebas Design (BROKEN):**
```xml
<!-- Text with tspan elements for multi-color highlights -->
<text x="540" y="1200" class="title-text">
  <tspan class="">5 TOP </tspan> 
  <tspan class="highlight-0">WASHINGTON</tspan> 
  <tspan class="">, D.C., HOTEL HOLIDAY TEAS</tspan> 
</text>
```

**Code that generates this (Lines 3107-3123):**
```javascript
if (design === 'bebas' && selectedDesign.enableHighlight) {
  const defaultColors = ['#FFD700', '#FF8C00', '#00FFFF', '#1E90FF', '#F4E04D', '#C084FC'];
  const colors = highlightColors.length > 0 ? highlightColors : defaultColors;
  const maxHighlights = Math.min(colors.length, 6);
  
  const segments = parseHighlights(line, maxHighlights);
  const tspanContent = segments.map(seg => {
    let className = '';
    if (seg.highlight && seg.colorIndex >= 0 && seg.colorIndex < maxHighlights) {
      className = `highlight-${seg.colorIndex}`;
    }
    const space = seg.isLastWord ? '' : ' ';
    return `<tspan class="${className}">${seg.text}</tspan>${space}`;
  }).join('');
  return `<text x="${targetWidth / 2}" y="${titleStartY + (index * lineHeight)}" class="${classes}">${tspanContent}</text>`;
}
```

### 7. Sharp Processing (Lines 3178-3190)
SVG is converted to image buffer and composited:

```javascript
const svgBuffer = Buffer.from(svg, 'utf-8');

const compositeTop = Math.round(targetHeight - svgHeight);
finalImage = await processedImage
  .composite([{
    input: svgBuffer,
    left: 0,
    top: compositeTop,
    blend: 'over'
  }])
  .jpeg({ quality: 90 })
  .toBuffer();
```

## Hypothesis: Why It Fails on Vercel

### Possible Causes

1. **Tspan Font Inheritance Issue**
   - `<tspan>` elements may not inherit font-family from parent `<text>` in Sharp's SVG renderer
   - Anton designs work because they use plain `<text>` without `<tspan>`
   - Bebas fails because highlighted words are wrapped in `<tspan>` elements

2. **Base64 Font URL Size Limits**
   - Vercel serverless functions may have limits on inline base64 data URLs
   - BebasNeue-Regular.ttf file might be larger than Anton-Regular.ttf
   - Check actual file sizes in `/fonts` directory

3. **Font-Weight Mismatch**
   - Bebas Neue uses `font-weight: 900` in design config
   - But @font-face declares it as `font-weight: 400`
   - Sharp on Vercel might be stricter about this mismatch than local

4. **Sharp Version Differences**
   - Local and Vercel may use different Sharp versions
   - SVG rendering behavior could differ between versions

5. **CSS Cascade in Tspan**
   - When `.highlight-N` class is applied to `<tspan>`, it may override parent font
   - If font-family in `.highlight-N` resolves incorrectly, falls back to system font

## Testing Recommendations

### Test 1: Remove Highlighting Feature
Temporarily disable highlighting to confirm it works:
```javascript
'bebas': {
  // ... other properties
  fontFamily: 'Bebas Neue',
  enableHighlight: false  // ← Change to false
}
```
If this works, the issue is definitely with tspan rendering.

### Test 2: Simplify Bebas to Match Anton
Create a test design identical to antonWhite but with Bebas Neue:
```javascript
'bebasTest': {
  name: 'Bebas Test',
  titleColor: '#FFFFFF',
  websiteColor: '#FFFFFF',
  gradientColors: ['rgba(0,0,0,0.95)', 'rgba(0,0,0,0.98)'],
  titleSize: 78,
  websiteSize: 32,
  fontWeight: '900',
  fontFamily: 'Bebas Neue'
  // NO enableHighlight
}
```

### Test 3: Check Font File Sizes
```bash
ls -lh fonts/BebasNeue-Regular.ttf
ls -lh fonts/Anton-Regular.ttf
```

### Test 4: Fix Font-Weight Declaration
Match @font-face font-weight to usage:
```javascript
@font-face {
  font-family: 'Bebas Neue';
  font-weight: 900;  // ← Change from 400 to 900
  font-style: normal;
  src: url('${fontBase64Cache.bebasNeue}') format('truetype');
}
```

### Test 5: Explicit Tspan Font Attribute
Instead of CSS classes, add inline font-family to tspan:
```javascript
return `<tspan class="${className}" font-family="Bebas Neue" font-weight="900">${seg.text}</tspan>${space}`;
```

### Test 6: Vercel Deployment Logs
Check Vercel function logs for font loading errors:
```
✅ Loaded Bebas Neue: XXkB
```
If this is missing, font file not found on Vercel.

## Relevant Code Sections

1. **Font loading**: Lines 51-134
2. **Design configs**: Lines 144-509
3. **Font-face declarations**: Lines 2770-2860
4. **CSS classes**: Lines 2906-2960
5. **Tspan rendering**: Lines 3107-3123
6. **Sharp compositing**: Lines 3178-3190

## Files to Check

- `/fonts/BebasNeue-Regular.ttf` - Verify file exists and size
- `vercel.json` - Check if any font exclusions
- `.vercelignore` - Check if fonts folder ignored
- `next.config.js` - Check webpack font handling

## Expected vs Actual

**Expected Output**: 
- Text rendered in Bebas Neue bold font (blocky, condensed, all-caps style)
- Multi-color highlights on emphasized words

**Actual Output on Vercel**:
- Text rendered in system fallback font (likely Arial)
- Multi-color highlights still work (CSS fill colors apply)
- Font shape/style is wrong

This indicates the font file IS being loaded (no 404 errors), but Sharp's SVG renderer cannot resolve the font-family name in the tspan context.

## Suggested Fix Approaches (Priority Order)

1. **Add inline font attributes to tspan** (highest priority)
2. **Fix font-weight mismatch in @font-face**
3. **Use !important in .highlight-N classes**
4. **Load Bebas Neue as font-weight: 900 variant**
5. **Switch to Anton font for bebas design as workaround**

## Contact Points for Further Investigation

- Sharp library documentation: https://sharp.pixelplumbing.com/
- SVG text rendering in Sharp: https://github.com/lovell/sharp/issues (search "tspan font")
- Next.js + Vercel font loading: Vercel support or Next.js GitHub issues
