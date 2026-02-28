import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const tempDbPath = path.join(os.tmpdir(), `runway-display-names-${randomUUID()}.db`);
process.env.DATABASE_PATH = tempDbPath;

type DbModule = typeof import("@/lib/db");
type AccountModule = typeof import("@/lib/account");
type ReceiptsModule = typeof import("@/lib/receipts");
type ContributorProfilesModule = typeof import("@/lib/contributorProfiles");

let db: DbModule["db"];
let resolveAccountContextForUser: AccountModule["resolveAccountContextForUser"];
let getRecentReceipts: ReceiptsModule["getRecentReceipts"];
let saveDisplayName: ContributorProfilesModule["saveDisplayName"];
let getContributorProfile: ContributorProfilesModule["getContributorProfile"];
let getContributorDisplayNameMap: ContributorProfilesModule["getContributorDisplayNameMap"];
let upsertAuthProviderName: ContributorProfilesModule["upsertAuthProviderName"];

test.before(async () => {
  ({ db } = await import("@/lib/db"));
  ({ resolveAccountContextForUser } = await import("@/lib/account"));
  ({ getRecentReceipts } = await import("@/lib/receipts"));
  ({ saveDisplayName, getContributorProfile, getContributorDisplayNameMap, upsertAuthProviderName } =
    await import("@/lib/contributorProfiles"));
});

const resetDb = (): void => {
  db.prepare("DELETE FROM line_items").run();
  db.prepare("DELETE FROM receipts").run();
  db.prepare("DELETE FROM account_memberships").run();
  db.prepare("DELETE FROM accounts").run();
  db.prepare("DELETE FROM user_profiles").run();
};

const seedSharedAccount = (): void => {
  const now = new Date().toISOString();

  db.prepare(
    "INSERT INTO accounts (id, owner_user_id, created_at) VALUES (?, ?, ?)"
  ).run("acct_display_v1", "owner@example.com", now);
  db.prepare(
    `INSERT INTO account_memberships (account_id, user_id, role, status, created_at, updated_at)
     VALUES (?, ?, 'owner', 'active', ?, ?)`
  ).run("acct_display_v1", "owner@example.com", now, now);
  db.prepare(
    `INSERT INTO account_memberships (account_id, user_id, role, status, created_at, updated_at)
     VALUES (?, ?, 'member', 'active', ?, ?)`
  ).run("acct_display_v1", "member@example.com", now, now);

  db.prepare(
    `INSERT INTO receipts (id, user_id, account_id, contributor_user_id, retailer, transaction_date, total, parsed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    "r_display_1",
    "owner@example.com",
    "acct_display_v1",
    "owner@example.com",
    "Walmart",
    "2026-02-10",
    52,
    now
  );
  db.prepare(
    `INSERT INTO line_items (receipt_id, raw_name, name, quantity, unit_price, total_price, category)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run("r_display_1", "Milk", "Milk", 1, 52, 52, "Groceries");
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

test("settings profile save/load persists trimmed display name", () => {
  resetDb();

  const saved = saveDisplayName("Owner@Example.com", "  Taylor  ", "Taylor OAuth");
  assert.equal(saved, "Taylor");

  const profile = getContributorProfile("owner@example.com");
  assert.equal(profile?.displayName, "Taylor");
  assert.equal(profile?.authProviderName, "Taylor OAuth");
});

test("receipts payload includes contributor display name", () => {
  resetDb();
  seedSharedAccount();
  saveDisplayName("owner@example.com", "Taylor");

  const context = resolveAccountContextForUser("owner@example.com");
  assert.ok(context);

  const receipts = getRecentReceipts(context, 365);
  assert.equal(receipts.length, 1);
  assert.equal(receipts[0].contributor_user_id, "owner@example.com");
  assert.equal(receipts[0].contributor_display_name, "Taylor");
});

test("fallback preference is display name, then auth provider name, then user id", () => {
  resetDb();

  upsertAuthProviderName("member@example.com", "Member OAuth");
  const authFallbackMap = getContributorDisplayNameMap(["member@example.com"]);
  assert.equal(authFallbackMap.get("member@example.com"), "Member OAuth");

  const sessionFallbackMap = getContributorDisplayNameMap(["owner@example.com"], {
    userId: "owner@example.com",
    authProviderName: "Owner Session Name",
  });
  assert.equal(sessionFallbackMap.get("owner@example.com"), "Owner Session Name");

  const idFallbackMap = getContributorDisplayNameMap(["unknown@example.com"]);
  assert.equal(idFallbackMap.get("unknown@example.com"), "unknown@example.com");

  saveDisplayName("member@example.com", "Saved Name");
  const displayNameMap = getContributorDisplayNameMap(["member@example.com"]);
  assert.equal(displayNameMap.get("member@example.com"), "Saved Name");
});
