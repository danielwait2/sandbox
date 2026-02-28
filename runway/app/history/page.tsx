'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

type MonthlySpending = { month: string; total: number };
type MonthlyCategorySpending = { month: string; category: string; total: number };
type HistorySummary = { totalSpend: number; avgPerMonth: number; receiptCount: number; topCategory: string | null };
type LineItem = { id: number; name: string; quantity: number; unit_price: number; total_price: number; category: string; subcategory: string | null };
type ReceiptWithItems = {
  id: string;
  retailer: string;
  transaction_date: string;
  total: number;
  order_number: string | null;
  contributor_user_id: string;
  contributorRole: 'owner' | 'member';
  items: LineItem[];
};
type ContributorFilter = 'all' | 'owner' | 'member';
type AccountMember = { userId: string; role: 'owner' | 'member'; status: 'pending' | 'active' | 'removed' };
type MembersResponse = { members: AccountMember[] };

type HistoryData = {
  contributor?: ContributorFilter;
  monthlySpending: MonthlySpending[];
  categorySpending: MonthlyCategorySpending[];
  summary: HistorySummary;
};

type RangePreset = 'month' | '3months' | 'quarter' | 'year' | 'all';

const formatUserLabel = (userId: string | null): string => {
  if (!userId) return 'Member';
  const local = userId.split('@')[0] ?? userId;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
};

const CATEGORY_COLORS: Record<string, string> = {
  Groceries: '#3b82f6',
  Household: '#8b5cf6',
  'Baby & Kids': '#ec4899',
  'Health & Wellness': '#10b981',
  'Personal Care': '#f59e0b',
  Electronics: '#6366f1',
  'Clothing & Apparel': '#14b8a6',
  'Pet Supplies': '#f97316',
  Other: '#94a3b8',
};

function getDateRange(preset: RangePreset): { start: string; end: string } {
  const now = new Date();
  const end = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  switch (preset) {
    case 'month':
      return { start: end, end };
    case '3months': {
      const d = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      return { start: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, end };
    }
    case 'quarter': {
      const qStart = Math.floor(now.getMonth() / 3) * 3;
      const d = new Date(now.getFullYear(), qStart, 1);
      return { start: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, end };
    }
    case 'year':
      return { start: `${now.getFullYear()}-01`, end };
    case 'all':
      return { start: '2020-01', end };
  }
}

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [preset, setPreset] = useState<RangePreset>('year');
  const [contributor, setContributor] = useState<ContributorFilter>('all');
  const [ownerLabel, setOwnerLabel] = useState('Owner');
  const [memberLabel, setMemberLabel] = useState('Member');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [drilldownReceipts, setDrilldownReceipts] = useState<ReceiptWithItems[] | null>(null);
  const [drilldownLoading, setDrilldownLoading] = useState(false);
  const [expandedReceipt, setExpandedReceipt] = useState<string | null>(null);
  const [chartMode, setChartMode] = useState<'total' | 'category'>('total');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/signin');
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/account/members')
      .then((r) => r.json())
      .then((j: MembersResponse) => {
        const owner = j.members?.find((m) => m.role === 'owner');
        const member = j.members?.find((m) => m.role === 'member' && m.status !== 'removed');
        setOwnerLabel(formatUserLabel(owner?.userId ?? null));
        setMemberLabel(formatUserLabel(member?.userId ?? null));
      })
      .catch(() => {});
  }, [status]);

  const fetchData = useCallback(async () => {
    if (status !== 'authenticated') return;
    setLoading(true);
    const range = useCustom ? { start: customStart, end: customEnd } : getDateRange(preset);
    const res = await fetch(`/api/history?start=${range.start}&end=${range.end}&contributor=${contributor}`);
    const d = await res.json() as HistoryData;
    setData(d);
    setLoading(false);
    setSelectedMonth(null);
    setDrilldownReceipts(null);
  }, [status, preset, useCustom, customStart, customEnd, contributor]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleBarClick = async (monthValue: string) => {
    if (selectedMonth === monthValue) {
      setSelectedMonth(null);
      setDrilldownReceipts(null);
      return;
    }
    setSelectedMonth(monthValue);
    setDrilldownLoading(true);
    const res = await fetch(`/api/history/${monthValue}?contributor=${contributor}`);
    const d = await res.json() as { receipts: ReceiptWithItems[] };
    setDrilldownReceipts(d.receipts);
    setDrilldownLoading(false);
    setExpandedReceipt(null);
  };

  if (status === 'loading' || loading) return null;
  if (!session) return null;

  const isEmpty = !data || data.monthlySpending.length === 0;

  // Build stacked chart data
  const allCategories = [...new Set(data?.categorySpending.map((c) => c.category) ?? [])];
  const stackedData = data?.monthlySpending.map((m) => {
    const entry: Record<string, string | number> = { month: m.month };
    for (const cat of allCategories) {
      const match = data.categorySpending.find((c) => c.month === m.month && c.category === cat);
      entry[cat] = match?.total ?? 0;
    }
    return entry;
  }) ?? [];

  const presets: { key: RangePreset; label: string }[] = [
    { key: 'month', label: 'This Month' },
    { key: '3months', label: 'Last 3 Months' },
    { key: 'quarter', label: 'This Quarter' },
    { key: 'year', label: 'This Year' },
    { key: 'all', label: 'All Time' },
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-2xl font-bold text-zinc-900 mb-6">Spending History</h1>

      {/* Time Range Selector */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {presets.map((p) => (
          <button
            key={p.key}
            onClick={() => { setPreset(p.key); setUseCustom(false); }}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              !useCustom && preset === p.key
                ? 'bg-zinc-900 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            {p.label}
          </button>
        ))}
        <div className="flex items-center gap-2 ml-2">
          <input
            type="month"
            value={customStart}
            onChange={(e) => { setCustomStart(e.target.value); setUseCustom(true); }}
            className="rounded border border-zinc-300 px-2 py-1 text-sm"
            placeholder="Start"
          />
          <span className="text-zinc-400 text-sm">to</span>
          <input
            type="month"
            value={customEnd}
            onChange={(e) => { setCustomEnd(e.target.value); setUseCustom(true); }}
            className="rounded border border-zinc-300 px-2 py-1 text-sm"
            placeholder="End"
          />
          {useCustom && (
            <button
              onClick={fetchData}
              className="rounded bg-zinc-900 px-3 py-1 text-sm text-white hover:bg-zinc-800"
            >
              Apply
            </button>
          )}
        </div>
      </div>
      <div className="border-b border-zinc-200 mb-6">
        {[
          { key: 'all', label: 'All Contributors' },
          { key: 'owner', label: ownerLabel },
          { key: 'member', label: memberLabel },
        ].map((opt) => (
          <button
            key={opt.key}
            onClick={() => setContributor(opt.key as ContributorFilter)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition ${
              contributor === opt.key
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {isEmpty ? (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-12 text-center">
          <p className="text-zinc-500 mb-2">No spending history yet.</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">
            Go to Dashboard to scan your Gmail
          </Link>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <p className="text-sm text-zinc-500">Total Spend</p>
              <p className="text-xl font-bold text-zinc-900">${data!.summary.totalSpend.toFixed(2)}</p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <p className="text-sm text-zinc-500">Avg / Month</p>
              <p className="text-xl font-bold text-zinc-900">${data!.summary.avgPerMonth.toFixed(2)}</p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <p className="text-sm text-zinc-500">Receipts</p>
              <p className="text-xl font-bold text-zinc-900">{data!.summary.receiptCount}</p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <p className="text-sm text-zinc-500">Top Category</p>
              <p className="text-xl font-bold text-zinc-900">{data!.summary.topCategory ?? '—'}</p>
            </div>
          </div>

          {/* Chart Mode Toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setChartMode('total')}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                chartMode === 'total' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Total Spending
            </button>
            <button
              onClick={() => setChartMode('category')}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                chartMode === 'category' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              By Category
            </button>
          </div>

          {/* Chart */}
          <div className="rounded-lg border border-zinc-200 bg-white p-4 mb-8">
            <ResponsiveContainer width="100%" height={350}>
              {chartMode === 'total' ? (
                <BarChart data={data!.monthlySpending} onClick={(e) => { if (e?.activeLabel) handleBarClick(String(e.activeLabel)); }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => `$${v}`} />
                  <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Total']} />
                  <Bar
                    dataKey="total"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    cursor="pointer"
                  />
                </BarChart>
              ) : (
                <BarChart data={stackedData} onClick={(e) => { if (e?.activeLabel) handleBarClick(String(e.activeLabel)); }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => `$${v}`} />
                  <Tooltip formatter={(value, name) => [`$${Number(value).toFixed(2)}`, name]} />
                  <Legend />
                  {allCategories.map((cat) => (
                    <Bar
                      key={cat}
                      dataKey={cat}
                      stackId="stack"
                      fill={CATEGORY_COLORS[cat] ?? '#94a3b8'}
                      cursor="pointer"
                    />
                  ))}
                </BarChart>
              )}
            </ResponsiveContainer>
            <p className="text-xs text-zinc-400 mt-2 text-center">Click a bar to see receipts for that month</p>
          </div>

          {/* Drill-down */}
          {selectedMonth && (
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-zinc-800">
                  Receipts for {selectedMonth}
                </h2>
                <button
                  onClick={() => { setSelectedMonth(null); setDrilldownReceipts(null); }}
                  className="text-sm text-zinc-500 hover:text-zinc-700"
                >
                  Close
                </button>
              </div>
              {drilldownLoading ? (
                <p className="text-sm text-zinc-400 animate-pulse">Loading receipts...</p>
              ) : drilldownReceipts && drilldownReceipts.length > 0 ? (
                <div className="space-y-3">
                  {drilldownReceipts.map((r) => (
                    <div key={r.id} className="border border-zinc-100 rounded-lg">
                      <button
                        onClick={() => setExpandedReceipt(expandedReceipt === r.id ? null : r.id)}
                        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-zinc-50"
                      >
                        <div>
                          <span className="font-medium text-zinc-900">{r.retailer}</span>
                          <span className="text-sm text-zinc-500 ml-3">{r.transaction_date}</span>
                          <span className="text-xs text-zinc-400 ml-2 uppercase">{r.contributorRole}</span>
                          {r.order_number && (
                            <span className="text-xs text-zinc-400 ml-2">#{r.order_number}</span>
                          )}
                        </div>
                        <span className="font-semibold text-zinc-900">${r.total.toFixed(2)}</span>
                      </button>
                      {expandedReceipt === r.id && (
                        <div className="border-t border-zinc-100 px-4 py-3">
                          <table className="w-full text-sm">
                            <thead className="text-zinc-500">
                              <tr>
                                <th className="text-left pb-1">Item</th>
                                <th className="text-right pb-1">Qty</th>
                                <th className="text-right pb-1">Price</th>
                                <th className="text-left pb-1 pl-3">Category</th>
                              </tr>
                            </thead>
                            <tbody>
                              {r.items.map((item) => (
                                <tr key={item.id} className="border-t border-zinc-50">
                                  <td className="py-1 text-zinc-800">{item.name}</td>
                                  <td className="py-1 text-right text-zinc-600">{item.quantity}</td>
                                  <td className="py-1 text-right text-zinc-700">${item.total_price.toFixed(2)}</td>
                                  <td className="py-1 pl-3 text-zinc-500">{item.category}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-400">No receipts found for this month.</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
