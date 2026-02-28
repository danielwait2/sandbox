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
    CREATE INDEX IF NOT EXISTS idx_receipts_account_dedupe_hash ON receipts(account_id, dedupe_hash);
    CREATE INDEX IF NOT EXISTS idx_line_items_receipt_id ON line_items(receipt_id);
    CREATE INDEX IF NOT EXISTS idx_price_history_user_item ON price_history(user_id, item_name_normalized);
  `);

  seedDefaultCategories(db);
};
