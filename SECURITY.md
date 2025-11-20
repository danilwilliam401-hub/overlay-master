# 🔒 Security Guide - Protecting Your API Keys and Secrets

## ✅ Current Security Status

Your repository is now properly configured to protect sensitive information!

### Protected Files
- ✅ `.env` - Ignored by Git
- ✅ `.env.local` - Ignored by Git
- ✅ All `.env*.local` files - Ignored by Git
- ✅ Database files (`*.db`, `*.db-journal`) - Ignored by Git
- ✅ Files with "secret", "key", "credentials" - Ignored by Git

### Template Files (Safe to Commit)
- ✅ `.env.payment-template` - Safe (contains placeholders only)
- ✅ `.env.example` - Safe (if you create one)

---

## 🛡️ What's Protected

### 1. Environment Variables
```
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

### 2. Authentication Secrets
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

### 3. Payment Provider Keys
- `PAYMONGO_SECRET_KEY`
- `PAYMONGO_PUBLIC_KEY`
- `PAYMONGO_WEBHOOK_SECRET`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`

### 4. Database Files
- `prisma/dev.db`
- `*.db-journal`
- Any SQLite database files

---

## 📋 Before Every Commit - Checklist

### Step 1: Check Status
```bash
git status
```

**Look for:**
- ❌ `.env` files
- ❌ `.env.local` files
- ❌ `*.db` files
- ❌ Files containing "secret" or "key"

### Step 2: Verify Gitignore
```bash
git check-ignore .env
git check-ignore .env.local
git check-ignore prisma/dev.db
```

**Should output:** File paths (means they're ignored ✅)

### Step 3: Check Staged Files
```bash
git diff --cached --name-only
```

**Make sure NO sensitive files appear!**

---

## 🚨 Emergency: If You Accidentally Committed Secrets

### If NOT Yet Pushed to Remote:

```bash
# Undo last commit, keep changes
git reset --soft HEAD~1

# Remove sensitive file from staging
git restore --staged .env

# Commit again without sensitive files
git commit -m "Your commit message"
```

### If ALREADY Pushed to Remote:

**⚠️ YOU MUST:**

1. **Immediately revoke/regenerate ALL exposed keys:**
   - Google OAuth credentials
   - PayMongo API keys
   - PayPal API keys
   - NextAuth secret

2. **Remove from Git history:**
```bash
# Remove file from all commits
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (careful!)
git push origin --force --all
```

3. **Better Alternative - Use BFG Repo Cleaner:**
```bash
# Download BFG from https://rclone.github.io/bfg-repo-cleaner/
java -jar bfg.jar --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin --force --all
```

---

## ✅ Safe Practices

### 1. Use Template Files
Create `.env.example` or `.env.template` with placeholders:
```env
# Example - Safe to commit
NEXTAUTH_SECRET=your_secret_here_replace_me
GOOGLE_CLIENT_ID=your_client_id_here
PAYMONGO_SECRET_KEY=sk_test_xxxxxxxxxxxxx
```

### 2. Environment-Specific Files
```
.env.local          # Local development (never commit)
.env.development    # Development config (commit if no secrets)
.env.production     # Production config (never commit)
```

### 3. Use Secrets Management
**For Production:**
- Vercel: Use Environment Variables in dashboard
- GitHub Actions: Use encrypted secrets
- Docker: Use Docker secrets
- AWS: Use AWS Secrets Manager
- Azure: Use Azure Key Vault

---

## 🔍 Verify Your Protection

### Test 1: Check Gitignore
```bash
# Should return the filename (means ignored)
git check-ignore -v .env
git check-ignore -v .env.local
```

### Test 2: Try to Add
```bash
# Should say "ignored by .gitignore"
git add .env
```

### Test 3: Check Tracked Files
```bash
# Should NOT list any .env files
git ls-files | Select-String ".env"
```

### Test 4: Search History
```bash
# Should return nothing
git log --all --full-history -- .env
```

---

## 📦 Safe Files to Commit

### Documentation ✅
- `README.md`
- `BILLING_SETUP.md`
- `AUTH_SETUP.md`
- `SECURITY.md` (this file)

### Templates ✅
- `.env.payment-template`
- `.env.example`

### Configuration ✅
- `next.config.js`
- `package.json`
- `.gitignore`
- `vercel.json`

### Code ✅
- All `.js` files
- All `.css` files
- All `.jsx`, `.tsx` files

### Schema ✅
- `prisma/schema.prisma` (no secrets here)

---

## 🚫 NEVER Commit

### Credentials ❌
- API keys
- Secret keys
- OAuth client secrets
- Webhook secrets
- Database passwords
- Private keys
- Tokens
- Session secrets

### Data ❌
- Database files (`.db`)
- User data
- Production data dumps
- Backup files with sensitive data

### Build Artifacts ❌
- `node_modules/`
- `.next/`
- `build/`
- `dist/`

---

## 🔐 Additional Security Tips

### 1. Use Different Keys Per Environment
```
Development:  sk_test_xxxxx
Production:   sk_live_xxxxx
```

### 2. Rotate Keys Regularly
- Every 90 days minimum
- After team member leaves
- After suspected breach

### 3. Limit Key Permissions
- Use read-only keys where possible
- Restrict IP addresses if supported
- Enable webhook signature verification

### 4. Monitor Key Usage
- Check provider dashboards regularly
- Set up alerts for unusual activity
- Review API logs weekly

### 5. Use Environment Variable Validation
```javascript
// In next.config.js or a startup script
const requiredEnvVars = [
  'NEXTAUTH_SECRET',
  'PAYMONGO_SECRET_KEY',
  'PAYPAL_CLIENT_ID'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});
```

---

## 📱 For Team Members

### When Joining Project:

1. **Get your own API keys** (never share!)
2. **Copy `.env.payment-template` to `.env.local`**
3. **Fill in your own credentials**
4. **Verify `.env.local` is not tracked:**
   ```bash
   git status  # Should not show .env.local
   ```

### When Leaving Project:

1. **Delete local `.env` files**
2. **Revoke any personal API keys**
3. **Inform team to rotate shared keys**

---

## 🎯 Quick Verification Checklist

Before every push:

- [ ] No `.env` files in `git status`
- [ ] No database files in `git status`
- [ ] No files with "secret" or "key" in name
- [ ] Checked `git diff` for accidental inclusions
- [ ] Verified `.gitignore` is up to date
- [ ] All credentials are in `.env.local` only

---

## 📞 What to Do If Breached

1. **Immediately revoke all exposed credentials**
2. **Generate new keys/secrets**
3. **Update `.env.local` with new credentials**
4. **Deploy new secrets to production**
5. **Check provider dashboards for unauthorized usage**
6. **Review recent transactions/API calls**
7. **File incident report if required**
8. **Document what happened and how to prevent**

---

## ✅ Your Repository is Secure!

Current status: 🟢 **PROTECTED**

- ✅ `.gitignore` configured correctly
- ✅ No `.env` files tracked in Git
- ✅ Template files safe to commit
- ✅ Database files ignored
- ✅ Extra patterns for API keys protected

**Keep it secure by following this guide!** 🔒
