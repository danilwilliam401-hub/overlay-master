# 🔐 ENVIRONMENT VARIABLES - VERCEL DEPLOYMENT GUIDE

## ✅ Security Audit Results

**Status:** 🟢 **PRODUCTION READY**

Your codebase has been audited and is **secure for GitHub and Vercel deployment**:

- ✅ No hardcoded API keys or secrets in source code
- ✅ All credentials use `process.env.*` pattern
- ✅ Proper `.gitignore` excludes all sensitive files
- ✅ Only 1 public variable (correctly prefixed with `NEXT_PUBLIC_`)
- ✅ All payment/auth secrets remain server-side only

---

## 📋 Required Environment Variables for Vercel

### Step-by-Step Vercel Configuration

1. **Navigate to:** Vercel Dashboard → Your Project → Settings → Environment Variables
2. **Add each variable below** with the appropriate values
3. **Select environments:** Production, Preview, Development (or as specified)

---

### 🔑 CRITICAL VARIABLES (Required for Core Functionality)

#### Authentication & Security

| Variable | Value Example | Environments | Description |
|----------|---------------|--------------|-------------|
| `NEXTAUTH_URL` | `https://yourdomain.vercel.app` | Production, Preview | Your deployed app URL |
| `NEXTAUTH_SECRET` | `[generate with: openssl rand -base64 32]` | All | Min 32 chars, JWT encryption |
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db` | All | PostgreSQL connection string |

**How to get `NEXTAUTH_SECRET`:**
```bash
openssl rand -base64 32
```

---

#### Google OAuth (Sign-In Provider)

| Variable | Value Example | Environments | Description |
|----------|---------------|--------------|-------------|
| `GOOGLE_CLIENT_ID` | `xxxxx.apps.googleusercontent.com` | All | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-xxxxxxxxxxxxx` | All | OAuth client secret |

**Setup Guide:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URI: `https://yourdomain.vercel.app/api/auth/callback/google`
4. Copy Client ID and Secret

---

#### Payment Providers (Required for Billing)

##### PayMongo (Philippines)

| Variable | Value Example | Environments | Description |
|----------|---------------|--------------|-------------|
| `PAYMONGO_SECRET_KEY` | `sk_live_xxxxx` (prod) / `sk_test_xxxxx` (dev) | All | From PayMongo Dashboard |
| `PAYMONGO_PUBLIC_KEY` | `pk_live_xxxxx` (prod) / `pk_test_xxxxx` (dev) | All | Public API key |
| `PAYMONGO_WEBHOOK_SECRET` | `whsec_xxxxxxxxxxxxx` | All | Webhook signature verification |

**Setup Guide:**
1. Go to [PayMongo Dashboard](https://dashboard.paymongo.com/developers/api-keys)
2. Copy keys (use `sk_live_*` for production, `sk_test_*` for development)
3. Create webhook pointing to: `https://yourdomain.vercel.app/api/webhooks/paymongo`

##### PayPal (International)

| Variable | Value Example | Environments | Description |
|----------|---------------|--------------|-------------|
| `PAYPAL_CLIENT_ID` | `AxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxT` | All | From PayPal Developer Dashboard |
| `PAYPAL_CLIENT_SECRET` | `ExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxP` | All | Client secret |
| `PAYPAL_MODE` | `live` (prod) / `sandbox` (dev) | All | API environment mode |

**Setup Guide:**
1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Create REST API app
3. Copy Client ID and Secret
4. Use `sandbox` for testing, `live` for production

---

#### reCAPTCHA (Anti-Spam for Signup)

| Variable | Value Example | Environments | Description |
|----------|---------------|--------------|-------------|
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI` | All | **PUBLIC** - Safe to expose |
| `RECAPTCHA_SECRET_KEY` | `6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe` | All | **SERVER-ONLY** |

**Important:** The `NEXT_PUBLIC_` prefix makes the site key available to the browser (intentional for reCAPTCHA).

**Setup Guide:**
1. Go to [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Create reCAPTCHA v2 "I'm not a robot" Checkbox
3. Add your domain (e.g., `yourdomain.vercel.app`)
4. Copy Site Key and Secret Key

**Test Keys** (Google's default, always pass):
- Site Key: `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`
- Secret Key: `6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe`

---

### 📧 OPTIONAL VARIABLES (Email Verification)

**Note:** If not configured, the app will use Ethereal (test email service) and log preview URLs to console.

#### SMTP Configuration (For Production Email)

| Variable | Value Example | Environments | Description |
|----------|---------------|--------------|-------------|
| `SMTP_HOST` | `smtp.gmail.com` | All | SMTP server hostname |
| `SMTP_PORT` | `587` | All | SMTP port (587 for TLS) |
| `SMTP_SECURE` | `false` | All | Use SSL (false for TLS/STARTTLS) |
| `SMTP_USER` | `your-email@gmail.com` | All | SMTP username |
| `SMTP_PASSWORD` | `xxxx xxxx xxxx xxxx` | All | SMTP password or App Password |
| `SMTP_FROM` | `"Banner API" <noreply@yourdomain.com>` | All | Email sender display |

**Gmail Setup (Recommended for Easy Testing):**
1. Enable 2FA on your Google account
2. Generate App Password: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Use the 16-character app password as `SMTP_PASSWORD`

**Alternative Providers:**
- **SendGrid:** `smtp.sendgrid.net` (Port 587)
- **Mailgun:** `smtp.mailgun.org` (Port 587)
- **AWS SES:** `email-smtp.us-east-1.amazonaws.com` (Port 587)

---

### 🚀 FUTURE ENHANCEMENTS (Not Currently Used)

These variables are referenced in documentation but not actively used:

| Variable | Description | When to Add |
|----------|-------------|-------------|
| `INTERNAL_API_SECRET` | Cross-service API authentication | When implementing usage logging |
| `UPSTASH_URL` | Redis connection for rate limiting | When upgrading from in-memory to Redis |
| `UPSTASH_TOKEN` | Redis auth token | Same as above |

---

## 🛡️ Security Classification

### ✅ Safe to Expose (Public Variables)

Only **1 variable** is safe for browser exposure:
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` - Intentionally public for client-side reCAPTCHA

### 🔒 Server-Only (Private Variables)

**All other variables MUST remain server-side:**
- All `*_SECRET`, `*_SECRET_KEY` variables
- All `*_CLIENT_SECRET` variables
- All `PAYMONGO_*` variables (except public key is server-only too)
- All `PAYPAL_*` variables
- All `SMTP_*` variables
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_SECRET`

**How Next.js Protects Server Variables:**
- Variables **without** `NEXT_PUBLIC_` prefix are **never** sent to the browser
- Only available in server-side code:
  - API routes (`pages/api/*`)
  - `getServerSideProps`
  - `getStaticProps`
  - Serverless functions

---

## 📝 Quick Copy-Paste Checklist for Vercel

Use this checklist when adding variables in Vercel Dashboard:

```plaintext
☐ NEXTAUTH_URL
☐ NEXTAUTH_SECRET
☐ DATABASE_URL
☐ GOOGLE_CLIENT_ID
☐ GOOGLE_CLIENT_SECRET
☐ PAYMONGO_SECRET_KEY
☐ PAYMONGO_PUBLIC_KEY
☐ PAYMONGO_WEBHOOK_SECRET
☐ PAYPAL_CLIENT_ID
☐ PAYPAL_CLIENT_SECRET
☐ PAYPAL_MODE
☐ NEXT_PUBLIC_RECAPTCHA_SITE_KEY
☐ RECAPTCHA_SECRET_KEY

Optional (Email):
☐ SMTP_HOST
☐ SMTP_PORT
☐ SMTP_SECURE
☐ SMTP_USER
☐ SMTP_PASSWORD
☐ SMTP_FROM
```

---

## 🔍 Verification After Deployment

### 1. Test Environment Variables Loaded

```javascript
// In browser console (should ONLY see public variable)
console.log(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY); // ✅ Should show value

// In API route or server component (should work)
console.log(process.env.NEXTAUTH_SECRET); // ✅ Should show value
console.log(process.env.PAYMONGO_SECRET_KEY); // ✅ Should show value
```

### 2. Test Authentication Flow

- ✅ Google Sign-In works
- ✅ Email/Password sign-up works
- ✅ reCAPTCHA appears and validates

### 3. Test Payment Flow (if applicable)

- ✅ PayMongo checkout session creates
- ✅ PayPal order creates
- ✅ Webhooks receive and verify signatures

### 4. Check Server Logs

In Vercel Dashboard → Deployments → [Your Deployment] → Function Logs:

- ❌ Should NOT see "Missing environment variable" errors
- ✅ Should see successful database connections
- ✅ Should see successful API authentications

---

## 🚨 Common Deployment Issues & Fixes

### Issue: "Invalid NEXTAUTH_SECRET"

**Solution:** Regenerate and ensure it's at least 32 characters:
```bash
openssl rand -base64 32
```

### Issue: "Database connection failed"

**Solution:**
- Ensure `DATABASE_URL` uses PostgreSQL (not SQLite) for production
- Format: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public`
- Test connection with Prisma Studio locally first

### Issue: "Google OAuth redirect URI mismatch"

**Solution:**
- In Google Cloud Console, add exact redirect URI:
  - Production: `https://yourdomain.vercel.app/api/auth/callback/google`
  - Preview: `https://your-project-git-branch.vercel.app/api/auth/callback/google`

### Issue: "PayMongo webhook signature invalid"

**Solution:**
- Update webhook URL in PayMongo Dashboard to match deployed URL
- Ensure `PAYMONGO_WEBHOOK_SECRET` matches the secret shown in dashboard

### Issue: "Environment variable not found"

**Solution:**
- Verify variable name is spelled exactly as shown in code
- Check it's enabled for the correct environment (Production/Preview/Development)
- Redeploy after adding new variables

---

## 📚 Additional Resources

- [Next.js Environment Variables Docs](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel Environment Variables Guide](https://vercel.com/docs/concepts/projects/environment-variables)
- [NextAuth.js Configuration](https://next-auth.js.org/configuration/options)
- [Prisma Connection Strings](https://www.prisma.io/docs/reference/database-reference/connection-urls)

---

## ✅ Final Checklist

Before pushing to GitHub and deploying to Vercel:

- ✅ `.env.local` is NOT committed (check with `git status`)
- ✅ `.gitignore` includes `.env*` exclusions
- ✅ All secrets use `process.env.*` pattern in code
- ✅ `.env.example` is committed (as reference for team)
- ✅ All Vercel environment variables are configured
- ✅ `NEXT_PUBLIC_*` prefix only used for truly public values

**Your project is GitHub-safe and Vercel-ready! 🚀**
