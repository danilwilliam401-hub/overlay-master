import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

// Prisma singleton
const globalForPrisma = global;
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get session
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user) {
      return res.status(401).json({ error: 'Unauthorized. Please sign in.' });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch user's templates
    const templates = await prisma.template.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        design: true,
        parameters: true,
        uniqueUrl: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Parse JSON parameters
    const templatesWithParsedParams = templates.map(t => ({
      ...t,
      parameters: JSON.parse(t.parameters),
      apiUrl: `/api/templates/${t.uniqueUrl}`,
      fullUrl: `${req.headers.origin || process.env.NEXTAUTH_URL}/api/templates/${t.uniqueUrl}`
    }));

    return res.status(200).json({
      success: true,
      templates: templatesWithParsedParams,
      count: templatesWithParsedParams.length
    });

  } catch (error) {
    console.error('❌ Error fetching templates:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch templates',
      message: error.message 
    });
  }
}
