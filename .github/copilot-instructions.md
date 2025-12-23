# AI Agent Instructions - Overlay Banner API

## Project Overview
Next.js 14 (Pages Router) banner generation API with Sharp image processing, NextAuth authentication, Prisma ORM, and dual payment providers (PayMongo/PayPal). Main product: `/api/bundled-font-overlay` - generates professional image overlays with 31 design themes and 14 bundled fonts.

## Environment Variables

### Required Variables (`.env.local`)
```bash
# Database Configuration
DATABASE_URL="file:./dev.db"                           # SQLite for dev
# DATABASE_URL="postgresql://user:pass@host:5432/db"  # PostgreSQL for prod

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3001"                   # Dev: http://localhost:3001
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32" # Min 32 chars

# Google OAuth (Get from console.cloud.google.com/apis/credentials)
GOOGLE_CLIENT_ID="xxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="xxxxx"

# PayMongo (Philippines) - dashboard.paymongo.com
PAYMONGO_SECRET_KEY="sk_test_xxxxx"                    # Use sk_live_ for production
PAYMONGO_PUBLIC_KEY="pk_test_xxxxx"
PAYMONGO_WEBHOOK_SECRET="whsec_xxxxx"

# PayPal (International) - developer.paypal.com
PAYPAL_CLIENT_ID="xxxxx"
PAYPAL_CLIENT_SECRET="xxxxx"
PAYPAL_MODE="sandbox"                                  # Use "live" for production

# Optional: Email Configuration (for nodemailer)
EMAIL_SERVER="smtp://user:pass@smtp.example.com:587"
EMAIL_FROM="noreply@yourdomain.com"

# Optional: Internal API Secret (for usage logging)
INTERNAL_API_SECRET="your-internal-secret"
```

### Generating Secrets
```bash
# NEXTAUTH_SECRET
openssl rand -base64 32

# PayMongo webhook secret: Get from PayMongo dashboard
# PayPal credentials: Create app in PayPal Developer Dashboard
```

## Critical Architecture Patterns

### Image Processing Pipeline
- **Entry Point**: `pages/api/bundled-font-overlay.js` (2838 lines)
- **Runtime**: `export const runtime = 'nodejs'` required for Sharp + fontconfig
- **Font System**: Fonts loaded as base64 at module startup, cached in `fontBase64Cache`
- **Fontconfig**: Environment vars set at module load (`FONTCONFIG_PATH`, `FONTCONFIG_FILE`, `FONTCONFIG_CACHE=/tmp/fontconfig-cache`)
- **Design Themes**: 31 themes in `DESIGN_THEMES` object (lines 144-509), each with `titleColor`, `gradientColors`, `fontFamily`, `titleSize`
- **Quote Generation**: 3 quote modes (`InspirationTagalog`, `HugotTagalog`, `babaeTagalog`) auto-fill empty titles with random Tagalog quotes
- **Image Sources**: Priority order: `imageData` (base64) > `image` (URL) > blank gradient background

### Authentication & API Keys
- **Protected Routes**: Use `protectApiRoute()` from `lib/apiKeyAuth.js` (currently disabled in bundled-font-overlay)
- **Key Format**: `sk_live_*` or `sk_test_*` (prefix for display, full key hashed with bcrypt)
- **Validation**: Extract from `Authorization: Bearer` or `x-api-key` header
- **Rate Limiting**: In-memory Map (upgrade to Redis for production) - see `rateLimitStore` in `lib/apiKeyAuth.js`
- **Usage Tracking**: Log via `lib/apiKeyAuth.js` `logUsage()` - currently disabled (commented out in handlers)

### Database Schema (Prisma)
- **Provider**: SQLite dev, PostgreSQL prod (change `provider` in `prisma/schema.prisma`)
- **Core Models**: `User`, `ApiKey`, `Banner`, `Subscription`, `Payment`, `Invoice`, `ApiUsage`, `Template`
- **Relations**: User → ApiKeys → Banners, User → Subscriptions → Payments, User → Templates
- **Migrations**: Run `npx prisma migrate dev --name <name>` ONLY when dev server stopped (lock conflict)
- **Admin Role**: `User.isAdmin` field - check before accessing `/pages/admin/*`
- **Template Model**: Stores reusable banner designs with `uniqueUrl` (8-char hex) for API access via `/api/templates/{uniqueUrl}`

### Payment System
- **PayMongo** (Philippines): `/api/payments/paymongo/*` - GCash, GrabPay, cards
- **PayPal** (International): `/api/payments/paypal/*` - standard PayPal flow
- **Webhooks**: `/api/webhooks/paymongo.js` and `/api/webhooks/paypal.js` handle async payment events
- **Plans**: 3 tiers (Starter $10, Pro $30, Enterprise $50) - defined in `/pages/checkout.js`
- **Billing**: `/pages/billing.js` shows subscription status, payment history, cancel button

### NextAuth Configuration
- **File**: `pages/api/auth/[...nextauth].js`
- **Providers**: Google OAuth + credentials (email/password with bcrypt)
- **Email Verification**: `/api/auth/send-verification.js` sends token, `/api/auth/verify.js` validates
- **Session**: Database sessions via Prisma adapter
- **Callbacks**: Custom `jwt` and `session` callbacks inject `userId`, `isAdmin` into session

## Development Workflows

### Local Development
```bash
npm run dev           # Port 3001 (configured in package.json)
npx prisma studio     # View/edit database
npm run check-secrets # Pre-commit security scan (MUST run before commits)
```

### Testing Features
- **Preview Pages**: `/quote-test`, `/font-test`, `/long-text-test`, `/binary-test` for interactive testing
- **Template Generator**: `/banner-template` - authenticated page to create/save reusable banner designs
- **Direct API**: `/api/bundled-font-overlay?image=URL&title=Text&design=tech&w=1080&h=1350`
- **Quote Modes**: Add `&val=babaeTagalog` to quote designs for auto-generated Tagalog quotes
- **Binary Upload**: POST with `imageData` (base64) in JSON body
- **Template API**: Access saved templates via `/api/templates/{uniqueUrl}` (no auth required once created)

### Database Operations
```bash
# Stop dev server FIRST, then:
npx prisma migrate dev --name <change_description>
npx prisma generate   # After schema changes

# If migration fails with lock error: dev server is running
```

### Testing API Routes
- **Preview Pages**: `/quote-test`, `/font-test`, `/long-text-test`, `/binary-test` for interactive testing
- **Direct API**: `/api/bundled-font-overlay?image=URL&title=Text&design=tech&w=1080&h=1350`
- **Quote Modes**: Add `&val=babaeTagalog` to quote designs for auto-generated Tagalog quotes
- **Binary Upload**: POST with `imageData` (base64) in JSON body
- **Template Testing**: Create template at `/banner-template`, access via `/api/templates/{uniqueUrl}`

### Deployment (Vercel)
- **Config**: `vercel.json` (if exists) and `next.config.js` configure serverless
- **Environment**: Detect with `process.env.VERCEL` - adjust logging/timeouts accordingly
- **Caching**: Quote APIs use `no-cache`, others default 5min (`max-age=300`)
- **Font Loading**: Base64 fonts ensure no filesystem dependencies in serverless

## Project-Specific Conventions

### File Organization
- **API Routes**: `pages/api/` - all handlers export `async function handler(req, res)`
- **Page Routes**: `pages/*.js` - use `getServerSideProps` for auth checks
- **Styles**: Matching module CSS (e.g., `Billing.module.css` for `billing.js`)
- **Scripts**: `scripts/` for admin tasks (check-secrets, make-admin, list-users)
- **Config**: `config/banner.config.js` for shared design constants

### Code Patterns
- **Error Handling**: Log with `console.error('❌ ...')`, return proper HTTP status (400/401/500)
- **Success Logging**: Use emoji prefixes: `✅ Success`, `🔤 Fonts`, `📊 Metrics`, `🚀 Starting`
- **Image Response**: Set `Content-Type`, `Content-Disposition: inline`, `Content-Length`, cache headers
- **NextAuth Protection**: Wrap with `getServerSideProps` using `getSession(context)` for pages, `getToken()` for API routes
- **Design Extensions**: Add new themes to `DESIGN_THEMES` object with all required properties (titleColor, gradientColors, fontFamily, titleSize, websiteSize, positioning)

### Security Requirements
- **Pre-Commit**: ALWAYS run `npm run check-secrets` before committing (scans for .env, API keys, secrets)
- **.gitignore**: Never commit `.env*`, `*.db`, secrets files
- **API Keys**: Display only prefix (first 12 chars), store bcrypt hash
- **Passwords**: Hash with bcrypt (10 rounds) before storing
- **Webhooks**: Verify signatures (PayMongo: `paymongo-signature` header, PayPal: validate event structure)

## Design Theme System

### Adding New Themes

**Step-by-Step Example:**

1. **Add to DESIGN_THEMES object** (around line 144 in `bundled-font-overlay.js`):

```javascript
const DESIGN_THEMES = {
  // ... existing themes ...
  'myNewTheme': {
    name: 'My Custom Theme',
    titleColor: '#FFFFFF',              // White text
    websiteColor: '#FFD700',            // Gold accent
    gradientColors: [                    // Bottom overlay gradient
      'rgba(25,25,112,0.95)',           // Midnight blue (start)
      'rgba(25,25,112,0.98)'            // Darker blue (end)
    ],
    titleSize: 56,                       // Font size in pixels
    websiteSize: 28,                     // Website text size
    fontWeight: '700',                   // Bold (400-900)
    fontFamily: 'Bebas Neue',           // From available fonts
    positioning: 'bottom',               // 'bottom', 'center', 'top'
    
    // Optional properties:
    glowColor: 'rgba(255,215,0,0.6)',   // Text glow effect
    titleMaxWidth: 900,                  // Override default width
    websiteMaxWidth: 800,
    titleShadow: '2px 4px 12px rgba(0,0,0,0.8)',
    websiteShadow: '1px 2px 6px rgba(0,0,0,0.6)',
    titleBackground: 'rgba(0,0,0,0.3)', // Text background box
    isQuoteDesign: true                  // Enable val parameter for quotes
  }
};
```

2. **Test your theme**:
   - Visit `/quote-test?design=myNewTheme`
   - Or API: `/api/bundled-font-overlay?image=URL&design=myNewTheme&title=Test`

3. **For quote designs**, enable random quote generation:
```javascript
'myQuoteTheme': {
  // ... other properties ...
  isQuoteDesign: true,  // This enables val parameter
  positioning: 'center' // Center text for quotes
}
```

### Font Selection
Available fonts: `Bebas Neue`, `Anton`, `Impact`, `Oswald`, `Montserrat`, `League Spartan`, `Raleway`, `Roboto Condensed`, `Poppins`, `Playfair Display`, `Noto Sans`, `Inter`

### Quote Collections
- **InspirationTagalog**: 10 motivational quotes (array around line 629)
- **HugotTagalog**: 200+ relationship quotes (from `/api/hugot-quotes.js` integration)
- **babaeTagalog**: 200+ romantic quotes (from `tagalogQuotes` array)

## Key Integration Points

### Sharp/SVG Image Processing Pipeline

**How it works** (lines 2200-2600 in `bundled-font-overlay.js`):

1. **Image Source Priority**:
```javascript
// Priority: imageData (base64) > image (URL) > blank background
if (imageData) {
  // Decode base64: supports both data:image/jpeg;base64,* and raw base64
  const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
  imageBuffer = Buffer.from(base64Data, 'base64');
} else if (image) {
  imageBuffer = await fetchImageBuffer(image); // HTTPS/HTTP fetch
} else {
  // Generate blank gradient background (design-specific colors)
  imageBuffer = await sharp({ create: { width, height, channels: 3, background } })
    .jpeg().toBuffer();
}
```

2. **Text Wrapping Algorithm**:
```javascript
// Smart text wrapping - NO ellipsis, accepts all text
function wrapText(text, maxWidth, fontSize) {
  const avgCharWidth = fontSize * 0.55; // Character width estimation
  const maxCharsPerLine = Math.floor(maxWidth / avgCharWidth);
  
  // Split words, wrap to multiple lines
  for (const word of words) {
    if (testLine.length <= maxCharsPerLine) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  return lines; // Array of text lines
}
```

3. **SVG Overlay Generation**:
```javascript
// Create SVG with embedded base64 fonts (for serverless compatibility)
const svgOverlay = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @font-face {
        font-family: 'CustomFont';
        src: url('${fontBase64Cache.bebasNeue}') format('truetype');
      }
    </style>
    <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${gradientColors[0]}" />
      <stop offset="100%" style="stop-color:${gradientColors[1]}" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#grad)"/>
  <text x="${padding}" y="${titleStartY}" font-family="CustomFont" 
        font-size="${titleSize}" fill="${titleColor}">
    ${escapeXml(titleText)}
  </text>
</svg>`;

// Composite SVG onto image
const finalImage = await sharp(imageBuffer)
  .resize(width, height, { fit: 'cover', position: 'center' })
  .composite([{ input: Buffer.from(svgOverlay), top: 0, left: 0 }])
  .jpeg({ quality: 90 })
  .toBuffer();
```

### Protected API Routes

**Example: Adding authentication to an endpoint**:

```javascript
import { protectApiRoute } from '../../lib/apiKeyAuth';

export default async function handler(req, res) {
  // Validate API key (extracts from Authorization or x-api-key header)
  const { valid, key, error } = await protectApiRoute(req);
  
  if (!valid) {
    return res.status(401).json({ error: error || 'Invalid API key' });
  }
  
  console.log(`✅ Request from user: ${key.user.email}`);
  
  // Your API logic here
  // key.id - for usage logging
  // key.metadata - rate limits, allowed origins
}
```

**API Key Validation Flow** (from `lib/apiKeyAuth.js`):
```javascript
// 1. Extract key from headers
const apiKeyString = extractApiKey(req); // Bearer or x-api-key

// 2. Validate format
if (!apiKeyString.startsWith('sk_live_') || apiKeyString.length !== 32) {
  return { valid: false, error: 'Invalid format' };
}

// 3. Compare hash (constant-time via bcrypt)
const allKeys = await prisma.apiKey.findMany({ where: { revokedAt: null } });
for (const key of allKeys) {
  const isMatch = await bcrypt.compare(apiKeyString, key.keyHash);
  if (isMatch) return { valid: true, key };
}
```

### Webhook Signature Verification

**PayMongo Webhook** (lines 1-25 in `pages/api/webhooks/paymongo.js`):
```javascript
import crypto from 'crypto';

export default async function handler(req, res) {
  // 1. Get signature from header
  const signature = req.headers['paymongo-signature'];
  const payload = JSON.stringify(req.body);
  
  // 2. Calculate expected signature
  const expectedSig = crypto
    .createHmac('sha256', process.env.PAYMONGO_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  
  // 3. Verify match
  if (signature !== expectedSig) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // 4. Process event
  const event = req.body.data;
  switch (event.attributes.type) {
    case 'checkout_session.payment.paid':
      await handlePaymentPaid(event.attributes.data);
      break;
  }
}
```

### External Dependencies
- **Sharp**: v0.34.4 - image processing (requires Node.js runtime)
- **NextAuth**: v4.24.13 - authentication with Prisma adapter
- **Prisma**: v6.19.0 - ORM with SQLite/PostgreSQL support
- **bcryptjs**: API key & password hashing
- **nodemailer**: Email verification tokens

### Cross-Component Communication
- **Session Context**: `SessionProvider` in `_app.js` makes `useSession()` available everywhere
- **Prisma Client**: Import `@prisma/client` directly, instantiate once per module
- **Font System**: Fonts loaded once at module startup, shared across all requests via `fontBase64Cache`
- **Rate Limiting**: Shared `rateLimitStore` Map in `lib/apiKeyAuth.js` (stateless in serverless - needs Redis)
- **Template System**: User-created templates saved in DB, accessible via unique 8-char URL without authentication

## Template System Workflow

### Creating Templates (`/banner-template`)
1. **Authentication**: Requires NextAuth session (protected via `getServerSideProps`)
2. **Design Parameters**: User configures all banner settings (title, design, colors, dimensions)
3. **Preview with Watermark**: Calls `/api/v1/secure-overlay?watermark=PREVIEW` to test design
4. **Save Template**: POST to `/api/templates/create` generates unique URL (8-char hex: `crypto.randomBytes(4).toString('hex')`)
5. **Template Storage**: Parameters saved as JSON string in `Template.parameters` field
6. **Public Access**: Generated URL (`/api/templates/{uniqueUrl}`) can be used without authentication

### Using Templates
```javascript
// Template creation response
{
  "uniqueUrl": "a3f8c9d2",
  "apiUrl": "/api/templates/a3f8c9d2",
  "fullUrl": "http://localhost:3001/api/templates/a3f8c9d2"
}

// Access template endpoint (no auth required)
GET /api/templates/a3f8c9d2
// Returns: Generated banner image with saved parameters
// Can override: ?image=NEW_URL to change background

// Load template in editor
/banner-template?templateId=<template-id>
```

### V1 API Endpoints
- **`/api/v1/secure-overlay`**: Enhanced overlay endpoint with watermark support (used by template preview)
- **Template Creation**: `/api/templates/create` (POST, requires session)
- **Template Listing**: `/api/templates/list` (GET, requires session)
- **Template Public Access**: `/api/templates/{uniqueUrl}` (GET, no auth)

## Common Pitfalls

1. **Dev server must be stopped** before running Prisma migrations (lock conflict)
2. **Don't use `export const runtime = 'edge'`** for Sharp-based APIs (needs Node.js)
3. **Quote designs need `isQuoteDesign = true`** in theme config to enable val parameter
4. **Font loading fails silently** - check console logs for `✅ Loaded` or `❌ Failed` messages
5. **Webhooks fail locally** - use ngrok for testing PayMongo/PayPal callbacks
6. **Cache-Control matters** - quote APIs must use `no-cache` for random generation
7. **Binary imageData** - decode base64 before passing to Sharp, handle both `data:image/jpeg;base64,*` and raw base64

## Troubleshooting Guide

### Database Errors

**Error**: `Error: Can't reach database server`
```bash
# Check if dev server is running (conflicts with migrations)
# Solution: Stop server, then run migration
Ctrl+C  # Stop dev server
npx prisma migrate dev --name your_migration_name
npm run dev  # Restart server
```

**Error**: `P1001: Can't reach database at localhost:5432`
```bash
# PostgreSQL not running or DATABASE_URL incorrect
# Solution for dev: Use SQLite instead
# In prisma/schema.prisma, change:
provider = "sqlite"
# In .env.local:
DATABASE_URL="file:./dev.db"
```

**Error**: `@prisma/client did not initialize yet`
```bash
# Run after schema changes
npx prisma generate
```

### Font Loading Issues

**Error**: Fonts not rendering, text appears as boxes
```javascript
// Check console logs at startup for:
console.log('🔤 Font Loading Results:');
// Should show: ✅ Loaded for each font

// Common causes:
// 1. Font files missing in /fonts directory
// 2. fontBase64Cache not populated (check module load logs)
// 3. SVG @font-face src URL malformed

// Debug: Add to handler start
console.log('Font cache keys:', Object.keys(fontBase64Cache));
console.log('Bebas Neue loaded:', !!fontBase64Cache.bebasNeue);
```

**Error**: `Error: Input buffer contains unsupported image format`
```javascript
// Sharp can't decode the image
// Solution: Validate imageData/image before processing
if (imageData) {
  // Check if valid base64
  const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
  try {
    imageBuffer = Buffer.from(base64Data, 'base64');
  } catch (e) {
    return res.status(400).json({ error: 'Invalid base64 image data' });
  }
}
```

### Authentication Errors

**Error**: `Error: [next-auth][error][JWT_SESSION_ERROR]`
```bash
# NEXTAUTH_SECRET not set or too short
# Solution: Generate and add to .env.local
openssl rand -base64 32
# Add to .env.local:
NEXTAUTH_SECRET="<generated-secret>"
```

**Error**: `Error: There is no client with the given id`
```bash
# Google OAuth credentials invalid or missing
# Solution: Verify in .env.local
GOOGLE_CLIENT_ID="xxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="xxxxx"

# Check redirect URIs in Google Cloud Console match:
# http://localhost:3001/api/auth/callback/google (dev)
```

**Error**: `401 Unauthorized` on protected routes
```javascript
// API key validation failed
// Debug: Check key format and headers
console.log('API Key:', req.headers.authorization);
console.log('Expected format:', 'Bearer sk_live_<24chars>');

// Common issues:
// 1. Key revoked (check revokedAt in database)
// 2. Wrong prefix (must be sk_live_ not sk_test_)
// 3. Key hash mismatch (regenerate key)
```

### Payment Webhook Errors

**Error**: `Invalid PayMongo webhook signature`
```bash
# PAYMONGO_WEBHOOK_SECRET incorrect
# Solution: Get from PayMongo dashboard > Developers > Webhooks
# Add to .env.local:
PAYMONGO_WEBHOOK_SECRET="whsec_xxxxx"
```

**Error**: Webhooks not received locally
```bash
# Webhooks require public URL
# Solution: Use ngrok for local testing
ngrok http 3001
# Copy ngrok URL to webhook config:
# https://xxxxx.ngrok.io/api/webhooks/paymongo
```

### Deployment Issues (Vercel)

**Error**: Title/website not displaying on production
```javascript
// Parameter encoding issues in serverless
// Solution: Multiple decode attempts (already in code around line 2100)
let title = req.query.title || req.body.title || '';
try {
  title = decodeURIComponent(title);
} catch (e) {
  try {
    title = decodeURIComponent(decodeURIComponent(title)); // Double-encoded
  } catch (e2) {
    // Use as-is
  }
}
```

**Error**: `Runtime.ExitError: Runtime exited with error: signal: killed`
```javascript
// Function timeout or memory limit
// Solution: Optimize Sharp operations
// In vercel.json (if exists):
{
  "functions": {
    "pages/api/bundled-font-overlay.js": {
      "maxDuration": 60,
      "memory": 1024
    }
  }
}
```

**Error**: Fonts not loading on Vercel
```javascript
// Filesystem access fails in serverless
// Solution: Already solved via base64 font cache
// Verify at startup:
console.log('base64CacheReady:', Object.values(fontBase64Cache).filter(Boolean).length > 0);
// Should be > 0
```

### Image Processing Errors

**Error**: `SVG validation failed`
```javascript
// Invalid characters in title/website text
// Solution: XML escaping (already in code around line 2270)
function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
```

**Error**: Images appear blank or corrupted
```javascript
// Check image source priority
console.log('Image source:', { 
  hasImageData: !!imageData, 
  hasImageUrl: !!image,
  willUseBlank: !imageData && !image 
});

// Verify buffer before Sharp processing
if (!imageBuffer || !Buffer.isBuffer(imageBuffer)) {
  throw new Error('Invalid image buffer');
}
```

### Performance Issues

**Slow response times (>5 seconds)**
```javascript
// Profile with timestamps
const startTime = Date.now();
console.log(`⏱️ Image fetch: ${Date.now() - startTime}ms`);
// ... processing
console.log(`⏱️ Sharp resize: ${Date.now() - startTime}ms`);
console.log(`⏱️ SVG composite: ${Date.now() - startTime}ms`);
console.log(`⏱️ Total: ${Date.now() - startTime}ms`);

// Optimize:
// 1. Reduce image size (w=1080, h=1350 is default)
// 2. Use JPEG instead of PNG (smaller file size)
// 3. Cache remote images (not implemented - add CDN)
```

### Quick Diagnostics Commands

```bash
# Check database connection
npx prisma studio

# View all API keys
node scripts/list-users.js

# Test API endpoint
curl "http://localhost:3001/api/bundled-font-overlay?design=tech&title=Test"

# Check font files
ls -la fonts/

# Verify environment variables loaded
node -e "console.log(process.env.NEXTAUTH_SECRET ? 'Set' : 'Missing')"
```

## Documentation References
- `README.md` - API parameters, quote modes, binary data format
- `AUTH_SETUP.md` - NextAuth + Prisma setup, OAuth flow
- `PAYMENT_SYSTEM_SUMMARY.md` - PayMongo + PayPal integration, webhook setup
- `DESIGN_OVERVIEW.md` - UI design system, color palette, responsive breakpoints
- `COMMIT_SAFETY.md` - Pre-commit checklist, security scanning
- `DEPLOYMENT.md` - Vercel-specific fixes, parameter encoding issues
- `TEMPLATE_GENERATOR_GUIDE.md` - Template system setup, API endpoints, workflow
- `QUICK_START_DESIGN.md` - Design theme quick reference
