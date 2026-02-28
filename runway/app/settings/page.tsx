'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const DEFAULT_CATEGORIES = [
  'Groceries', 'Household', 'Baby & Kids', 'Health & Wellness',
  'Personal Care', 'Electronics', 'Clothing & Apparel', 'Pet Supplies', 'Other',
];

type Rule = {
  id: number;
  match_pattern: string;
  category: string;
  subcategory: string | null;
};

type BudgetRow = {
  category: string;
  amount: number;
  isCustom: boolean;
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [rules, setRules] = useState<Rule[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [budgets, setBudgets] = useState<BudgetRow[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [newAmount, setNewAmount] = useState('');

  useEffect(() => {
    fetch('/api/rules')
      .then((r) => r.json())
      .then((j: { rules: Rule[] }) => setRules(j.rules ?? []));

    fetch('/api/budget-defaults')
      .then((r) => r.json())
      .then((j: { defaults: { category: string; amount: number }[] }) => {
        const saved = j.defaults ?? [];
        const savedMap = new Map(saved.map((d) => [d.category, d.amount]));
        const defaults = DEFAULT_CATEGORIES.map((cat) => ({
          category: cat,
          amount: savedMap.get(cat) ?? 0,
          isCustom: false,
        }));
        const custom = saved
          .filter((d) => !DEFAULT_CATEGORIES.includes(d.category))
          .map((d) => ({ category: d.category, amount: d.amount, isCustom: true }));
        setBudgets([...defaults, ...custom]);
      });
  }, []);

  const handleDisconnect = async () => {
    await fetch('/api/auth/disconnect', { method: 'DELETE' });
    await signOut({ callbackUrl: '/signin' });
  };

  const handleDeleteRule = async (id: number) => {
    await fetch(`/api/rules/${id}`, { method: 'DELETE' });
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const handleBudgetChange = async (category: string, amount: number) => {
    setBudgets((prev) => prev.map((b) => b.category === category ? { ...b, amount } : b));
    await fetch('/api/budget-defaults', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, amount }),
    });
  };

  const handleAddCategory = async () => {
    const cat = newCategory.trim();
    const amt = parseFloat(newAmount) || 0;
    if (!cat || budgets.some((b) => b.category.toLowerCase() === cat.toLowerCase())) return;
    await fetch('/api/budget-defaults', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: cat, amount: amt }),
    });
    setBudgets((prev) => [...prev, { category: cat, amount: amt, isCustom: true }]);
    setNewCategory('');
    setNewAmount('');
  };

  const handleDeleteCategory = async (category: string) => {
    await fetch('/api/budget-defaults', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, amount: null }),
    });
    setBudgets((prev) => prev.filter((b) => b.category !== category));
  };

  const handleResetScanState = async () => {
    setResetting(true);
    await fetch('/api/scan-state', { method: 'DELETE' });
    setResetting(false);
    router.push('/dashboard');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return;
    await fetch('/api/account', { method: 'DELETE' });
    await signOut({ callbackUrl: '/signin' });
  };

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-10">
      <h1 className="text-2xl font-bold text-zinc-900">Settings</h1>

      {/* Section 1: Gmail Connection */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">Gmail Connection</h2>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 flex items-center justify-between">
          <div>
            <p className="text-zinc-900 font-medium">{session?.user?.email}</p>
            <p className="text-sm text-green-600">Connected</p>
          </div>
          <button
            className="bg-zinc-100 text-zinc-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-200"
            onClick={handleDisconnect}
          >
            Disconnect Gmail
          </button>
        </div>
      </section>

      {/* Section 2: Custom Rules */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">Custom Rules</h2>
        <div className="rounded-xl border border-zinc-200 bg-white divide-y divide-zinc-100">
          {rules.length === 0 ? (
            <p className="p-5 text-sm text-zinc-500">No custom rules yet.</p>
          ) : (
            rules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium text-zinc-900">{rule.match_pattern}</p>
                  <p className="text-xs text-zinc-500">
                    {rule.category}{rule.subcategory ? ` / ${rule.subcategory}` : ''}
                  </p>
                </div>
                <button
                  className="text-sm text-red-500 hover:text-red-700"
                  onClick={() => handleDeleteRule(rule.id)}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Section 3: Export Data */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">Export Data</h2>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 flex items-center justify-between">
          <p className="text-sm text-zinc-600">Download all your spending data as a CSV file.</p>
          <a
            href="/api/items/export"
            download
            className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-700"
          >
            Export CSV
          </a>
        </div>
      </section>

      {/* Section 4: Budget Categories */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">Budget Categories</h2>
        <div className="rounded-xl border border-zinc-200 bg-white divide-y divide-zinc-100">
          {budgets.map((b) => (
            <div key={b.category} className="flex items-center justify-between px-5 py-3 gap-4">
              <span className="text-sm font-medium text-zinc-900 flex-1">{b.category}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-400">$/mo</span>
                <input
                  type="number"
                  min="0"
                  className="w-24 border border-zinc-200 rounded-lg px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  value={b.amount}
                  onChange={(e) => handleBudgetChange(b.category, parseFloat(e.target.value) || 0)}
                />
                {b.isCustom && (
                  <button
                    className="text-sm text-red-500 hover:text-red-700 ml-1"
                    onClick={() => handleDeleteCategory(b.category)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
          {/* Add custom category */}
          <div className="flex items-center gap-2 px-5 py-3">
            <input
              type="text"
              placeholder="New category name"
              className="flex-1 border border-zinc-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <input
              type="number"
              min="0"
              placeholder="$/mo"
              className="w-24 border border-zinc-200 rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-zinc-400"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
            />
            <button
              className="bg-zinc-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-zinc-700 disabled:opacity-40"
              onClick={handleAddCategory}
              disabled={!newCategory.trim()}
            >
              Add
            </button>
          </div>
        </div>
      </section>

      {/* Section 5: Email Scan */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">Email Scan</h2>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 flex items-center justify-between">
          <div>
            <p className="font-medium text-zinc-900">Re-scan all emails</p>
            <p className="text-sm text-zinc-500">Resets the scan window so the next scan re-checks the last 90 days. Useful after adding a new retailer.</p>
          </div>
          <button
            className="bg-zinc-100 text-zinc-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-200 disabled:opacity-40"
            onClick={handleResetScanState}
            disabled={resetting}
          >
            {resetting ? 'Resetting…' : 'Reset Scan Window'}
          </button>
        </div>
      </section>

      {/* Section 5: Danger Zone */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>
        <div className="rounded-xl border border-red-200 bg-white p-5 flex items-center justify-between">
          <div>
            <p className="font-medium text-zinc-900">Delete Account</p>
            <p className="text-sm text-zinc-500">Permanently wipe all your data.</p>
          </div>
          <button
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete Account
          </button>
        </div>
      </section>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-lg font-bold text-zinc-900">Are you sure?</h3>
            <p className="text-sm text-zinc-600">
              This will permanently delete all your data. Type{' '}
              <strong>DELETE</strong> to confirm.
            </p>
            <input
              type="text"
              className="w-full border border-zinc-300 rounded px-3 py-2 text-sm"
              placeholder="Type DELETE to confirm"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                className="flex-1 bg-zinc-100 text-zinc-700 rounded-lg px-4 py-2 text-sm hover:bg-zinc-200"
                onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); }}
              >
                Cancel
              </button>
              <button
                className="flex-1 bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-40"
                disabled={deleteConfirm !== 'DELETE'}
                onClick={handleDeleteAccount}
              >
                Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
