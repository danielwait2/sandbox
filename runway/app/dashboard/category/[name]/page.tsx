'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

type LineItem = {
  id: number;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category: string;
  subcategory: string | null;
};

function formatUSD(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
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
  const name = decodeURIComponent(params.name as string);
  const currentMonth = new Date().toISOString().slice(0, 7);

  const [items, setItems] = useState<LineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/items?category=${encodeURIComponent(name)}&month=${currentMonth}`)
      .then((r) => r.json())
      .then((j: { items: LineItem[] }) => setItems(j.items ?? []))
      .finally(() => setLoading(false));
  }, [name, currentMonth]);

  const totalSpend = items.reduce((sum, item) => sum + item.total_price, 0);

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-700">
        ← Back to Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-zinc-900">{name}</h1>
        {!loading && (
          <p className="text-zinc-500 mt-1">
            Total: {formatUSD(totalSpend)} &middot; {items.length} items
          </p>
        )}
      </div>

      <div>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
        ) : items.length === 0 ? (
          <p className="text-zinc-500">No items in this category for the current month.</p>
        ) : (
          <div className="divide-y divide-zinc-100">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between py-3">
                <div>
                  <p className="text-zinc-900 font-medium">{item.name}</p>
                  <p className="text-sm text-zinc-500">
                    Qty: {item.quantity} &times; {formatUSD(item.unit_price)}
                  </p>
                </div>
                <p className="font-semibold text-zinc-900">{formatUSD(item.total_price)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
