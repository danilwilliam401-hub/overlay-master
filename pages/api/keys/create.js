import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * POST /api/keys/create
 * 
 * Create a new API key for the authenticated user
 * 
 * REQUEST BODY:
 * {
 *   "name": "My Banner Key",           // Required: User-friendly name
 *   "limitPerMinute": 60,              // Optional: Rate limit (default: 60)
 *   "allowedOrigins": ["example.com"]  // Optional: CORS origins
 * }
 * 
 * RESPONSE (201):
 * {
 *   "status": "success",
 *   "apiKey": "your_generated_api_key_here",  // Full key (shown ONCE)
 *   "prefix": "key_prefix",                   // Display prefix
 *   "id": "key_id_here",
 *   "name": "My Banner Key",
 *   "createdAt": "2025-11-18T00:00:00.000Z",
 *   "metadata": { "limitPerMinute": 60 }
 * }
 * 
 * ERRORS:
 * - 401: Unauthorized (no session)
 * - 400: Invalid request body
 * - 500: Server error
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Unauthorized - Please sign in' });
    }

    // Parse request body
    const { name, limitPerMinute = 60, allowedOrigins = [] } = req.body;

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'API key name is required' });
    }

    if (name.length > 100) {
      return res.status(400).json({ error: 'API key name must be 100 characters or less' });
    }

    if (limitPerMinute && (typeof limitPerMinute !== 'number' || limitPerMinute < 1 || limitPerMinute > 1000)) {
      return res.status(400).json({ error: 'limitPerMinute must be between 1 and 1000' });
    }

    // Generate secure API key
    // Format: sk_live_<24 random URL-safe characters>
    const randomBytes = crypto.randomBytes(18); // 18 bytes = 24 base64 chars
    const keySecret = randomBytes.toString('base64url').substring(0, 24);
    const fullKey = `sk_live_${keySecret}`;
    
    // Extract prefix (first 12 characters for display)
    const prefix = fullKey.substring(0, 12);

    // Hash the full key for storage (bcrypt with 10 rounds)
    const keyHash = await bcrypt.hash(fullKey, 10);

    // Prepare metadata
    const metadata = {
      limitPerMinute,
      allowedOrigins: allowedOrigins.filter(o => typeof o === 'string' && o.length > 0)
    };

    // Create API key in database
    const apiKey = await prisma.apiKey.create({
      data: {
        userId: session.user.id,
        keyHash,
        prefix,
        name: name.trim(),
        metadata: JSON.stringify(metadata),
      },
      select: {
        id: true,
        prefix: true,
        name: true,
        createdAt: true,
        metadata: true,
      }
    });

    console.log(`✅ Created API key for user ${session.user.email}: ${prefix}...`);

    // Return the full key ONLY ONCE
    return res.status(201).json({
      status: 'success',
      apiKey: fullKey,  // ⚠️ ONLY shown once - user must copy it now
      prefix: apiKey.prefix,
      id: apiKey.id,
      name: apiKey.name,
      createdAt: apiKey.createdAt,
      metadata: JSON.parse(apiKey.metadata || '{}'),
      warning: '⚠️ Save this API key now. You will not be able to see it again!'
    });

  } catch (error) {
    console.error('❌ Error creating API key:', error);
    return res.status(500).json({ 
      error: 'Failed to create API key',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * USAGE EXAMPLE (Client-side):
 * 
 * const response = await fetch('/api/keys/create', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     name: 'Production Banner Key',
 *     limitPerMinute: 120,
 *     allowedOrigins: ['myapp.com', 'www.myapp.com']
 *   })
 * });
 * 
 * const data = await response.json();
 * if (data.status === 'success') {
 *   console.log('API Key:', data.apiKey); // sk_live_...
 *   // IMPORTANT: Display this to user with copy button and warning
 *   alert('⚠️ Copy your API key now! You will not see it again.');
 * }
 */
