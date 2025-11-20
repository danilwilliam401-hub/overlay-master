import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

/**
 * POST /api/auth/send-verification
 * Send verification email to user
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store or update verification token
    await prisma.verificationToken.upsert({
      where: {
        identifier_token: {
          identifier: email.toLowerCase(),
          token: token,
        },
      },
      update: {
        expires,
      },
      create: {
        identifier: email.toLowerCase(),
        token,
        expires,
      },
    });

    // Send verification email
    const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;

    // Configure email transporter
    let transporter;
    
    if (process.env.SMTP_HOST) {
      // Use custom SMTP settings if configured
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });
    } else {
      // Use Ethereal for development/testing
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    // Email HTML template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 40px 60px; border-radius: 16px 16px 0 0; text-align: center;">
                    <h1 style="color: white; font-size: 32px; margin: 0; font-weight: 800;">🎨 Overlay Banner API</h1>
                  </td>
                </tr>
                
                <!-- Body -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="color: #1a1a1a; font-size: 24px; margin: 0 0 16px 0; font-weight: 700;">Verify Your Email Address</h2>
                    
                    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                      Thank you for signing up! Please verify your email address to activate your account and start generating beautiful banner overlays.
                    </p>
                    
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
                      Click the button below to verify your email address:
                    </p>
                    
                    <!-- Verify Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 16px 0;">
                          <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                            Verify Email Address
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
                      Or copy and paste this link into your browser:
                    </p>
                    
                    <p style="background-color: #f3f4f6; padding: 12px; border-radius: 6px; word-break: break-all; font-size: 12px; color: #667eea; margin: 8px 0 0 0;">
                      ${verificationUrl}
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
                    
                    <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 0;">
                      <strong>Note:</strong> This verification link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 24px 40px; border-radius: 0 0 16px 16px; text-align: center;">
                    <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px 0;">
                      © ${new Date().getFullYear()} Overlay Banner API. All rights reserved.
                    </p>
                    <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                      Need help? Contact us at <a href="mailto:support@yourdomain.com" style="color: #667eea; text-decoration: none;">support@yourdomain.com</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Send email
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Overlay Banner API" <noreply@yourdomain.com>',
      to: email,
      subject: '✉️ Verify Your Email - Overlay Banner API',
      html: emailHtml,
      text: `Verify your email address\n\nThank you for signing up! Please verify your email address by clicking the link below:\n\n${verificationUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account, you can safely ignore this email.`,
    });

    console.log('✅ Verification email sent:', info.messageId);
    
    // If using Ethereal, log the preview URL
    if (!process.env.SMTP_HOST) {
      console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    return res.status(200).json({
      success: true,
      message: 'Verification email sent successfully',
      // Include preview URL in development
      ...(process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST && {
        previewUrl: nodemailer.getTestMessageUrl(info),
      }),
    });

  } catch (error) {
    console.error('Send verification error:', error);
    return res.status(500).json({ error: 'Failed to send verification email' });
  } finally {
    await prisma.$disconnect();
  }
}
