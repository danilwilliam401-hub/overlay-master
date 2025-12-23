# Secure Overlay API Guide

## Endpoint
```
/api/v1/secure-overlay
```

## Authentication
**Required:** API Key in Authorization header

```
Authorization: Bearer sk_live_xxxxxxxxxxxxxxxxxxxx
```

## Supported Methods
- `GET` - Parameters in query string
- `POST` - Parameters in JSON body

---

## Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `title` | string | Yes | Main text for overlay | "AMAZING SALE" |
| `website` | string | No | Website/brand text | "SHOP.COM" |
| `design` | string | No | Design theme (default: "default") | "bebas", "tech", "entertainment" |
| `image` | string | No | Image URL | "https://picsum.photos/1080/1350" |
| `imageData` | string | No | Base64 image data | "data:image/jpeg;base64,..." |
| `w` | integer | No | Width in pixels (default: 1080) | 1080 |
| `h` | integer | No | Height in pixels (default: 1350) | 1350 |
| `hl` | string | No | Highlight colors (comma-separated) | "FFD700,FF8C00,00FFFF" |
| `wc` | string | No | Website color override | "FF0000" or "red" |
| `keywords` | string | No | Keywords to highlight (comma-separated) | "SALE,NEW,AMAZING" |
| `titleColor` or `tc` | string | No | Override title text color | "FFFFFF" or "white" |
| `titleBgColor` or `tbc` | string | No | Title background color | "000000" or "black" |
| `titleBgGradient` or `tbg` | string | No | Title background gradient (comma-separated) | "FF0000,0000FF" |

---

## Design Themes

- **default** - Clean white text on dark gradient
- **bebas** - Bold Anton font with highlight support
- **tech** - Cyan text with tech aesthetic
- **entertainment** - Purple gradient with Impact font

---

## HTTP Module Configuration

### Make.com / Integromat

```
Module: HTTP - Make a request
URL: https://your-domain.vercel.app/api/v1/secure-overlay
Method: GET
Headers:
  - Name: Authorization
    Value: Bearer sk_live_xxxxxxxxxxxxxxxxxxxx
Query String:
  - title: AMAZING SALE
  - website: SHOP.COM
  - design: bebas
  - w: 1080
  - h: 1350
  - hl: FFD700,FF8C00
  - wc: FF0000
  - image: https://picsum.photos/1080/1350
```

### Zapier Webhooks

```
Action: Webhooks by Zapier - GET
URL: https://your-domain.vercel.app/api/v1/secure-overlay?title=AMAZING%20SALE&website=SHOP.COM&design=bebas&w=1080&h=1350&hl=FFD700,FF8C00&wc=FF0000&image=https://picsum.photos/1080/1350
Headers:
  Authorization: Bearer sk_live_xxxxxxxxxxxxxxxxxxxx
```

### n8n

```
Node: HTTP Request
Method: GET
URL: https://your-domain.vercel.app/api/v1/secure-overlay
Authentication: Generic Credential Type
  - Credential Type: Header Auth
  - Name: Authorization
  - Value: Bearer sk_live_xxxxxxxxxxxxxxxxxxxx
Query Parameters:
  title=AMAZING SALE
  website=SHOP.COM
  design=bebas
  w=1080
  h=1350
  hl=FFD700,FF8C00
  wc=FF0000
  image=https://picsum.photos/1080/1350
Response Format: File
```

---

## Example Requests

### GET Request (cURL)
```bash
curl -X GET "https://your-domain.vercel.app/api/v1/secure-overlay?title=AMAZING%20SALE&website=SHOP.COM&design=bebas&w=1080&h=1350&hl=FFD700,FF8C00&wc=FF0000&image=https://picsum.photos/1080/1350" \
  -H "Authorization: Bearer sk_live_xxxxxxxxxxxxxxxxxxxx" \
  --output overlay.jpg
```

### POST Request (cURL)
```bash
curl -X POST "https://your-domain.vercel.app/api/v1/secure-overlay" \
  -H "Authorization: Bearer sk_live_xxxxxxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "AMAZING SALE",
    "website": "SHOP.COM",
    "design": "bebas",
    "w": 1080,
    "h": 1350,
    "hl": "FFD700,FF8C00,00FFFF",
    "wc": "FF0000",
    "image": "https://picsum.photos/1080/1350"
  }' \
  --output overlay.jpg
```

### JavaScript (Fetch)
```javascript
const response = await fetch('https://your-domain.vercel.app/api/v1/secure-overlay', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sk_live_xxxxxxxxxxxxxxxxxxxx',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'AMAZING SALE',
    website: 'SHOP.COM',
    design: 'bebas',
    w: 1080,
    h: 1350,
    hl: 'FFD700,FF8C00,00FFFF',
    wc: 'FF0000',
    image: 'https://picsum.photos/1080/1350'
  })
});

const blob = await response.blob();
const imageUrl = URL.createObjectURL(blob);
```

### Python (Requests)
```python
import requests

url = "https://your-domain.vercel.app/api/v1/secure-overlay"
headers = {
    "Authorization": "Bearer sk_live_xxxxxxxxxxxxxxxxxxxx",
    "Content-Type": "application/json"
}
data = {
    "title": "AMAZING SALE",
    "website": "SHOP.COM",
    "design": "bebas",
    "w": 1080,
    "h": 1350,
    "hl": "FFD700,FF8C00,00FFFF",
    "wc": "FF0000",
    "image": "https://picsum.photos/1080/1350"
}

response = requests.post(url, headers=headers, json=data)

with open('overlay.jpg', 'wb') as f:
    f.write(response.content)
```

---

## Response Headers

- `Content-Type: image/jpeg`
- `Content-Disposition: inline; filename="bebas-overlay-1234567890-abc123.jpg"`
- `Content-Length: 123456`
- `X-API-Key-Used: sk_live_abcd...` (first 12 chars of your key)
- `X-Design-Theme: Bebas Style`
- `X-Processing-Time: 1234ms`

---

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing API key",
  "hint": "Include API key in Authorization header: Bearer sk_live_xxxxxxxxxxxxxxxxxxxx"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "Failed to generate overlay",
  "details": "Error message here"
}
```

---

## Rate Limiting

- Default: 100 requests per hour per API key
- Rate limit info returned in response headers:
  - `X-RateLimit-Limit: 100`
  - `X-RateLimit-Remaining: 95`
  - `X-RateLimit-Reset: 1640000000`

---

## Getting Your API Key

1. Sign in to your account at `/dashboard`
2. Navigate to "API Keys" section
3. Click "Create New API Key"
4. Copy the key (starts with `sk_live_` or `sk_test_`)
5. **Important:** Store securely - key is only shown once!

---

## Best Practices

1. **Always use HTTPS** - Never send API keys over HTTP
2. **Keep keys secret** - Don't commit to version control
3. **Use environment variables** - Store in `.env` files
4. **Rotate keys regularly** - Generate new keys periodically
5. **Monitor usage** - Check dashboard for usage statistics
6. **Handle errors** - Implement retry logic with exponential backoff

---

## Support

For issues or questions:
- Check logs in your dashboard
- Review error messages in response
- Contact support with your API key prefix (e.g., `sk_live_abcd...`)
