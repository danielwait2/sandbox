import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const tempDbPath = path.join(os.tmpdir(), `runway-shared-analytics-${randomUUID()}.db`);
process.env.DATABASE_PATH = tempDbPath;

type DbModule = typeof import("@/lib/db");
type AccountModule = typeof import("@/lib/account");
type InsightsModule = typeof import("@/lib/insights");
type HistoryModule = typeof import("@/lib/history");
type MailboxModule = typeof import("@/lib/mailbox");

let db: DbModule["db"];
let resolveAccountContextForUser: AccountModule["resolveAccountContextForUser"];
let getAllInsights: InsightsModule["getAllInsights"];
let getHistorySummary: HistoryModule["getHistorySummary"];
let getMonthlySpending: HistoryModule["getMonthlySpending"];
let getMonthlyCategorySpending: HistoryModule["getMonthlyCategorySpending"];
let getReceiptsForMonth: HistoryModule["getReceiptsForMonth"];
let upsertMailboxConnection: MailboxModule["upsertMailboxConnection"];
let getConnectedMailboxConnection: MailboxModule["getConnectedMailboxConnection"];
let disconnectMailboxConnection: MailboxModule["disconnectMailboxConnection"];

test.before(async () => {
  ({ db } = await import("@/lib/db"));
  ({ resolveAccountContextForUser } = await import("@/lib/account"));
  ({ getAllInsights } = await import("@/lib/insights"));
  ({ getHistorySummary, getMonthlySpending, getMonthlyCategorySpending, getReceiptsForMonth } = await import("@/lib/history"));
  ({ upsertMailboxConnection, getConnectedMailboxConnection, disconnectMailboxConnection } = await import("@/lib/mailbox"));
});

const resetDb = (): void => {
  db.prepare("DELETE FROM line_items").run();
  db.prepare("DELETE FROM receipts").run();
  db.prepare("DELETE FROM account_memberships").run();
  db.prepare("DELETE FROM accounts").run();
  db.prepare("DELETE FROM budgets").run();
  db.prepare("DELETE FROM rules").run();
  db.prepare("DELETE FROM scan_state").run();
};

const seedSharedAccount = (): void => {
  const now = new Date().toISOString();

  db.prepare(
    "INSERT INTO accounts (id, owner_user_id, created_at) VALUES (?, ?, ?)"
  ).run("acct_shared_v1", "owner@example.com", now);

  db.prepare(
    `INSERT INTO account_memberships (account_id, user_id, role, status, created_at, updated_at)
     VALUES (?, ?, ?, 'active', ?, ?)`
  ).run("acct_shared_v1", "owner@example.com", "owner", now, now);

  db.prepare(
    `INSERT INTO account_memberships (account_id, user_id, role, status, created_at, updated_at)
     VALUES (?, ?, ?, 'active', ?, ?)`
  ).run("acct_shared_v1", "member@example.com", "member", now, now);

  db.prepare(
    `INSERT INTO receipts (id, user_id, retailer, transaction_date, total, parsed_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run("r_owner_1", "owner@example.com", "Walmart", "2026-01-10", 90, now);
  db.prepare(
    `INSERT INTO receipts (id, user_id, retailer, transaction_date, total, parsed_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run("r_member_1", "member@example.com", "Costco", "2026-01-12", 60, now);

  db.prepare(
    `INSERT INTO line_items (receipt_id, raw_name, name, quantity, unit_price, total_price, category)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run("r_owner_1", "Milk", "Milk", 1, 30, 30, "Groceries");
  db.prepare(
    `INSERT INTO line_items (receipt_id, raw_name, name, quantity, unit_price, total_price, category)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run("r_owner_1", "Soap", "Soap", 1, 60, 60, "Household");
  db.prepare(
    `INSERT INTO line_items (receipt_id, raw_name, name, quantity, unit_price, total_price, category)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run("r_member_1", "Milk", "Milk", 1, 25, 25, "Groceries");
  db.prepare(
    `INSERT INTO line_items (receipt_id, raw_name, name, quantity, unit_price, total_price, category)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run("r_member_1", "Diapers", "Diapers", 1, 35, 35, "Baby & Kids");
};

test.after(() => {
  try {
    db.close();
  } finally {
    if (fs.existsSync(tempDbPath)) {
      fs.unlinkSync(tempDbPath);
    }
  }
});

test("owner/member parity for shared analytics defaults", () => {
  resetDb();
  seedSharedAccount();

  const ownerContext = resolveAccountContextForUser("owner@example.com");
  const memberContext = resolveAccountContextForUser("member@example.com");

  assert.ok(ownerContext);
  assert.ok(memberContext);
  assert.equal(ownerContext.accountId, memberContext.accountId);

  const ownerHistory = getHistorySummary(ownerContext, "all", "2026-01", "2026-01");
  const memberHistory = getHistorySummary(memberContext, "all", "2026-01", "2026-01");
  assert.deepEqual(ownerHistory, memberHistory);

  const ownerInsights = getAllInsights(ownerContext, "all", "2026-01");
  const memberInsights = getAllInsights(memberContext, "all", "2026-01");
  assert.deepEqual(ownerInsights, memberInsights);
});

test("contributor filter returns deterministic scoped totals", () => {
  resetDb();
  seedSharedAccount();

  const ownerContext = resolveAccountContextForUser("owner@example.com");
  assert.ok(ownerContext);

  const all = getHistorySummary(ownerContext, "all", "2026-01", "2026-01");
  const ownerOnly = getHistorySummary(ownerContext, "owner", "2026-01", "2026-01");
  const memberOnly = getHistorySummary(ownerContext, "member", "2026-01", "2026-01");

  assert.equal(all.totalSpend, 150);
  assert.equal(ownerOnly.totalSpend, 90);
  assert.equal(memberOnly.totalSpend, 60);

  const monthlyAll = getMonthlySpending(ownerContext, "all", "2026-01", "2026-01");
  const monthlyOwner = getMonthlySpending(ownerContext, "owner", "2026-01", "2026-01");
  const monthlyMember = getMonthlySpending(ownerContext, "member", "2026-01", "2026-01");
  assert.equal(monthlyAll[0]?.total, 150);
  assert.equal(monthlyOwner[0]?.total, 90);
  assert.equal(monthlyMember[0]?.total, 60);
});

test("removed member loses analytics access", () => {
  resetDb();
  seedSharedAccount();

  db.prepare(
    `UPDATE account_memberships
     SET status = 'removed'
     WHERE account_id = ? AND user_id = ?`
  ).run("acct_shared_v1", "member@example.com");

  const removedContext = resolveAccountContextForUser("member@example.com");
  assert.equal(removedContext, null);
});

test("single-user accounts continue to work after migration", () => {
  resetDb();

  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO receipts (id, user_id, retailer, transaction_date, total, parsed_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run("r_solo_1", "solo@example.com", "Walmart", "2026-01-05", 42, now);
  db.prepare(
    `INSERT INTO line_items (receipt_id, raw_name, name, quantity, unit_price, total_price, category)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run("r_solo_1", "Bread", "Bread", 1, 42, 42, "Groceries");

  const context = resolveAccountContextForUser("solo@example.com");
  assert.ok(context);
  assert.equal(context.viewerRole, "owner");

  const summary = getHistorySummary(context, "all", "2026-01", "2026-01");
  assert.equal(summary.totalSpend, 42);

  const receipts = getReceiptsForMonth(context, "all", "2026-01");
  assert.equal(receipts.length, 1);
  assert.equal(receipts[0].contributorRole, "owner");
});

test("history drill-down preserves contributor attribution", () => {
  resetDb();
  seedSharedAccount();

  const ownerContext = resolveAccountContextForUser("owner@example.com");
  assert.ok(ownerContext);

  const receipts = getReceiptsForMonth(ownerContext, "all", "2026-01");
  const ownerReceipt = receipts.find((r) => r.id === "r_owner_1");
  const memberReceipt = receipts.find((r) => r.id === "r_member_1");

  assert.equal(ownerReceipt?.contributor_user_id, "owner@example.com");
  assert.equal(ownerReceipt?.contributorRole, "owner");
  assert.equal(memberReceipt?.contributor_user_id, "member@example.com");
  assert.equal(memberReceipt?.contributorRole, "member");
});

test("account totals match summed line items for selected range", () => {
  resetDb();
  seedSharedAccount();

  const ownerContext = resolveAccountContextForUser("owner@example.com");
  assert.ok(ownerContext);

  const monthly = getMonthlySpending(ownerContext, "all", "2026-01", "2026-01");
  const categoryRows = getMonthlyCategorySpending(ownerContext, "all", "2026-01", "2026-01");
  const sumCategories = categoryRows.reduce((sum, row) => sum + row.total, 0);

  assert.equal(monthly.length, 1);
  assert.equal(monthly[0].total, 150);
  assert.equal(sumCategories, monthly[0].total);
});

test("mailbox connections remain isolated per user", () => {
  resetDb();

  upsertMailboxConnection("owner@example.com", "google", "owner-access", "owner-refresh");
  upsertMailboxConnection("member@example.com", "google", "member-access", "member-refresh");

  const ownerConn = getConnectedMailboxConnection("owner@example.com", "google");
  const memberConn = getConnectedMailboxConnection("member@example.com", "google");
  assert.ok(ownerConn);
  assert.ok(memberConn);

  disconnectMailboxConnection("member@example.com", "google");

  const ownerStillConnected = getConnectedMailboxConnection("owner@example.com", "google");
  const memberDisconnected = getConnectedMailboxConnection("member@example.com", "google");
  assert.ok(ownerStillConnected);
  assert.equal(memberDisconnected, null);
});

test("pending member activates on first account resolution", () => {
  resetDb();

  const now = new Date().toISOString();
  db.prepare(
    "INSERT INTO accounts (id, owner_user_id, created_at) VALUES (?, ?, ?)"
  ).run("acct_pending", "owner@example.com", now);
  db.prepare(
    `INSERT INTO account_memberships (account_id, user_id, role, status, created_at, updated_at)
     VALUES (?, ?, 'owner', 'active', ?, ?)`
  ).run("acct_pending", "owner@example.com", now, now);
  db.prepare(
    `INSERT INTO account_memberships (account_id, user_id, role, status, created_at, updated_at)
     VALUES (?, ?, 'member', 'pending', ?, ?)`
  ).run("acct_pending", "invitee@example.com", now, now);

  const context = resolveAccountContextForUser("invitee@example.com");
  assert.ok(context);
  assert.equal(context.viewerRole, "member");
  assert.equal(context.accountId, "acct_pending");

  const membership = db
    .prepare(
      `SELECT status FROM account_memberships
       WHERE account_id = ? AND user_id = ? AND role = 'member'`
    )
    .get("acct_pending", "invitee@example.com") as { status: string };
  assert.equal(membership.status, "active");
});

test("mailbox connection lookups are case-insensitive by user id", () => {
  resetDb();

  upsertMailboxConnection("Member.User@Example.com", "google", "member-access", "member-refresh");

  const lookupLower = getConnectedMailboxConnection("member.user@example.com", "google");
  const lookupUpper = getConnectedMailboxConnection("MEMBER.USER@EXAMPLE.COM", "google");

  assert.ok(lookupLower);
  assert.ok(lookupUpper);
});
