// JPEG-specific route for ig-overlay
// This route explicitly indicates it returns a JPEG image
// Usage: /api/ig-overlay.jpg?title=...&website=...

import handler from './ig-overlay.js';

export default handler;
export const runtime = 'nodejs';
