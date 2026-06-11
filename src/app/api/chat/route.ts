import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getRateLimiter } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const session: any = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { message } = await request.json();
  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: String(session.user.email) } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const limiter = getRateLimiter(user.plan);
  const identifier = `user:${user.id}`;
  const { success, limit, remaining, reset } = await limiter.limit(identifier);
  if (!success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const month = new Date().toISOString().slice(0, 7);
  const usage = await prisma.usage.upsert({
    where: { userId_month: { userId: user.id, month } },
    update: { requestCount: { increment: 1 } },
    create: { userId: user.id, month, requestCount: 1 },
  });

  if (user.plan === 'FREE' && usage.requestCount > 20) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  if (user.plan === 'PRO' && usage.requestCount > 200) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const ollamaUrl = process.env.OLLAMA_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!ollamaUrl) {
    return NextResponse.json({ response: 'AI backend is not configured.' }, { status: 200 });
  }

  const response = await fetch(`${ollamaUrl.replace(/\/+$/, '')}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'llama3', prompt: message, stream: false }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'Backend unavailable' }, { status: 502 });
  }

  const data = await response.json();

  await prisma.conversation.create({
    data: {
      userId: user.id,
      messages: JSON.stringify([
        { role: 'user', content: message },
        { role: 'assistant', content: data.response || 'No response returned.' },
      ]),
    },
  });

  return NextResponse.json({ response: data.response || 'No response returned.' });
}
