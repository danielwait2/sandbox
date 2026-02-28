import type Database from "better-sqlite3";

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

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS account_memberships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'member')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'removed')) DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (account_id, user_id),
  FOREIGN KEY (account_id) REFERENCES accounts(id)
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

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_receipts_user_date ON receipts(user_id, transaction_date);
    CREATE INDEX IF NOT EXISTS idx_line_items_receipt_id ON line_items(receipt_id);
    CREATE INDEX IF NOT EXISTS idx_account_memberships_user_status ON account_memberships(user_id, status);
    CREATE INDEX IF NOT EXISTS idx_account_memberships_account_role ON account_memberships(account_id, role);
  `);

  seedDefaultCategories(db);
  backfillAccounts(db);
};

const makeAccountId = (userId: string): string =>
  `acct_${Buffer.from(userId).toString("hex").slice(0, 24)}`;

const backfillAccounts = (db: Database.Database): void => {
  const users = db
    .prepare(
      `SELECT DISTINCT user_id FROM (
          SELECT user_id FROM receipts
          UNION
          SELECT user_id FROM budgets
          UNION
          SELECT user_id FROM rules
          UNION
          SELECT user_id FROM scan_state
       )
       WHERE user_id <> ''`
    )
    .all() as { user_id: string }[];

  const insert = db.transaction((rows: { user_id: string }[]) => {
    for (const row of rows) {
      const membership = db
        .prepare(
          `SELECT account_id
           FROM account_memberships
           WHERE user_id = ?`
        )
        .get(row.user_id) as { account_id: string } | undefined;

      if (membership) continue;

      const accountId = makeAccountId(row.user_id);
      const now = new Date().toISOString();

      db.prepare(
        `INSERT OR IGNORE INTO accounts (id, owner_user_id, created_at)
         VALUES (?, ?, ?)`
      ).run(accountId, row.user_id, now);

      db.prepare(
        `INSERT OR IGNORE INTO account_memberships (account_id, user_id, role, status, created_at, updated_at)
         VALUES (?, ?, 'owner', 'active', ?, ?)`
      ).run(accountId, row.user_id, now, now);
    }
  });

  insert(users);
};
