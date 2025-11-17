# 🖼️ Banner Generator API

A powerful Next.js application that creates professional image banners with custom text overlays. Features 31 design themes with superior font support and comprehensive image processing capabilities.

## 🎉 Recent Updates (November 2025)

### New Quote Generation Features
- ✨ **New Inspirational Tagalog Quotes Button**: Added 50 fresh motivational Tagalog quotes with dedicated button
- 💕 **babaeTagalog Parameter**: New `val=babaeTagalog` parameter for API-side romantic quote generation
- 🤖 **Auto-Fill Empty Titles**: System automatically picks random quotes when title field is empty
- 🎲 **Random Quote on Every Request**: Fresh content generation with each API call when using `val` parameter
- 🎨 **Enhanced Quote Test Page**: Now features 4 quote buttons with 260+ total Tagalog quotes
- 📱 **Responsive Button Layout**: Improved UI with flex-wrap for better mobile experience

### Technical Improvements
- 🔄 **Frontend-Backend Integration**: Seamless quote generation between quote-test page and API
- 🎯 **Expanded Quote Collection**: 200+ romantic/relationship quotes in `tagalogQuotes` array
- 🔧 **API Enhancement**: Added `val=babaeTagalog` handler in bundled-font-overlay.js
- 🎪 **Cache Busting**: Improved refresh mechanism for dynamic quote loading

## ✨ Features

### Enhanced Font System
- **🔤 Superior Unicode Support**: Bundled 14 professional fonts with fontconfig
- **� 31 Design Themes**: From breaking news to aesthetic quotes, covering all content types
- **📏 Dynamic Text Layout**: Intelligent wrapping and positioning prevents overlap
- **⚡ Special Effects**: Glow effects, gradients, transparency support
- **� Professional Typography**: Bebas Neue, Anton, Impact, Oswald, Montserrat, League Spartan, Raleway, Roboto Condensed, Poppins, Playfair Display, and more

### Core Features
- **🚀 Fast Processing**: Server-side rendering with Sharp image processing
- **🌐 Public API**: No authentication required
- **📊 Binary Data Support**: Direct base64 image upload
- **🎨 PNG Transparency**: Transparent overlays with blank design
- **📱 Interactive Testing**: Multiple preview pages for design testing

## 🔧 API Parameters

### Image Sources
- `image` → Source image URL (use OR imageData)
- `imageData` → **Base64-encoded binary image data** (use OR image URL)

### Text Overlays
- `title` → Text overlay for banner
- `website` → Brand/website name (optional)

### Design Options
- `design` → Design theme: `default`, `tech`, `entertainment`, `antonBlack`, `antonTransparent`, `antonTransparent2`, `sports`, `anime`, `eco`, `news`, `minimal`, `modern`, `bold`, `viral`, `breaking`, `thoughtful`, `colorful`, `overlay`, `aesthetic`, `monochrome`, `vintage`, `luxury`, `cinematic`, `neon`, `inspire`, `cute`, `warmbrown`, `pokemon`, `quote1`, `quote2`, `quote3`, `blank`

### 🇵🇭 Auto-Generated Tagalog Quotes (UPDATED!)
- `val` → Quote generation mode for quote designs:
  - `InspirationTagalog` → Generates random Tagalog inspirational quotes (10 quotes)
  - `HugotTagalog` → Generates random Tagalog Hugot quotes about love and heartbreak (200+ quotes)
  - `babaeTagalog` → **NEW!** Generates random romantic/relationship Tagalog quotes (200+ quotes focused on love, relationships, and dating)

**Usage with Quote Designs:**
When using `val` parameter with quote designs (`quote1`, `quote2`, `quote3`), the API will automatically generate a random quote on every request, even if `title` is empty. This enables fresh quote content on every refresh.

**Example URLs:**
```
/api/bundled-font-overlay?image=https://picsum.photos/800/600&design=quote1&val=InspirationTagalog
/api/bundled-font-overlay?image=https://picsum.photos/800/600&design=quote2&val=HugotTagalog
/api/bundled-font-overlay?image=https://picsum.photos/800/600&design=quote3&val=babaeTagalog
```

**Auto-Fill Empty Titles:** 
- When `val=babaeTagalog` is used, if the `title` parameter is empty, the system automatically picks a random quote from the Tagalog collection
- This ensures every image has meaningful content even when no specific title is provided

**Cache Control:** When `val` parameter is used, caching is disabled to ensure fresh quotes on every request.

### Output Settings
- `w` → Width in pixels (default: 1080)
- `h` → Height in pixels (default: 1350)

### 🆕 Binary Data Support
The API supports **direct binary image data** via the `imageData` parameter:

- **Format**: Base64-encoded image data
- **Data URI Support**: Both `data:image/jpeg;base64,/9j/4AAQ...` and raw base64 `iVBORw0KGgo...`
- **Priority**: `imageData` > `image` URL > blank background
- **Method**: POST recommended for large binary data
- **Size Limit**: 5MB recommended for optimal performance

#### Binary Data Usage Examples:
```javascript
// POST with JSON body (recommended for large data)
fetch('/api/bundled-font-overlay', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    imageData: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...',
    title: 'Binary Data Test',
    website: 'TestSite.com',
    design: 'tech'
  })
});

// URL parameter (for smaller base64 data)
})

// Or GET with URL parameter (smaller data)
fetch('/api/bundled-font-overlay?imageData=iVBORw0KGgoAAAANS...&title=Test&design=aesthetic')
```

## 🧪 Interactive Testing & Preview Pages;
```

## 🚀 API Endpoints

### 1. Direct Image URL (recommended)
```
https://your-domain.com/api/direct-image?image=IMAGE_URL&title=TITLE&design=DESIGN
```

### 2. Bundled Font Overlay (Enhanced Font System)
```
https://your-domain.com/api/bundled-font-overlay.jpg?image=IMAGE_URL&title=TITLE&design=DESIGN
```

### 3. Preview Mode
```
https://your-domain.com/?image=IMAGE_URL&title=TITLE&preview=true
```

### 4. JSON Metadata (API Endpoint)
```
https://your-domain.com/api/image?image=IMAGE_URL&title=TITLE
```

## 📝 Complete Fetch Examples

### 🎨 All Design Variants

#### Default Design (Modern Gradient)
```javascript
fetch('https://your-domain.com/api/direct-image?image=https://picsum.photos/800/600&title=Modern%20Banner&website=YourBrand.com')
```

#### Design 1 - 🚨 Classic Red Alert (Breaking News)
```javascript
fetch('https://your-domain.com/api/direct-image?image=https://picsum.photos/800/600&title=BREAKING%20NEWS&website=CNN.com&design=design1')
```

#### Design 2 - ⚡ Blue Pulse (Tech News)
```javascript
fetch('https://your-domain.com/api/direct-image?image=https://picsum.photos/800/600&title=TECH%20UPDATE&website=TechCrunch.com&design=design2')
```

#### Design 3 - 🟡 Yellow Flash (Viral Content)
```javascript
fetch('https://your-domain.com/api/direct-image?image=https://picsum.photos/800/600&title=VIRAL%20NOW&website=BuzzFeed.com&design=design3')
```

#### Design 4 - 🟥 Gradient Burst (YouTube Style)
```javascript
fetch('https://your-domain.com/api/direct-image?image=https://picsum.photos/800/600&title=HOT%20TOPIC&website=YouTube.com&design=design4')
```

#### Design 5 - 📰 White Noise (Professional News)
```javascript
fetch('https://your-domain.com/api/direct-image?image=https://picsum.photos/800/600&title=OFFICIAL%20STATEMENT&website=Reuters.com&design=design5')
```

#### Design 6 - 🧨 Cyber Alert (Futuristic)
```javascript
fetch('https://your-domain.com/api/direct-image?image=https://picsum.photos/800/600&title=CYBER%20ALERT&website=Wired.com&design=design6')
```

#### Design 7 - 🔥 Red Flash Impact (Urgent Alert)
```javascript
fetch('https://your-domain.com/api/direct-image?image=https://picsum.photos/800/600&title=FLASH%20UPDATE&website=NewsAlert.com&design=design7')
```

#### Design 8 - ⚡ Electric Cyan Pop (Future Tech)
```javascript
fetch('https://your-domain.com/api/direct-image?image=https://picsum.photos/800/600&title=FUTURE%20TECH&website=CyberNews.com&design=design8')
```

#### Design 9 - 🖤 Black + Red Pulse (Energy)
```javascript
fetch('https://your-domain.com/api/direct-image?image=https://picsum.photos/800/600&title=ENERGY%20PULSE&website=PowerNews.com&design=design9')
```

#### Design 10 - 🟠 Amber Alert (Authority)
```javascript
fetch('https://your-domain.com/api/direct-image?image=https://picsum.photos/800/600&title=AMBER%20WARNING&website=AlertSystem.com&design=design10')
```

#### Design 11 - 🔵 Blue Ribbon News (Corporate)
```javascript
fetch('https://your-domain.com/api/direct-image?image=https://picsum.photos/800/600&title=CORPORATE%20NEWS&website=BusinessDaily.com&design=design11')
```

#### Design 12 - 🔴 Metallic Red Signal (Modern)
```javascript
fetch('https://your-domain.com/api/direct-image?image=https://picsum.photos/800/600&title=METALLIC%20SIGNAL&website=ModernNews.com&design=design12')
```

## 🧪 Interactive Testing & Preview Pages

### **� Design Gallery**
```
http://localhost:3000/designs
```
Browse and preview all 30+ available designs with live rendering. Select from modern, bold, viral, breaking, thoughtful, colorful, overlay, aesthetic, monochrome, vintage, and more.

### **🔤 Font Tester**
```
http://localhost:3000/font-test
```
Test all 14 embedded font families (Bebas Neue, Oswald, Anton, Impact, Poppins, League Spartan, Playfair Display, etc.) across different designs with live preview.

### **💬 Quote Design Tester**
```
http://localhost:3000/quote-test
```
Interactive testing for quote overlay designs (quote1, quote2, quote3) with:
- **4 Quote Buttons** with extensive collections:
  - 🎲 Load Random Inspirational Quote (8 English quotes)
  - 🇵🇭 Mag-load ng Random na Inspirational Quote Tagalog (10 original Tagalog inspirational quotes)
  - ✨ **NEW!** Load Random Inspirational Quote Tagalog (50 fresh motivational Tagalog quotes)
  - 💔 Load Random Hugot Babae Quote (200+ Tagalog romantic/hugot quotes)
- **Automatic Quote Generation**: When title is empty, automatically picks a random quote
- **val=babaeTagalog Parameter**: Integrated URL parameter for API-side quote generation
- **Live Preview**: Real-time rendering with cache-busting for fresh content on every load
- **Responsive Layout**: Buttons wrap nicely on all screen sizes

### **📝 Long Text Tester**
```
http://localhost:3000/long-text-test
```
Test quote designs with lengthy text content. Supports both GET and POST methods. Perfect for testing text wrapping and layout with extended quotes.

### **🔬 Binary Data Tester**
```
http://localhost:3000/binary-test
```
Upload image files or generate sample images to test the `imageData` parameter. Supports all designs including the transparent blank design.

### **🖼️ General Preview**
```
http://localhost:3000/preview
```
General purpose preview page with error handling for testing any design configuration.

## 🎯 Available Design Themes

All designs support custom text, colors, and font families. Use the `design` parameter to select a theme.

### **Core News & Media Designs**

#### 1. `default` - Breaking News Boldness
Navy blue gradient with golden accents. Bold Bebas Neue font for maximum impact.
```
/api/bundled-font-overlay.jpg?title=Breaking%20News%20Alert&website=NEWS&design=default
```

#### 2. `tech` - Professional Editorial
Steel blue gradient with clean typography. Perfect for tech and business content.
```
/api/bundled-font-overlay.jpg?title=Tech%20Innovation&website=TECH&design=tech
```

#### 3. `entertainment` - Viral & Loud
Burnt orange gradient with massive 78pt titles. High-impact Anton font for viral content. Minimal 15px padding for maximum text spread.
```
/api/bundled-font-overlay.jpg?title=VIRAL%20ENTERTAINMENT&website=GAMING&design=entertainment
```

#### 3b. `antonBlack` - Anton Black
Pure black gradient with massive 78pt white titles. Same bold Anton font as entertainment but with dramatic black background. Minimal 15px padding for edge-to-edge impact. Perfect for dramatic headlines and high-contrast content.
```
/api/bundled-font-overlay.jpg?title=DRAMATIC%20HEADLINE&website=NEWS&design=antonBlack
```

#### 3c. `antonTransparent` - Anton Transparent (NEW!)
**Fully transparent background** with massive 78pt white titles and **golden yellow website text (#FFD700)**. Bold Anton font with dramatic **black shadow (offsetX: 7px, offsetY: 6px, blur: 14px)**. Returns PNG format with alpha channel. Minimal 15px padding for edge-to-edge impact. Perfect for overlay compositing and transparent text effects!
```
/api/bundled-font-overlay.jpg?title=TRANSPARENT%20OVERLAY&website=DESIGN&design=antonTransparent
```
**Note**: Always returns PNG with transparency. Website text is golden yellow for contrast. Ideal for layering text over custom backgrounds!

#### 3d. `antonTransparent2` - Anton White Background (NEW!)
**White background** with massive 78pt white titles and **orange website text (#FFB347)**. Bold Anton font with dramatic **black shadow (offsetX: 7px, offsetY: 6px, blur: 14px)**. Same styling as entertainment design but with white background instead of burnt orange. Minimal 15px padding for edge-to-edge impact.
```
/api/bundled-font-overlay.jpg?title=WHITE%20BACKGROUND&website=DESIGN&design=antonTransparent2
```
**Note**: Perfect for clean, high-contrast designs with bold text on white background!

#### 4. `sports` - Impact Headlines
Teal gradient with bold Impact font. Dynamic style for sports news.
```
/api/bundled-font-overlay.jpg?title=Sports%20Victory&website=ESPN&design=sports
```

#### 5. `anime` - Friendly & Trustworthy
Amber gradient with Poppins font. Approachable style for anime and gaming.
```
/api/bundled-font-overlay.jpg?title=Anime%20Release&website=OTAKU&design=anime
```

#### 6. `eco` - Smart & Minimal
Teal gradient with League Spartan font. Clean design for environmental content.
```
/api/bundled-font-overlay.jpg?title=Eco%20Friendly&website=GREEN&design=eco
```

#### 7. `news` - Breaking News Crimson
Dark red gradient with classic Bebas Neue. Traditional news aesthetic.
```
/api/bundled-font-overlay.jpg?title=Breaking%20Story&website=NEWS&design=news
```

#### 8. `minimal` - Editorial Prestige
Pure black gradient with Playfair Display. Elegant and sophisticated.
```
/api/bundled-font-overlay.jpg?title=Editorial%20Content&website=MAGAZINE&design=minimal
```

### **Modern Social Media Designs**

#### 9. `modern` - Modern Authority
Royal blue gradient with Montserrat ExtraBold. Contemporary and professional.
```
/api/bundled-font-overlay.jpg?title=Modern%20Business&website=BRAND&design=modern
```

#### 10. `bold` - Stylish Credibility
Espresso brown gradient with massive Raleway Heavy font (85pt). Maximum presence.
```
/api/bundled-font-overlay.jpg?title=BOLD%20STATEMENT&website=IMPACT&design=bold
```

#### 11. `viral` - Versatile & Balanced
Graphite gradient with Roboto Condensed. Perfect for viral social content.
```
/api/bundled-font-overlay.jpg?title=Viral%20Content&website=SOCIAL&design=viral
```

#### 12. `breaking` - Breaking News Alert
Dark red gradient with urgent Bebas Neue styling. Immediate attention-grabber.
```
/api/bundled-font-overlay.jpg?title=BREAKING%20NOW&website=ALERT&design=breaking
```

#### 13. `thoughtful` - Thoughtful Deep Purple
Deep purple gradient with Montserrat. Reflective and engaging.
```
/api/bundled-font-overlay.jpg?title=Thoughtful%20Insight&website=WISDOM&design=thoughtful
```

#### 14. `colorful` - Colorful Amber
Vibrant amber gradient with Anton font. Eye-catching and energetic.
```
/api/bundled-font-overlay.jpg?title=Colorful%20Content&website=VIBRANT&design=colorful
```

### **Aesthetic & Style Designs**

#### 15. `overlay` - Photo Overlay Dark Gray
Dark gray gradient perfect for photo overlays. Roboto Condensed for readability.
```
/api/bundled-font-overlay.jpg?title=Photo%20Overlay&website=IMAGE&design=overlay
```

#### 16. `aesthetic` - Aesthetic Sea Green
Sea green gradient with Poppins. Calm and wellness-focused aesthetic.
```
/api/bundled-font-overlay.jpg?title=Aesthetic%20Vibes&website=WELLNESS&design=aesthetic
```

#### 17. `monochrome` - Monochrome Graphite
Graphite gradient with Impact font. Classic black and white style.
```
/api/bundled-font-overlay.jpg?title=Monochrome%20Style&website=CLASSIC&design=monochrome
```

#### 18. `vintage` - Vintage Copper
Copper gradient with Playfair Display. Nostalgic and elegant.
```
/api/bundled-font-overlay.jpg?title=Vintage%20Style&website=RETRO&design=vintage
```

#### 19. `luxury` - Luxury Burgundy
Burgundy gradient with golden accents. Premium Playfair Display font.
```
/api/bundled-font-overlay.jpg?title=Luxury%20Brand&website=PREMIUM&design=luxury
```

#### 20. `cinematic` - Cinematic Steel Blue
Steel blue gradient with massive Anton font (70pt). Hollywood drama style.
```
/api/bundled-font-overlay.jpg?title=Cinematic%20Drama&website=CINEMA&design=cinematic
```

#### 21. `neon` - Neon Indigo
Indigo gradient with Bebas Neue. Futuristic neon aesthetic.
```
/api/bundled-font-overlay.jpg?title=Neon%20Lights&website=FUTURE&design=neon
```

#### 22. `inspire` - Inspirational Olive
Olive gradient with League Spartan. Uplifting and motivational.
```
/api/bundled-font-overlay.jpg?title=Inspiration&website=MOTIVATE&design=inspire
```

#### 23. `cute` - Cute Royal Violet
Royal violet gradient with Poppins. Friendly and approachable.
```
/api/bundled-font-overlay.jpg?title=Cute%20Content&website=KAWAII&design=cute
```

#### 24. `warmbrown` - Warm Espresso
Espresso brown gradient with Montserrat. Cozy and comfortable.
```
/api/bundled-font-overlay.jpg?title=Warm%20Vibes&website=COFFEE&design=warmbrown
```

#### 25. `pokemon` - Pokémon Wine
Wine purple gradient with Impact font (73pt). Electric gaming energy.
```
/api/bundled-font-overlay.jpg?title=Pokemon%20Battle&website=TRAINER&design=pokemon
```

### **Quote & Special Designs**

#### 26. `quote1` - Bold Quote Overlay
Pure black background with Anton font (64pt). Bold inspirational quotes.
```
/api/bundled-font-overlay.jpg?title=Your%20Inspirational%20Quote%20Here&website=QUOTES&design=quote1
```

**🇵🇭 With Auto-Generated Tagalog Hugot Quotes:**
```
/api/bundled-font-overlay.jpg?image=https://picsum.photos/800/600&design=quote1&val=HugotTagalog
```
Generates random Tagalog Hugot quotes on every request (200+ quotes available).

**🇵🇭 With Auto-Generated Tagalog Inspirational Quotes:**
```
/api/bundled-font-overlay.jpg?image=https://picsum.photos/800/600&design=quote1&val=InspirationTagalog
```
Generates random Tagalog inspirational quotes on every request (10 quotes available).

**💕 NEW! With Auto-Generated Tagalog Romantic Quotes:**
```
/api/bundled-font-overlay.jpg?image=https://picsum.photos/800/600&design=quote1&val=babaeTagalog
```
Generates random romantic/relationship Tagalog quotes on every request (200+ quotes about love, dating, and relationships). Automatically uses quotes even when title is empty!

#### 27. `quote2` - Elegant Quote Overlay
Dark charcoal background with Playfair Display (58pt). Elegant wisdom quotes.
```
/api/bundled-font-overlay.jpg?title=Elegant%20Quote%20Here&website=WISDOM&design=quote2
```

#### 28. `quote3` - Impact Quote Overlay
Black to dark gray gradient with Impact font (68pt). High-impact motivational quotes.
```
/api/bundled-font-overlay.jpg?title=Motivational%20Quote&website=INSPIRE&design=quote3
```

#### 29. `blank` - Transparent Blank
**Completely transparent background** with white Anton text (60pt). Returns PNG format.
```
/api/bundled-font-overlay.jpg?title=Transparent%20Text&website=OVERLAY&design=blank
```
**Note**: Perfect for compositing text over other images! Always returns PNG with alpha channel.

## 🔧 Advanced Usage

### Embedding in HTML
```html
<!-- Enhanced Font System -->
<img src="https://your-domain.com/api/bundled-font-overlay.jpg?image=https://picsum.photos/800/600&title=Enhanced%20Banner&website=YourSite.com&design=tech" alt="Tech News Banner" />
```

### Social Media Integration
```javascript
// Enhanced Font System with all 29 designs
const enhancedBanner = 'https://your-domain.com/api/bundled-font-overlay.jpg?' + 
  'image=https://images.unsplash.com/photo-1506905925346-21bda4d32df4' +
  '&title=Social%20Media%20Post' +
  '&website=YourBrand.com' +
  '&design=entertainment';

// Use for Twitter, Facebook, Instagram, etc.
```

### Batch Processing
```javascript
// All available designs
const allDesigns = [
  'default', 'tech', 'entertainment', 'antonBlack', 'antonTransparent', 'antonTransparent2', 'sports', 'anime', 'eco', 'news', 'minimal',
  'modern', 'bold', 'viral', 'breaking', 'thoughtful', 'colorful', 'overlay', 
  'aesthetic', 'monochrome', 'vintage', 'luxury', 'cinematic', 'neon', 'inspire',
  'cute', 'warmbrown', 'pokemon', 'quote1', 'quote2', 'quote3', 'blank'
];

const baseUrl = 'https://your-domain.com/api/bundled-font-overlay.jpg?image=https://picsum.photos/800/600&title=Batch%20Test&website=TestSite.com';

allDesigns.forEach(design => {
  fetch(`${baseUrl}&design=${design}`)
    .then(response => response.blob())
    .then(blob => {
      console.log(`Generated ${design} variant`);
    });
});
```

## 📊 Response Formats

The API supports multiple response types:

- **Direct Image**: Binary image data (JPEG or PNG depending on design)
- **Interactive Preview**: HTML interface with download options via `/preview` page

## 🛠 Development

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Test the API:
```bash
# Test bundled font overlay system
curl "http://localhost:3000/api/bundled-font-overlay.jpg?image=https://picsum.photos/800/600&title=Enhanced%20Test&website=TestSite.com&design=tech" --output test-enhanced.jpg

# Test with binary data parameter
curl "http://localhost:3000/api/bundled-font-overlay.jpg?imageData=<base64-encoded-image>&title=Binary%20Test&design=aesthetic" --output test-binary.jpg

# Test transparent overlay (PNG output)
curl "http://localhost:3000/api/bundled-font-overlay.jpg?title=Transparent%20Text&website=OVERLAY&design=blank" --output test-transparent.png

# Open design gallery
open "http://localhost:3000/designs"

# Open quote tester
open "http://localhost:3000/quote-test"
```

4. Build for production:
```bash
npm run build
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Automatic deployments with global CDN
3. Serverless functions with Sharp optimization
4. Built-in SSL and performance optimization

### Environment Variables
No environment variables required - the API is designed to work out of the box.

### Production Considerations
- Sharp image processing is optimized for serverless
- Global CDN ensures fast image delivery
- No rate limiting implemented (add if needed)
- CORS enabled for cross-origin requests

## 📈 Performance

- **Image Processing**: Server-side Sharp optimization
- **Output Quality**: 1080×1350 high resolution
- **Compression**: Optimized JPEG (quality: 90) and PNG
- **Caching**: Browser and CDN friendly headers
- **Response Time**: < 2s for most images

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add new design variants in `pages/api/direct-image.js`
4. Test with multiple image formats
5. Submit a pull request

## 📄 License

MIT License - feel free to use in personal and commercial projects.

## 🔗 Links

- **Live Demo**: [Try the API](https://your-domain.com/api/bundled-font-overlay.jpg?image=https://picsum.photos/800/600&title=Demo%20Banner&design=tech)
- **Design Gallery**: [Browse All Designs](https://your-domain.com/designs)
- **Interactive Testing**: [Binary Data Tester](https://your-domain.com/binary-test)
- **Quote Designs**: [Quote Tester](https://your-domain.com/quote-test)