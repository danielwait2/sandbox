'use client';

import { useEffect, useState } from 'react';
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

  useEffect(() => {
    fetch('/api/receipts')
      .then((r) => r.json())
      .then((j: { receipts: ReceiptSummary[] }) => setReceipts(j.receipts ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Receipts</h1>

      <div>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
        ) : receipts.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-12 text-center">
            <p className="text-zinc-500 mb-2">
              No receipts yet — pull your receipts from email to get started
            </p>
            <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {receipts.map((receipt) => (
              <button
                key={receipt.id}
                onClick={() => router.push(`/receipts/${receipt.id}`)}
                className="w-full flex items-center justify-between py-4 text-left hover:bg-zinc-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-zinc-900">{receipt.retailer}</p>
                  <p className="text-sm text-zinc-500">
                    {formatDate(receipt.transaction_date)} &middot; {receipt.item_count} item{receipt.item_count !== 1 ? 's' : ''}
                  </p>
                </div>
                <p className="font-semibold text-zinc-900">{formatUSD(receipt.total)}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
