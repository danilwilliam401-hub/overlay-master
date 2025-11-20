const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: { 
        email: true, 
        name: true, 
        isAdmin: true, 
        createdAt: true 
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('\n📊 Registered Users:\n');
    
    if (users.length === 0) {
      console.log('No users found. Sign in first to create an account.\n');
    } else {
      users.forEach((user, index) => {
        const adminBadge = user.isAdmin ? '✓ Admin' : '✗ User';
        const date = new Date(user.createdAt).toLocaleString();
        console.log(`${index + 1}. ${user.email}`);
        console.log(`   Name: ${user.name || 'Not set'}`);
        console.log(`   Role: ${adminBadge}`);
        console.log(`   Registered: ${date}\n`);
      });
      console.log(`Total: ${users.length} user(s)\n`);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
