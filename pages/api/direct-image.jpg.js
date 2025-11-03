// JPEG-specific route for direct-image
// This route explicitly indicates it returns a JPEG image
// Usage: /api/direct-image.jpg?image=...&title=...&website=...&design=...

import handler from './direct-image.js';

// Re-export the same handler with explicit JPEG route
export default handler;
export const runtime = 'nodejs';