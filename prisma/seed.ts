import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'chat@neuritas-ai.com';
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existing) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await bcrypt.hash('ChangeMe123!', 10),
        role: 'ADMIN',
        plan: 'ENTERPRISE',
      },
    });
  }
}

main().finally(async () => {
  await prisma.$disconnect();
});
