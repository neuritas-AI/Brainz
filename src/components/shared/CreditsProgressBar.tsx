'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from '@/lib/i18n';

export default function CreditsProgressBar() {
  const t = useTranslations();
  const [credits, setCredits] = useState(0);
  const [limit, setLimit] = useState(100);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCredits() {
      setLoading(true);
      try {
        const response = await fetch('/api/user/credits');
        const data = await response.json();
        if (response.ok) {
          setCredits(data.credits ?? 0);
          setLimit(data.limit ?? 100);
        }
      } finally {
        setLoading(false);
      }
    }

    loadCredits();
  }, []);

  const usage = limit > 0 ? Math.min(1, credits / limit) : 0;

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-brand-muted">{t.creditsRemaining}</p>
          <p className="mt-1 text-sm font-semibold text-brand-text">{credits} / {limit}</p>
        </div>
        {loading ? <span className="text-sm text-slate-400">Loading…</span> : null}
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-950">
        <div className="h-full rounded-full bg-brand-blue transition-all" style={{ width: `${usage * 100}%` }} />
      </div>
      <p className="mt-3 text-xs text-brand-muted">{Math.max(0, limit - credits)} {t.creditsLeft}</p>
    </section>
  );
}
