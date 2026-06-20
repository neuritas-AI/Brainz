import type { DefaultSession } from 'next-auth';

type Locale = 'en' | 'nl';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id?: string;
      role?: string;
      plan?: string;
      locale?: Locale;
    };
  }

  interface User {
    id: string;
    role?: string;
    plan?: string;
    locale?: Locale;
  }
}
