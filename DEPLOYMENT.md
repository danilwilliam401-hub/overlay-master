# Deployment Guide

## Issues Fixed for Vercel Deployment

The following issues have been addressed to ensure the overlay banner works correctly on Vercel:

### 1. Parameter Encoding Issues
- Added multiple decoding attempts for URL parameters
- Handle double encoding that can occur on serverless platforms
- Clean up quote wrapping that may occur in different environments
- Added fallback values for empty or undefined parameters

### 2. ES Module Compatibility
- Updated imports to work with both local development and Vercel's serverless environment
- Added native fetch as primary method with Node.js fallback
- Fixed require/import mixing issues

### 3. SVG Generation Robustness
- Added SVG validation before rendering
- Implemented fallback simple overlay in case main overlay fails
- Added proper HTML entity escaping for SVG content
- Better error handling and logging

### 4. Environment Detection
- Added Vercel environment detection
- Enhanced debugging logs for production troubleshooting
- Configured appropriate function timeouts

## Deploy to Vercel

1. **Commit your changes:**
```bash
git add .
git commit -m "Fix title and website display issues on Vercel"
git push origin main
```

2. **Deploy to Vercel:**
- If connected to GitHub: Push will auto-deploy
- If using Vercel CLI: `vercel --prod`

3. **Test the deployment:**
```
https://your-app.vercel.app/api/direct-image?image=https://picsum.photos/800/600&title=Test%20Title&website=TestSite.com&design=design1
```

## Debugging on Vercel

Check function logs in Vercel dashboard to see:
- `Query parameters received:` - Shows how parameters are being received
- `Decoded values:` - Shows the decoded title and website values
- `Environment:` - Confirms if running on Vercel or locally
- Any error messages from the fallback mechanisms

## Key Changes Made

1. **Enhanced Parameter Handling**: Multiple decoding strategies for different serverless environments
2. **Fetch Compatibility**: Native fetch with Node.js fallback for better Vercel compatibility
3. **SVG Robustness**: Validation and fallback rendering to prevent blank overlays
4. **Better Error Handling**: Comprehensive logging and graceful degradation
5. **Environment Awareness**: Different behaviors for local vs. production environments

The title and website should now display correctly on Vercel production deployment.