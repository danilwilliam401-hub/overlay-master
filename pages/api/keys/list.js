import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/keys/list
 * 
 * List all API keys for the authenticated user
 * Shows only prefix (not full key), name, status, and usage stats
 * 
 * QUERY PARAMETERS:
 * - includeRevoked: boolean (default: false) - Include revoked keys
 * 
 * RESPONSE (200):
 * {
 *   "status": "success",
 *   "keys": [
 *     {
 *       "id": "clx1234567890",
 *       "prefix": "sk_live_a1b2",
 *       "name": "Production Key",
 *       "createdAt": "2025-11-18T00:00:00.000Z",
 *       "lastUsedAt": "2025-11-18T10:30:00.000Z",
 *       "revokedAt": null,
 *       "metadata": { "limitPerMinute": 60 },
 *       "usageCount": 1250,
 *       "usageLast24h": 45
 *     }
 *   ]
 * }
 * 
 * ERRORS:
 * - 401: Unauthorized
 * - 500: Server error
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Unauthorized - Please sign in' });
    }

    // Parse query parameters
    const includeRevoked = req.query.includeRevoked === 'true';

    // Build where clause
    const whereClause = {
      userId: session.user.id,
      ...(includeRevoked ? {} : { revokedAt: null })
    };

    // Fetch API keys with usage counts
    const apiKeys = await prisma.apiKey.findMany({
      where: whereClause,
      select: {
        id: true,
        prefix: true,
        name: true,
        createdAt: true,
        lastUsedAt: true,
        revokedAt: true,
        metadata: true,
        _count: {
          select: {
            usage: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Fetch usage counts for last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const keysWithStats = await Promise.all(
      apiKeys.map(async (key) => {
        // Get usage count in last 24 hours
        const recentUsage = await prisma.apiUsage.count({
          where: {
            apiKeyId: key.id,
            createdAt: {
              gte: twentyFourHoursAgo
            }
          }
        });

        return {
          id: key.id,
          prefix: key.prefix,
          name: key.name,
          createdAt: key.createdAt,
          lastUsedAt: key.lastUsedAt,
          revokedAt: key.revokedAt,
          metadata: key.metadata ? JSON.parse(key.metadata) : {},
          usageCount: key._count.usage,
          usageLast24h: recentUsage,
          isActive: !key.revokedAt
        };
      })
    );

    return res.status(200).json({
      status: 'success',
      keys: keysWithStats,
      total: keysWithStats.length,
      active: keysWithStats.filter(k => k.isActive).length,
      revoked: keysWithStats.filter(k => !k.isActive).length
    });

  } catch (error) {
    console.error('❌ Error listing API keys:', error);
    return res.status(500).json({ 
      error: 'Failed to list API keys',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * USAGE EXAMPLE (Client-side):
 * 
 * // Fetch active keys only
 * const response = await fetch('/api/keys/list');
 * const data = await response.json();
 * 
 * if (data.status === 'success') {
 *   data.keys.forEach(key => {
 *     console.log(`${key.name}: ${key.prefix}... (${key.usageCount} total uses)`);
 *   });
 * }
 * 
 * // Fetch all keys including revoked
 * const allKeys = await fetch('/api/keys/list?includeRevoked=true');
 */
