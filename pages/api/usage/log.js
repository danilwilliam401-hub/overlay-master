import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/usage/log
 * 
 * Internal endpoint to log API usage
 * Should be called by other API endpoints (e.g., bundled-font-overlay)
 * 
 * REQUEST BODY:
 * {
 *   "apiKeyId": "clx1234567890",
 *   "endpoint": "/api/bundled-font-overlay",
 *   "method": "POST",
 *   "status": 200,
 *   "latencyMs": 1250,
 *   "bytesOut": 524288,
 *   "errorMessage": null,
 *   "metadata": { "theme": "antonBlack", "hasImage": true }
 * }
 * 
 * RESPONSE (201):
 * {
 *   "status": "success",
 *   "usageId": "clx9876543210"
 * }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate internal call (optional: add secret token check)
    // if (req.headers['x-internal-secret'] !== process.env.INTERNAL_API_SECRET) {
    //   return res.status(403).json({ error: 'Forbidden' });
    // }

    const {
      apiKeyId,
      endpoint,
      method = 'POST',
      status,
      latencyMs,
      bytesOut,
      errorMessage,
      metadata
    } = req.body;

    // Validate required fields
    if (!apiKeyId || !endpoint || !status) {
      return res.status(400).json({ 
        error: 'Missing required fields: apiKeyId, endpoint, status' 
      });
    }

    // Create usage log
    const usage = await prisma.apiUsage.create({
      data: {
        apiKeyId,
        endpoint,
        method,
        status,
        latencyMs: latencyMs || null,
        bytesOut: bytesOut || null,
        errorMessage: errorMessage || null,
        metadata: metadata ? JSON.stringify(metadata) : null
      },
      select: {
        id: true
      }
    });

    // Update lastUsedAt on the API key
    await prisma.apiKey.update({
      where: { id: apiKeyId },
      data: { lastUsedAt: new Date() }
    });

    return res.status(201).json({
      status: 'success',
      usageId: usage.id
    });

  } catch (error) {
    console.error('❌ Error logging usage:', error);
    return res.status(500).json({ 
      error: 'Failed to log usage',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * HELPER FUNCTION: Log usage from within API routes
 * Use this instead of making HTTP calls
 */
export async function logUsage({
  apiKeyId,
  endpoint,
  method = 'POST',
  status,
  latencyMs,
  bytesOut,
  errorMessage,
  metadata
}) {
  try {
    const usage = await prisma.apiUsage.create({
      data: {
        apiKeyId,
        endpoint,
        method,
        status,
        latencyMs: latencyMs || null,
        bytesOut: bytesOut || null,
        errorMessage: errorMessage || null,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    });

    // Update lastUsedAt on the API key (non-blocking)
    prisma.apiKey.update({
      where: { id: apiKeyId },
      data: { lastUsedAt: new Date() }
    }).catch(err => console.error('Failed to update lastUsedAt:', err));

    return usage.id;
  } catch (error) {
    console.error('❌ Error logging usage:', error);
    return null;
  }
}

/**
 * HELPER FUNCTION: Get usage stats for a user or API key
 */
export async function getUsageStats({ userId, apiKeyId, days = 7 }) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Build where clause
    let whereClause = {
      createdAt: { gte: startDate }
    };

    if (apiKeyId) {
      whereClause.apiKeyId = apiKeyId;
    } else if (userId) {
      whereClause.apiKey = { userId };
    }

    // Get daily counts
    const usage = await prisma.apiUsage.findMany({
      where: whereClause,
      select: {
        createdAt: true,
        status: true,
        bytesOut: true,
        latencyMs: true
      }
    });

    // Group by date
    const dailyCounts = {};
    const statusCounts = { success: 0, error: 0 };
    let totalBytes = 0;
    let totalLatency = 0;
    let latencyCount = 0;

    usage.forEach(u => {
      const date = u.createdAt.toISOString().split('T')[0];
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;

      if (u.status >= 200 && u.status < 400) {
        statusCounts.success++;
      } else {
        statusCounts.error++;
      }

      if (u.bytesOut) totalBytes += u.bytesOut;
      if (u.latencyMs) {
        totalLatency += u.latencyMs;
        latencyCount++;
      }
    });

    return {
      totalRequests: usage.length,
      successRate: usage.length > 0 
        ? ((statusCounts.success / usage.length) * 100).toFixed(2) 
        : 0,
      totalBytes,
      avgLatencyMs: latencyCount > 0 
        ? Math.round(totalLatency / latencyCount) 
        : 0,
      dailyCounts,
      statusCounts
    };

  } catch (error) {
    console.error('❌ Error getting usage stats:', error);
    return null;
  }
}

/**
 * USAGE EXAMPLE in bundled-font-overlay.js:
 * 
 * import { logUsage } from './usage/log';
 * 
 * export default async function handler(req, res) {
 *   const startTime = Date.now();
 *   
 *   try {
 *     // ... process image ...
 *     const imageBuffer = await generateBanner(...);
 *     
 *     // Log successful usage
 *     await logUsage({
 *       apiKeyId: validatedKey.id,
 *       endpoint: '/api/bundled-font-overlay',
 *       method: 'POST',
 *       status: 200,
 *       latencyMs: Date.now() - startTime,
 *       bytesOut: imageBuffer.length,
 *       metadata: { theme, hasCustomImage: !!imageUrl }
 *     });
 *     
 *     return res.status(200).send(imageBuffer);
 *   } catch (error) {
 *     // Log failed usage
 *     await logUsage({
 *       apiKeyId: validatedKey.id,
 *       endpoint: '/api/bundled-font-overlay',
 *       method: 'POST',
 *       status: 500,
 *       latencyMs: Date.now() - startTime,
 *       errorMessage: error.message
 *     });
 *     
 *     return res.status(500).json({ error: error.message });
 *   }
 * }
 */
