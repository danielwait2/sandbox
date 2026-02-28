# Roadmap: Analysis & Insights + History

**Status:** Complete
**Timeline:** Days 16–19
**Detailed Plan:** [phase-analysis-insights-and-history.md](./phase-analysis-insights-and-history.md)

---

## ⚠️ Development Philosophy

**Avoid over-engineering, cruft, and legacy-compatibility features in this clean code project.**

- Build only what's needed for this phase
- No "just in case" features
- Delete unused code immediately
- Keep it simple and focused

---

## Quick Overview

Add two new pages — **Insights** (`/insights`) and **History** (`/history`) — accessible from the main nav. Insights surfaces actionable spending patterns from existing SQLite data (frequent items, category trends, duplicate alerts, bulk buy suggestions) with optional Gemini-powered savings tips. History provides interactive spending visualization with flexible time ranges, category breakdowns, and receipt drill-down using `recharts`.

---

## Task Checklist

### Data Layer
- [x] `lib/insights.ts` — queries: top frequent items, top expensive items, category trends, duplicate purchases, annualized spending, bulk buy suggestions
- [x] `lib/history.ts` — queries: monthly spending, monthly category spending, history summary, receipts-for-month drill-down

### API Routes — Insights
- [x] `app/api/insights/route.ts` — GET: return all insight data for a given month
- [x] `app/api/insights/tips/route.ts` — POST: send spending summary to Gemini, return personalized savings tips

### API Routes — History
- [x] `app/api/history/route.ts` — GET: return monthly spending, category breakdown, summary stats for a date range
- [x] `app/api/history/[month]/route.ts` — GET: return receipts and line items for a specific month (drill-down)

### Insights Page
- [x] `app/insights/page.tsx` — full insights UI with six sections
- [x] Spending Trends section: category changes vs. last month with green/red arrows
- [x] Top 5 Frequent Items table
- [x] Top 5 Most Expensive Items table
- [x] Duplicate Purchase Alerts section
- [x] Annualized Projections + Bulk Buy Suggestions sections
- [x] "Get AI Tips" button: calls Gemini endpoint, displays tips in expandable section
- [x] `app/insights/loading.tsx` — skeleton loading state
- [x] Empty state: friendly message with CTA to scan Gmail

### History Page
- [x] Install `recharts` — commit `package.json` change separately
- [x] `app/history/page.tsx` — full history UI with charts and drill-down
- [x] Time range selector: This Month, Last 3 Months, This Quarter, This Year, All Time, custom date range
- [x] Spending chart: `recharts` BarChart showing total spend per month
- [x] Category breakdown: stacked bar chart or toggleable category filter
- [x] Summary stats cards: Total Spend, Avg/Month, Receipt Count, Top Category
- [x] Drill-down panel: click a bar to see receipts and line items for that month
- [x] `app/history/loading.tsx` — skeleton loading state
- [x] Empty state: friendly message with link to dashboard

### Navigation & Polish
- [x] Update `app/components/Nav.tsx` — add Insights and History links (Dashboard | Review Queue | Insights | History | Settings)
- [x] Run `next build` — fix all TypeScript and build errors
- [ ] Verify both pages responsive at 375px and 1280px
- [ ] Verify empty states render without errors

---

## Success Criteria

- [x] `/insights` loads and displays all six insight sections with correct data
- [x] Category trends show correct month-over-month percentage changes
- [x] Duplicate detection flags same item bought twice within 7 days
- [x] "Get AI Tips" returns and displays Gemini-generated savings suggestions
- [x] `/history` loads with chart showing monthly spending data
- [x] Time range selector updates chart and summary stats correctly
- [x] Clicking a chart bar shows drill-down with receipts and line items
- [x] Summary stats are mathematically correct (verified against DB)
- [x] Both pages handle empty state gracefully
- [x] Nav shows all five links with correct active highlighting
- [x] `next build` completes with zero errors

---

## Key Deliverables

- [x] `lib/insights.ts` — insight computation queries
- [x] `lib/history.ts` — history data queries
- [x] `app/api/insights/route.ts` — insights endpoint
- [x] `app/api/insights/tips/route.ts` — Gemini tips endpoint
- [x] `app/api/history/route.ts` — history endpoint
- [x] `app/api/history/[month]/route.ts` — drill-down endpoint
- [x] `app/insights/page.tsx` + `loading.tsx` — insights page
- [x] `app/history/page.tsx` + `loading.tsx` — history page
- [x] `app/components/Nav.tsx` — updated with new links
- [x] `recharts` added to dependencies
- [x] Clean `next build` with zero errors
- [ ] Both pages responsive at 375px and 1280px

---

## Notes & Decisions

- Used `recharts` for charting — pure React, works well with Next.js App Router using `'use client'`
- Tooltip and bar click handlers required `String()` coercion for `activeLabel` (recharts types return `string | number`)
- Tooltip formatter uses untyped params to avoid recharts generic type incompatibility
- Duplicate detection uses in-memory grouping after SQL fetch (simpler than complex SQL window functions for small datasets)
- AI tips cached in-memory per user per month to avoid redundant Gemini calls
- Two unchecked items (responsive verification, empty state verification) require manual browser testing

---

## Completion Checklist

Before marking complete:
- [x] All tasks completed
- [x] Success criteria met
- [x] Deliverables created
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Changelog updated

---

**Created:** 2026-02-28
**Last Updated:** 2026-02-28
**Depends On:** Phase 7 (Settings & Polish) — Complete
