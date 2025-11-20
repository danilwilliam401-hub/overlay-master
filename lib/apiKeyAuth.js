import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * API Key Validation and Rate Limiting Helper
 * 
 * This module provides functions to:
 * - Extract API keys from request headers
 * - Validate API keys against database
 * - Enforce rate limiting (in-memory for demo)
 * - Check if keys are revoked
 * 
 * PRODUCTION NOTE: Use Redis or Upstash for distributed rate limiting
 */

// In-memory rate limit store (use Redis in production)
// Structure: { apiKeyId: { count: number, resetAt: timestamp } }
const rateLimitStore = new Map();

/**
 * Extract API key from request headers
 * Supports:
 * - Authorization: Bearer sk_live_...
 * - x-api-key: sk_live_...
 */
export function extractApiKey(req) {
  // Check Authorization header
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader) {
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (match) {
      return match[1].trim();
    }
  }

  // Check x-api-key header
  const apiKeyHeader = req.headers['x-api-key'];
  if (apiKeyHeader) {
    return apiKeyHeader.trim();
  }

  return null;
}

/**
 * Validate API key against database
 * Returns { valid: boolean, key?: ApiKey, error?: string }
 */
export async function validateApiKey(apiKeyString) {
  try {
    if (!apiKeyString || typeof apiKeyString !== 'string') {
      return { valid: false, error: 'API key is required' };
    }

    // Validate format
    if (!apiKeyString.startsWith('sk_live_')) {
      return { valid: false, error: 'Invalid API key format' };
    }

    if (apiKeyString.length !== 32) { // sk_live_ (8) + 24 chars
      return { valid: false, error: 'Invalid API key length' };
    }

    // Fetch all API keys and compare hashes (bcrypt.compare)
    // Note: In production with many keys, consider indexing strategy
    const allKeys = await prisma.apiKey.findMany({
      where: {
        revokedAt: null // Only check active keys
      },
      select: {
        id: true,
        userId: true,
        keyHash: true,
        prefix: true,
        name: true,
        metadata: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    // Find matching key by comparing hashes (constant-time comparison via bcrypt)
    for (const key of allKeys) {
      const isMatch = await bcrypt.compare(apiKeyString, key.keyHash);
      if (isMatch) {
        return {
          valid: true,
          key: {
            id: key.id,
            userId: key.userId,
            prefix: key.prefix,
            name: key.name,
            metadata: key.metadata ? JSON.parse(key.metadata) : {},
            user: key.user
          }
        };
      }
    }

    return { valid: false, error: 'Invalid or revoked API key' };

  } catch (error) {
    console.error('❌ Error validating API key:', error);
    return { valid: false, error: 'Failed to validate API key' };
  }
}

/**
 * Check rate limit for API key
 * Returns { allowed: boolean, remaining: number, resetAt: number }
 * 
 * PRODUCTION: Replace with Redis-based rate limiting
 * Example with Upstash Redis:
 * 
 * import { Redis } from '@upstash/redis';
 * const redis = new Redis({ url: process.env.UPSTASH_URL, token: process.env.UPSTASH_TOKEN });
 * 
 * async function checkRateLimit(apiKeyId, limit) {
 *   const key = `ratelimit:${apiKeyId}`;
 *   const count = await redis.incr(key);
 *   if (count === 1) {
 *     await redis.expire(key, 60); // 60 seconds
 *   }
 *   const ttl = await redis.ttl(key);
 *   return {
 *     allowed: count <= limit,
 *     remaining: Math.max(0, limit - count),
 *     resetAt: Date.now() + (ttl * 1000)
 *   };
 * }
 */
export function checkRateLimit(apiKeyId, limit = 60) {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window

  // Get or create rate limit entry
  let entry = rateLimitStore.get(apiKeyId);

  // Reset if window expired
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + windowMs
    };
    rateLimitStore.set(apiKeyId, entry);
  }

  // Increment counter
  entry.count++;

  // Check if limit exceeded
  const allowed = entry.count <= limit;
  const remaining = Math.max(0, limit - entry.count);

  return {
    allowed,
    remaining,
    resetAt: entry.resetAt,
    limit
  };
}

/**
 * Cleanup expired rate limit entries (call periodically)
 * In production, this is handled automatically by Redis TTL
 */
export function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}

// Cleanup every 5 minutes
if (process.env.NODE_ENV !== 'test') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}

/**
 * Middleware function to protect API routes
 * Usage in API handler:
 * 
 * import { protectApiRoute } from '../../lib/apiKeyAuth';
 * 
 * export default async function handler(req, res) {
 *   const { valid, key, error, rateLimit } = await protectApiRoute(req);
 *   
 *   if (!valid) {
 *     return res.status(401).json({ error });
 *   }
 *   
 *   if (!rateLimit.allowed) {
 *     return res.status(429)
 *       .setHeader('X-RateLimit-Limit', rateLimit.limit)
 *       .setHeader('X-RateLimit-Remaining', rateLimit.remaining)
 *       .setHeader('X-RateLimit-Reset', rateLimit.resetAt)
 *       .json({ error: 'Rate limit exceeded' });
 *   }
 *   
 *   // Process request with key.userId, key.metadata, etc.
 * }
 */
export async function protectApiRoute(req, options = {}) {
  const {
    requireKey = true,
    defaultLimit = 60
  } = options;

  // Extract API key
  const apiKeyString = extractApiKey(req);

  if (requireKey && !apiKeyString) {
    return {
      valid: false,
      error: 'API key is required. Provide via Authorization: Bearer <key> or x-api-key header'
    };
  }

  if (!apiKeyString) {
    return { valid: true, key: null, rateLimit: null };
  }

  // Validate API key
  const validation = await validateApiKey(apiKeyString);
  if (!validation.valid) {
    return validation;
  }

  const { key } = validation;

  // Check rate limit
  const limit = key.metadata?.limitPerMinute || defaultLimit;
  const rateLimit = checkRateLimit(key.id, limit);

  return {
    valid: true,
    key,
    rateLimit
  };
}

/**
 * USAGE EXAMPLE in bundled-font-overlay.js:
 * 
 * import { protectApiRoute } from '../../lib/apiKeyAuth';
 * import { logUsage } from './usage/log';
 * 
 * export default async function handler(req, res) {
 *   const startTime = Date.now();
 *   
 *   // Validate API key and check rate limit
 *   const { valid, key, error, rateLimit } = await protectApiRoute(req, {
 *     requireKey: true,
 *     defaultLimit: 60
 *   });
 *   
 *   // Handle authentication error
 *   if (!valid) {
 *     return res.status(401).json({ 
 *       status: 'error',
 *       error: error || 'Invalid API key'
 *     });
 *   }
 *   
 *   // Handle rate limit exceeded
 *   if (!rateLimit.allowed) {
 *     await logUsage({
 *       apiKeyId: key.id,
 *       endpoint: '/api/bundled-font-overlay',
 *       method: req.method,
 *       status: 429,
 *       latencyMs: Date.now() - startTime,
 *       errorMessage: 'Rate limit exceeded'
 *     });
 *     
 *     return res.status(429)
 *       .setHeader('X-RateLimit-Limit', rateLimit.limit)
 *       .setHeader('X-RateLimit-Remaining', 0)
 *       .setHeader('X-RateLimit-Reset', rateLimit.resetAt)
 *       .json({ 
 *         status: 'error',
 *         error: 'Rate limit exceeded',
 *         limit: rateLimit.limit,
 *         resetAt: new Date(rateLimit.resetAt).toISOString()
 *       });
 *   }
 *   
 *   // Add rate limit headers to response
 *   res.setHeader('X-RateLimit-Limit', rateLimit.limit);
 *   res.setHeader('X-RateLimit-Remaining', rateLimit.remaining);
 *   res.setHeader('X-RateLimit-Reset', rateLimit.resetAt);
 *   
 *   try {
 *     // ... process overlay ...
 *     const result = await generateOverlay(...);
 *     
 *     // Log successful usage
 *     await logUsage({
 *       apiKeyId: key.id,
 *       endpoint: '/api/bundled-font-overlay',
 *       method: req.method,
 *       status: 200,
 *       latencyMs: Date.now() - startTime,
 *       bytesOut: result.length
 *     });
 *     
 *     return res.status(200).send(result);
 *   } catch (error) {
 *     // Log failed usage
 *     await logUsage({
 *       apiKeyId: key.id,
 *       endpoint: '/api/bundled-font-overlay',
 *       method: req.method,
 *       status: 500,
 *       latencyMs: Date.now() - startTime,
 *       errorMessage: error.message
 *     });
 *     
 *     return res.status(500).json({ error: error.message });
 *   }
 * }
 */
