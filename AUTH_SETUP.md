# Overlay Banner API - Authentication & API Key Management System

Complete login/registration + API key management system for the Overlay Banner API with Google OAuth authentication, secure API key handling, usage tracking, and a comprehensive dashboard.

## 🚀 Features

- **Google OAuth Authentication** via NextAuth.js
- **API Key Management** - Create, list, revoke API keys with secure hashing (bcrypt)
- **Rate Limiting** - Per-key request limits (in-memory with Redis upgrade path)
- **Usage Tracking** - Log every API request with latency, status, and metadata
- **Dashboard** - SSR page with user profile, API keys, usage metrics, and code examples
- **Secure by Default** - Constant-time comparisons, revocation checks, proper HTTP status codes

---

## 📋 Prerequisites

- Node.js 16+ 
- Next.js 14.2 (Pages Router)
- PostgreSQL or SQLite database
- Google Cloud Platform account (for OAuth credentials)

---

## 🔧 Installation & Setup

### 1. Install Dependencies

```bash
npm install @prisma/client prisma bcryptjs next-auth @next-auth/prisma-adapter
```

### 2. Configure Environment Variables

Create `.env.local` in your project root:

```env
# Database (SQLite for dev, PostgreSQL for production)
DATABASE_URL="file:./dev.db"
# For PostgreSQL:
# DATABASE_URL="postgresql://user:password@localhost:5432/overlay_banner_db?schema=public"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here-generate-with-openssl-rand-base64-32"

# Google OAuth Credentials
GOOGLE_CLIENT_ID="your-google-client-id-here.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret-here"

# Optional: Internal API secret for usage logging
INTERNAL_API_SECRET="your-internal-secret"
```

### 3. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (dev)
     - `https://yourdomain.com/api/auth/callback/google` (production)
5. Copy Client ID and Client Secret to `.env.local`

### 4. Initialize Prisma Database

```bash
# Generate Prisma Client
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name init

# Optional: Open Prisma Studio to view data
npx prisma studio
```

### 5. Update _app.js to Include SessionProvider

Create or update `pages/_app.js`:

```javascript
import { SessionProvider } from 'next-auth/react';
import '../styles/globals.css';

export default function App({ 
  Component, 
  pageProps: { session, ...pageProps } 
}) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}
```

### 6. Start Development Server

```bash
npm run dev
```

Visit:
- **Dashboard**: http://localhost:3000/dashboard
- **Sign In**: http://localhost:3000/api/auth/signin
- **API**: http://localhost:3000/api/bundled-font-overlay

---

## 📚 API Documentation

### Authentication

All API requests to `/api/bundled-font-overlay` require an API key in one of these headers:

```
Authorization: Bearer your_api_key_here
```

or

```
x-api-key: your_api_key_here
```

### Endpoints

#### Create API Key
```http
POST /api/keys/create
Content-Type: application/json

{
  "name": "Production Key",
  "limitPerMinute": 60,
  "allowedOrigins": ["example.com"]
}
```

**Response:**
```json
{
  "status": "success",
  "apiKey": "your_generated_api_key_here",
  "prefix": "key_prefix",
  "id": "key_id_here",
  "name": "Production Key",
  "warning": "⚠️ Save this API key now. You will not be able to see it again!"
}
```

#### List API Keys
```http
GET /api/keys/list?includeRevoked=false
```

**Response:**
```json
{
  "status": "success",
  "keys": [
    {
      "id": "key_id_here",
      "prefix": "key_prefix",
      "name": "Production Key",
      "createdAt": "2025-11-18T00:00:00.000Z",
      "lastUsedAt": "2025-11-18T10:30:00.000Z",
      "revokedAt": null,
      "metadata": { "limitPerMinute": 60 },
      "usageCount": 1250,
      "usageLast24h": 45,
      "isActive": true
    }
  ]
}
```

#### Revoke API Key
```http
POST /api/keys/revoke
Content-Type: application/json

{
  "keyId": "clx1234567890"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "API key revoked successfully",
  "keyId": "clx1234567890",
  "revokedAt": "2025-11-18T12:00:00.000Z"
}
```

#### Use Overlay API
```http
POST /api/bundled-font-overlay
Authorization: Bearer your_api_key_here
Content-Type: multipart/form-data

image: <file>
title: "Sale Banner"
theme: "antonBlack"
website: "MyBrand.com"
```

**Response Headers:**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1700318400000
Content-Type: image/jpeg
```

**Response:** Image buffer (JPEG or PNG)

---

## 💻 Usage Examples

### Node.js / JavaScript
```javascript
const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

const form = new FormData();
form.append('image', fs.createReadStream('./hero.jpg'));
form.append('title', 'Black Friday Sale');
form.append('theme', 'antonBlack');
form.append('website', 'MyStore.com');

const response = await fetch('https://yourdomain.com/api/bundled-font-overlay', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.API_KEY}`
  },
  body: form
});

if (response.ok) {
  const imageBuffer = await response.buffer();
  fs.writeFileSync('./banner.jpg', imageBuffer);
  console.log('✅ Banner generated!');
} else {
  const error = await response.json();
  console.error('❌ Error:', error);
}
```

### Python
```python
import requests
import os

with open('hero.jpg', 'rb') as f:
    files = {'image': f}
    data = {
        'title': 'Black Friday Sale',
        'theme': 'antonBlack',
        'website': 'MyStore.com'
    }
    headers = {
        'Authorization': f'Bearer {os.environ["API_KEY"]}'
    }
    
    response = requests.post(
        'https://yourdomain.com/api/bundled-font-overlay',
        files=files,
        data=data,
        headers=headers
    )
    
    if response.status_code == 200:
        with open('banner.jpg', 'wb') as output:
            output.write(response.content)
        print('✅ Banner generated!')
    else:
        print(f'❌ Error: {response.json()}')
```

### cURL
```bash
curl -X POST \
  https://yourdomain.com/api/bundled-font-overlay \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \
  -F "image=@hero.jpg" \
  -F "title=Black Friday Sale" \
  -F "theme=antonBlack" \
  -F "website=MyStore.com" \
  -o banner.jpg
```

---

## 🔒 Security Best Practices

### API Key Storage
- **Client-side**: Store in environment variables, never hardcode
- **Server-side**: Use secret management services (AWS Secrets Manager, etc.)
- **Never commit** API keys to version control

### Rate Limiting
- Default: 60 requests/minute per key
- Configurable per key via dashboard
- Returns `429 Too Many Requests` when exceeded
- **Production**: Migrate to Redis/Upstash for distributed rate limiting

```javascript
// Example Redis-based rate limiting (Upstash)
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_URL,
  token: process.env.UPSTASH_TOKEN
});

async function checkRateLimit(apiKeyId, limit) {
  const key = `ratelimit:${apiKeyId}`;
  const count = await redis.incr(key);
  
  if (count === 1) {
    await redis.expire(key, 60); // 60 seconds
  }
  
  const ttl = await redis.ttl(key);
  
  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    resetAt: Date.now() + (ttl * 1000)
  };
}
```

### Revocation
- Revoked keys immediately return `401 Unauthorized`
- Soft delete (keys remain in database for audit)
- Check `revokedAt` field before validating hash

### Hashing
- Uses bcrypt with 10 rounds
- Constant-time comparison via `bcrypt.compare()`
- Only store hash, never plain key

---

## 📊 Database Schema

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  image         String?
  createdAt     DateTime @default(now())
  apiKeys       ApiKey[]
  banners       Banner[]
}

model ApiKey {
  id            String    @id @default(cuid())
  userId        String
  keyHash       String    @unique
  prefix        String
  name          String
  createdAt     DateTime  @default(now())
  revokedAt     DateTime?
  lastUsedAt    DateTime?
  metadata      String?
  user          User      @relation(fields: [userId], references: [id])
  usage         ApiUsage[]
}

model ApiUsage {
  id            String   @id @default(cuid())
  apiKeyId      String
  endpoint      String
  status        Int
  latencyMs     Int?
  bytesOut      Int?
  createdAt     DateTime @default(now())
  apiKey        ApiKey   @relation(fields: [apiKeyId], references: [id])
}

model Banner {
  id            String   @id @default(cuid())
  userId        String
  theme         String
  title         String
  createdAt     DateTime @default(now())
  user          User     @relation(fields: [userId], references: [id])
}
```

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
vercel env add NEXTAUTH_SECRET
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add DATABASE_URL
```

### Environment Variables (Production)
```env
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="production-secret-32-chars-min"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

### Database Migration (Production)
```bash
# Generate migration
npx prisma migrate deploy

# Or use Prisma Studio
npx prisma studio
```

---

## 🐛 Troubleshooting

### "Invalid API key" Error
- Verify key format is correct (generated from dashboard)
- Check if key is revoked in dashboard
- Ensure header is `Authorization: Bearer <key>` or `x-api-key: <key>`

### Rate Limit Issues
- Check key's `limitPerMinute` in dashboard
- Implement exponential backoff in client
- Consider upgrading to higher limit

### Database Connection Issues
- Verify `DATABASE_URL` in `.env.local`
- Run `npx prisma migrate deploy`
- Check database server is running

### Google OAuth Issues
- Verify redirect URIs match exactly
- Check client ID/secret are correct
- Ensure Google+ API is enabled

---

## 📈 Monitoring & Analytics

### Usage Dashboard
- View in `/dashboard` after signing in
- See last 7 days of usage
- Daily request counts and success rates
- Per-key usage metrics

### Logging
- All requests logged to `ApiUsage` table
- Includes: timestamp, status, latency, bytes
- Query with Prisma Studio or SQL

### Metrics to Track
- Total requests per day
- Error rate (4xx/5xx responses)
- Average latency
- Top API keys by usage
- Bandwidth consumption

---

## 🛠️ Development Tips

### Testing Locally
```bash
# Create test API key via dashboard
# Use key in Postman/cURL to test API
curl -X POST http://localhost:3000/api/bundled-font-overlay \
  -H "Authorization: Bearer your_api_key_here" \
  -F "title=Test" \
  -F "theme=antonBlack"
```

### Debugging
```javascript
// Enable NextAuth debug mode in .env.local
NEXTAUTH_DEBUG=true

// Check API logs in terminal
console.log('Auth result:', { valid, key, error, rateLimit });
```

---

## 📝 License

This project extends the Overlay Banner API with authentication and API key management.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📧 Support

For issues or questions:
- Open an issue on GitHub
- Check the troubleshooting section above
- Review Next Auth.js documentation: https://next-auth.js.org

---

## ⚡ Next Steps

1. ✅ Set up Google OAuth credentials
2. ✅ Configure environment variables
3. ✅ Run database migration
4. ✅ Sign in to create your first API key
5. ✅ Test the API with your key
6. 🚀 Deploy to production

**Enjoy your secure, authenticated Overlay Banner API!** 🎨
