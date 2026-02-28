# Roadmap: Analysis & Insights + History

**Status:** Not Started
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
- [ ] `lib/insights.ts` — queries: top frequent items, top expensive items, category trends, duplicate purchases, annualized spending, bulk buy suggestions
- [ ] `lib/history.ts` — queries: monthly spending, monthly category spending, history summary, receipts-for-month drill-down

### API Routes — Insights
- [ ] `app/api/insights/route.ts` — GET: return all insight data for a given month
- [ ] `app/api/insights/tips/route.ts` — POST: send spending summary to Gemini, return personalized savings tips

### API Routes — History
- [ ] `app/api/history/route.ts` — GET: return monthly spending, category breakdown, summary stats for a date range
- [ ] `app/api/history/[month]/route.ts` — GET: return receipts and line items for a specific month (drill-down)

### Insights Page
- [ ] `app/insights/page.tsx` — full insights UI with six sections
- [ ] Spending Trends section: category changes vs. last month with green/red arrows
- [ ] Top 5 Frequent Items table
- [ ] Top 5 Most Expensive Items table
- [ ] Duplicate Purchase Alerts section
- [ ] Annualized Projections + Bulk Buy Suggestions sections
- [ ] "Get AI Tips" button: calls Gemini endpoint, displays tips in expandable section
- [ ] `app/insights/loading.tsx` — skeleton loading state
- [ ] Empty state: friendly message with CTA to scan Gmail

### History Page
- [ ] Install `recharts` — commit `package.json` change separately
- [ ] `app/history/page.tsx` — full history UI with charts and drill-down
- [ ] Time range selector: This Month, Last 3 Months, This Quarter, This Year, All Time, custom date range
- [ ] Spending chart: `recharts` BarChart showing total spend per month
- [ ] Category breakdown: stacked bar chart or toggleable category filter
- [ ] Summary stats cards: Total Spend, Avg/Month, Receipt Count, Top Category
- [ ] Drill-down panel: click a bar to see receipts and line items for that month
- [ ] `app/history/loading.tsx` — skeleton loading state
- [ ] Empty state: friendly message with link to dashboard

### Navigation & Polish
- [ ] Update `app/components/Nav.tsx` — add Insights and History links (Dashboard | Review Queue | Insights | History | Settings)
- [ ] Run `next build` — fix all TypeScript and build errors
- [ ] Verify both pages responsive at 375px and 1280px
- [ ] Verify empty states render without errors

---

## Success Criteria

- [ ] `/insights` loads and displays all six insight sections with correct data
- [ ] Category trends show correct month-over-month percentage changes
- [ ] Duplicate detection flags same item bought twice within 7 days
- [ ] "Get AI Tips" returns and displays Gemini-generated savings suggestions
- [ ] `/history` loads with chart showing monthly spending data
- [ ] Time range selector updates chart and summary stats correctly
- [ ] Clicking a chart bar shows drill-down with receipts and line items
- [ ] Summary stats are mathematically correct (verified against DB)
- [ ] Both pages handle empty state gracefully
- [ ] Nav shows all five links with correct active highlighting
- [ ] `next build` completes with zero errors

---

## Key Deliverables

- [ ] `lib/insights.ts` — insight computation queries
- [ ] `lib/history.ts` — history data queries
- [ ] `app/api/insights/route.ts` — insights endpoint
- [ ] `app/api/insights/tips/route.ts` — Gemini tips endpoint
- [ ] `app/api/history/route.ts` — history endpoint
- [ ] `app/api/history/[month]/route.ts` — drill-down endpoint
- [ ] `app/insights/page.tsx` + `loading.tsx` — insights page
- [ ] `app/history/page.tsx` + `loading.tsx` — history page
- [ ] `app/components/Nav.tsx` — updated with new links
- [ ] `recharts` added to dependencies
- [ ] Clean `next build` with zero errors
- [ ] Both pages responsive at 375px and 1280px

---

## Notes & Decisions

<!-- Track decisions made during implementation here -->

---

## Completion Checklist

Before marking complete:
- [ ] All tasks completed
- [ ] Success criteria met
- [ ] Deliverables created
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Changelog updated

---

**Created:** 2026-02-28
**Last Updated:** 2026-02-28
**Depends On:** Phase 7 (Settings & Polish) — Complete
