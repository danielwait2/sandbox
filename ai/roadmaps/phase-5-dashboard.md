# Phase 5 — Dashboard

**Timeline:** Days 9–11
**Status:** Not Started
**Roadmap:** [2026-02-28-roadmap-phase5-dashboard.md](./2026-02-28-roadmap-phase5-dashboard.md) — Track progress

---

## Overview

Build the main dashboard UI: category spend overview with progress bars, a time-period toggle, summary stats, and a drill-down view of items within a category. All data comes from the `line_items` and `budgets` tables via a dedicated aggregation API route. When this phase is complete, users can see their spending by category and navigate into individual categories.

---

## Prerequisites

- Phase 1 complete: Auth, session, SQLite
- Phase 4 complete: All `line_items` rows have categories and confidence scores
- The `budgets` table exists (Phase 1 migration); budget targets are optional for users

---

## Success Criteria

- `/dashboard` loads without error for an authenticated user
- The overview shows all 9 categories with: total spend, budget target (if set), and a color-coded progress bar
- The time toggle (This Month / Last Month / 3 Months) updates the data without a page reload
- Summary stats display correctly: total spend, receipt count, top category, most frequent item
- Tapping/clicking a category opens a drill-down list of its items, sorted by total price descending
- Categories with no spend in the selected period display $0 (not hidden)
- `GET /api/dashboard/summary` returns the aggregated data for the selected period

---

## Implementation Steps

1. **Create the dashboard summary API route**
   - File: `app/api/dashboard/summary/route.ts`
   - Method: `GET`
   - Query param: `period` — `this_month` | `last_month` | `3_months` (default: `this_month`)
   - Compute the date range from `period` (ISO date strings)
   - Run a single SQL query:
     ```sql
     SELECT
       li.category,
       SUM(li.total_price) as total_spend,
       COUNT(li.id) as item_count
     FROM line_items li
     JOIN receipts r ON li.receipt_id = r.id
     WHERE r.user_id = ? AND r.transaction_date >= ? AND r.transaction_date <= ?
     GROUP BY li.category
     ```
   - Fetch matching `budgets` rows for the period and merge budget targets into the response
   - Compute summary stats in the same query or separate queries:
     - Total spend: `SUM` across all categories
     - Receipt count: `SELECT COUNT(*) FROM receipts WHERE user_id = ? AND ...`
     - Top category: category with highest `total_spend`
     - Most frequent item: `SELECT name, COUNT(*) as c FROM line_items ... GROUP BY name ORDER BY c DESC LIMIT 1`
   - Return shape:
     ```json
     {
       "period": "this_month",
       "totalSpend": 412.50,
       "receiptCount": 7,
       "topCategory": "Groceries",
       "mostFrequentItem": "Salted Butter Quarters",
       "categories": [
         { "name": "Groceries", "spend": 280.00, "budget": 350.00, "itemCount": 42 },
         ...
       ]
     }
     ```

2. **Build the category spend card component**
   - File: `app/dashboard/components/CategoryCard.tsx`
   - Props: `name`, `spend`, `budget` (optional), `itemCount`
   - Render: category name, spend amount, a progress bar, and item count
   - Progress bar color: green if `spend / budget < 0.75`, yellow if `0.75–1.0`, red if `> 1.0`
   - If `budget` is null, show a neutral gray progress bar with spend only (no target denominator)

3. **Build the summary stats bar**
   - File: `app/dashboard/components/SummaryStats.tsx`
   - Props: `totalSpend`, `receiptCount`, `topCategory`, `mostFrequentItem`
   - Render: 4 stat tiles in a horizontal row

4. **Build the time toggle**
   - File: `app/dashboard/components/PeriodToggle.tsx`
   - Three buttons: "This Month" / "Last Month" / "3 Months"
   - Controls a `period` state variable passed up to the dashboard page
   - Active button is highlighted

5. **Build the dashboard page**
   - File: `app/dashboard/page.tsx`
   - Mark as `'use client'` — data fetches on the client using `fetch('/api/dashboard/summary?period=...')`
   - State: `period` (default `this_month`), `data` (API response), `loading`
   - Render: `<PeriodToggle>`, `<SummaryStats>`, grid of `<CategoryCard>` (one per category)
   - On category click: navigate to `/dashboard/category/[name]`
   - Show a "Connect Gmail and scan your receipts to get started" CTA if `receiptCount === 0`

6. **Build the category drill-down page**
   - File: `app/dashboard/category/[name]/page.tsx`
   - Mark as `'use client'`
   - Fetch `GET /api/items?category=<name>&month=<current>` (re-use Phase 4 route)
   - Render a list of items: product name, quantity, unit price, total price
   - Sort by `total_price DESC`
   - Back link to `/dashboard`
   - Show the period's category total at the top

7. **Budget target inline editing**
   - File: `app/dashboard/components/CategoryCard.tsx` (extend)
   - Add a small pencil icon next to the budget amount
   - On click: show an inline input for the budget amount
   - On blur/enter: `PUT /api/categories` with `{ category, month, amount }`
   - See step 8 for the API route

8. **Create the categories API route**
   - File: `app/api/categories/route.ts`
   - `GET`: return all `budgets` rows for the user (all months, or current month filtered)
   - `PUT`: upsert a budget row — `INSERT OR REPLACE INTO budgets (category, subcategory, month, amount) VALUES (?, ?, ?, ?)`
   - Note: `budgets` schema has no `user_id` in the current schema (`aiDocs/context.md`) — add `user_id` to the migration if multiple users share the DB instance. For single-user MVP, scope by session.

---

## File Structure

```
runway/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx                        (modified: full implementation)
│   │   ├── category/
│   │   │   └── [name]/
│   │   │       └── page.tsx                (new)
│   │   └── components/
│   │       ├── CategoryCard.tsx            (new)
│   │       ├── SummaryStats.tsx            (new)
│   │       └── PeriodToggle.tsx            (new)
│   └── api/
│       ├── dashboard/
│       │   └── summary/
│       │       └── route.ts                (new)
│       └── categories/
│           └── route.ts                    (new)
```

---

## Tech & Libraries

| Library | Purpose | Reference |
|---|---|---|
| `next` | App Router pages, client components, `useRouter` | `ai/context7/nextjs.md` |
| `better-sqlite3` | Aggregation queries for summary and category data | `ai/context7/better-sqlite3.md` |
| Tailwind CSS | Progress bars, color states, responsive grid | — |

---

## Testing Strategy

1. Seed the DB with known `line_items` across two months and multiple categories
2. `GET /api/dashboard/summary?period=this_month` — assert totals match seeded data
3. `GET /api/dashboard/summary?period=last_month` — assert different totals for the prior month
4. `GET /api/dashboard/summary?period=3_months` — assert totals span both months
5. Load `/dashboard` in the browser — confirm all 9 categories appear, progress bars render
6. Toggle "Last Month" — confirm data updates without full page reload
7. Click a category — confirm drill-down shows only items for that category
8. `PUT /api/categories` with a budget amount — confirm progress bar reflects the new target
9. Verify a user with zero receipts sees the CTA and $0 across all categories

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| `budgets` table lacks `user_id` (schema as written) | Add `user_id` to the `budgets` migration in Phase 1's `migrations.ts`; this is a schema fix, not a feature add |
| Aggregation queries slow on large datasets | Add an index: `CREATE INDEX idx_line_items_receipt_id ON line_items(receipt_id)` and `CREATE INDEX idx_receipts_user_date ON receipts(user_id, transaction_date)` in migrations |
| Client-side fetch causes loading flash | Show a skeleton UI during `loading` state — simple gray placeholder cards |
| Category names with spaces break URL routing | URL-encode category names in `Link` hrefs; decode with `decodeURIComponent` in the dynamic route |

---

## Deliverables

- `app/api/dashboard/summary/route.ts` — aggregated spend, stats, budget data
- `app/api/categories/route.ts` — budget targets CRUD
- `app/dashboard/page.tsx` — full dashboard with toggle, stats, category cards
- `app/dashboard/category/[name]/page.tsx` — item drill-down by category
- `app/dashboard/components/` — `CategoryCard`, `SummaryStats`, `PeriodToggle`
