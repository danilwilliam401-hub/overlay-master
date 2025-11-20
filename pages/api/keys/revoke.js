import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/keys/revoke
 * 
 * Revoke an API key (soft delete - key remains in DB but cannot be used)
 * 
 * REQUEST BODY:
 * {
 *   "keyId": "clx1234567890"  // Required: ID of the key to revoke
 * }
 * 
 * RESPONSE (200):
 * {
 *   "status": "success",
 *   "message": "API key revoked successfully",
 *   "keyId": "clx1234567890",
 *   "revokedAt": "2025-11-18T12:00:00.000Z"
 * }
 * 
 * ERRORS:
 * - 401: Unauthorized
 * - 400: Invalid request body
 * - 403: Key belongs to another user
 * - 404: Key not found
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
    const { keyId } = req.body;

    // Validate input
    if (!keyId || typeof keyId !== 'string') {
      return res.status(400).json({ error: 'keyId is required' });
    }

    // Find the API key and verify ownership
    const apiKey = await prisma.apiKey.findUnique({
      where: { id: keyId },
      select: {
        id: true,
        userId: true,
        prefix: true,
        name: true,
        revokedAt: true
      }
    });

    // Check if key exists
    if (!apiKey) {
      return res.status(404).json({ error: 'API key not found' });
    }

    // Check if key belongs to the authenticated user
    if (apiKey.userId !== session.user.id) {
      console.warn(`⚠️ User ${session.user.email} attempted to revoke key ${keyId} belonging to another user`);
      return res.status(403).json({ error: 'You do not have permission to revoke this key' });
    }

    // Check if already revoked
    if (apiKey.revokedAt) {
      return res.status(400).json({ 
        error: 'API key is already revoked',
        revokedAt: apiKey.revokedAt
      });
    }

    // Revoke the key (soft delete)
    const revokedAt = new Date();
    await prisma.apiKey.update({
      where: { id: keyId },
      data: { revokedAt }
    });

    console.log(`🔒 Revoked API key for user ${session.user.email}: ${apiKey.prefix}... (${apiKey.name})`);

    return res.status(200).json({
      status: 'success',
      message: 'API key revoked successfully',
      keyId: apiKey.id,
      name: apiKey.name,
      prefix: apiKey.prefix,
      revokedAt
    });

  } catch (error) {
    console.error('❌ Error revoking API key:', error);
    return res.status(500).json({ 
      error: 'Failed to revoke API key',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * USAGE EXAMPLE (Client-side):
 * 
 * async function revokeKey(keyId) {
 *   const response = await fetch('/api/keys/revoke', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ keyId })
 *   });
 *   
 *   const data = await response.json();
 *   
 *   if (data.status === 'success') {
 *     console.log(`✅ Revoked: ${data.name}`);
 *     // Refresh key list in UI
 *   } else {
 *     console.error('Failed to revoke key:', data.error);
 *   }
 * }
 * 
 * // Example with confirmation dialog
 * function handleRevoke(keyId, keyName) {
 *   if (confirm(`Are you sure you want to revoke "${keyName}"? This action cannot be undone.`)) {
 *     revokeKey(keyId);
 *   }
 * }
 */
