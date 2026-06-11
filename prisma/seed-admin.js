const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'chat@neuritas-ai.com';
  const password = 'NeuritasAdmin2026!';
  const passwordHash = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: { passwordHash, role: 'ADMIN', plan: 'TEAM' },
    });
    console.log('Updated admin user:', email);
  } else {
    await prisma.user.create({
      data: { email, passwordHash, role: 'ADMIN', plan: 'TEAM' },
    });
    console.log('Created admin user:', email);
  }

  console.log('Admin password:', password);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
