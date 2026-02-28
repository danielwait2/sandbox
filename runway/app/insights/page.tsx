'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type FrequentItem = { name: string; count: number; totalSpent: number };
type ExpensiveItem = { name: string; totalPrice: number; retailer: string; date: string };
type CategoryTrend = { category: string; currentSpend: number; previousSpend: number; changePercent: number };
type DuplicatePurchase = { name: string; occurrences: number; dates: string[]; totalSpent: number };
type AnnualizedCategory = { category: string; weeklyAvg: number; annualProjection: number };
type BulkBuySuggestion = { name: string; count: number; totalSpent: number; avgPrice: number };

type InsightsData = {
  frequentItems: FrequentItem[];
  expensiveItems: ExpensiveItem[];
  categoryTrends: CategoryTrend[];
  duplicates: DuplicatePurchase[];
  annualized: AnnualizedCategory[];
  bulkBuySuggestions: BulkBuySuggestion[];
};

export default function InsightsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [tips, setTips] = useState<string[] | null>(null);
  const [tipsLoading, setTipsLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/signin');
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    setLoading(true);
    fetch(`/api/insights?month=${month}`)
      .then((res) => res.json())
      .then((d) => setData(d as InsightsData))
      .finally(() => setLoading(false));
  }, [status, month]);

  const fetchTips = async () => {
    setTipsLoading(true);
    try {
      const res = await fetch('/api/insights/tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month }),
      });
      const result = await res.json() as { tips: string[] };
      setTips(result.tips);
    } finally {
      setTipsLoading(false);
    }
  };

  if (status === 'loading' || loading) return null;
  if (!session) return null;

  const isEmpty =
    !data ||
    (data.frequentItems.length === 0 &&
      data.expensiveItems.length === 0 &&
      data.categoryTrends.length === 0);

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Insights</h1>
        <input
          type="month"
          value={month}
          onChange={(e) => { setMonth(e.target.value); setTips(null); }}
          className="rounded border border-zinc-300 px-3 py-1.5 text-sm"
        />
      </div>

      {isEmpty ? (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-12 text-center">
          <p className="text-zinc-500 mb-2">No spending data yet for {month}.</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">
            Go to Dashboard to scan your Gmail
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Category Trends */}
          {data!.categoryTrends.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-zinc-800 mb-4">Spending Trends</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {data!.categoryTrends.map((t) => (
                  <div key={t.category} className="rounded-lg border border-zinc-200 bg-white p-4">
                    <p className="text-sm font-medium text-zinc-700">{t.category}</p>
                    <p className="text-xl font-bold text-zinc-900 mt-1">${t.currentSpend.toFixed(2)}</p>
                    <p className={`text-sm mt-1 ${t.changePercent > 0 ? 'text-red-600' : t.changePercent < 0 ? 'text-green-600' : 'text-zinc-400'}`}>
                      {t.changePercent > 0 ? '\u2191' : t.changePercent < 0 ? '\u2193' : '\u2192'}{' '}
                      {Math.abs(t.changePercent)}% vs last month
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Top Frequent Items */}
          {data!.frequentItems.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-zinc-800 mb-4">Top 5 Frequent Items</h2>
              <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 text-zinc-600">
                    <tr>
                      <th className="text-left px-4 py-2">#</th>
                      <th className="text-left px-4 py-2">Item</th>
                      <th className="text-right px-4 py-2">Times Purchased</th>
                      <th className="text-right px-4 py-2">Total Spent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data!.frequentItems.map((item, i) => (
                      <tr key={item.name} className="border-t border-zinc-100">
                        <td className="px-4 py-2 text-zinc-400">{i + 1}</td>
                        <td className="px-4 py-2 text-zinc-900 font-medium">{item.name}</td>
                        <td className="px-4 py-2 text-right text-zinc-700">{item.count}</td>
                        <td className="px-4 py-2 text-right text-zinc-700">${item.totalSpent.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Top Expensive Items */}
          {data!.expensiveItems.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-zinc-800 mb-4">Top 5 Most Expensive Items</h2>
              <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 text-zinc-600">
                    <tr>
                      <th className="text-left px-4 py-2">#</th>
                      <th className="text-left px-4 py-2">Item</th>
                      <th className="text-right px-4 py-2">Price</th>
                      <th className="text-left px-4 py-2">Retailer</th>
                      <th className="text-left px-4 py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data!.expensiveItems.map((item, i) => (
                      <tr key={`${item.name}-${item.date}`} className="border-t border-zinc-100">
                        <td className="px-4 py-2 text-zinc-400">{i + 1}</td>
                        <td className="px-4 py-2 text-zinc-900 font-medium">{item.name}</td>
                        <td className="px-4 py-2 text-right text-zinc-700">${item.totalPrice.toFixed(2)}</td>
                        <td className="px-4 py-2 text-zinc-700">{item.retailer}</td>
                        <td className="px-4 py-2 text-zinc-500">{item.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Duplicate Purchase Alerts */}
          {data!.duplicates.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-zinc-800 mb-4">Possible Duplicate Purchases</h2>
              <div className="space-y-3">
                {data!.duplicates.map((d) => (
                  <div key={d.name} className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-medium text-amber-900">
                      {d.name} purchased {d.occurrences} times within a week
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                      Dates: {d.dates.join(', ')} &middot; Total: ${d.totalSpent.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Annualized Projections */}
          {data!.annualized.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-zinc-800 mb-4">Annualized Projections</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {data!.annualized.slice(0, 6).map((a) => (
                  <div key={a.category} className="rounded-lg border border-zinc-200 bg-white p-4">
                    <p className="text-sm font-medium text-zinc-700">{a.category}</p>
                    <p className="text-lg font-bold text-zinc-900 mt-1">
                      ${a.weeklyAvg.toFixed(2)}/week
                    </p>
                    <p className="text-sm text-zinc-500 mt-1">
                      ~${a.annualProjection.toFixed(2)}/year
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Bulk Buy Suggestions */}
          {data!.bulkBuySuggestions.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-zinc-800 mb-4">Bulk Buy Suggestions</h2>
              <div className="space-y-3">
                {data!.bulkBuySuggestions.map((s) => (
                  <div key={s.name} className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <p className="text-sm font-medium text-blue-900">
                      You bought <span className="font-bold">{s.name}</span> {s.count} times this month
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      Avg ${s.avgPrice.toFixed(2)} each &middot; Total ${s.totalSpent.toFixed(2)} &mdash; consider buying in bulk
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* AI Tips */}
          <section>
            <h2 className="text-lg font-semibold text-zinc-800 mb-4">AI Savings Tips</h2>
            {tips ? (
              <div className="rounded-lg border border-zinc-200 bg-white p-4 space-y-3">
                {tips.map((tip, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-green-600 font-bold text-sm mt-0.5">{i + 1}.</span>
                    <p className="text-sm text-zinc-700">{tip}</p>
                  </div>
                ))}
              </div>
            ) : (
              <button
                onClick={fetchTips}
                disabled={tipsLoading}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
              >
                {tipsLoading ? 'Generating...' : 'Get AI Tips'}
              </button>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
