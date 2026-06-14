import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const session: any = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { profileName, password } = await request.json();
  const user = await prisma.user.findUnique({ where: { email: String(session.user.email) } });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const updates: any = {};
  if (typeof profileName === 'string' && profileName.trim()) {
    updates.profileName = profileName.trim();
  }
  if (typeof password === 'string' && password.trim()) {
    updates.passwordHash = await bcrypt.hash(password, 10);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: updates,
  });

  return NextResponse.json({ ok: true });
}
