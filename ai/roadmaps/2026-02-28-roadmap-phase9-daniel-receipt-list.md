# Phase 9 Roadmap: Receipt List & Detail Pages

**Status:** Not Started
**Timeline:** Days 19–20
**Detailed Plan:** [phase-9-daniel-receipt-list.md](./phase-9-daniel-receipt-list.md)

---

## ⚠️ Development Philosophy

**Avoid over-engineering, cruft, and legacy-compatibility features in this clean code project.**

- Build only what's needed for this phase
- No "just in case" features
- Delete unused code immediately
- Keep it simple and focused

---

## Quick Overview

Adds a `/receipts` page that lists every ingested receipt (date, retailer, total, item count) and a `/receipts/[id]` detail page showing every line item on that trip. The backend API already exists (`GET /api/receipts` needs to be added; `GET /api/receipts/[id]` is already complete). No new npm packages.

---

## Task Checklist

### API Routes
- [ ] `app/api/receipts/route.ts` — GET all receipts for user, sorted by `transaction_date DESC`

### Pages
- [ ] `app/receipts/page.tsx` — receipt list page
- [ ] `app/receipts/[id]/page.tsx` — receipt detail page (line items for one trip)
- [ ] Add `/receipts` link to persistent nav bar

---

## Success Criteria

- [ ] `/receipts` loads a list of all ingested receipts sorted by date, showing retailer, date, total, and item count per receipt
- [ ] Clicking a receipt row navigates to `/receipts/[id]`
- [ ] `/receipts/[id]` shows retailer, date, order number (if present), subtotal, tax, total, and every line item with name, qty, unit price, total price, and category
- [ ] Empty state shown when no receipts exist
- [ ] `/receipts` link appears in the nav bar
- [ ] `next build` completes with zero errors

---

## Key Deliverables

- [ ] `app/api/receipts/route.ts` — list endpoint
- [ ] `app/receipts/page.tsx` — receipt list
- [ ] `app/receipts/[id]/page.tsx` — receipt detail
- [ ] Updated nav bar — `/receipts` link

---

## Notes & Decisions

- `GET /api/receipts/[id]` already exists and returns `{ ...receipt, items }` — the detail page can use it directly with no backend changes
- No pagination needed for MVP — a simple sorted list is fine

---

## Completion Checklist

Before moving to `ai/roadmaps/complete`:
- [ ] All tasks completed
- [ ] Success criteria met
- [ ] Deliverables created
- [ ] `next build` passing
- [ ] Nav updated

---

**Created:** 2026-02-28
**Last Updated:** 2026-02-28
**Next Phase:** TBD
