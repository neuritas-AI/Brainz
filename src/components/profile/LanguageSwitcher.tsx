"use client";

import { useTranslations, useLocale } from '@/lib/i18n';

export default function LanguageSwitcher() {
  const t = useTranslations();
  const { locale, setLocale } = useLocale();

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-soft">
      <div className="mb-3 text-sm font-semibold text-brand-text">{t.languageSettings}</div>
      <label className="text-sm text-slate-300">
        {t.selectLanguage}
        <select
          value={locale}
          onChange={(event) => setLocale(event.target.value as 'en' | 'nl')}
          className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-brand-text outline-none"
        >
          <option value="en">English</option>
          <option value="nl">Nederlands</option>
        </select>
      </label>
    </div>
  );
}
