# MVP Spec — Grocery Receipt Email → Budgeting Dashboard

**Goal:** Demo that the full loop works — receive a Sam's Club / Walmart email, extract items, categorize them, and display them in a budgeting dashboard.

---

## The Demo Loop

```
Receipt Email Arrives in Gmail
        ↓
Gmail Trigger (watch / polling)
        ↓
LLM Parses Email → Normalizes Item Names → Assigns Categories
        ↓
Structured JSON saved / pushed to app
        ↓
Budgeting Dashboard updates (month view, categories, transactions)
```

---

## JSON Schema

Designed to be minimal but complete enough to power the budgeting dashboard. Easy to extend later.

```json
{
  "receipt_id": "a3f9c2d1-7e4b-4a12-b5f8-9c01d2e3f4a5",
  "imported_at": "2026-02-13T17:41:00Z",

  "retailer": {
    "name": "Sam's Club",
    "store_id": "6685",
    "address": "1313 S University Ave, Provo UT 84601"
  },

  "transaction": {
    "date": "2026-02-13",
    "time": "17:23",
    "payment_method": "Visa",
    "payment_last_four": "7247",
    "subtotal": 52.03,
    "tax": 1.56,
    "total": 53.59
  },

  "items": [
    {
      "raw_name": "SLT BTR QTRS",
      "name": "Salted Butter Quarters",
      "upc": "007874210442",
      "quantity": 1,
      "unit_price": 8.44,
      "total_price": 8.44,
      "category": "Groceries",
      "subcategory": "Dairy",
      "confidence": 0.97
    },
    {
      "raw_name": "MM CF LG AA",
      "name": "Member's Mark Large AA Eggs",
      "upc": "019396815905",
      "quantity": 1,
      "unit_price": 4.42,
      "total_price": 4.42,
      "category": "Groceries",
      "subcategory": "Dairy & Eggs",
      "confidence": 0.91
    },
    {
      "raw_name": "CAESAR SALAD",
      "name": "Caesar Salad Kit",
      "upc": "081655402117",
      "quantity": 1,
      "unit_price": 3.86,
      "total_price": 3.86,
      "category": "Groceries",
      "subcategory": "Produce",
      "confidence": 0.95
    },
    {
      "raw_name": "MM SW SALAD",
      "name": "Member's Mark Southwest Salad",
      "upc": "019396811363",
      "quantity": 1,
      "unit_price": 2.46,
      "total_price": 2.46,
      "category": "Groceries",
      "subcategory": "Produce",
      "confidence": 0.92
    },
    {
      "raw_name": "COSMIC CRISP",
      "name": "Cosmic Crisp Apples",
      "upc": "088828940419",
      "quantity": 1,
      "unit_price": 5.62,
      "total_price": 5.62,
      "category": "Groceries",
      "subcategory": "Produce",
      "confidence": 0.98
    },
    {
      "raw_name": "CLEMENTINES",
      "name": "Clementines",
      "upc": "001466834001",
      "quantity": 1,
      "unit_price": 6.57,
      "total_price": 6.57,
      "category": "Groceries",
      "subcategory": "Produce",
      "confidence": 0.99
    },
    {
      "raw_name": "MMTOMATOSAUC",
      "name": "Member's Mark Tomato Sauce",
      "upc": "007874225619",
      "quantity": 1,
      "unit_price": 9.68,
      "total_price": 9.68,
      "category": "Groceries",
      "subcategory": "Pantry",
      "confidence": 0.94
    },
    {
      "raw_name": "KETOCLUSTERS",
      "name": "Keto Clusters (Snack)",
      "upc": "067721009212",
      "quantity": 1,
      "unit_price": 10.98,
      "total_price": 10.98,
      "category": "Groceries",
      "subcategory": "Snacks",
      "confidence": 0.88
    }
  ]
}
```

### Key field decisions

| Field | Why it's there |
|---|---|
| `raw_name` | Preserve original abbreviated text for debugging / re-parsing |
| `name` | LLM-normalized, human-readable name shown in the dashboard |
| `upc` | Enables future product lookups, deduplication, price tracking |
| `category` + `subcategory` | Two-level taxonomy maps to dashboard budget groups (see below) |
| `confidence` | Flags low-confidence items for manual review in the UI |
| `receipt_id` | Idempotency — don't import the same receipt twice |
| `imported_at` vs `transaction.date` | Separate so we know when it entered the system vs. when the purchase happened |

---

## Category Taxonomy (MVP)

Flat enough to be simple, structured enough to be useful.

| Category | Subcategories |
|---|---|
| Groceries | Produce, Dairy & Eggs, Meat & Seafood, Pantry, Snacks, Beverages, Frozen, Bakery |
| Household | Cleaning, Paper Goods, Storage & Organization |
| Personal Care | Health, Beauty, Baby |
| Other | Uncategorized (fallback) |

These map directly to the budget groups in the dashboard.

---

## Budgeting Dashboard (What the JSON powers)

YNAB-style but simpler. Interactive web app backed by SQLite.

**Tech stack:** Next.js (or plain Express + React) + SQLite via `better-sqlite3`. Simple enough to run locally for the demo, no cloud infra needed.

**Three views:**

**1. Month Overview**
- Month selector (default: current month)
- Total spent vs. budget per category group
- Visual progress bars (green → yellow → red as you approach budget)
- Summary cards: total spent, # of receipts, # of items

**2. Category Drill-Down**
- Click any category group → expands to show subcategories
- Each subcategory shows: spent, budget, % used
- Sparkline trend vs. prior month (nice-to-have for demo)

**3. Transactions List**
- All line items from all receipts, sorted by date desc
- Columns: Date | Store | Item Name | Subcategory | Price
- Filter by category, store, or month
- Items with `confidence < 0.85` shown with a ⚠ flag
- Inline recategorize: click the category pill to change it (updates SQLite immediately)

---

## SQLite Schema

Three tables. JSON gets parsed and written into these on import.

```sql
-- One row per receipt email
CREATE TABLE receipts (
  id TEXT PRIMARY KEY,          -- receipt_id (UUID)
  retailer TEXT NOT NULL,       -- "Sam's Club", "Walmart"
  store_id TEXT,                -- "6685"
  transaction_date TEXT NOT NULL, -- "2026-02-13" (ISO date)
  subtotal REAL,
  tax REAL,
  total REAL NOT NULL,
  payment_method TEXT,
  payment_last_four TEXT,
  imported_at TEXT NOT NULL     -- ISO timestamp
);

-- One row per line item
CREATE TABLE items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  receipt_id TEXT NOT NULL REFERENCES receipts(id),
  raw_name TEXT NOT NULL,
  name TEXT NOT NULL,
  upc TEXT,
  quantity INTEGER DEFAULT 1,
  unit_price REAL NOT NULL,
  total_price REAL NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  confidence REAL,
  user_overridden INTEGER DEFAULT 0  -- 1 if user manually changed the category
);

-- Budget targets set by the user
CREATE TABLE budgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  subcategory TEXT,             -- NULL = budget applies to whole category
  month TEXT NOT NULL,          -- "2026-02" (year-month)
  amount REAL NOT NULL
);
```

**Key query for the month overview:**
```sql
SELECT
  i.category,
  i.subcategory,
  SUM(i.total_price) AS spent,
  b.amount AS budget
FROM items i
JOIN receipts r ON i.receipt_id = r.id
LEFT JOIN budgets b
  ON b.category = i.category
  AND b.subcategory = i.subcategory
  AND b.month = '2026-02'
WHERE strftime('%Y-%m', r.transaction_date) = '2026-02'
GROUP BY i.category, i.subcategory;
```

---

## Trigger Mechanism (Gmail → Parser)

For the real version: Gmail API `watch()` sends a Pub/Sub notification when a new email arrives. The backend checks if it's from a supported retailer and kicks off parsing.

**For the demo (Wizard of Oz options):**

| Option | Effort | Looks like |
|---|---|---|
| Forward email to a special address (e.g. `receipts@yourapp.com`) | Low | User manually forwards; backend parses on receipt |
| Paste email text into a form field | Lowest | Not automatic but shows the extraction working |
| Gmail OAuth + polling every 5 min | Medium | Closest to real; checks for new retailer emails on a timer |
| Gmail `watch()` + Pub/Sub (real-time) | Higher | Production-ready trigger |

**Recommendation for demo:** Start with email forwarding. It's one setup step for the user and feels automatic once configured. Avoids the Gmail OAuth audit complexity for now.

---

## Supported Retailers (MVP)

- Sam's Club (confirmed email format above)
- Walmart (online order confirmation emails)

Identified by sender domain: `@samsclub.com`, `@walmart.com`

---

## What we are Wizard of Oz-ing

- LLM normalization can be run manually per demo — no need to automate the full pipeline
- Budget amounts can be hardcoded for the demo (e.g., $600/mo grocery budget)
- Dashboard is interactive (SQLite-backed) but runs entirely locally — no cloud infra needed for the demo

---

## Open Questions

- Do we want a web dashboard or just show the JSON output for the demo?
- Seed SQLite with a few months of fake receipts so the dashboard looks full for the demo?
- Should low-confidence items show in the UI as "needs review" or just be auto-assigned?
- Add Costco to supported retailers? Their email format is similar.
