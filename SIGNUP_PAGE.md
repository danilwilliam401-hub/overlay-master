# 📝 Signup Page Documentation

## Overview

A dedicated signup page with email/password authentication matching the landing page design theme. Users can sign up using their email and password or continue with Google OAuth.

## Files Created

### 1. **pages/signup.js** (Main Signup Page)
- Beautiful gradient background matching landing page theme
- Email/password registration form
- Google OAuth integration
- reCAPTCHA v2 verification
- Form validation with error handling
- Auto-signin after successful registration
- Redirects to dashboard after signup

### 2. **styles/Signup.module.css** (Styling)
- Purple gradient background (#667eea → #764ba2)
- Clean white card design with rounded corners
- Responsive design for mobile and desktop
- Hover effects and animations
- Loading states and error messages
- Matches landing page design system

### 3. **pages/api/auth/signup.js** (API Endpoint)
- POST endpoint for user registration
- Email validation
- Password hashing with bcrypt
- reCAPTCHA verification
- Duplicate email checking
- User creation in database

### 4. **Updated NextAuth Configuration**
- Added CredentialsProvider for email/password auth
- JWT session strategy for credentials support
- Password verification with bcrypt
- Backward compatible with Google OAuth

### 5. **Updated Prisma Schema**
- Added `password` field to User model (nullable for OAuth users)
- Created migration: `20251118081937_add_password_field`

## Features

### ✅ Email/Password Authentication
- Create account with email and password
- Password must be at least 8 characters
- Automatic password hashing with bcryptjs
- Secure credential storage in database

### ✅ Google OAuth (Existing)
- Continue with Google button
- Seamless OAuth flow
- No password required

### ✅ Form Validation
- First name required
- Last name required
- Valid email format
- Password minimum length (8 characters)
- reCAPTCHA verification

### ✅ Security Features
- Password hashing with bcrypt (12 rounds)
- reCAPTCHA v2 spam protection
- Duplicate email prevention
- Secure session management with JWT

### ✅ User Experience
- Password visibility toggle
- Loading states during submission
- Success and error messages
- Auto-signin after registration
- Redirect to dashboard on success
- Link to sign in page for existing users

## Usage

### Access the Signup Page
```
http://localhost:3000/signup
```

### Sign Up Flow
1. User fills in first name, last name, email, password
2. User completes reCAPTCHA verification
3. Click "Sign Up" button
4. Account is created in database
5. User is automatically signed in
6. Redirected to dashboard

### Google OAuth Flow
1. Click "Continue with Google"
2. Select Google account
3. Redirected to dashboard

## API Endpoint

### POST `/api/auth/signup`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "captchaToken": "recaptcha_token_here"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "id": "clxxx...",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2025-11-18T08:19:37.000Z"
  }
}
```

**Error Response (400/500):**
```json
{
  "error": "An account with this email already exists"
}
```

## Environment Variables

### Required for reCAPTCHA

Add to `.env.local`:

```bash
# reCAPTCHA v2 Keys
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key_here
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

### Test Keys (Already in Code)
The signup page uses Google's test keys by default:
- **Site Key:** `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`
- **Secret Key:** `6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe`

These test keys always pass validation. For production, replace with real keys from:
https://www.google.com/recaptcha/admin

## Database Schema

### User Model (Updated)
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  password      String?   // NEW: For email/password auth
  image         String?
  emailVerified DateTime?
  isAdmin       Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations...
}
```

## Authentication Methods

### 1. Email/Password (NEW)
- User provides email and password
- Credentials stored in database
- Password hashed with bcrypt
- JWT session management

### 2. Google OAuth (Existing)
- No password required
- OAuth tokens stored
- Profile data from Google
- Database session management

## Navigation Updates

### Landing Page
Added "Sign Up" button in navigation:
- Appears next to "Sign In" when not logged in
- White button with purple text
- Redirects to `/signup`

## Design System

### Colors
- **Gradient:** `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- **Primary Text:** `#1a1a1a`
- **Secondary Text:** `#6b7280`
- **Borders:** `#e5e7eb`
- **Error:** `#ef4444`
- **Success:** `#10b981`

### Typography
- **Title:** 32px, 800 weight
- **Labels:** 14px, 600 weight
- **Inputs:** 15px
- **Buttons:** 16px, 600 weight

### Spacing
- Card padding: 48px 40px (desktop), 32px 24px (mobile)
- Form group margin: 24px
- Input padding: 12px 16px

## Testing

### Test Signup Flow
1. Navigate to `http://localhost:3000/signup`
2. Fill in form with test data:
   - First name: Test
   - Last name: User
   - Email: test@example.com
   - Password: testpassword123
3. Complete reCAPTCHA (auto-passes with test keys)
4. Click "Sign Up"
5. Should see success message
6. Should redirect to dashboard

### Test Validation
- Try submitting without first name → Error
- Try submitting without last name → Error
- Try invalid email format → Error
- Try password < 8 characters → Error
- Try duplicate email → Error

### Test Google OAuth
1. Click "Continue with Google"
2. Select Google account
3. Should redirect to dashboard

## Security Best Practices

### ✅ Implemented
- Password hashing with bcrypt (12 rounds)
- reCAPTCHA spam protection
- Email format validation
- Password minimum length requirement
- Duplicate email prevention
- JWT session encryption
- HTTPS required in production

### 🔒 Additional Recommendations
1. **Email Verification:** Add email verification flow
2. **Password Strength:** Add password strength meter
3. **Rate Limiting:** Add rate limiting to signup endpoint
4. **Account Recovery:** Add forgot password flow
5. **2FA:** Add two-factor authentication option

## Troubleshooting

### Issue: "Captcha verification failed"
**Solution:** 
- Check `RECAPTCHA_SECRET_KEY` is set in `.env.local`
- Verify reCAPTCHA script is loaded
- Check browser console for errors

### Issue: "Account with this email already exists"
**Solution:** 
- User already has an account
- Direct them to sign in page
- Or use password recovery flow

### Issue: "Failed to create account"
**Solution:** 
- Check database connection
- Verify Prisma client is generated
- Check server logs for details

### Issue: Password field not in database
**Solution:** 
```bash
npx prisma migrate dev --name add_password_field
npx prisma generate
```

## Integration with Existing System

### Authentication Flow
1. **Signup Page** → Creates user account
2. **NextAuth** → Handles authentication
3. **Dashboard** → Protected route (requires auth)
4. **Billing/Checkout** → Protected routes (requires auth)

### Session Management
- JWT tokens for both email/password and OAuth
- 30-day session expiration
- Session updated every 24 hours
- Secure cookie storage

## Future Enhancements

### Planned Features
- [ ] Email verification flow
- [ ] Password strength indicator
- [ ] Password recovery (forgot password)
- [ ] Social login (GitHub, Facebook)
- [ ] Profile completion wizard
- [ ] Welcome email on signup
- [ ] Terms of Service acceptance checkbox
- [ ] Newsletter subscription option

## Links

- **Signup Page:** `/signup`
- **Sign In:** `/api/auth/signin`
- **Dashboard:** `/dashboard`
- **reCAPTCHA Admin:** https://www.google.com/recaptcha/admin
- **NextAuth Docs:** https://next-auth.js.org/

## Summary

The signup page is now fully functional with:
✅ Beautiful UI matching landing page theme
✅ Email/password authentication
✅ Google OAuth integration
✅ reCAPTCHA verification
✅ Form validation and error handling
✅ Secure password hashing
✅ Auto-signin after registration
✅ Mobile-responsive design
✅ Database migration applied

Users can now create accounts using email/password or Google OAuth, with a seamless experience that matches your existing design system.
