# �️ Banner Generator API

A powerful Next.js application that creates professional image banners with custom text overlays. Features 12 design variants, direct image URLs, and comprehensive image processing capabilities.

## ✨ Features

### Standard Design System
- **🎨 12 Professional Designs**: From news alerts to corporate styles
- **⚡ Direct Image URLs**: Works like wsrv.nl for instant embedding
- **🖼️ High Quality Output**: 1080×1350 resolution with optimized compression
- **📱 Preview Mode**: Interactive preview with download options
- **🔗 Multiple Formats**: JPEG and PNG support

### Enhanced Font System (bundled-font-overlay)
- **� Superior Unicode Support**: Bundled Noto Sans + Inter fonts with fontconfig
- **🎯 8 Themed Designs**: Tech, Entertainment, Sports, Anime, Eco, News, Minimal styles
- **📏 Dynamic Text Layout**: Intelligent wrapping and positioning prevents overlap
- **⚡ Glow Effects**: Special visual effects for tech designs
- **🎨 Design-Specific Features**: Accent lines, separator bars, custom gradients

### Common Features
- **�🚀 Fast Processing**: Server-side rendering with Sharp image processing
- **🌐 Public API**: No authentication required
- **📊 Detailed Logging**: Debug information for troubleshooting

## 🔧 API Parameters

- `image` → Source image URL (required)
- `title` → Text overlay for banner
- `website` → Brand/website name (optional)
- `design` → Design variant: `default`, `design1`-`design12`
- `format` → Output format: `jpeg` (default) or `png`
- `preview` → Set to `true` for interactive preview
- `w` → Width in pixels (default: 1080)
- `h` → Height in pixels (default: 1350)

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

## 🎯 Direct Design Test URLs (Bundled Font System)

### **🌟 Design Gallery Page:**
```
http://localhost:3000/designs
```

### **Enhanced Font-Enabled Designs:**

#### 1. Classic Dark (Default)
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=AI%20Will%20Replace%20Doctors%20%26%20Teachers%20Within%2010%20Years&website=SOCIATV&design=default
```

#### 2. Tech Blue (Solid Black Background) 
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=AI%20Will%20Replace%20Doctors%20%26%20Teachers%20Within%2010%20Years&website=SOCIATV&design=tech
```

#### 3. Entertainment Yellow (Gaming News Style)
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=US%20GAMERS%20AREN%27T%20BUYING%20VIDEO%20GAMES%20ANYMORE%2C%20NEW%20STUDY%20REVEALS&website=GAMING%20NEWS&design=entertainment
```

#### 4. Sports Dynamic (Tennis/Sports Style)
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Valentin%20Vacherot%20Discloses%20How%20Jannik%20Sinner%20Treats%20Him&website=THE%20SPORT%20REVIEW&design=sports
```

#### 5. Anime Dark (Hunter x Hunter Style)
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Hunter%20x%20Hunter%27s%20Dark%20Continent%20Arc%20Finally%20Gets%20An%20Anime%20Adaptation&website=RICHHIPPOS.COM&design=anime
```

#### 6. Eco Green (Iceland Renewable Energy Style)
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Iceland%20Powers%20Itself%20With%20100%25%20Renewable%20Energy&website=HW&design=eco
```

#### 7. News Professional (YouTube/News Style)
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=YouTuber%20Outdoor%20Boys%20Has%20Revealed%20He%20Will%20Be%20Uploading%203%20Videos&website=BAD%20FRIENDS&design=news
```

#### 8. Minimal Clean (Japan Water Plant Style)
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Japan%27s%20Water%20Plant%20Generates%20Endless%20Power%20By%20Mixing%20Saltwater&website=SCIENCE%20HUB&design=minimal
```

### 🖼️ Format Variations

#### PNG Format (with transparency support)
```javascript
fetch('https://your-domain.com/api/direct-image?image=https://picsum.photos/800/600&title=PNG%20Banner&format=png&design=design2')
```

#### Custom Dimensions
```javascript
fetch('https://your-domain.com/api/direct-image?image=https://picsum.photos/800/600&title=Custom%20Size&w=1920&h=1080&design=design1')
```

### 📱 Interactive Preview Mode
```javascript
// Open in browser for interactive preview with download options
window.open('https://your-domain.com/?image=https://picsum.photos/800/600&title=Preview%20Banner&website=Demo.com&preview=true&design=design3')
```

### 📊 JSON Metadata Response
```javascript
// Get pure JSON metadata (no HTML wrapper)
fetch('https://your-domain.com/api/image?image=https://picsum.photos/800/600&title=Metadata%20Only')
  .then(response => response.json())
  .then(data => console.log(data));
```

#### JSON Response Example:
```json
[
  {
    "statusCode": 200,
    "headers": [
      {
        "name": "content-type",
        "value": "image/jpeg"
      },
      {
        "name": "content-length", 
        "value": "370962"
      }
    ],
    "cookieHeaders": [],
    "data": "IMTBuffer(370962, binary, ffd8ffe000104a46...): /9j/4AAQSkZJRgABAQAAAQ...",
    "fileSize": 370962,
    "fileName": "file.jpeg",
    "contentType": "image/jpeg",
    "url": "https://picsum.photos/800/600",
    "title": "Metadata Only",
    "timestamp": "2025-11-02T12:00:00.000Z"
  }
]
```

## 🎨 Design Variants Guide

| Design | Style | Best For | Color Scheme |
|--------|-------|----------|--------------|
| `default` | Modern gradient | General use | Blue gradient |
| `design1` | 🚨 Red Alert | Breaking news | Red gradient |
| `design2` | ⚡ Blue Pulse | Tech news | Electric blue |
| `design3` | � Yellow Flash | Viral content | Yellow accent |
| `design4` | 🟥 Gradient Burst | YouTube style | Red-orange |
| `design5` | 📰 White Noise | Professional | Clean white |
| `design6` | 🧨 Cyber Alert | Futuristic | Neon effects |
| `design7` | 🔥 Red Flash | Urgent alerts | Impact red |
| `design8` | ⚡ Electric Cyan | Fresh tech | Cyan pop |
| `design9` | 🖤 Black + Red | Energetic | Black/red |
| `design10` | 🟠 Amber Alert | Authority | Amber warning |
| `design11` | 🔵 Blue Ribbon | Corporate | Professional blue |
| `design12` | 🔴 Metallic Red | Modern polish | Metallic red |

## 🎨 Enhanced Font Design Variants (Bundled System)

| Design | Style | Best For | Color Scheme | Special Features |
|--------|-------|----------|--------------|------------------|
| `default` | Classic Dark | General use | White/Gold | Elegant gradient |
| `tech` | 🔵 Tech Blue | AI/Tech content | White/Cyan | Solid black bg + Glow effects |
| `entertainment` | 🟣 Entertainment Purple | Movies/TV shows | Gold/Purple | Rich gradients |
| `sports` | ⚡ Sports Dynamic | Sports content | White/Green | Dynamic spacing |
| `anime` | 🌟 Anime Dark | Gaming/Anime | Gold/Orange | Accent lines |
| `eco` | 🌱 Eco Green | Environmental | White/Lime | Earth tones |
| `news` | 📰 News Professional | News/Media | White/Red | Separator bars |
| `minimal` | 🤍 Minimal Clean | Minimalist | Dark Gray | Clean/Light |

## 🔧 Advanced Usage

### Embedding in HTML
```html
<!-- Standard Design System -->
<img src="https://your-domain.com/api/direct-image?image=https://picsum.photos/800/600&title=Embedded%20Banner&design=design1" alt="News Banner" />

<!-- Enhanced Font System -->
<img src="https://your-domain.com/api/bundled-font-overlay.jpg?image=https://picsum.photos/800/600&title=Enhanced%20Banner&website=YourSite.com&design=tech" alt="Tech News Banner" />
```

### Social Media Integration
```javascript
// Standard Design System
const standardBanner = 'https://your-domain.com/api/direct-image?' + 
  'image=https://images.unsplash.com/photo-1506905925346-21bda4d32df4' +
  '&title=Social%20Media%20Post' +
  '&website=YourBrand.com' +
  '&design=design3' +
  '&format=png';

// Enhanced Font System (Better Unicode Support)
const enhancedBanner = 'https://your-domain.com/api/bundled-font-overlay.jpg?' + 
  'image=https://images.unsplash.com/photo-1506905925346-21bda4d32df4' +
  '&title=Social%20Media%20Post' +
  '&website=YourBrand.com' +
  '&design=entertainment';

// Use for Twitter, Facebook, Instagram, etc.
```

### Batch Processing
```javascript
// Standard Design System
const standardDesigns = ['design1', 'design2', 'design3'];
const standardUrl = 'https://your-domain.com/api/direct-image?image=https://picsum.photos/800/600&title=Batch%20Test';

standardDesigns.forEach(design => {
  fetch(`${standardUrl}&design=${design}`)
    .then(response => response.blob())
    .then(blob => {
      console.log(`Generated ${design} variant`);
    });
});

// Enhanced Font System
const enhancedDesigns = ['tech', 'entertainment', 'sports', 'anime', 'eco', 'news', 'minimal'];
const enhancedUrl = 'https://your-domain.com/api/bundled-font-overlay.jpg?image=https://picsum.photos/800/600&title=Batch%20Test&website=TestSite.com';

enhancedDesigns.forEach(design => {
  fetch(`${enhancedUrl}&design=${design}`)
    .then(response => response.blob())
    .then(blob => {
      console.log(`Generated ${design} enhanced variant`);
    });
});
```

## 📊 Response Formats

The API supports multiple response types:

- **Direct Image**: Binary image data (default for `/api/direct-image`)
- **JSON Metadata**: Complete image information with base64 data
- **Interactive Preview**: HTML interface with download options

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
# Test standard design system
curl "http://localhost:3001/api/direct-image?image=https://picsum.photos/800/600&title=Test%20Banner&design=design1" --output test-banner.jpg

# Test enhanced font system
curl "http://localhost:3001/api/bundled-font-overlay.jpg?image=https://picsum.photos/800/600&title=Enhanced%20Test&website=TestSite.com&design=tech" --output test-enhanced.jpg

# Test JSON metadata (pure JSON API)
curl "http://localhost:3001/api/image?image=https://picsum.photos/800/600&title=Test%20Metadata"

# Test preview mode
open "http://localhost:3001/?image=https://picsum.photos/800/600&title=Test%20Preview&preview=true&design=design2"

# Test design gallery
open "http://localhost:3001/designs"
```

4. Build for production:
```bash
npm run build
```

## � Security & Access

### Public Homepage
- Default homepage shows a clean, professional interface
- No API details exposed to public visitors
- Perfect for public deployment

### Technical Documentation
- Access with `?admin=docs` parameter
- Complete API documentation and examples
- For developers and technical users

```bash
# Public homepage (safe for public)
https://your-domain.com/

# Technical docs (for developers)
https://your-domain.com/?admin=docs
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

- **Live Demo**: [Try the API](https://your-domain.com/api/direct-image?image=https://picsum.photos/800/600&title=Demo%20Banner&design=design1)
- **Preview Mode**: [Interactive Preview](https://your-domain.com/?image=https://picsum.photos/800/600&title=Demo&preview=true&design=design2)
- **Documentation**: [Technical Docs](https://your-domain.com/?admin=docs)