import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

/**
 * POST /api/auth/signup
 * Create a new user account
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, password, captchaToken } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!email.match(/\S+@\S+\.\S+/)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Verify reCAPTCHA (if configured)
    if (process.env.RECAPTCHA_SECRET_KEY && captchaToken) {
      try {
        const verifyResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`,
        });

        const verifyData = await verifyResponse.json();

        if (!verifyData.success) {
          return res.status(400).json({ error: 'Captcha verification failed' });
        }
      } catch (captchaError) {
        console.error('Captcha verification error:', captchaError);
        // Continue without captcha verification if it fails (optional)
        // To make captcha mandatory, uncomment the line below:
        // return res.status(500).json({ error: 'Captcha verification failed' });
      }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        emailVerified: null, // Email not verified yet
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store verification token
    await prisma.verificationToken.create({
      data: {
        identifier: email.toLowerCase(),
        token,
        expires,
      },
    });

    // Send verification email
    try {
      const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;

      // Configure email transporter
      let transporter;
      
      if (process.env.SMTP_HOST) {
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
          <title>Verify Your Email</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 16px 16px 0 0; text-align: center;">
                      <h1 style="color: white; font-size: 32px; margin: 0; font-weight: 800;">🎨 Overlay Banner API</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="color: #1a1a1a; font-size: 24px; margin: 0 0 16px 0;">Welcome ${name}!</h2>
                      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                        Thank you for signing up! Please verify your email address to activate your account.
                      </p>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 16px 0;">
                            <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                              Verify Email Address
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="color: #6b7280; font-size: 14px; margin: 24px 0 0 0;">
                        Or copy and paste this link: <span style="color: #667eea; word-break: break-all;">${verificationUrl}</span>
                      </p>
                      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
                      <p style="color: #9ca3af; font-size: 13px; margin: 0;">
                        This link expires in 24 hours. If you didn't create this account, please ignore this email.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #f9fafb; padding: 24px; border-radius: 0 0 16px 16px; text-align: center;">
                      <p style="color: #6b7280; font-size: 12px; margin: 0;">
                        © ${new Date().getFullYear()} Overlay Banner API
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

      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || '"Overlay Banner API" <noreply@yourdomain.com>',
        to: email,
        subject: '✉️ Verify Your Email - Overlay Banner API',
        html: emailHtml,
        text: `Welcome ${name}!\n\nPlease verify your email address:\n${verificationUrl}\n\nThis link expires in 24 hours.`,
      });

      console.log('✅ Verification email sent:', info.messageId);
      
      // Log preview URL in development
      if (!process.env.SMTP_HOST) {
        console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
      }
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue even if email fails
    }

    return res.status(201).json({
      success: true,
      message: 'Account created successfully. Please check your email to verify your account.',
      user,
    });

  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Failed to create account. Please try again.' });
  } finally {
    await prisma.$disconnect();
  }
}
