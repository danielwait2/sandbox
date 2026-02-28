import type Database from "better-sqlite3";
import { randomUUID } from "crypto";

const schemaSql = `
CREATE TABLE IF NOT EXISTS receipts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  retailer TEXT NOT NULL,
  transaction_date TEXT NOT NULL,
  subtotal REAL,
  tax REAL,
  total REAL NOT NULL,
  order_number TEXT,
  raw_email_id TEXT,
  dedupe_hash TEXT,
  parsed_at TEXT
);

CREATE TABLE IF NOT EXISTS line_items (
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
  user_overridden INTEGER DEFAULT 0,
  FOREIGN KEY (receipt_id) REFERENCES receipts(id)
);

CREATE TABLE IF NOT EXISTS budgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  subcategory TEXT,
  month TEXT NOT NULL,
  amount REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_pattern TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  created_from TEXT DEFAULT 'manual'
);

CREATE TABLE IF NOT EXISTS scan_state (
  user_id TEXT PRIMARY KEY,
  last_scanned_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS budget_defaults (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     TEXT    NOT NULL,
  category    TEXT    NOT NULL,
  amount      REAL    NOT NULL,
  UNIQUE(user_id, category)
);

CREATE TABLE IF NOT EXISTS price_history (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id              TEXT    NOT NULL,
  item_name_normalized TEXT    NOT NULL,
  unit_price           REAL    NOT NULL,
  retailer             TEXT    NOT NULL,
  date                 TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_log (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id     TEXT,
  actor_user_id  TEXT,
  event_type     TEXT NOT NULL,
  target_user_id TEXT,
  metadata       TEXT,
  created_at     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS accounts (
  id             TEXT PRIMARY KEY,
  owner_user_id  TEXT NOT NULL,
  created_at     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS account_memberships (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id TEXT NOT NULL REFERENCES accounts(id),
  user_id    TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'owner',
  status     TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(account_id, user_id)
);

CREATE TABLE IF NOT EXISTS mailbox_connections (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       TEXT NOT NULL,
  provider      TEXT NOT NULL,
  access_token  TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'connected',
  connected_at  TEXT NOT NULL,
  updated_at    TEXT NOT NULL,
  UNIQUE(user_id, provider)
);
`;

const defaultCategories = [
  "Groceries",
  "Household",
  "Baby & Kids",
  "Health & Wellness",
  "Personal Care",
  "Electronics",
  "Clothing & Apparel",
  "Pet Supplies",
  "Other",
] as const;

const seedDefaultCategories = (db: Database.Database): void => {
  const existingRows = db.prepare("SELECT COUNT(*) as count FROM budgets").get() as {
    count: number;
  };

  if (existingRows.count > 0) {
    return;
  }

  const insertBudget = db.prepare(
    "INSERT INTO budgets (category, subcategory, month, amount) VALUES (?, NULL, ?, ?)"
  );

  const currentMonth = new Date().toISOString().slice(0, 7);

  const insertMany = db.transaction((categories: readonly string[]) => {
    for (const category of categories) {
      insertBudget.run(category, currentMonth, 0);
    }
  });

  insertMany(defaultCategories);
};

const addColumnIfMissing = (
  db: Database.Database,
  table: string,
  column: string,
  definition: string
): void => {
  const cols = db.pragma(`table_info(${table})`) as { name: string }[];
  if (!cols.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
};

export const runMigrations = (db: Database.Database): void => {
  db.exec(schemaSql);

  addColumnIfMissing(db, "budgets", "user_id", "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, "rules", "user_id", "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, "budget_defaults", "deleted", "INTEGER NOT NULL DEFAULT 0");
  addColumnIfMissing(db, "receipts", "account_id", "TEXT");
  addColumnIfMissing(db, "receipts", "contributor_user_id", "TEXT");
  addColumnIfMissing(db, "receipts", "dedupe_hash", "TEXT");
  addColumnIfMissing(db, "scan_state", "provider", "TEXT NOT NULL DEFAULT 'google'");
  addColumnIfMissing(db, "scan_state", "mailbox_connection_id", "INTEGER");

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_receipts_user_date ON receipts(user_id, transaction_date);
    CREATE INDEX IF NOT EXISTS idx_receipts_account_date ON receipts(account_id, transaction_date);
    CREATE INDEX IF NOT EXISTS idx_receipts_contributor_date ON receipts(contributor_user_id, transaction_date);
    CREATE INDEX IF NOT EXISTS idx_receipts_account_contributor_date ON receipts(account_id, contributor_user_id, transaction_date);
    CREATE INDEX IF NOT EXISTS idx_receipts_account_dedupe_hash ON receipts(account_id, dedupe_hash);
    CREATE INDEX IF NOT EXISTS idx_account_memberships_user_status ON account_memberships(user_id, status);
    CREATE INDEX IF NOT EXISTS idx_account_memberships_account_role_status ON account_memberships(account_id, role, status);
    CREATE INDEX IF NOT EXISTS idx_line_items_receipt_id ON line_items(receipt_id);
    CREATE INDEX IF NOT EXISTS idx_price_history_user_item ON price_history(user_id, item_name_normalized);
  `);

  db.exec(`
    UPDATE receipts
    SET contributor_user_id = user_id
    WHERE contributor_user_id IS NULL OR TRIM(contributor_user_id) = '';
  `);

  const usersNeedingAccount = db
    .prepare(
      `SELECT DISTINCT user_id
       FROM receipts
       WHERE user_id IS NOT NULL
         AND TRIM(user_id) <> ''
         AND (account_id IS NULL OR TRIM(account_id) = '')`
    )
    .all() as { user_id: string }[];

  const findExistingMembership = db.prepare(
    `SELECT account_id
     FROM account_memberships
     WHERE user_id = ? AND status = 'active'
     ORDER BY CASE WHEN role = 'owner' THEN 0 ELSE 1 END
     LIMIT 1`
  );
  const insertAccount = db.prepare(
    `INSERT INTO accounts (id, owner_user_id, created_at)
     VALUES (?, ?, ?)`
  );
  const insertMembership = db.prepare(
    `INSERT OR IGNORE INTO account_memberships (account_id, user_id, role, status, created_at, updated_at)
     VALUES (?, ?, 'owner', 'active', ?, ?)`
  );
  const updateReceiptAccount = db.prepare(
    `UPDATE receipts
     SET account_id = ?
     WHERE user_id = ? AND (account_id IS NULL OR TRIM(account_id) = '')`
  );

  const now = new Date().toISOString();
  const backfillAccounts = db.transaction((rows: { user_id: string }[]) => {
    for (const row of rows) {
      const normalizedUserId = row.user_id.trim().toLowerCase();
      if (!normalizedUserId) continue;

      const existing = findExistingMembership.get(normalizedUserId) as
        | { account_id: string }
        | undefined;
      const accountId = existing?.account_id ?? randomUUID();

      if (!existing) {
        insertAccount.run(accountId, normalizedUserId, now);
        insertMembership.run(accountId, normalizedUserId, now, now);
      }

      updateReceiptAccount.run(accountId, row.user_id);
    }
  });

  backfillAccounts(usersNeedingAccount);

  seedDefaultCategories(db);
};
