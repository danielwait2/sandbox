'use client';

import { useEffect, useState } from 'react';
import BudgetRow from '@/app/dashboard/components/BudgetRow';

type CategoryData = {
  name: string;
  spend: number;
  budget: number | null;
  itemCount: number;
};

type SummaryData = {
  categories: CategoryData[];
};

type BudgetDefault = {
  category: string;
  amount: number;
};

export default function BudgetPage() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [defaults, setDefaults] = useState<BudgetDefault[]>([]);
  const [loading, setLoading] = useState(true);

  const currentMonth = new Date().toISOString().slice(0, 7);

  const fetchData = async () => {
    setLoading(true);
    const [summaryRes, defaultsRes] = await Promise.all([
      fetch(`/api/dashboard/summary?period=${currentMonth}`),
      fetch('/api/budget-defaults'),
    ]);

    if (summaryRes.ok) {
      const json = (await summaryRes.json()) as SummaryData;
      setCategories(json.categories ?? []);
    }

    if (defaultsRes.ok) {
      const json = (await defaultsRes.json()) as { defaults: BudgetDefault[] };
      setDefaults(json.defaults ?? []);
    }

    setLoading(false);
  };

  useEffect(() => {
    void fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const defaultsMap = new Map(defaults.map((d) => [d.category, d.amount]));

  const handleBudgetChange = async (category: string, amount: number) => {
    await fetch('/api/categories', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, month: currentMonth, amount }),
    });
    await fetchData();
  };

  const handleDefaultToggle = async (category: string, amount: number | null) => {
    await fetch('/api/budget-defaults', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, amount }),
    });
    await fetchData();
  };

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Budget</h1>
        <p className="text-zinc-500 mt-1 text-sm">
          Set monthly spending targets by category. Enable &quot;Set as default&quot; to auto-apply each month.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-zinc-200 bg-white p-5 animate-pulse h-28"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => (
            <BudgetRow
              key={cat.name}
              category={cat.name}
              spent={cat.spend}
              budget={cat.budget ?? 0}
              defaultAmount={defaultsMap.get(cat.name) ?? null}
              onBudgetChange={handleBudgetChange}
              onDefaultToggle={handleDefaultToggle}
            />
          ))}
        </div>
      )}
    </main>
  );
}
