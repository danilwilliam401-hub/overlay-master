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

### Image Sources
- `image` → Source image URL (use OR imageData)
- `imageData` → **🆕 Base64-encoded binary image data** (use OR image URL)

### Text Overlays
- `title` → Text overlay for banner
- `website` → Brand/website name (optional)

### Design Options
- `design` → Design variant: `default`, `design1`-`design12`
- `format` → Output format: `jpeg` (default) or `png`
- `preview` → Set to `true` for interactive preview

### Output Settings
- `w` → Width in pixels (default: 1080)
- `h` → Height in pixels (default: 1350)

### 🆕 Binary Data Support
The API now supports **direct binary image data** via the `imageData` parameter:

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
fetch('/api/bundled-font-overlay?imageData=iVBORw0KGgo...&title=Small%20Binary&design=minimal');
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

## 🎯 Direct Design Test URLs (Bundled Font System)

### **🌟 Design Gallery Page:**
```
http://localhost:3000/designs
```

### **🔬 Binary Data Testing Page:**
```
http://localhost:3000/binary-test
```
Test the new `imageData` parameter with file uploads and sample image generation.

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

### **🚀 New Universal Design Test URLs:**

#### 9. Modern Lifestyle
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Live%20Your%20Best%20Life%20Today&website=LIFESTYLE&design=modern
```

#### 10. Bold Impact (Viral Memes)
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=When%20You%20Realize%20It%27s%20Monday&website=VIRAL%20MEMES&design=bold
```

#### 11. Viral Entertainment
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Celebrity%20Drama%20Unfolds%20on%20Social%20Media&website=ENTERTAINMENT&design=viral
```

#### 12. Breaking News
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Major%20Political%20Development%20Shakes%20Nation&website=NEWS%20CENTER&design=breaking
```

#### 13. Thoughtful Quotes
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Success%20Is%20Not%20Final%20Failure%20Is%20Not%20Fatal&website=MOTIVATION&design=thoughtful
```

#### 14. Colorful Youth
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Gen%20Z%20Changes%20Everything%20Again&website=YOUTH%20CULTURE&design=colorful
```

#### 15. Photo Overlay
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Capture%20Every%20Moment%20That%20Matters&website=PHOTOGRAPHY&design=overlay
```

#### 16. Aesthetic Style
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Wellness%20Journey%20Starts%20With%20Self%20Love&website=WELLNESS&design=aesthetic
```

#### 17. Monochrome Minimal
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Less%20Is%20More%20In%20Every%20Aspect&website=MINIMALIST&design=monochrome
```

#### 18. Vintage Retro
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Good%20Old%20Days%20Were%20Actually%20Good&website=RETRO%20VIBES&design=vintage
```

#### 19. Luxury Premium
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Excellence%20Is%20Never%20An%20Accident&website=LUXURY%20BRAND&design=luxury
```

#### 20. Cinematic Drama
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Plot%20Twist%20Nobody%20Saw%20Coming&website=CINEMA&design=cinematic
```

#### 21. Neon Tech
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Artificial%20Intelligence%20Revolution%20Begins&website=TECH%20NEWS&design=neon
```

#### 22. Inspirational
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Believe%20You%20Can%20And%20You%20Are%20Halfway%20There&website=INSPIRATION&design=inspire
```

#### 23. Cute Aesthetic
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Small%20Steps%20Lead%20To%20Big%20Changes&website=POSITIVITY&design=cute
```

#### 24. Warm Brown Elegance
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Premium%20Coffee%20Experience%20Awaits&website=COFFEE%20CULTURE&design=warmbrown
```

#### 25. Pokémon Electric
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Gotta%20Catch%20Em%20All%20Adventure%20Begins&website=POKEMON%20TRAINER&design=pokemon
```

### **⚡ 30 New High-Engagement Design Presets:**

#### 26. Modern Minimal
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Clean%20Modern%20Design%20For%20Professional%20Content&website=MODERN%20BRAND&design=modern
```

#### 27. Bold Blue Impact
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Bold%20Statement%20With%20Maximum%20Impact&website=BLUE%20IMPACT&design=boldblue
```

#### 28. Sunrise Energy
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Energy%20And%20Motivation%20Start%20Here&website=SUNRISE%20VIBES&design=sunrise
```

#### 29. Gradient Gold
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Luxury%20Content%20With%20Golden%20Touch&website=GOLD%20STANDARD&design=gradientgold
```

#### 30. Minimal White
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Clean%20Minimalist%20Approach%20To%20Content&website=MINIMAL%20DESIGN&design=minimalwhite
```

#### 31. Midnight Dark
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Dark%20Theme%20For%20Serious%20Content&website=MIDNIGHT%20MOOD&design=midnight
```

#### 32. Energetic Fire
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=High%20Energy%20Viral%20Content%20Design&website=FIRE%20ENERGY&design=energetic
```

#### 33. Cyberpunk Neon
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Future%20Tech%20Cyberpunk%20Aesthetic&website=CYBER%20PUNK&design=cyberpunk
```

#### 34. Moody Atmosphere
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Atmospheric%20Content%20With%20Mood&website=MOODY%20VIBES&design=moody
```

#### 35. Forest Deep
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Nature%20And%20Environmental%20Content&website=FOREST%20GREEN&design=forest
```

#### 36. Pop Art Style
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Retro%20Pop%20Art%20Viral%20Content&website=POP%20ART&design=popart
```

#### 37. Dark Gold Luxury
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Premium%20Luxury%20Brand%20Content&website=DARK%20GOLD&design=darkgold
```

#### 38. Aqua Fresh
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Fresh%20Clean%20Water%20Theme%20Design&website=AQUA%20FRESH&design=aqua
```

#### 39. Fire Intensity
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Intense%20High%20Impact%20Content&website=FIRE%20POWER&design=fire
```

#### 40. Chill Vibes
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Relaxed%20Chill%20Content%20Vibes&website=CHILL%20MODE&design=chill
```

#### 41. Royal Elegance
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Royal%20Premium%20Elegant%20Design&website=ROYAL%20CLASS&design=royal
```

#### 42. Cinematic Drama
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Hollywood%20Movie%20Style%20Content&website=CINEMATIC&design=cinematic
```

#### 43. Retro Nostalgia
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Vintage%20Retro%20Nostalgic%20Content&website=RETRO%20STYLE&design=retro
```

#### 44. Purple Dream
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Dreamy%20Purple%20Aesthetic%20Content&website=PURPLE%20DREAM&design=purpledream
```

#### 45. Grunge Style
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Raw%20Grunge%20Urban%20Style%20Content&website=GRUNGE%20STYLE&design=grunge
```

#### 46. Matrix Code
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Digital%20Matrix%20Tech%20Content&website=MATRIX%20CODE&design=matrix
```

#### 47. Street Urban
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Urban%20Street%20Culture%20Content&website=STREET%20STYLE&design=street
```

#### 48. Cloud Sky
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Sky%20High%20Inspirational%20Content&website=CLOUD%20NINE&design=cloud
```

#### 49. Metallic Steel
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Industrial%20Metallic%20Steel%20Design&website=STEEL%20POWER&design=metallic
```

#### 50. Chocolate Brown
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Warm%20Chocolate%20Comfort%20Content&website=CHOCOLATE&design=chocolate
```

#### 51. Future Tech
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Advanced%20Future%20Technology%20Content&website=FUTURE%20TECH&design=future
```

#### 52. Lime Pop
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Bright%20Lime%20Pop%20Energy%20Content&website=LIME%20POP&design=limepop
```

#### 53. Royal Red
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Royal%20Red%20Premium%20Content&website=ROYAL%20RED&design=royalred
```

#### 54. Viral Impact
```
http://localhost:3000/api/bundled-font-overlay.jpg?title=Maximum%20Viral%20Impact%20Content&website=VIRAL%20HIT&design=viral
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

### Original 8 Designs

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

### Universal Design Collection (47 Total Styles)

| Design | Style | Best For | Font Size | Special Features |
|--------|-------|----------|-----------|------------------|
| `modern` | 🎨 Modern Lifestyle | General quotes, lifestyle | 75px | Clean centered layout |
| `bold` | ⚡ Bold Impact | Memes, viral content | 85px | High contrast dark red background |
| `viral` | 💬 Viral Entertainment | Pop culture, humor | 85px | Yellow-orange viral gradient |
| `breaking` | 📰 Breaking News | News, politics | 57px | Red "BREAKING" tag |
| `thoughtful` | 🧠 Thoughtful Quotes | Motivational content | 53px | Thin divider line |
| `colorful` | 🌈 Colorful Youth | Lifestyle, youth content | 63px | Bright cyan-orange gradient |
| `overlay` | 📸 Photo Overlay | Image captions | 60px | Bottom gradient overlay |
| `aesthetic` | 🎨 Aesthetic Style | Fashion, wellness | 57px | Soft pastel palette |
| `monochrome` | 🖤 Monochrome Minimal | Brand posts | 60px | Pure black/white |
| `vintage` | 🧩 Vintage Retro | Nostalgia content | 78px | Cream/brown retro colors |
| `luxury` | 💎 Luxury Premium | Business, success | 63px | Gold on navy gradient |
| `cinematic` | 🎥 Cinematic Drama | Movie content | 85px | Black letterbox bars |
| `neon` | ⚙️ Neon Tech | Tech, coding | 60px | Neon glow effects |
| `inspire` | ☀️ Inspirational | Positive quotes | 63px | Blue-yellow gradient |
| `cute` | 🧁 Cute Aesthetic | Feel-good content | 67px | Pink rounded style |
| `warmbrown` | ☕ Warm Brown Elegance | Professional, coffee shops | 67px | Soft shadow + vignette |
| `pokemon` | ⚡ Pokémon Electric | Gaming, anime, fun content | 73px | Text outline + radial burst |
| `boldblue` | 🔵 Bold Blue Impact | Corporate, tech announcements | 80px | Deep blue professional gradient |
| `sunrise` | 🌅 Sunrise Energy | Motivational, morning content | 78px | Orange-pink energy gradient |
| `gradientgold` | 👑 Gradient Gold | Luxury, premium brands | 75px | Gold gradient on dark background |
| `minimalwhite` | ⚪ Minimal White | Clean, professional content | 80px | Pure white minimalist design |
| `midnight` | 🌙 Midnight Dark | Night themes, serious content | 80px | Deep navy to black gradient |
| `energetic` | 🔥 Energetic Fire | High-energy, sports content | 85px | Red-orange fire gradient |
| `cyberpunk` | 🤖 Cyberpunk Neon | Futuristic, gaming content | 78px | Pink-cyan cyberpunk aesthetic |
| `moody` | 🍂 Moody Atmosphere | Artistic, emotional content | 75px | Brown-gray atmospheric tones |
| `forest` | 🌲 Forest Deep | Environmental, nature content | 78px | Deep green forest gradient |
| `popart` | 🎨 Pop Art Style | Retro, fun viral content | 85px | Bright red-yellow pop colors |
| `darkgold` | 🏆 Dark Gold Luxury | Premium, exclusive content | 75px | Gold on black luxury theme |
| `aqua` | 💧 Aqua Fresh | Health, wellness, fresh content | 80px | Teal-blue water gradient |
| `fire` | 🔥 Fire Intensity | Intense, urgent content | 85px | Yellow on black with red accent |
| `chill` | 😌 Chill Vibes | Relaxed, lifestyle content | 80px | Cool blue calming gradient |
| `royal` | 👑 Royal Elegance | Premium, luxury brands | 75px | Royal blue to gold gradient |
| `grunge` | 🎸 Grunge Style | Alternative, urban content | 78px | Dark gray grunge texture |
| `matrix` | 💚 Matrix Code | Tech, programming content | 80px | Green matrix code aesthetic |
| `street` | 🏙️ Street Urban | Urban culture, street style | 80px | Gray urban concrete theme |
| `cloud` | ☁️ Cloud Sky | Inspirational, sky themes | 78px | Light blue sky gradient |
| `metallic` | ⚙️ Metallic Steel | Industrial, tech content | 80px | Silver-steel metallic gradient |
| `chocolate` | 🍫 Chocolate Brown | Comfort, food content | 78px | Warm brown chocolate tones |
| `future` | 🚀 Future Tech | Sci-fi, technology content | 80px | Cyan on black futuristic |
| `limepop` | 🍃 Lime Pop | Fresh, energetic content | 80px | Bright lime-green gradient |
| `royalred` | 🏴 Royal Red | Premium, luxury red theme | 78px | Deep red to gold gradient |
| `purpledream` | 💜 Purple Dream | Creative, artistic content | 80px | Purple-magenta dream gradient |
| `retro` | 📼 Retro Nostalgia | Vintage, nostalgic content | 78px | Orange-brown retro palette |

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