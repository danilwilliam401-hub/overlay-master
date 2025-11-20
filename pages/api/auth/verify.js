import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/auth/verify?token=xxx&email=xxx
 * Verify email address with token
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, email } = req.query;

    if (!token || !email) {
      return res.redirect('/verify-email?error=invalid_token');
    }

    // Find verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: {
          identifier: email.toLowerCase(),
          token: token,
        },
      },
    });

    if (!verificationToken) {
      return res.redirect('/verify-email?error=invalid_token');
    }

    // Check if token expired
    if (new Date() > verificationToken.expires) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: email.toLowerCase(),
            token: token,
          },
        },
      });
      
      return res.redirect('/verify-email?error=expired_token');
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.redirect('/verify-email?error=user_not_found');
    }

    // Update user as verified
    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { emailVerified: new Date() },
    });

    // Delete used token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: email.toLowerCase(),
          token: token,
        },
      },
    });

    console.log(`✅ Email verified for user: ${email}`);

    // Redirect to success page
    return res.redirect('/email-verified');

  } catch (error) {
    console.error('Verify email error:', error);
    return res.redirect('/verify-email?error=verification_failed');
  } finally {
    await prisma.$disconnect();
  }
}
