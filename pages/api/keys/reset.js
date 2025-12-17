import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * POST /api/keys/reset
 * 
 * Reset (regenerate) an existing API key - revokes old one and creates new one
 * 
 * REQUEST BODY:
 * {
 *   "keyId": "existing_key_id"  // Required: ID of key to reset
 * }
 * 
 * RESPONSE (200):
 * {
 *   "status": "success",
 *   "apiKey": "new_generated_api_key_here",  // Full new key (shown ONCE)
 *   "prefix": "new_key_prefix",
 *   "id": "new_key_id",
 *   "name": "My Banner Key",
 *   "createdAt": "2025-11-18T00:00:00.000Z",
 *   "metadata": { "limitPerMinute": 60 }
 * }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { keyId } = req.body;

    if (!keyId) {
      return res.status(400).json({ error: 'Key ID is required' });
    }

    // Find the existing key and verify ownership
    const existingKey = await prisma.apiKey.findFirst({
      where: {
        id: keyId,
        userId: session.user.id,
        revokedAt: null
      }
    });

    if (!existingKey) {
      return res.status(404).json({ error: 'API key not found or already revoked' });
    }

    // Generate new secure API key
    const randomBytes = crypto.randomBytes(18);
    const keySecret = randomBytes.toString('base64url').substring(0, 24);
    const fullKey = `sk_live_${keySecret}`;
    const prefix = fullKey.substring(0, 12);
    const keyHash = await bcrypt.hash(fullKey, 10);

    // Update the existing key with new hash and prefix
    const updatedKey = await prisma.apiKey.update({
      where: { id: keyId },
      data: {
        keyHash,
        prefix,
        lastUsedAt: null, // Reset last used
      },
      select: {
        id: true,
        prefix: true,
        name: true,
        createdAt: true,
        metadata: true,
      }
    });

    console.log(`✅ Reset API key for user ${session.user.email}: ${prefix}...`);

    return res.status(200).json({
      status: 'success',
      apiKey: fullKey,
      prefix: updatedKey.prefix,
      id: updatedKey.id,
      name: updatedKey.name,
      createdAt: updatedKey.createdAt,
      metadata: JSON.parse(updatedKey.metadata || '{}'),
      warning: '⚠️ Save this new API key now. The old key is no longer valid!'
    });

  } catch (error) {
    console.error('❌ Error resetting API key:', error);
    return res.status(500).json({ 
      error: 'Failed to reset API key',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
