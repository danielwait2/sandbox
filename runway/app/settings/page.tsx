'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

type Rule = {
  id: number;
  match_pattern: string;
  category: string;
  subcategory: string | null;
};

type AccountMember = {
  userId: string;
  role: 'owner' | 'member';
  status: 'pending' | 'active' | 'removed';
  createdAt: string;
  updatedAt: string;
};

type MembersResponse = {
  accountId: string;
  viewerRole: 'owner' | 'member';
  members: AccountMember[];
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const [rules, setRules] = useState<Rule[]>([]);
  const [members, setMembers] = useState<AccountMember[]>([]);
  const [viewerRole, setViewerRole] = useState<'owner' | 'member'>('member');
  const [membersLoading, setMembersLoading] = useState(true);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [mailboxConnected, setMailboxConnected] = useState(false);
  const [mailboxLoading, setMailboxLoading] = useState(true);

  const fetchMailboxStatus = async () => {
    setMailboxLoading(true);
    try {
      const res = await fetch('/api/mailbox/connect');
      const json = await res.json() as { connected?: boolean };
      setMailboxConnected(Boolean(json.connected));
    } catch {
      setMailboxConnected(false);
    } finally {
      setMailboxLoading(false);
    }
  };

  const fetchMembers = async () => {
    setMembersLoading(true);
    setMembersError(null);
    try {
      const res = await fetch('/api/account/members');
      const json = await res.json() as MembersResponse & { error?: string };
      if (!res.ok) {
        setMembersError(json.error ?? 'Failed to load account members.');
        setMembers([]);
        return;
      }
      setViewerRole(json.viewerRole);
      setMembers(json.members ?? []);
    } catch {
      setMembersError('Failed to load account members.');
      setMembers([]);
    } finally {
      setMembersLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/rules')
      .then((r) => r.json())
      .then((j: { rules: Rule[] }) => setRules(j.rules ?? []));
    void fetchMembers();
    void fetchMailboxStatus();
  }, []);

  const handleMailboxDisconnect = async () => {
    await fetch('/api/mailbox/disconnect', { method: 'DELETE' });
    await fetchMailboxStatus();
  };

  const handleMailboxConnect = async () => {
    await fetch('/api/mailbox/connect', { method: 'POST' });
    await fetchMailboxStatus();
  };

  const handleDeleteRule = async (id: number) => {
    await fetch(`/api/rules/${id}`, { method: 'DELETE' });
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return;
    await fetch('/api/account', { method: 'DELETE' });
    await signOut({ callbackUrl: '/signin' });
  };

  const handleAddMember = async () => {
    setInviteLoading(true);
    setInviteMessage(null);
    try {
      const res = await fetch('/api/account/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      });
      const json = await res.json() as { error?: string; invitedEmail?: string };
      if (!res.ok) {
        setInviteMessage(json.error ?? 'Unable to add member.');
        return;
      }
      setInviteMessage(`Invite created for ${json.invitedEmail}. They become active after login.`);
      setInviteEmail('');
      await fetchMembers();
    } catch {
      setInviteMessage('Unable to add member.');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    setRemovingUserId(userId);
    setInviteMessage(null);
    try {
      const res = await fetch(`/api/account/members/${encodeURIComponent(userId)}`, {
        method: 'DELETE',
      });
      const json = await res.json() as { error?: string };
      if (!res.ok) {
        setInviteMessage(json.error ?? 'Unable to remove member.');
        return;
      }
      await fetchMembers();
    } catch {
      setInviteMessage('Unable to remove member.');
    } finally {
      setRemovingUserId(null);
    }
  };

  const activeMemberCount = members.filter((m) => m.role === 'member' && (m.status === 'active' || m.status === 'pending')).length;
  const owner = members.find((m) => m.role === 'owner');

  const statusClasses: Record<AccountMember['status'], string> = {
    active: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    removed: 'bg-zinc-100 text-zinc-600',
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
            {mailboxLoading ? (
              <p className="text-sm text-zinc-500">Checking status...</p>
            ) : (
              <p className={`text-sm ${mailboxConnected ? 'text-green-600' : 'text-amber-600'}`}>
                {mailboxConnected ? 'Connected' : 'Disconnected'}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {mailboxConnected ? (
              <button
                className="bg-zinc-100 text-zinc-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-200"
                onClick={handleMailboxDisconnect}
              >
                Disconnect Gmail
              </button>
            ) : (
              <button
                className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-700"
                onClick={handleMailboxConnect}
              >
                Connect Gmail
              </button>
            )}
            <button
              className="bg-zinc-100 text-zinc-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-200"
              onClick={() => signOut({ callbackUrl: '/signin' })}
            >
              Sign Out
            </button>
          </div>
        </div>
      </section>

      {/* Section 2: Account Members */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">Account Members</h2>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-4">
          {membersLoading ? (
            <p className="text-sm text-zinc-500">Loading members...</p>
          ) : membersError ? (
            <p className="text-sm text-red-600">{membersError}</p>
          ) : (
            <>
              {viewerRole === 'owner' ? (
                <div className="space-y-3">
                  <p className="text-sm text-zinc-600">
                    v1 supports one additional member per account.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="member@email.com"
                      className="flex-1 rounded border border-zinc-300 px-3 py-2 text-sm"
                      disabled={inviteLoading || activeMemberCount >= 1}
                    />
                    <button
                      onClick={handleAddMember}
                      disabled={inviteLoading || !inviteEmail || activeMemberCount >= 1}
                      className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-700 disabled:opacity-40"
                    >
                      {inviteLoading ? 'Adding...' : 'Add Member'}
                    </button>
                  </div>
                  {activeMemberCount >= 1 && (
                    <p className="text-xs text-amber-700">
                      Member slot is full for v1. Remove the current member first.
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-zinc-600">
                  You are a member on this shared account.
                  {owner ? ` Account owner: ${owner.userId}.` : ''}
                </p>
              )}

              {inviteMessage && <p className="text-sm text-zinc-600">{inviteMessage}</p>}

              <div className="rounded-lg border border-zinc-200 divide-y divide-zinc-100">
                {members.map((member) => (
                  <div key={`${member.userId}-${member.role}`} className="flex items-center justify-between p-3">
                    <div>
                      <p className="text-sm font-medium text-zinc-900">{member.userId}</p>
                      <p className="text-xs text-zinc-500 capitalize">{member.role}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${statusClasses[member.status]}`}>
                        {member.status}
                      </span>
                      {viewerRole === 'owner' && member.role === 'member' && member.status !== 'removed' && (
                        <button
                          onClick={() => handleRemoveMember(member.userId)}
                          disabled={removingUserId === member.userId}
                          className="text-sm text-red-600 hover:text-red-700 disabled:opacity-40"
                        >
                          {removingUserId === member.userId ? 'Removing...' : 'Remove'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-zinc-500">
                Removing a member blocks access immediately. Historical receipts remain in account analytics.
              </p>
            </>
          )}
        </div>
      </section>

      {/* Section 3: Custom Rules */}
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

      {/* Section 4: Export Data */}
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
