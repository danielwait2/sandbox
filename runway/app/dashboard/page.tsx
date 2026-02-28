'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PeriodToggle from './components/PeriodToggle';
import SummaryStats from './components/SummaryStats';
import CategoryCard from './components/CategoryCard';
import SpendingAlertBanner from './components/SpendingAlertBanner';

type CategoryData = {
  name: string;
  spend: number;
  budget: number | null;
  itemCount: number;
};

type SummaryData = {
  period: string;
  totalSpend: number;
  receiptCount: number;
  topCategory: string;
  categories: CategoryData[];
};

function ScanButton({ onComplete }: { onComplete: () => void }) {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleScan = async () => {
    setScanning(true);
    setResult(null);
    try {
      const res = await fetch('/api/receipts/scan', { method: 'POST' });
      const json = await res.json() as { new?: number; parsed?: number; error?: string };
      if (!res.ok) {
        setResult(json.error ?? 'Pull failed');
      } else {
        const msg = `Found ${json.new ?? 0} new receipts, parsed ${json.parsed ?? 0}`;
        setResult(msg);
        if ((json.new ?? 0) > 0) {
          setTimeout(() => onComplete(), 2000);
        }
      }
    } catch {
      setResult('Pull failed — check console');
    }
    setScanning(false);
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleScan}
        disabled={scanning}
        className="inline-block bg-zinc-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-zinc-700 disabled:opacity-50"
      >
        {scanning ? 'Pulling...' : 'Pull Receipts from Email'}
      </button>
      {result && <p className="text-sm text-zinc-500">{result}</p>}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 animate-pulse">
      <div className="h-4 w-1/2 bg-zinc-200 rounded mb-2" />
      <div className="h-7 w-1/3 bg-zinc-200 rounded mb-4" />
      <div className="h-2 w-full bg-zinc-100 rounded" />
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [period, setPeriod] = useState('this_month');
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewCount, setReviewCount] = useState(0);

  const currentMonth = new Date().toISOString().slice(0, 7);

  const fetchSummary = async (p: string) => {
    setLoading(true);
    const res = await fetch(`/api/dashboard/summary?period=${p}`);
    if (res.ok) {
      const json = (await res.json()) as SummaryData;
      setData(json);
    }
    setLoading(false);
  };

  useEffect(() => {
    void fetchSummary(period);
    fetch('/api/review-queue')
      .then((r) => r.json())
      .then((j: { count: number }) => setReviewCount(j.count ?? 0))
      .catch(() => {});
  }, [period]);

  const handlePeriodChange = (p: string) => {
    setPeriod(p);
  };

  const handleBudgetSave = async (categoryName: string, amount: number) => {
    await fetch('/api/categories', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: categoryName, month: currentMonth, amount }),
    });
    await fetchSummary(period);
  };

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
        <div className="flex items-center gap-3">
        <ScanButton onComplete={() => fetchSummary(period)} />
        {reviewCount > 0 && (
          <a
            href="/review-queue"
            className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full hover:bg-yellow-200"
          >
            {reviewCount} items need review
          </a>
        )}
        </div>
      </div>

      <PeriodToggle period={period} onChange={handlePeriodChange} />

      {loading ? (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-zinc-200 bg-white p-5 animate-pulse">
                <div className="h-4 w-1/2 bg-zinc-200 rounded mb-2" />
                <div className="h-7 w-2/3 bg-zinc-200 rounded" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </>
      ) : data ? (
        <>
          {data.receiptCount === 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-10 text-center">
              <p className="text-zinc-600 text-lg mb-4">
                Connect Gmail and pull your receipts to get started
              </p>
              <ScanButton onComplete={() => fetchSummary(period)} />
            </div>
          ) : (
            <>
              <SpendingAlertBanner categories={data.categories} />
              <SummaryStats
                totalSpend={data.totalSpend}
                receiptCount={data.receiptCount}
                topCategory={data.topCategory}
              />
            </>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.categories.map((cat) => (
              <CategoryCard
                key={cat.name}
                name={cat.name}
                spend={cat.spend}
                budget={cat.budget}
                itemCount={cat.itemCount}
                onClick={() =>
                  router.push(
                    '/dashboard/category/' +
                      encodeURIComponent(cat.name) +
                      '?period=' +
                      encodeURIComponent(period)
                  )
                }
                onBudgetSave={(amount) => handleBudgetSave(cat.name, amount)}
              />
            ))}
          </div>
        </>
      ) : null}
    </main>
  );
}
