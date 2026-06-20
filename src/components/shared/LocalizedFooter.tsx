"use client";

import { useTranslations } from '@/lib/i18n';

export default function LocalizedFooter() {
  const t = useTranslations();
  return <p className="text-sm text-brand-muted">{t.adminFooter}</p>;
}
