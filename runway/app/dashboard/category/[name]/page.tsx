'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { normalizeItemName } from '@/lib/normalizeItemName';

type LineItem = {
  id: number;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category: string;
  subcategory: string | null;
};

type PriceHistoryEntry = {
  id: number;
  unit_price: number;
  date: string;
};

type PriceTrend = {
  direction: 'up' | 'down' | 'stable';
  diff: number;
};

function formatUSD(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

function resolveMonth(period: string): string {
  const now = new Date();
  if (period === 'last_month') {
    const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return d.toISOString().slice(0, 7);
  }
  if (period === 'this_month') {
    return now.toISOString().slice(0, 7);
  }
  // assume it's already a YYYY-MM string
  return period;
}

function SkeletonRow() {
  return (
    <div className="flex justify-between py-3 border-b border-zinc-100 animate-pulse">
      <div className="h-4 w-1/2 bg-zinc-200 rounded" />
      <div className="h-4 w-1/4 bg-zinc-200 rounded" />
    </div>
  );
}

export default function CategoryDrillDownPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const name = decodeURIComponent(params.name as string);

  const period = searchParams.get('period') ?? 'this_month';
  const month = resolveMonth(period);

  const [items, setItems] = useState<LineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [trendMap, setTrendMap] = useState<Map<string, PriceTrend | null>>(new Map());

  useEffect(() => {
    fetch(`/api/items?category=${encodeURIComponent(name)}&month=${month}`)
      .then((r) => r.json())
      .then((j: { items: LineItem[] }) => {
        const fetched = j.items ?? [];
        setItems(fetched);
        return fetched;
      })
      .then(async (fetched) => {
        const uniqueNames = [...new Set(fetched.map((i) => normalizeItemName(i.name)))];
        const historyResults = await Promise.all(
          uniqueNames.map((n) =>
            fetch(`/api/item-history?name=${encodeURIComponent(n)}`)
              .then((r) => r.json())
              .then((j: { entries: PriceHistoryEntry[] }) => ({ normalized: n, entries: j.entries ?? [] }))
          )
        );

        const map = new Map<string, PriceTrend | null>();
        for (const { normalized, entries } of historyResults) {
          if (entries.length < 2) {
            map.set(normalized, null);
            continue;
          }
          const latest = entries[entries.length - 1].unit_price;
          const prev = entries[entries.length - 2].unit_price;
          const diff = latest - prev;
          if (Math.abs(diff) < 0.005) {
            map.set(normalized, { direction: 'stable', diff: 0 });
          } else if (diff > 0) {
            map.set(normalized, { direction: 'up', diff });
          } else {
            map.set(normalized, { direction: 'down', diff: Math.abs(diff) });
          }
        }
        setTrendMap(map);
      })
      .finally(() => setLoading(false));
  }, [name, month]);

  const totalSpend = items.reduce((sum, item) => sum + item.total_price, 0);

  const monthLabel = new Date(month + '-01').toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-700">
        ← Back to Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-zinc-900">{name}</h1>
        {!loading && (
          <p className="text-zinc-500 mt-1">
            Total: {formatUSD(totalSpend)} &middot; {items.length} items &middot; {monthLabel}
          </p>
        )}
      </div>

      <div>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
        ) : items.length === 0 ? (
          <p className="text-zinc-500">No items in this category for {monthLabel}.</p>
        ) : (
          <div className="divide-y divide-zinc-100">
            {items.map((item) => {
              const normalized = normalizeItemName(item.name);
              const trend = trendMap.get(normalized) ?? null;
              return (
                <div key={item.id} className="flex justify-between py-3">
                  <div>
                    <p className="text-zinc-900 font-medium">{item.name}</p>
                    <p className="text-sm text-zinc-500">
                      Qty: {item.quantity} &times; {formatUSD(item.unit_price)}
                    </p>
                    {trend && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {trend.direction === 'stable'
                          ? 'Stable'
                          : trend.direction === 'up'
                          ? `↑ ${formatUSD(trend.diff)} since last purchase`
                          : `↓ ${formatUSD(trend.diff)} since last purchase`}
                      </p>
                    )}
                  </div>
                  <p className="font-semibold text-zinc-900">{formatUSD(item.total_price)}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
