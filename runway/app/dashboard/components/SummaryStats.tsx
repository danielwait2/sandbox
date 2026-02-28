'use client';

type Props = {
  totalSpend: number;
  receiptCount: number;
  topCategory: string;
};

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-zinc-900 truncate">{value}</p>
    </div>
  );
}

export default function SummaryStats({
  totalSpend,
  receiptCount,
  topCategory,
}: Props) {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(totalSpend);

  return (
    <div className="grid grid-cols-3 gap-4">
      <StatTile label="Total Spend" value={formatted} />
      <StatTile label="Receipts" value={String(receiptCount)} />
      <StatTile label="Top Category" value={topCategory || '—'} />
    </div>
  );
}
