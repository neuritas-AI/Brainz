import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const session: any = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { password } = await request.json();
  const user = await prisma.user.findUnique({ where: { email: String(session.user.email) } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(String(password), 10) },
  });

  return NextResponse.json({ ok: true });
}
