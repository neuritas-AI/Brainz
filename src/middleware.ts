import { NextResponse } from 'next/server';
import NextAuth from 'next-auth';

import { authOptions } from '@/lib/auth';

const { auth: middleware } = NextAuth(authOptions);

export default middleware((req) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/login') || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  if (!req.auth?.user) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/chat/:path*', '/admin/:path*', '/pricing/:path*'],
};
