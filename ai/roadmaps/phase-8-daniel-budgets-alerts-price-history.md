# Phase 8 — Budget Targets, Spending Alerts & Price History (daniel)

**Timeline:** Days 16–18
**Status:** Not Started
**Roadmap:** [2026-02-28-roadmap-phase8-daniel-budgets-alerts-price-history.md](./2026-02-28-roadmap-phase8-daniel-budgets-alerts-price-history.md) — Track progress

---

## Overview

Three additive features on top of the completed MVP:

1. **Monthly Budget Targets** — dedicated `/budget` page + `budget_defaults` table for auto-seeding new months
2. **Spending Alerts** — in-app banner on `/dashboard` when any category hits ≥ 90% of its budget
3. **Item Price History** — `price_history` table, populated on every scan, surfaced as inline trend notes on the category drill-down page

---

## Prerequisites

- Phases 1–7 complete and `next build` green
- `budgets` table exists with `(id, user_id, category, subcategory, month, amount)` schema
- `GET /api/dashboard/summary` returns `{ category, spent, budget }` per category

---

## Success Criteria

- `/budget` page fully functional with live spend data and editable defaults
- Alert banner appears on `/dashboard` only when a category is ≥ 90% of its budget, dismissible per session
- `price_history` populated on every receipt scan and backfilled on first run
- Inline price trend note shown per line item on `/dashboard/category/[name]`
- `next build` passes with zero errors

---

## Implementation Steps

---

### Feature 1: Monthly Budget Targets

#### Step 1 — Add `budget_defaults` table

**File:** `lib/migrations.ts`

Add after the existing `budgets` table migration:

```sql
CREATE TABLE IF NOT EXISTS budget_defaults (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     TEXT    NOT NULL,
  category    TEXT    NOT NULL,
  amount      REAL    NOT NULL,
  UNIQUE(user_id, category)
);
```

TypeScript interface (add to `lib/types.ts`):

```ts
export interface BudgetDefault {
  id: number;
  user_id: string;
  category: string;
  amount: number;
}
```

---

#### Step 2 — Budget defaults API

**File:** `app/api/budget-defaults/route.ts` (new)

```
GET  /api/budget-defaults          — return all budget_defaults rows for the session user
PUT  /api/budget-defaults          — body: { category: string; amount: number | null }
                                     if amount is null, DELETE the row (unset default)
                                     otherwise UPSERT (INSERT OR REPLACE)
```

Business logic lives in `lib/budgetDefaults.ts` (new):

```ts
// lib/budgetDefaults.ts
export function getBudgetDefaults(userId: string): BudgetDefault[]
export function upsertBudgetDefault(userId: string, category: string, amount: number): void
export function deleteBudgetDefault(userId: string, category: string): void
```

Use `INSERT OR REPLACE` for upsert (SQLite).

---

#### Step 3 — Auto-seed new months from defaults

**File:** `lib/budgets.ts` (existing, or create if it doesn't exist)

Add a helper:

```ts
export function seedBudgetFromDefaults(userId: string, month: string): void
```

Logic:
1. Fetch all `budget_defaults` for the user
2. For each default, check if a `budgets` row already exists for `(user_id, category, month)`
3. If not, `INSERT INTO budgets (user_id, category, month, amount) VALUES (?, ?, ?, ?)`

**Where to call it:** At the top of `GET /api/dashboard/summary` and `GET /api/categories`, call `seedBudgetFromDefaults(userId, currentMonth)` before querying budgets. This ensures new months are seeded lazily on first read — no cron job needed.

---

#### Step 4 — `/budget` page

**File:** `app/budget/page.tsx` (new)

- Mark `'use client'`
- On mount: fetch `GET /api/dashboard/summary?period=<current YYYY-MM>` for spend data, and `GET /api/budget-defaults` for defaults
- Render one `<BudgetRow>` per category

**File:** `components/BudgetRow.tsx` (new)

Props:
```ts
interface BudgetRowProps {
  category: string;
  spent: number;
  budget: number;        // current month budget amount (0 if not set)
  defaultAmount: number | null;
  onBudgetChange: (category: string, amount: number) => void;
  onDefaultToggle: (category: string, amount: number | null) => void;
}
```

Each row contains:
- Category name (left)
- Progress bar (same green/yellow/red logic as `CategoryCard`)
- Spend summary text: `$X spent of $Y` (or "No budget set" if 0)
- Editable amount input — on blur, calls `PUT /api/categories` with the new amount
- "Set as default" checkbox — when checked, calls `PUT /api/budget-defaults` with the current amount; when unchecked, calls `PUT /api/budget-defaults` with `amount: null`

---

#### Step 5 — Add `/budget` to nav

**File:** `components/Nav.tsx` (or wherever the persistent nav lives from Phase 7)

Add a `Budget` link pointing to `/budget`, with active highlight via `usePathname()`.

---

### Feature 2: Spending Alerts

#### Step 6 — `SpendingAlertBanner` component

**File:** `components/SpendingAlertBanner.tsx` (new)

Props:
```ts
interface SpendingAlertBannerProps {
  // summary data already fetched by the dashboard page
  categories: Array<{ category: string; spent: number; budget: number }>;
}
```

Logic:
1. On mount, read `localStorage.getItem('runway_alerts_dismissed')` — if set to today's date string (`YYYY-MM-DD`), render nothing
2. Filter `categories` for rows where `budget > 0` and `spent / budget >= 0.9`
3. If none triggered, render nothing
4. Render a yellow/amber banner (Tailwind `bg-amber-50 border border-amber-300`) listing each triggered category:
   - `"Groceries is at 94% of your $300 budget this month — $18 left"`
   - Format amounts with `$` and two decimal places
5. Include an `×` dismiss button — on click, set `localStorage.setItem('runway_alerts_dismissed', todayDateString)` and hide the banner

**No server calls.** The banner is purely derived from the summary data the dashboard already fetches.

---

#### Step 7 — Mount banner on `/dashboard`

**File:** `app/dashboard/page.tsx` (existing)

- Import `<SpendingAlertBanner>`
- Pass the already-fetched summary array as props
- Render the banner above the `CategoryCard` grid

---

### Feature 3: Item Price History

#### Step 8 — Add `price_history` table

**File:** `lib/migrations.ts`

Add after the `budget_defaults` migration:

```sql
CREATE TABLE IF NOT EXISTS price_history (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id              TEXT    NOT NULL,
  item_name_normalized TEXT    NOT NULL,
  unit_price           REAL    NOT NULL,
  retailer             TEXT    NOT NULL,
  date                 TEXT    NOT NULL   -- ISO 8601: YYYY-MM-DD
);
CREATE INDEX IF NOT EXISTS idx_price_history_user_item
  ON price_history(user_id, item_name_normalized);
```

TypeScript interface (add to `lib/types.ts`):

```ts
export interface PriceHistoryEntry {
  id: number;
  user_id: string;
  item_name_normalized: string;
  unit_price: number;
  retailer: string;
  date: string; // YYYY-MM-DD
}
```

---

#### Step 9 — Name normalization + upsert logic

**File:** `lib/priceHistory.ts` (new)

```ts
export function normalizeItemName(name: string): string
// lowercase, trim, collapse whitespace, remove stop words:
// ("the", "a", "an", "oz", "lb", "ct", "pk", "pack", "count")
// Example: "Kirkland Signature Organic Chicken Breast 6 CT" → "kirkland signature organic chicken breast 6"

export function upsertPriceHistory(
  userId: string,
  items: Array<{ name: string; unit_price: number; retailer: string; date: string }>
): void
// For each item: normalizeItemName(name), then INSERT INTO price_history
// No deduplication needed — each receipt scan is a distinct data point

export function getPriceHistory(userId: string, normalizedName: string): PriceHistoryEntry[]
// SELECT * FROM price_history WHERE user_id = ? AND item_name_normalized = ?
// ORDER BY date ASC
```

---

#### Step 10 — Populate price_history on every scan

**File:** `lib/parseReceipt.ts` (or wherever line items are saved after Gemini parsing)

After the `INSERT INTO line_items` loop, call:

```ts
upsertPriceHistory(userId, lineItems.map(item => ({
  name: item.name,
  unit_price: item.unit_price,
  retailer: receipt.retailer,
  date: receipt.transaction_date,
})));
```

---

#### Step 11 — Backfill existing line items

**File:** `lib/backfillPriceHistory.ts` (new)

```ts
export function backfillPriceHistoryIfEmpty(userId: string): void
```

Logic:
1. `SELECT COUNT(*) FROM price_history WHERE user_id = ?`
2. If count > 0, return immediately (already seeded)
3. Otherwise, query:
   ```sql
   SELECT li.name, li.unit_price, r.retailer, r.transaction_date AS date
   FROM line_items li
   JOIN receipts r ON r.id = li.receipt_id
   WHERE r.user_id = ?
   ```
4. Call `upsertPriceHistory(userId, rows)`

**Where to call it:** At the top of `GET /api/dashboard/summary` (same place as `seedBudgetFromDefaults`). Runs once per user, then no-ops forever.

---

#### Step 12 — Price history API

**File:** `app/api/item-history/route.ts` (new)

```
GET /api/item-history?name=<normalized_name>
```

- Require auth; return 401 if not signed in
- Call `getPriceHistory(userId, name)`
- Return `{ entries: PriceHistoryEntry[] }`

---

#### Step 13 — Price trend notes on category drill-down

**File:** `app/dashboard/category/[name]/page.tsx` (existing)

For each line item rendered:

1. Fetch `GET /api/item-history?name=<normalizeItemName(item.name)>` — can be done in a single batched server component fetch or client-side per item
2. Compute trend:
   - If `entries.length < 2`: show nothing
   - Compare `entries[entries.length - 1].unit_price` (latest, excluding current) to current `item.unit_price`:
     - If current > previous: `↑ $X.XX since last purchase`
     - If current < previous: `↓ $X.XX since last purchase`
     - If equal: `Stable`
3. Render as small muted text below the item name (Tailwind `text-xs text-gray-400`)

Implementation note: to avoid N+1 fetches, fetch all history for the page's items in one server-side pass using `getPriceHistory` directly (server component), not via the API route.

---

---

### Feature 4: Dashboard Improvements & Bug Fixes

#### Step 14 — Rename "Scan Receipts" → "Pull Receipts from Email"

**File:** `app/dashboard/page.tsx`

Change both button label strings from `'Scan Receipts'` / `'Scanning...'` to `'Pull Receipts from Email'` / `'Pulling...'`. Update the empty-state copy from `"Connect Gmail and scan your receipts to get started"` to `"Connect Gmail and pull your receipts to get started"`.

---

#### Step 15 — Remove "Most Frequent Item" from dashboard summary

**Files:** `app/dashboard/page.tsx`, `components/SummaryStats.tsx`, `app/api/dashboard/summary/route.ts`

1. Remove `mostFrequentItem` from the `SummaryData` type in `page.tsx`
2. Remove it from the `<SummaryStats>` call and from the `SummaryStats` component props/render
3. Remove it from the API response in the summary route
4. Remove it from the DB query if it has one (likely a `GROUP BY` + `ORDER BY COUNT` query)

The dashboard summary stats should show: **Total Spend**, **Receipt Count**, **Top Category** (three tiles).

---

#### Step 16 — Fix month-aware category drill-down

**Bug:** `app/dashboard/category/[name]/page.tsx` hardcodes `currentMonth` on line 39 (`fetch(\`/api/items?category=...&month=${currentMonth}\``), so switching the period selector to "Last Month" and clicking a tile still shows this month's data.

**Fix — dashboard page (`app/dashboard/page.tsx`):**

In the `router.push` call for category card clicks, append the selected period as a query param:

```ts
onClick={() =>
  router.push(
    '/dashboard/category/' + encodeURIComponent(cat.name) + '?period=' + encodeURIComponent(period)
  )
}
```

**Fix — drill-down page (`app/dashboard/category/[name]/page.tsx`):**

1. Add `useSearchParams` import from `next/navigation`
2. Read the period: `const searchParams = useSearchParams(); const period = searchParams.get('period') ?? 'this_month';`
3. Resolve the month string from the period the same way the dashboard API does — extract a helper or inline the logic:
   - `'this_month'` → `new Date().toISOString().slice(0, 7)`
   - `'last_month'` → compute previous month as `YYYY-MM`
   - A literal `'YYYY-MM'` value → use as-is
4. Pass the resolved month to the API fetch instead of always using `currentMonth`
5. Update the empty-state message to reflect the selected month (e.g. "No items in this category for January 2026.")

---

## File Structure

```
runway/
├── lib/
│   ├── migrations.ts           (modified: add budget_defaults, price_history)
│   ├── types.ts                (modified: add BudgetDefault, PriceHistoryEntry)
│   ├── budgetDefaults.ts       (new)
│   ├── budgets.ts              (new or modified: add seedBudgetFromDefaults)
│   ├── priceHistory.ts         (new)
│   └── backfillPriceHistory.ts (new)
├── app/
│   ├── budget/
│   │   └── page.tsx            (new)
│   ├── dashboard/
│   │   ├── page.tsx            (modified: add SpendingAlertBanner)
│   │   └── category/
│   │       └── [name]/
│   │           └── page.tsx    (modified: add price trend notes)
│   └── api/
│       ├── budget-defaults/
│       │   └── route.ts        (new)
│       └── item-history/
│           └── route.ts        (new)
└── components/
    ├── SpendingAlertBanner.tsx  (new)
    ├── BudgetRow.tsx            (new)
    └── Nav.tsx                  (modified: add /budget link)
```

---

## Tech & Libraries

| Library | Purpose |
|---|---|
| `better-sqlite3` | All new table queries, migrations, backfill |
| Tailwind CSS | `BudgetRow`, `SpendingAlertBanner` layout and color |
| `localStorage` | Alert dismiss state (browser only, no server) |

No new npm packages required.

---

## Testing Strategy

1. Run migrations on a fresh DB — confirm `budget_defaults` and `price_history` tables created
2. Set a default on `/budget`, advance the month (or manually delete the `budgets` row) — confirm new month is seeded
3. Trigger alert banner: set a budget of $10, add spend of $9.50 — confirm banner appears with correct message
4. Dismiss banner, refresh — confirm it does not re-appear in the same session
5. Scan a new receipt — confirm `price_history` rows inserted
6. Load app with existing `line_items` and empty `price_history` — confirm backfill runs, confirm it does not run again on next load
7. `GET /api/item-history?name=kirkland+chicken` — confirm correct entries in date order
8. Load `/dashboard/category/Groceries` — confirm trend notes appear for items with ≥ 2 history entries, nothing shown for items with < 2
9. Run `next build` — zero errors

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| N+1 history fetches on category drill-down | Fetch all history for the page's items in one server-side pass rather than per-item API calls |
| Backfill runs on every request for new users with no items | `COUNT(*)` check is a single cheap query; acceptable |
| Name normalization produces false matches | Keep stop-word list minimal; only strip units and filler words, not brand names |
| `localStorage` not available during SSR | Guard with `typeof window !== 'undefined'` check in `SpendingAlertBanner` |
| `budget_defaults` upsert clobbers a different user's row | Always filter by `user_id` in WHERE clause; UNIQUE constraint is on `(user_id, category)` |

---

## Deliverables

- `lib/migrations.ts` — `budget_defaults` and `price_history` tables
- `lib/types.ts` — `BudgetDefault`, `PriceHistoryEntry` interfaces
- `lib/budgetDefaults.ts` — defaults CRUD
- `lib/budgets.ts` — `seedBudgetFromDefaults`
- `lib/priceHistory.ts` — normalize, upsert, get
- `lib/backfillPriceHistory.ts` — one-time backfill
- `app/api/budget-defaults/route.ts`
- `app/api/item-history/route.ts`
- `app/budget/page.tsx`
- `components/BudgetRow.tsx`
- `components/SpendingAlertBanner.tsx`
- Updated `app/dashboard/page.tsx` — alert banner, renamed button, removed most-frequent-item stat, period passed to drill-down
- Updated `app/dashboard/category/[name]/page.tsx` — price trend notes, month-aware data fetch via `?period=` param
- Updated `components/SummaryStats.tsx` — removed mostFrequentItem prop/render
- Updated `app/api/dashboard/summary/route.ts` — removed mostFrequentItem from response
- Updated nav — `/budget` link
- Clean `next build` with zero errors
