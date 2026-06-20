import { redirect } from 'next/navigation';

import BackToChatBar from '@/components/layout/BackToChatBar';
import ProfileCard from '@/components/profile/ProfileCard';
import LocalizedPageHeader from '@/components/shared/LocalizedPageHeader';
import LanguageSwitcher from '@/components/profile/LanguageSwitcher';
import { auth } from '@/lib/auth';

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <BackToChatBar />
      <div className="p-6">
        <div className="mx-auto flex max-w-4xl flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-glow">
          <LocalizedPageHeader titleKey="profilePageTitle" descriptionKey="profilePageDescription" />
          <LanguageSwitcher />
          <ProfileCard session={session} />
        </div>
      </div>
    </main>
  );
}
