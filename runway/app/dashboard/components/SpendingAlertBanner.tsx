'use client';

import { useEffect, useState } from 'react';

interface SpendingAlertBannerProps {
  categories: Array<{ name: string; spend: number; budget: number | null }>;
}

function formatUSD(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

export default function SpendingAlertBanner({ categories }: SpendingAlertBannerProps) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('runway_alerts_dismissed');
    setDismissed(stored === todayString());
  }, []);

  const triggered = categories.filter(
    (cat) => cat.budget !== null && cat.budget > 0 && cat.spend / cat.budget >= 0.9
  );

  if (dismissed || triggered.length === 0) return null;

  const handleDismiss = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('runway_alerts_dismissed', todayString());
    }
    setDismissed(true);
  };

  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 px-5 py-4 flex items-start justify-between gap-4">
      <div className="space-y-1">
        {triggered.map((cat) => {
          const pct = Math.round((cat.spend / (cat.budget ?? 1)) * 100);
          const remaining = (cat.budget ?? 0) - cat.spend;
          return (
            <p key={cat.name} className="text-sm text-amber-800">
              <span className="font-semibold">{cat.name}</span> is at {pct}% of your{' '}
              {formatUSD(cat.budget ?? 0)} budget this month &mdash;{' '}
              {formatUSD(remaining < 0 ? 0 : remaining)} left
            </p>
          );
        })}
      </div>
      <button
        onClick={handleDismiss}
        className="text-amber-600 hover:text-amber-800 text-lg leading-none flex-shrink-0"
        aria-label="Dismiss alerts"
      >
        &times;
      </button>
    </div>
  );
}
