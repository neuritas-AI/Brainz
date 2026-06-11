import { redirect } from 'next/navigation';

import ChatShell from '@/components/layout/ChatShell';
import { auth } from '@/lib/auth';

export default async function ChatPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return <ChatShell />;
}
