'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

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
  contributor_display_name: string;
  contributor_role: 'owner' | 'member';
};

const SEARCH_URL_DEBOUNCE_MS = 250;

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

function getInitialQueryParam(name: string) {
  if (typeof window === 'undefined') {
    return '';
  }

  return new URLSearchParams(window.location.search).get(name) ?? '';
}

function getInitialRetailers() {
  const rawRetailers = getInitialQueryParam('retailers');
  if (!rawRetailers) {
    return [];
  }

  return rawRetailers
    .split(',')
    .map((retailer) => retailer.trim())
    .filter(Boolean);
}

export default function ReceiptsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [receipts, setReceipts] = useState<ReceiptSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(() => getInitialQueryParam('q'));
  const [debouncedSearch, setDebouncedSearch] = useState(() => getInitialQueryParam('q'));
  const [selectedRetailers, setSelectedRetailers] = useState<string[]>(() => getInitialRetailers());
  const [fromDate, setFromDate] = useState(() => getInitialQueryParam('from'));
  const [toDate, setToDate] = useState(() => getInitialQueryParam('to'));

  useEffect(() => {
    fetch('/api/receipts')
      .then((r) => r.json())
      .then((j: { receipts: ReceiptSummary[] }) => setReceipts(j.receipts ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, SEARCH_URL_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const params = new URLSearchParams();
    const trimmedSearch = debouncedSearch.trim();

    if (trimmedSearch) {
      params.set('q', trimmedSearch);
    }
    if (selectedRetailers.length > 0) {
      params.set('retailers', selectedRetailers.join(','));
    }
    if (fromDate) {
      params.set('from', fromDate);
    }
    if (toDate) {
      params.set('to', toDate);
    }

    const nextQuery = params.toString();
    const currentQuery = window.location.search.startsWith('?')
      ? window.location.search.slice(1)
      : window.location.search;

    if (nextQuery === currentQuery) {
      return;
    }

    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }, [debouncedSearch, fromDate, pathname, router, selectedRetailers, toDate]);

  const retailers = useMemo(() => Array.from(new Set(receipts.map((r) => r.retailer))).sort(), [receipts]);
  const hasInvalidDateRange = Boolean(fromDate && toDate && fromDate > toDate);

  const filtered = useMemo(() => {
    const searchText = search.trim().toLowerCase();
    const retailerSet = new Set(selectedRetailers);

    const matchesSearch = (receipt: ReceiptSummary) => {
      if (!searchText) {
        return true;
      }

      return (
        receipt.retailer.toLowerCase().includes(searchText) ||
        (receipt.order_number ?? '').toLowerCase().includes(searchText) ||
        receipt.transaction_date.includes(searchText)
      );
    };

    const matchesRetailers = (receipt: ReceiptSummary) => {
      if (retailerSet.size === 0) {
        return true;
      }

      return retailerSet.has(receipt.retailer);
    };

    const matchesDateRange = (receipt: ReceiptSummary) => {
      if (hasInvalidDateRange) {
        return true;
      }
      if (fromDate && receipt.transaction_date < fromDate) {
        return false;
      }
      if (toDate && receipt.transaction_date > toDate) {
        return false;
      }
      return true;
    };

    return receipts
      .filter(matchesSearch)
      .filter(matchesRetailers)
      .filter(matchesDateRange);
  }, [fromDate, hasInvalidDateRange, receipts, search, selectedRetailers, toDate]);

  const clearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setSelectedRetailers([]);
    setFromDate('');
    setToDate('');
  };

  const toggleRetailer = (retailer: string) => {
    setSelectedRetailers((current) =>
      current.includes(retailer)
        ? current.filter((value) => value !== retailer)
        : [...current, retailer]
    );
  };

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      {!loading && receipts.length > 0 ? (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-bold text-zinc-900">Receipts</h1>
            <div className="flex flex-wrap justify-end items-center gap-2 text-xs text-zinc-600">
              <span className="mr-1">Date</span>
              <label className="flex min-w-[130px] flex-col gap-1 sm:flex-none">
                <input
                  type="date"
                  aria-label="From date"
                  className="w-full border border-zinc-200 bg-zinc-100 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </label>
              <span className="text-zinc-400">to</span>
              <label className="flex min-w-[130px] flex-col gap-1 sm:flex-none">
                <input
                  type="date"
                  aria-label="To date"
                  className="w-full border border-zinc-200 bg-zinc-100 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </label>
            </div>
          </div>

          <input
            type="text"
            placeholder="Search by retailer or order number..."
            className="mt-3 w-full border border-zinc-200 bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {hasInvalidDateRange && (
            <p className="text-xs text-red-600">From date must be on or before To date.</p>
          )}

          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setSelectedRetailers([])}
              className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                selectedRetailers.length === 0
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:border-zinc-400'
              }`}
            >
              All
            </button>
            {retailers.map((retailer) => (
              <button
                key={retailer}
                onClick={() => toggleRetailer(retailer)}
                className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                  selectedRetailers.includes(retailer)
                    ? 'bg-zinc-900 text-white border-zinc-900'
                    : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:border-zinc-400'
                }`}
              >
                {retailer}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <h1 className="text-2xl font-bold text-zinc-900">Receipts</h1>
      )}

      <div>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-12 text-center">
            {receipts.length === 0 ? (
              <>
                <p className="text-zinc-500 mb-2">No receipts yet - pull your receipts from email to get started</p>
                <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">Go to Dashboard</Link>
              </>
            ) : (
              <p className="text-zinc-500">No receipts match your filters.</p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((receipt) => (
              <button
                key={receipt.id}
                onClick={() => router.push(`/receipts/${receipt.id}`)}
                className="w-full flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-4 text-left hover:bg-zinc-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-zinc-900">{receipt.retailer}</p>
                  <p className="text-sm text-zinc-500">
                    {formatDate(receipt.transaction_date)} &middot; {receipt.item_count} item{receipt.item_count !== 1 ? 's' : ''}
                    {receipt.order_number && <span> &middot; #{receipt.order_number}</span>}
                  </p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Found in: {receipt.contributor_display_name}
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

      {!loading && receipts.length > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm text-zinc-500 hover:text-zinc-800 underline-offset-2 hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </main>
  );
}
