import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/user/me
 * 
 * Get authenticated user information
 * 
 * RESPONSE (200):
 * {
 *   "status": "success",
 *   "user": {
 *     "id": "clx1234567890",
 *     "email": "user@example.com",
 *     "name": "John Doe",
 *     "image": "https://lh3.googleusercontent.com/...",
 *     "createdAt": "2025-11-01T00:00:00.000Z",
 *     "stats": {
 *       "totalApiKeys": 3,
 *       "activeApiKeys": 2,
 *       "totalBanners": 450,
 *       "totalRequests": 12500
 *     }
 *   }
 * }
 * 
 * PATCH /api/user/me
 * 
 * Update user profile
 * 
 * REQUEST BODY:
 * {
 *   "name": "Jane Doe"  // Only name is editable
 * }
 * 
 * RESPONSE (200):
 * {
 *   "status": "success",
 *   "user": { ... }
 * }
 */
export default async function handler(req, res) {
  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Unauthorized - Please sign in' });
    }

    if (req.method === 'GET') {
      return await handleGet(req, res, session);
    } else if (req.method === 'PATCH') {
      return await handlePatch(req, res, session);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('❌ Error in /api/user/me:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

async function handleGet(req, res, session) {
  // Fetch user with statistics
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      createdAt: true,
      _count: {
        select: {
          apiKeys: true,
          banners: true
        }
      }
    }
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Count active API keys
  const activeApiKeys = await prisma.apiKey.count({
    where: {
      userId: session.user.id,
      revokedAt: null
    }
  });

  // Count total requests
  const totalRequests = await prisma.apiUsage.count({
    where: {
      apiKey: {
        userId: session.user.id
      }
    }
  });

  return res.status(200).json({
    status: 'success',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      createdAt: user.createdAt,
      stats: {
        totalApiKeys: user._count.apiKeys,
        activeApiKeys,
        totalBanners: user._count.banners,
        totalRequests
      }
    }
  });
}

async function handlePatch(req, res, session) {
  const { name } = req.body;

  // Validate input
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Name is required' });
  }

  if (name.length > 100) {
    return res.status(400).json({ error: 'Name must be 100 characters or less' });
  }

  // Update user
  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { name: name.trim() },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      createdAt: true
    }
  });

  console.log(`✏️ Updated user profile: ${user.email}`);

  return res.status(200).json({
    status: 'success',
    user
  });
}

/**
 * USAGE EXAMPLE (Client-side):
 * 
 * // Fetch user info
 * const response = await fetch('/api/user/me');
 * const data = await response.json();
 * console.log(data.user.name, data.user.stats.totalRequests);
 * 
 * // Update user name
 * await fetch('/api/user/me', {
 *   method: 'PATCH',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ name: 'New Name' })
 * });
 */
