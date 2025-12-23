import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

// Prisma singleton to avoid "too many clients" error
const globalForPrisma = global;
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get session
    const session = await getServerSession(req, res, authOptions);
    
    console.log('📋 Session:', session ? `User: ${session.user?.email}` : 'No session');
    
    if (!session || !session.user) {
      console.error('❌ No session found');
      return res.status(401).json({ error: 'Unauthorized. Please sign in.' });
    }

    const { name, design, parameters } = req.body;
    console.log('📦 Request body:', { name, design, hasParameters: !!parameters });

    // Validate inputs
    if (!name || !design || !parameters) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, design, parameters' 
      });
    }

    if (name.length < 3 || name.length > 50) {
      return res.status(400).json({ 
        error: 'Template name must be between 3 and 50 characters' 
      });
    }

    // Generate unique URL (8 random characters)
    const uniqueUrl = crypto.randomBytes(4).toString('hex');

    // Get user from database
    console.log('🔍 Looking up user:', session.user.email);
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      console.error('❌ User not found in database:', session.user.email);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('✅ User found:', user.id);

    // Save template
    console.log('💾 Creating template...');
    const template = await prisma.template.create({
      data: {
        name,
        userId: user.id,
        design,
        parameters: JSON.stringify(parameters),
        uniqueUrl
      }
    });

    console.log(`✅ Template created: ${name} (${uniqueUrl}) by ${user.email}`);

    return res.status(201).json({
      success: true,
      template: {
        id: template.id,
        name: template.name,
        design: template.design,
        uniqueUrl: template.uniqueUrl,
        apiUrl: `/api/templates/${template.uniqueUrl}`,
        fullUrl: `${req.headers.origin || process.env.NEXTAUTH_URL}/api/templates/${template.uniqueUrl}`,
        createdAt: template.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Error creating template:', error);
    return res.status(500).json({ 
      error: 'Failed to create template',
      message: error.message 
    });
  }
}
