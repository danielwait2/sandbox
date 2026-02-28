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

export const runMigrations = (db: Database.Database): void => {
  db.exec(schemaSql);
  seedDefaultCategories(db);
};
