'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type Rule = {
  id: number;
  match_pattern: string;
  category: string;
  subcategory: string | null;
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [rules, setRules] = useState<Rule[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetch('/api/rules')
      .then((r) => r.json())
      .then((j: { rules: Rule[] }) => setRules(j.rules ?? []));
  }, []);

  const handleDisconnect = async () => {
    await fetch('/api/auth/disconnect', { method: 'DELETE' });
    await signOut({ callbackUrl: '/signin' });
  };

  const handleDeleteRule = async (id: number) => {
    await fetch(`/api/rules/${id}`, { method: 'DELETE' });
    setRules((prev) => prev.filter((r) => r.id !== id));
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

      {/* Section 4: Email Scan */}
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
