'use client';

import { useState } from 'react';

const DEFAULT_CATEGORIES = [
  'Groceries',
  'Household',
  'Baby & Kids',
  'Health & Wellness',
  'Personal Care',
  'Electronics',
  'Clothing & Apparel',
  'Pet Supplies',
  'Other',
];

type Item = {
  id: number;
  name: string;
  category: string;
  subcategory: string | null;
  confidence: number;
  total_price: number;
  retailer: string;
};

type Props = {
  item: Item;
  onConfirm: () => void;
  onRecategorize: (cat: string, sub: string | null) => void;
  onSkip: () => void;
};

export default function ReviewCard({ item, onConfirm, onRecategorize, onSkip }: Props) {
  const [recatOpen, setRecatOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState(item.category);
  const [subInput, setSubInput] = useState(item.subcategory ?? '');

  const pct = Math.round(item.confidence * 100);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-zinc-900">{item.name}</p>
          <p className="text-sm text-zinc-500">{item.retailer}</p>
        </div>
        <span className="text-sm text-zinc-400">{pct}% confident</span>
      </div>

      <div className="text-sm text-zinc-700">
        <span className="font-medium">Category:</span> {item.category}
        {item.subcategory && <span> / {item.subcategory}</span>}
      </div>

      <p className="text-sm font-semibold text-zinc-900">
        ${item.total_price.toFixed(2)}
      </p>

      {recatOpen && (
        <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
          <select
            className="w-full border border-zinc-300 rounded px-2 py-1 text-sm"
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
          >
            {DEFAULT_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Subcategory (optional)"
            className="w-full border border-zinc-300 rounded px-2 py-1 text-sm"
            value={subInput}
            onChange={(e) => setSubInput(e.target.value)}
          />
          <button
            className="w-full bg-blue-600 text-white rounded px-3 py-1.5 text-sm font-medium hover:bg-blue-700"
            onClick={() => {
              onRecategorize(selectedCat, subInput.trim() || null);
              setRecatOpen(false);
            }}
          >
            Save
          </button>
        </div>
      )}

      {!recatOpen && (
        <div className="flex gap-2">
          <button
            className="flex-1 bg-green-600 text-white rounded px-3 py-1.5 text-sm font-medium hover:bg-green-700"
            onClick={onConfirm}
          >
            Confirm
          </button>
          <button
            className="flex-1 bg-blue-600 text-white rounded px-3 py-1.5 text-sm font-medium hover:bg-blue-700"
            onClick={() => setRecatOpen(true)}
          >
            Recategorize
          </button>
          <button
            className="flex-1 bg-zinc-200 text-zinc-700 rounded px-3 py-1.5 text-sm font-medium hover:bg-zinc-300"
            onClick={onSkip}
          >
            Skip
          </button>
        </div>
      )}
    </div>
  );
}
