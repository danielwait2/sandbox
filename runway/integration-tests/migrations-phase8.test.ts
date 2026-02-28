import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import Database from "better-sqlite3";

import { runMigrations } from "@/lib/migrations";

test("legacy single-user rows backfill into account model", () => {
  const dbPath = path.join(os.tmpdir(), `runway-migrate-${randomUUID()}.db`);
  const db = new Database(dbPath);

  try {
    db.exec(`
      CREATE TABLE receipts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        retailer TEXT NOT NULL,
        transaction_date TEXT NOT NULL,
        subtotal REAL,
        tax REAL,
        total REAL NOT NULL,
        order_number TEXT,
        raw_email_id TEXT,
        parsed_at TEXT
      );
      CREATE TABLE line_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        receipt_id TEXT NOT NULL,
        raw_name TEXT NOT NULL,
        name TEXT NOT NULL,
        quantity INTEGER DEFAULT 1,
        unit_price REAL NOT NULL,
        total_price REAL NOT NULL,
        category TEXT NOT NULL,
        subcategory TEXT,
        confidence REAL,
        user_overridden INTEGER DEFAULT 0
      );
      CREATE TABLE budgets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        subcategory TEXT,
        month TEXT NOT NULL,
        amount REAL NOT NULL
      );
      CREATE TABLE rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        match_pattern TEXT NOT NULL,
        category TEXT NOT NULL,
        subcategory TEXT,
        created_from TEXT DEFAULT 'manual'
      );
      CREATE TABLE scan_state (
        user_id TEXT PRIMARY KEY,
        last_scanned_at TEXT NOT NULL
      );
    `);

    db.prepare(
      `INSERT INTO receipts (id, user_id, retailer, transaction_date, total, raw_email_id)
       VALUES ('legacy_r1', 'legacy@example.com', 'Walmart', '2026-01-11', 55.0, 'msg-1')`
    ).run();
    db.prepare(
      `INSERT INTO line_items (receipt_id, raw_name, name, quantity, unit_price, total_price, category)
       VALUES ('legacy_r1', 'Milk', 'Milk', 1, 55, 55, 'Groceries')`
    ).run();

    runMigrations(db);

    const membership = db
      .prepare(
        `SELECT a.id as account_id, m.role, m.status
         FROM accounts a
         JOIN account_memberships m ON m.account_id = a.id
         WHERE m.user_id = 'legacy@example.com'
         LIMIT 1`
      )
      .get() as { account_id: string; role: string; status: string } | undefined;

    assert.ok(membership);
    assert.equal(membership.role, "owner");
    assert.equal(membership.status, "active");

    const receipt = db
      .prepare(
        `SELECT account_id, contributor_user_id
         FROM receipts
         WHERE id = 'legacy_r1'`
      )
      .get() as { account_id: string | null; contributor_user_id: string | null };

    assert.equal(receipt.account_id, membership.account_id);
    assert.equal(receipt.contributor_user_id, "legacy@example.com");
  } finally {
    db.close();
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
  }
});
