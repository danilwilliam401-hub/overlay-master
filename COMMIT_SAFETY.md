# 🚀 Safe Commit Guide - Quick Reference

## Before EVERY Commit

### 1️⃣ Run Security Check
```bash
npm run check-secrets
```
This will scan for:
- ✅ Forbidden files (.env, .db)
- ✅ API keys and secrets in code
- ✅ Database files
- ✅ Proper .gitignore setup

### 2️⃣ Check Git Status
```bash
git status
```

**Red Flags** ❌ - DO NOT commit if you see:
- `.env`
- `.env.local`
- `.env.production`
- `dev.db`
- `*.db`
- Any file with "secret" or "key" in the name

### 3️⃣ Review Changes
```bash
git diff
```

**Look for** ❌:
- API keys (starts with `sk_`, `pk_`)
- Secrets (long random strings)
- Passwords
- OAuth client secrets
- Webhook secrets

### 4️⃣ Safe to Commit ✅
```bash
git add .
git commit -m "Your commit message"
git push
```

---

## Quick Commands

### Check if .env is Ignored
```bash
# Should return the filename (good!)
git check-ignore .env
```

### See What Will Be Committed
```bash
git diff --cached --name-only
```

### Remove Accidentally Staged .env
```bash
git restore --staged .env
# or
git reset HEAD .env
```

### Verify No Secrets in History
```bash
git log --all --full-history -- .env
# Should return nothing
```

---

## Automated Protection

### Run Before Every Commit
```bash
npm run check-secrets
```

**What it checks:**
- 🔍 Scans for API keys
- 🔍 Looks for forbidden files
- 🔍 Checks .env protection
- 🔍 Finds database files
- 🔍 Detects secret patterns

**Exit codes:**
- `0` = Safe to commit ✅
- `1` = Blocked (secrets found) ❌

---

## Common Mistakes & Fixes

### ❌ "I added .env by mistake"
```bash
# Remove from staging
git restore --staged .env

# Verify it's not staged
git status
```

### ❌ "I committed but didn't push yet"
```bash
# Undo last commit, keep changes
git reset --soft HEAD~1

# Remove .env from staging
git restore --staged .env

# Commit again (without .env)
git commit -m "Your message"
```

### ❌ "I already pushed with secrets!"
**IMMEDIATE ACTIONS:**
1. **Revoke ALL exposed keys** in provider dashboards
2. **Generate new keys**
3. **Update .env.local** with new keys
4. **Clean Git history** (see SECURITY.md)

---

## What's Safe to Commit ✅

### Always Safe
- `*.js` files (except if they contain secrets)
- `*.css` files
- `*.md` documentation files
- `package.json` (without secrets)
- `next.config.js` (without secrets)
- `.gitignore`
- `prisma/schema.prisma` (schema only)

### Templates (Safe)
- `.env.example`
- `.env.payment-template`
- Any file ending in `.template`

### Never Commit ❌
- `.env` or `.env.local`
- `*.db` database files
- `node_modules/`
- `.next/` build files
- Files with actual API keys

---

## Protection Layers

### Layer 1: .gitignore
- Prevents files from being tracked
- Already configured ✅

### Layer 2: check-secrets script
- Scans before commit
- Run with: `npm run check-secrets`

### Layer 3: Manual review
- Always check `git status`
- Review `git diff` before commit

### Layer 4: Pre-commit hook (Optional)
```bash
# Create Git hook
echo "#!/bin/sh" > .git/hooks/pre-commit
echo "npm run check-secrets" >> .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

---

## Emergency Contacts

### If Secrets Exposed:

**PayMongo:**
- Dashboard: https://dashboard.paymongo.com/
- Revoke keys: Developers > API Keys

**PayPal:**
- Dashboard: https://developer.paypal.com/
- Reset credentials: My Apps & Credentials

**Google OAuth:**
- Console: https://console.cloud.google.com/
- Reset secrets: APIs & Services > Credentials

**NextAuth:**
- Generate new secret: `openssl rand -base64 32`

---

## Daily Workflow

### Morning Start
```bash
git pull
npm run dev
```

### Before Lunch/End of Day
```bash
git status                    # Check changes
npm run check-secrets         # Security scan
git diff                      # Review changes
git add .                     # Stage (if safe)
git commit -m "Description"   # Commit
git push                      # Push
```

---

## Tips

✅ **DO:**
- Run `npm run check-secrets` before every commit
- Use `.env.local` for all secrets
- Review `git status` carefully
- Check `git diff` before committing
- Keep secrets in environment variables

❌ **DON'T:**
- Commit `.env` files
- Push without checking
- Share API keys in code
- Commit database files
- Skip security checks

---

## Quick Test

Test your setup:

```bash
# 1. Check .env is ignored
git check-ignore .env
# Output: .env ✅

# 2. Try to add .env
git add .env
# Should say "ignored by .gitignore" ✅

# 3. Run security scan
npm run check-secrets
# Should pass with "Safe to commit" ✅

# 4. Check no .env in history
git log --all -- .env
# Should return nothing ✅
```

All passed? **You're protected!** 🎉

---

## Remember

🔒 **Security is NOT optional**  
🔍 **Always double-check before pushing**  
⚠️ **When in doubt, don't commit**  
🚨 **If exposed, revoke immediately**

---

**Keep this guide handy and check it before every commit!** 📌
