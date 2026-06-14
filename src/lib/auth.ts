import NextAuth from 'next-auth';
import { getServerSession } from 'next-auth/next';

import { authOptions } from './auth.config';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

export async function auth() {
  return getServerSession(authOptions);
}
