import { redirect } from 'next/navigation';

import BackToChatBar from '@/components/layout/BackToChatBar';
import UserManagementPanel from '@/components/admin/UserManagementPanel';
import ModelManagementPanel from '@/components/admin/ModelManagementPanel';
import CreditsDashboard from '@/components/admin/CreditsDashboard';
import LocalizedPageHeader from '@/components/shared/LocalizedPageHeader';
import LocalizedFooter from '@/components/shared/LocalizedFooter';
import LanguageSwitcher from '@/components/profile/LanguageSwitcher';
import { auth } from '@/lib/auth';

export default async function SettingsPage() {
  const session = await auth();
  const role = (session?.user as any)?.role || 'USER';

  if (!session?.user) {
    redirect('/login');
  }

  if (role !== 'ADMIN') {
    redirect('/chat');
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <BackToChatBar />
      <div className="p-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-glow">
          <LocalizedPageHeader titleKey="settingsPageTitle" descriptionKey="settingsPageDescription" />
          <LanguageSwitcher />
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <UserManagementPanel />
              <ModelManagementPanel />
            </div>
            <div className="space-y-6">
              <CreditsDashboard />
            </div>
          </div>

          <LocalizedFooter />
        </div>
      </div>
    </main>
  );
}
