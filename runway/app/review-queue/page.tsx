'use client';

import { useEffect, useState } from 'react';
import ReviewCard from './components/ReviewCard';

type Item = {
  id: number;
  name: string;
  category: string;
  subcategory: string | null;
  confidence: number;
  total_price: number;
  retailer: string;
};

export default function ReviewQueuePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/review-queue')
      .then((r) => r.json())
      .then((j: { items: Item[] }) => setItems(j.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleConfirm = async (item: Item) => {
    removeItem(item.id);
    await fetch(`/api/items/${item.id}/categorize`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: item.category, subcategory: item.subcategory }),
    });
  };

  const handleRecategorize = async (item: Item, cat: string, sub: string | null) => {
    removeItem(item.id);
    await fetch(`/api/items/${item.id}/categorize`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: cat, subcategory: sub }),
    });
  };

  const handleSkip = async (item: Item) => {
    removeItem(item.id);
    await fetch(`/api/items/${item.id}/skip`, { method: 'PATCH' });
  };

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Review Queue</h1>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-zinc-200 bg-white p-5 animate-pulse h-32" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-10 text-center">
          <p className="text-zinc-600 text-lg">All items reviewed! Your spending data is up to date.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <ReviewCard
              key={item.id}
              item={item}
              onConfirm={() => handleConfirm(item)}
              onRecategorize={(cat, sub) => handleRecategorize(item, cat, sub)}
              onSkip={() => handleSkip(item)}
            />
          ))}
        </div>
      )}
    </main>
  );
}
