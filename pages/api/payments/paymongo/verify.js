/**
 * Verify PayMongo Payment Status
 * 
 * GET /api/payments/paymongo/verify?session_id=xxx
 */

import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;
const PAYMONGO_API_URL = 'https://api.paymongo.com/v1';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    // Retrieve checkout session from PayMongo
    const response = await fetch(`${PAYMONGO_API_URL}/checkout_sessions/${session_id}`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(PAYMONGO_SECRET_KEY).toString('base64')}`
      }
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('PayMongo API error:', responseData);
      throw new Error('Failed to retrieve checkout session');
    }

    const checkoutSession = responseData.data;
    const status = checkoutSession.attributes.payment_status;
    const metadata = checkoutSession.attributes.metadata;

    return res.status(200).json({
      sessionId: checkoutSession.id,
      status: status,
      paid: status === 'paid',
      amount: checkoutSession.attributes.line_items[0]?.amount,
      metadata: metadata
    });

  } catch (error) {
    console.error('Verify payment error:', error);
    return res.status(500).json({ 
      error: 'Failed to verify payment',
      message: error.message 
    });
  }
}
