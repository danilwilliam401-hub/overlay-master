// JPEG-specific route for simple-overlay
// This route explicitly indicates it returns a JPEG image
// Usage: /api/simple-overlay.jpg?image=...&title=...&website=...

import handler from './simple-overlay.js';

// Re-export the same handler with explicit JPEG route
export default handler;
export const runtime = 'nodejs';