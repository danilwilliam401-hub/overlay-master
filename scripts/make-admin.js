/**
 * Script to promote a user to admin role
 * Usage: node scripts/make-admin.js <email>
 * Example: node scripts/make-admin.js danilwilliam401@gmail.com
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function makeAdmin(email) {
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, isAdmin: true },
    });

    if (!user) {
      console.error(`❌ Error: User with email "${email}" not found.`);
      console.log('\n💡 Tip: The user must sign in at least once before being promoted to admin.');
      process.exit(1);
    }

    if (user.isAdmin) {
      console.log(`✅ User "${email}" is already an admin.`);
      process.exit(0);
    }

    // Promote user to admin
    await prisma.user.update({
      where: { email },
      data: { isAdmin: true },
    });

    console.log(`\n✅ Success! User promoted to admin:\n`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name || 'Not set'}`);
    console.log(`   Admin: ✓ Yes\n`);
    console.log(`💡 The user can now access /admin/users to view all registered users.\n`);

  } catch (error) {
    console.error('❌ Error promoting user to admin:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('❌ Error: Email argument is required.\n');
  console.log('Usage: node scripts/make-admin.js <email>');
  console.log('Example: node scripts/make-admin.js danilwilliam401@gmail.com\n');
  process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.error(`❌ Error: Invalid email format: "${email}"\n`);
  process.exit(1);
}

makeAdmin(email);
