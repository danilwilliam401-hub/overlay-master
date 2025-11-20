/**
 * PayMongo Payment Link API
 * Creates a payment link for one-time payments
 * 
 * POST /api/payments/paymongo/create-link
 * Body: { amount, description }
 */

import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;
const PAYMONGO_API_URL = 'https://api.paymongo.com/v1';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { amount, description = 'Payment' } = req.body;

    if (!amount || amount < 100) { // Minimum $1
      return res.status(400).json({ error: 'Invalid amount. Minimum $1' });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    // Create payment link
    const linkData = {
      data: {
        attributes: {
          amount: amount,
          description: description,
          metadata: {
            userId: user.id,
            userEmail: user.email
          }
        }
      }
    };

    const response = await fetch(`${PAYMONGO_API_URL}/links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(PAYMONGO_SECRET_KEY).toString('base64')}`
      },
      body: JSON.stringify(linkData)
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('PayMongo API error:', responseData);
      throw new Error(responseData.errors?.[0]?.detail || 'Failed to create payment link');
    }

    return res.status(200).json({
      linkId: responseData.data.id,
      checkoutUrl: responseData.data.attributes.checkout_url,
      referenceNumber: responseData.data.attributes.reference_number
    });

  } catch (error) {
    console.error('Create link error:', error);
    return res.status(500).json({ 
      error: 'Failed to create payment link',
      message: error.message 
    });
  }
}
