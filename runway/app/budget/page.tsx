'use client';

import { useEffect, useState } from 'react';
import BudgetRow from '@/app/dashboard/components/BudgetRow';

const DEFAULT_CATEGORIES = [
  'Groceries', 'Household', 'Baby & Kids', 'Health & Wellness',
  'Personal Care', 'Electronics', 'Clothing & Apparel', 'Pet Supplies', 'Other',
];

type CategoryRow = {
  category: string;
  spent: number;
  budget: number;
  defaultAmount: number | null;
};

type SummaryData = {
  categories: { name: string; spend: number; budget: number | null }[];
};

type BudgetDefault = {
  category: string;
  amount: number;
};

export default function BudgetPage() {
  const [rows, setRows] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState('');

  const currentMonth = new Date().toISOString().slice(0, 7);

  const fetchData = async () => {
    setLoading(true);
    const [summaryRes, defaultsRes] = await Promise.all([
      fetch(`/api/dashboard/summary?period=${currentMonth}`),
      fetch('/api/budget-defaults'),
    ]);

    const summaryJson = summaryRes.ok ? ((await summaryRes.json()) as SummaryData) : { categories: [] };
    const defaultsJson = defaultsRes.ok ? ((await defaultsRes.json()) as { defaults: BudgetDefault[] }) : { defaults: [] };

    const spendMap = new Map(summaryJson.categories.map((c) => [c.name, { spent: c.spend, budget: c.budget ?? 0 }]));
    const defaultsMap = new Map(defaultsJson.defaults.map((d) => [d.category, d.amount]));

    const allCategories = [
      ...DEFAULT_CATEGORIES,
      ...defaultsJson.defaults.map((d) => d.category).filter((c) => !DEFAULT_CATEGORIES.includes(c)),
    ];
    summaryJson.categories.forEach((c) => {
      if (!allCategories.includes(c.name)) allCategories.push(c.name);
    });

    setRows(
      allCategories.map((cat) => ({
        category: cat,
        spent: spendMap.get(cat)?.spent ?? 0,
        budget: spendMap.get(cat)?.budget ?? defaultsMap.get(cat) ?? 0,
        defaultAmount: defaultsMap.has(cat) ? (defaultsMap.get(cat) ?? 0) : null,
      }))
    );

    setLoading(false);
  };

  useEffect(() => {
    void fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBudgetChange = async (category: string, amount: number) => {
    await fetch('/api/categories', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, month: currentMonth, amount }),
    });
    setRows((prev) => prev.map((r) => r.category === category ? { ...r, budget: amount } : r));
  };

  const handleDefaultToggle = async (category: string, amount: number | null) => {
    await fetch('/api/budget-defaults', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, amount }),
    });
    setRows((prev) => prev.map((r) => r.category === category ? { ...r, defaultAmount: amount } : r));
  };

  const handleDelete = async (category: string) => {
    await fetch('/api/budget-defaults', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, amount: null }),
    });
    setRows((prev) => prev.filter((r) => r.category !== category));
  };

  const handleMoveUp = (category: string) => {
    setRows((prev) => {
      const idx = prev.findIndex((r) => r.category === category);
      if (idx <= 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  };

  const handleMoveDown = (category: string) => {
    setRows((prev) => {
      const idx = prev.findIndex((r) => r.category === category);
      if (idx < 0 || idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  };

  const handleAddCategory = async () => {
    const cat = newCategory.trim();
    if (!cat || rows.some((r) => r.category.toLowerCase() === cat.toLowerCase())) return;
    await fetch('/api/budget-defaults', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: cat, amount: 0 }),
    });
    setRows((prev) => [...prev, { category: cat, spent: 0, budget: 0, defaultAmount: 0 }]);
    setNewCategory('');
  };

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Budget</h1>
        <p className="text-zinc-500 mt-1 text-sm">
          Set monthly targets, reorder categories, and add or remove any category.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-zinc-200 bg-white p-5 animate-pulse h-28" />
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {rows.map((row, i) => (
              <BudgetRow
                key={row.category}
                category={row.category}
                spent={row.spent}
                budget={row.budget}
                defaultAmount={row.defaultAmount}
                isFirst={i === 0}
                isLast={i === rows.length - 1}
                onBudgetChange={handleBudgetChange}
                onDefaultToggle={handleDefaultToggle}
                onDelete={handleDelete}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add a category…"
              className="flex-1 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') void handleAddCategory(); }}
            />
            <button
              className="bg-zinc-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-zinc-700 disabled:opacity-40"
              onClick={() => void handleAddCategory()}
              disabled={!newCategory.trim()}
            >
              Add
            </button>
          </div>
        </>
      )}
    </main>
  );
}
