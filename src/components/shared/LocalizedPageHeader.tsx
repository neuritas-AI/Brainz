"use client";

import { useTranslations } from '@/lib/i18n';

type LocalizedPageHeaderProps = {
  titleKey: 'profilePageTitle' | 'settingsPageTitle';
  descriptionKey: 'profilePageDescription' | 'settingsPageDescription';
};

export default function LocalizedPageHeader({ titleKey, descriptionKey }: LocalizedPageHeaderProps) {
  const t = useTranslations();

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.35em] text-brand-muted">{titleKey === 'profilePageTitle' ? t.profile : t.settings}</p>
      <h1 className="text-2xl font-semibold">{t[titleKey]}</h1>
      <p className="text-slate-300">{t[descriptionKey]}</p>
    </div>
  );
}
