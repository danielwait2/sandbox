import { randomUUID } from "crypto";

import { db } from "@/lib/db";

export type AccountRole = "owner" | "member";
export type MembershipStatus = "pending" | "active" | "removed";
export type ContributorFilter = "all" | "owner" | "member";

export type AccountContext = {
  accountId: string;
  viewerUserId: string;
  viewerRole: AccountRole;
  ownerUserId: string;
  memberUserId: string | null;
};

type MembershipRow = {
  accountId: string;
  viewerRole: AccountRole;
  ownerUserId: string;
};

type MemberRow = { user_id: string };
type PendingMembershipRow = { account_id: string };
const normalizeUserId = (userId: string): string => userId.trim().toLowerCase();

export function parseContributorFilter(value: string | null): ContributorFilter | null {
  if (value === null || value === "all") return "all";
  if (value === "owner" || value === "member") return value;
  return null;
}

function createDefaultAccountForUser(userId: string): void {
  const normalizedUserId = normalizeUserId(userId);
  const accountId = randomUUID();
  const now = new Date().toISOString();

  const insert = db.transaction(() => {
    db.prepare(
      `INSERT INTO accounts (id, owner_user_id, created_at)
       VALUES (?, ?, ?)`
    ).run(accountId, normalizedUserId, now);

    db.prepare(
      `INSERT INTO account_memberships (account_id, user_id, role, status, created_at, updated_at)
       VALUES (?, ?, 'owner', 'active', ?, ?)`
    ).run(accountId, normalizedUserId, now, now);
  });

  insert();
}

export function resolveAccountContextForUser(userId: string): AccountContext | null {
  const normalizedUserId = normalizeUserId(userId);
  let row = db
    .prepare(
      `SELECT m.account_id as accountId, m.role as viewerRole, a.owner_user_id as ownerUserId
       FROM account_memberships m
       JOIN accounts a ON a.id = m.account_id
       WHERE m.user_id = ? AND m.status = 'active'
       ORDER BY CASE WHEN m.role = 'owner' THEN 0 ELSE 1 END
       LIMIT 1`
    )
      .get(normalizedUserId) as MembershipRow | undefined;

  if (!row) {
    const pending = db
      .prepare(
        `SELECT account_id
         FROM account_memberships
         WHERE user_id = ? AND status = 'pending'
         LIMIT 1`
      )
      .get(normalizedUserId) as PendingMembershipRow | undefined;

    if (pending) {
      db.prepare(
        `UPDATE account_memberships
         SET status = 'active', updated_at = ?
         WHERE account_id = ? AND user_id = ? AND status = 'pending'`
      ).run(new Date().toISOString(), pending.account_id, normalizedUserId);

      row = db
        .prepare(
          `SELECT m.account_id as accountId, m.role as viewerRole, a.owner_user_id as ownerUserId
           FROM account_memberships m
           JOIN accounts a ON a.id = m.account_id
           WHERE m.user_id = ? AND m.status = 'active'
           ORDER BY CASE WHEN m.role = 'owner' THEN 0 ELSE 1 END
           LIMIT 1`
        )
        .get(normalizedUserId) as MembershipRow | undefined;
    }
  }

  if (!row) {
    const existingMembership = db
      .prepare(
        `SELECT id
         FROM account_memberships
         WHERE user_id = ?
         LIMIT 1`
      )
      .get(normalizedUserId) as { id: number } | undefined;

    if (existingMembership) {
      return null;
    }

    createDefaultAccountForUser(normalizedUserId);
    row = db
      .prepare(
        `SELECT m.account_id as accountId, m.role as viewerRole, a.owner_user_id as ownerUserId
         FROM account_memberships m
         JOIN accounts a ON a.id = m.account_id
         WHERE m.user_id = ? AND m.status = 'active'
         ORDER BY CASE WHEN m.role = 'owner' THEN 0 ELSE 1 END
         LIMIT 1`
      )
      .get(normalizedUserId) as MembershipRow | undefined;
  }

  if (!row) return null;

  const member = db
    .prepare(
      `SELECT user_id
       FROM account_memberships
       WHERE account_id = ? AND role = 'member'
       LIMIT 1`
    )
    .get(row.accountId) as MemberRow | undefined;

  return {
    accountId: row.accountId,
    viewerUserId: normalizedUserId,
    viewerRole: row.viewerRole,
    ownerUserId: row.ownerUserId,
    memberUserId: member?.user_id ?? null,
  };
}

export function getContributorUserIds(
  context: AccountContext,
  contributor: ContributorFilter
): string[] {
  if (contributor === "owner") {
    return [context.ownerUserId];
  }

  if (contributor === "member") {
    return context.memberUserId ? [context.memberUserId] : [];
  }

  const ids = [context.ownerUserId];
  if (context.memberUserId && context.memberUserId !== context.ownerUserId) {
    ids.push(context.memberUserId);
  }
  return ids;
}

export function buildReceiptContributorClause(
  alias: string,
  contributorUserIds: string[]
): { whereSql: string; params: string[] } {
  if (contributorUserIds.length === 0) {
    return { whereSql: "1 = 0", params: [] };
  }

  const placeholders = contributorUserIds.map(() => "?").join(", ");
  return {
    whereSql: `${alias}.user_id IN (${placeholders})`,
    params: contributorUserIds,
  };
}
