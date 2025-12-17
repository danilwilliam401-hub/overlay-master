// JPEG-specific route for bundled-font-overlay
// This route explicitly indicates it returns a JPEG image
// Usage: /api/bundled-font-overlay.jpg?title=...&website=...

import handler from './overlay.js';

// Re-export the same handler with explicit JPEG route
export default handler;
export const runtime = 'nodejs';