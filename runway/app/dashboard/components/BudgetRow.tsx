'use client';

import { useState } from 'react';

interface BudgetRowProps {
  category: string;
  spent: number;
  budget: number;
  defaultAmount: number | null;
  isFirst: boolean;
  isLast: boolean;
  onBudgetChange: (category: string, amount: number) => void;
  onDefaultToggle: (category: string, amount: number | null) => void;
  onDelete: (category: string) => void;
  onMoveUp: (category: string) => void;
  onMoveDown: (category: string) => void;
}

function formatUSD(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

export default function BudgetRow({
  category,
  spent,
  budget,
  defaultAmount,
  isFirst,
  isLast,
  onBudgetChange,
  onDefaultToggle,
  onDelete,
  onMoveUp,
  onMoveDown,
}: BudgetRowProps) {
  const [inputValue, setInputValue] = useState(budget > 0 ? String(budget) : '');
  const isDefault = defaultAmount !== null;

  const pct = budget > 0 ? Math.min(spent / budget, 1) : 0;
  const barColor =
    pct >= 1 ? 'bg-red-500' : pct >= 0.9 ? 'bg-amber-400' : 'bg-green-500';

  const handleBlur = () => {
    const parsed = parseFloat(inputValue);
    if (!isNaN(parsed) && parsed >= 0) {
      onBudgetChange(category, parsed);
    }
  };

  const handleDefaultToggle = (checked: boolean) => {
    const current = parseFloat(inputValue);
    if (checked) {
      onDefaultToggle(category, isNaN(current) ? budget : current);
    } else {
      onDefaultToggle(category, null);
    }
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <div className="flex flex-col">
            <button
              onClick={() => onMoveUp(category)}
              disabled={isFirst}
              className="text-zinc-300 hover:text-zinc-600 disabled:opacity-20 leading-none text-xs"
              aria-label="Move up"
            >
              ▲
            </button>
            <button
              onClick={() => onMoveDown(category)}
              disabled={isLast}
              className="text-zinc-300 hover:text-zinc-600 disabled:opacity-20 leading-none text-xs"
              aria-label="Move down"
            >
              ▼
            </button>
          </div>
          <span className="font-medium text-zinc-900">{category}</span>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-zinc-500 cursor-pointer">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => handleDefaultToggle(e.target.checked)}
              className="accent-zinc-900"
            />
            Set as default
          </label>
          <button
            onClick={() => onDelete(category)}
            className="text-xs text-red-400 hover:text-red-600"
            aria-label="Delete category"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="w-full bg-zinc-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${barColor}`}
          style={{ width: `${pct * 100}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-500">
          {budget > 0
            ? `${formatUSD(spent)} spent of ${formatUSD(budget)}`
            : 'No budget set'}
        </span>
        <div className="flex items-center gap-1">
          <span className="text-zinc-400">$</span>
          <input
            type="number"
            min="0"
            step="1"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleBlur}
            placeholder="0"
            className="w-20 border border-zinc-200 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-zinc-400"
          />
        </div>
      </div>
    </div>
  );
}
