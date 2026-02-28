# Phase 9 — Receipt List & Detail Pages

**Timeline:** Days 19–20
**Status:** Not Started
**Roadmap:** [2026-02-28-roadmap-phase9-daniel-receipt-list.md](./2026-02-28-roadmap-phase9-daniel-receipt-list.md) — Track progress

---

## Overview

Adds two pages that close the trust gap — users currently have no way to verify which receipts were ingested or whether the line items were parsed correctly. The backend detail endpoint already exists. This phase is almost entirely frontend work.

---

## Prerequisites

- Phases 1–8 complete and `next build` green
- `GET /api/receipts/[id]` already exists and returns `{ id, retailer, transaction_date, subtotal, tax, total, order_number, items[] }`

---

## Success Criteria

- `/receipts` lists all receipts sorted newest-first with retailer, date, total, item count
- Clicking a row goes to `/receipts/[id]`
- `/receipts/[id]` shows full receipt detail: header info + every line item
- Empty state on `/receipts` when nothing is ingested yet
- Nav updated with `/receipts` link
- `next build` passes with zero errors

---

## Implementation Steps

---

### Step 1 — `GET /api/receipts` list endpoint

**File:** `app/api/receipts/route.ts` (new — note: `app/api/receipts/[id]/route.ts` and `app/api/receipts/scan/route.ts` already exist; this is the index route)

```ts
// Returns all receipts for the session user, sorted by transaction_date DESC
// Also joins a COUNT of line_items so the list page can show item count without a second query
```

Query:
```sql
SELECT r.id, r.retailer, r.transaction_date, r.subtotal, r.tax, r.total, r.order_number,
       COUNT(li.id) AS item_count
FROM receipts r
LEFT JOIN line_items li ON li.receipt_id = r.id
WHERE r.user_id = ?
GROUP BY r.id
ORDER BY r.transaction_date DESC
```

Response shape:
```ts
type ReceiptSummary = {
  id: string;
  retailer: string;
  transaction_date: string;   // YYYY-MM-DD
  subtotal: number | null;
  tax: number | null;
  total: number;
  order_number: string | null;
  item_count: number;
};

// Returns: { receipts: ReceiptSummary[] }
```

---

### Step 2 — `/receipts` list page

**File:** `app/receipts/page.tsx` (new)

- Mark `'use client'`
- On mount: fetch `GET /api/receipts`, set state
- Render a table or card list — one row per receipt:

| Column | Value |
|---|---|
| Date | `transaction_date` formatted as `Mon DD, YYYY` |
| Retailer | `receipt.retailer` |
| Items | `item_count` |
| Total | `formatUSD(receipt.total)` |

Each row is clickable and navigates to `/receipts/<id>`.

Empty state: if `receipts.length === 0`, show "No receipts yet — pull your receipts from email to get started" with a link to `/dashboard`.

Skeleton: show 5 skeleton rows while loading.

---

### Step 3 — `/receipts/[id]` detail page

**File:** `app/receipts/[id]/page.tsx` (new)

- Mark `'use client'`
- Read `id` from `useParams()`
- On mount: fetch `GET /api/receipts/<id>`
- Render:

**Header section:**
- Back link: `← Back to Receipts`
- Retailer name as `<h1>`
- Date, order number (if present), subtotal, tax, total as a small info block

**Line items section:**
- Same table layout as the category drill-down:
  - Item name + subcategory badge (small gray pill)
  - Qty × unit price
  - Category
  - Total price (right-aligned)

**404 state:** if the API returns 404, show "Receipt not found" with a back link.

---

### Step 4 — Add `/receipts` to nav

**File:** `app/components/Nav.tsx` (existing)

Add a `Receipts` link pointing to `/receipts`, with active highlight via `usePathname()`.

---

## File Structure

```
runway/
├── app/
│   ├── api/
│   │   └── receipts/
│   │       └── route.ts          (new — list endpoint)
│   └── receipts/
│       ├── page.tsx              (new — list page)
│       └── [id]/
│           └── page.tsx          (new — detail page)
└── app/components/
    └── Nav.tsx                   (modified — add /receipts link)
```

---

## Tech & Libraries

| Library | Purpose |
|---|---|
| `better-sqlite3` | Receipt list query with item count join |
| Tailwind CSS | List table, detail layout |

No new npm packages required.

---

## Deliverables

- `app/api/receipts/route.ts` — list endpoint
- `app/receipts/page.tsx` — receipt list
- `app/receipts/[id]/page.tsx` — receipt detail
- Updated `app/components/Nav.tsx` — `/receipts` link
- Clean `next build` with zero errors
