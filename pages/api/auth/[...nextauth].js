import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Initialize Prisma Client (singleton pattern)
const globalForPrisma = global;
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * NextAuth.js Configuration for Google OAuth
 * 
 * REQUIRED ENVIRONMENT VARIABLES:
 * - GOOGLE_CLIENT_ID: From Google Cloud Console (OAuth 2.0 credentials)
 * - GOOGLE_CLIENT_SECRET: From Google Cloud Console
 * - NEXTAUTH_SECRET: Random string for JWT encryption (generate with: openssl rand -base64 32)
 * - NEXTAUTH_URL: Your app's base URL (e.g., http://localhost:3000 or https://yourdomain.com)
 * - DATABASE_URL: Prisma database connection string
 * 
 * GOOGLE OAUTH SETUP:
 * 1. Go to https://console.cloud.google.com/apis/credentials
 * 2. Create OAuth 2.0 Client ID
 * 3. Add authorized redirect URIs:
 *    - http://localhost:3000/api/auth/callback/google (dev)
 *    - https://yourdomain.com/api/auth/callback/google (production)
 * 4. Copy Client ID and Client Secret to .env.local
 */

export const authOptions = {
  // Use Prisma adapter for database sessions
  adapter: PrismaAdapter(prisma),
  
  // OAuth providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() }
        });

        if (!user || !user.password) {
          throw new Error('Invalid email or password');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Invalid email or password');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      }
    })
  ],
  
  // Custom pages (commented out - using NextAuth default pages)
  // pages: {
  //   signIn: '/auth/signin',  // Optional: custom sign-in page
  //   error: '/auth/error',     // Optional: custom error page
  // },
  
  // Session strategy
  session: {
    strategy: 'jwt',  // Use JWT for credentials provider compatibility
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60,   // Update session every 24 hours
  },
  
  // Callbacks
  callbacks: {
    /**
     * JWT callback - called whenever a JWT is created or updated
     * Add custom fields to the token if needed
     */
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.userId = user.id;
        token.email = user.email;
        
        // Fetch additional user data from database
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { 
            isAdmin: true,
            emailVerified: true
          }
        });
        
        token.isAdmin = dbUser?.isAdmin || false;
        token.emailVerified = !!dbUser?.emailVerified;
      }
      return token;
    },
    
    /**
     * Session callback - called whenever a session is checked
     * Add custom fields to the session object
     */
    async session({ session, token }) {
      if (session?.user && token) {
        session.user.id = token.userId;
        session.user.isAdmin = token.isAdmin || false;
        session.user.emailVerified = token.emailVerified || false;
      }
      return session;
    },
    
    /**
     * Sign-in callback - control who can sign in
     * Return false to deny access
     */
    async signIn({ user, account, profile }) {
      // Auto-verify email for Google OAuth users
      if (account?.provider === 'google') {
        try {
          // Use upsert to handle both new and existing users
          await prisma.user.upsert({
            where: { email: user.email.toLowerCase() },
            update: { 
              emailVerified: new Date() 
            },
            create: {
              email: user.email.toLowerCase(),
              name: user.name,
              image: user.image,
              emailVerified: new Date()
            }
          });
          console.log(`✅ Auto-verified email for Google user: ${user.email}`);
        } catch (error) {
          console.error('Failed to auto-verify Google user email:', error);
        }
      }
      
      return true;
    },
    
    /**
     * Redirect callback - control where users are redirected after sign-in
     */
    async redirect({ url, baseUrl }) {
      // Redirect to dashboard after sign-in
      if (url === baseUrl + '/api/auth/signin') {
        return baseUrl + '/dashboard';
      }
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl + '/dashboard';
    }
  },
  
  // Events (optional logging)
  events: {
    async signIn({ user }) {
      console.log(`✅ User signed in: ${user.email}`);
    },
    async signOut({ session }) {
      console.log(`👋 User signed out`);
    },
    async createUser({ user }) {
      console.log(`🆕 New user created: ${user.email}`);
    }
  },
  
  // Custom pages
  pages: {
    signIn: '/signin',  // Custom sign-in page
  },
  
  // Debug mode (enable in development)
  debug: process.env.NODE_ENV === 'development',
  
  // Secret for JWT encryption
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);

/**
 * USAGE IN OTHER API ROUTES:
 * 
 * import { getServerSession } from 'next-auth/next';
 * import { authOptions } from './auth/[...nextauth]';
 * 
 * export default async function handler(req, res) {
 *   const session = await getServerSession(req, res, authOptions);
 *   
 *   if (!session) {
 *     return res.status(401).json({ error: 'Unauthorized' });
 *   }
 *   
 *   // Access user: session.user.id, session.user.email, session.user.name
 * }
 * 
 * USAGE IN PAGES (SSR):
 * 
 * export async function getServerSideProps(context) {
 *   const session = await getServerSession(context.req, context.res, authOptions);
 *   
 *   if (!session) {
 *     return {
 *       redirect: {
 *         destination: '/api/auth/signin',
 *         permanent: false,
 *       }
 *     };
 *   }
 *   
 *   return { props: { session } };
 * }
 * 
 * USAGE IN CLIENT COMPONENTS:
 * 
 * import { useSession, signIn, signOut } from 'next-auth/react';
 * 
 * function Component() {
 *   const { data: session, status } = useSession();
 *   
 *   if (status === 'loading') return <div>Loading...</div>;
 *   if (!session) return <button onClick={() => signIn('google')}>Sign In</button>;
 *   
 *   return <button onClick={() => signOut()}>Sign Out</button>;
 * }
 */
