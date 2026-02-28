'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type ReceiptSummary = {
  id: string;
  retailer: string;
  transaction_date: string;
  subtotal: number | null;
  tax: number | null;
  total: number;
  order_number: string | null;
  item_count: number;
  contributor_user_id: string;
  contributor_role: 'owner' | 'member';
};

function formatUSD(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between py-4 border-b border-zinc-100 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 w-40 bg-zinc-200 rounded" />
        <div className="h-3 w-24 bg-zinc-200 rounded" />
      </div>
      <div className="h-4 w-16 bg-zinc-200 rounded" />
    </div>
  );
}

export default function ReceiptsPage() {
  const router = useRouter();
  const [receipts, setReceipts] = useState<ReceiptSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [retailerFilter, setRetailerFilter] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/receipts')
      .then((r) => r.json())
      .then((j: { receipts: ReceiptSummary[] }) => setReceipts(j.receipts ?? []))
      .finally(() => setLoading(false));
  }, []);

  const retailers = useMemo(() => Array.from(new Set(receipts.map((r) => r.retailer))).sort(), [receipts]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return receipts.filter((r) => {
      if (retailerFilter && r.retailer !== retailerFilter) return false;
      if (q && !r.retailer.toLowerCase().includes(q) && !(r.order_number ?? '').toLowerCase().includes(q) && !r.transaction_date.includes(q)) return false;
      return true;
    });
  }, [receipts, retailerFilter, search]);

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Receipts</h1>

      {!loading && receipts.length > 0 && (
        <div className="space-y-3">
          {/* Search */}
          <input
            type="text"
            placeholder="Search by retailer or order number…"
            className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Retailer chips */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setRetailerFilter(null)}
              className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                retailerFilter === null
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
              }`}
            >
              All
            </button>
            {retailers.map((r) => (
              <button
                key={r}
                onClick={() => setRetailerFilter(retailerFilter === r ? null : r)}
                className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                  retailerFilter === r
                    ? 'bg-zinc-900 text-white border-zinc-900'
                    : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-12 text-center">
            {receipts.length === 0 ? (
              <>
                <p className="text-zinc-500 mb-2">No receipts yet — pull your receipts from email to get started</p>
                <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">Go to Dashboard</Link>
              </>
            ) : (
              <p className="text-zinc-500">No receipts match your filters.</p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {filtered.map((receipt) => (
              <button
                key={receipt.id}
                onClick={() => router.push(`/receipts/${receipt.id}`)}
                className="w-full flex items-center justify-between py-4 text-left hover:bg-zinc-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-zinc-900">{receipt.retailer}</p>
                  <p className="text-sm text-zinc-500">
                    {formatDate(receipt.transaction_date)} &middot; {receipt.item_count} item{receipt.item_count !== 1 ? 's' : ''}
                    {receipt.order_number && <span> &middot; #{receipt.order_number}</span>}
                  </p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Found in: {receipt.contributor_user_id}
                  </p>
                </div>
                <p className="font-semibold text-zinc-900">{formatUSD(receipt.total)}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {!loading && filtered.length > 0 && filtered.length !== receipts.length && (
        <p className="text-xs text-zinc-400 text-right">{filtered.length} of {receipts.length} receipts</p>
      )}
    </main>
  );
}
