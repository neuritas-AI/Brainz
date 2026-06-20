'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { I18nProvider } from '@/lib/i18n';

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <I18nProvider>{children}</I18nProvider>
    </NextAuthSessionProvider>
  );
}
