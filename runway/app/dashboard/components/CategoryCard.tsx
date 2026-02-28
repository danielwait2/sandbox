'use client';

import { useState } from 'react';

type Props = {
  name: string;
  spend: number;
  budget: number | null;
  itemCount: number;
  onClick: () => void;
  onBudgetSave?: (amount: number) => void;
};

function formatUSD(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

export default function CategoryCard({
  name,
  spend,
  budget,
  itemCount,
  onClick,
  onBudgetSave,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState(String(budget ?? ''));

  const hasBudget = budget !== null && budget > 0;
  const pct = hasBudget ? Math.min((spend / budget!) * 100, 100) : 0;

  let barColor = 'bg-gray-300';
  if (hasBudget) {
    const ratio = spend / budget!;
    if (ratio < 0.75) barColor = 'bg-green-500';
    else if (ratio <= 1) barColor = 'bg-yellow-500';
    else barColor = 'bg-red-500';
  }

  const handleSave = () => {
    const parsed = parseFloat(inputVal);
    if (!isNaN(parsed) && onBudgetSave) {
      onBudgetSave(parsed);
    }
    setEditing(false);
  };

  return (
    <div
      className="cursor-pointer rounded-xl border border-zinc-200 bg-white p-5 hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-zinc-900">{name}</span>
        <span className="text-sm text-zinc-500">{itemCount} items</span>
      </div>
      <p className="text-xl font-semibold text-zinc-900">{formatUSD(spend)}</p>

      <div className="mt-3">
        <div className="flex items-center gap-1 text-sm text-zinc-500 mb-1">
          <span>Budget:</span>
          {editing ? (
            <input
              type="number"
              className="w-24 border border-zinc-300 rounded px-1 py-0.5 text-sm text-zinc-900"
              value={inputVal}
              autoFocus
              onChange={(e) => setInputVal(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') setEditing(false);
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <>
              <span>{hasBudget ? formatUSD(budget!) : 'None'}</span>
              <button
                className="ml-1 text-zinc-400 hover:text-zinc-600"
                onClick={(e) => {
                  e.stopPropagation();
                  setInputVal(String(budget ?? ''));
                  setEditing(true);
                }}
                title="Edit budget"
              >
                ✏️
              </button>
            </>
          )}
        </div>
        <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
          <div
            className={`h-full rounded-full ${barColor}`}
            style={{ width: hasBudget ? `${pct}%` : '20%' }}
          />
        </div>
      </div>
    </div>
  );
}
