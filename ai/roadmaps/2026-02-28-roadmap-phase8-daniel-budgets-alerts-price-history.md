# Phase 8 Roadmap: Budget Targets, Spending Alerts & Price History

**Status:** In Progress
**Timeline:** Days 16–18
**Detailed Plan:** [phase-8-daniel-budgets-alerts-price-history.md](./phase-8-daniel-budgets-alerts-price-history.md)

---

## ⚠️ Development Philosophy

**Avoid over-engineering, cruft, and legacy-compatibility features in this clean code project.**

- Build only what's needed for this phase
- No "just in case" features
- Delete unused code immediately
- Keep it simple and focused

---

## Quick Overview

Extends the MVP with three family budgeting features targeted at Costco shoppers: a dedicated `/budget` management page with auto-seeding defaults, an in-app spending alert banner that warns when any category nears its monthly limit, and inline price-trend notes on the category drill-down page backed by a new `price_history` table. No email alerts, no charts, no new npm packages.

---

## Task Checklist

### Database
- [x] Add `budget_defaults` table migration — `(id, user_id, category, amount)`
- [x] Add `price_history` table migration — `(id, user_id, item_name_normalized, unit_price, retailer, date)`
- [x] Wire both migrations into `lib/migrations.ts`

### API Routes
- [x] `app/api/budget-defaults/route.ts` — GET all defaults for user, PUT upsert a default
- [x] Extend `app/api/categories/route.ts` PUT — on upsert, if no budget row exists for the month, seed from `budget_defaults`
- [x] `app/api/item-history/route.ts` — GET `?name=<normalized>`, returns price entries sorted by date
- [x] Extend `lib/parseReceipt.ts` (or receipt scan flow) — after saving line items, upsert each into `price_history`
- [x] Backfill script: `lib/backfillPriceHistory.ts` — one-time migration, runs on first server startup if `price_history` is empty for the user

### UI Components
- [x] `components/SpendingAlertBanner.tsx` — alert banner listing categories ≥ 90% of budget; dismissible via `localStorage`
- [x] `components/BudgetRow.tsx` — one row for `/budget` page: category name, editable amount, progress bar, "Set as default" toggle
- [x] Extend `app/dashboard/category/[name]/page.tsx` — add price trend note per line item ("↑ $2.50 since last purchase" / "Stable")

### Dashboard Improvements
- [x] Rename "Scan Receipts" button → "Pull Receipts from Email" everywhere it appears (`app/dashboard/page.tsx` button label and empty-state copy)
- [x] Remove "Most Frequent Item" stat from `SummaryStats` component and from the `SummaryData` type + API response
- [x] Fix month-aware category drill-down: pass the currently selected period/month as a query param in the `router.push` call so clicking a tile from "Last Month" loads that month's items — not always the current month. Update `app/dashboard/category/[name]/page.tsx` to read `?month=` from `useSearchParams()` and fall back to `currentMonth` only if absent.

### Pages
- [x] `app/budget/page.tsx` — dedicated budget management page, one `BudgetRow` per category
- [x] Add `/budget` link to persistent nav bar

---

## Success Criteria

- [ ] `/budget` page loads with all categories, correct current-month spend, and progress bars
- [ ] Editing an amount on `/budget` saves to the `budgets` table for the current month
- [ ] "Set as default" toggle saves/removes a row in `budget_defaults`
- [ ] A new month auto-populates `budgets` from `budget_defaults` when the first budget read occurs
- [ ] `SpendingAlertBanner` appears on `/dashboard` when ≥ 1 category is ≥ 90% of budget
- [ ] Alert banner is dismissible and does not re-appear in the same browser session
- [ ] `price_history` is populated after a new receipt scan
- [ ] Existing `line_items` are backfilled into `price_history` on first run
- [ ] `GET /api/item-history?name=<normalized>` returns correct price entries in date order
- [ ] Category drill-down shows a price trend note for each item that has ≥ 2 history entries
- [ ] "Scan Receipts" button label reads "Pull Receipts from Email" across all surfaces
- [ ] "Most Frequent Item" stat removed from dashboard summary stats and API response
- [ ] Clicking a category tile from any period (e.g. "Last Month") correctly shows that period's items in the drill-down, not current month's items
- [ ] `next build` completes with zero errors

---

## Key Deliverables

- [ ] `lib/migrations.ts` — updated with `budget_defaults` and `price_history` tables
- [ ] `app/api/budget-defaults/route.ts`
- [ ] `app/api/item-history/route.ts`
- [ ] `lib/priceHistory.ts` — normalize + upsert logic
- [ ] `lib/backfillPriceHistory.ts` — one-time backfill
- [ ] `components/SpendingAlertBanner.tsx`
- [ ] `components/BudgetRow.tsx`
- [ ] `app/budget/page.tsx`
- [ ] Updated `app/dashboard/category/[name]/page.tsx` — price trend notes
- [ ] Updated nav bar — `/budget` link

---

## Notes & Decisions

<!-- Track decisions made during implementation here -->

---

## Completion Checklist

Before moving to `ai/roadmaps/complete`:
- [ ] All tasks completed
- [ ] Success criteria met
- [ ] Deliverables created
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Changelog updated

---

**Created:** 2026-02-28
**Last Updated:** 2026-02-28
**Next Phase:** TBD
