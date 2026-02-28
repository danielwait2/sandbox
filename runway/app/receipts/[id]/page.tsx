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

type ReceiptDetail = {
  id: string;
  retailer: string;
  transaction_date: string;
  subtotal: number | null;
  tax: number | null;
  total: number;
  order_number: string | null;
  contributor_user_id: string;
  contributor_role: 'owner' | 'member';
  items: LineItem[];
};

function formatUSD(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function SkeletonBlock() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 bg-zinc-200 rounded" />
      <div className="h-4 w-72 bg-zinc-200 rounded" />
      <div className="border-t border-zinc-100 pt-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex justify-between">
            <div className="h-4 w-1/2 bg-zinc-200 rounded" />
            <div className="h-4 w-1/4 bg-zinc-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReceiptDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [receipt, setReceipt] = useState<ReceiptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/receipts/${id}`)
      .then(async (r) => {
        if (r.status === 404) {
          setNotFound(true);
          return;
        }
        const data = (await r.json()) as ReceiptDetail;
        setReceipt(data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl p-6 space-y-6">
        <Link href="/receipts" className="text-sm text-zinc-500 hover:text-zinc-700">
          ← Back to Receipts
        </Link>
        <SkeletonBlock />
      </main>
    );
  }

  if (notFound || !receipt) {
    return (
      <main className="mx-auto max-w-3xl p-6 space-y-4">
        <Link href="/receipts" className="text-sm text-zinc-500 hover:text-zinc-700">
          ← Back to Receipts
        </Link>
        <p className="text-zinc-500">Receipt not found.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <Link href="/receipts" className="text-sm text-zinc-500 hover:text-zinc-700">
        ← Back to Receipts
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-zinc-900">{receipt.retailer}</h1>
        <p className="text-sm text-zinc-500 mt-1">
          {formatDate(receipt.transaction_date)}
          {receipt.order_number && <> &middot; Order #{receipt.order_number}</>}
          {receipt.subtotal != null && <> &middot; Subtotal {formatUSD(receipt.subtotal)}</>}
          {receipt.tax != null && <> &middot; Tax {formatUSD(receipt.tax)}</>}
          {' '}&middot; Total {formatUSD(receipt.total)}
        </p>
        <p className="text-xs text-zinc-400 mt-1">Found in: {receipt.contributor_user_id}</p>
      </div>

      <hr className="border-zinc-200" />

      <div>
        <table className="w-full text-sm">
          <thead className="text-zinc-500">
            <tr>
              <th className="text-left pb-2">Item</th>
              <th className="text-right pb-2">Qty &times; Price</th>
              <th className="text-left pb-2 pl-4">Category</th>
              <th className="text-right pb-2">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {receipt.items.map((item) => (
              <tr key={item.id}>
                <td className="py-3 text-zinc-900 font-medium">
                  {item.name}
                  {item.subcategory && (
                    <span className="ml-2 inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500">
                      {item.subcategory}
                    </span>
                  )}
                </td>
                <td className="py-3 text-right text-zinc-600">
                  {item.quantity} &times; {formatUSD(item.unit_price)}
                </td>
                <td className="py-3 pl-4 text-zinc-500">{item.category}</td>
                <td className="py-3 text-right font-semibold text-zinc-900">
                  {formatUSD(item.total_price)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
