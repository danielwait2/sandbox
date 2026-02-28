# Phase 8 — Analysis & Insights + History

**Timeline:** Days 16–19
**Status:** Complete
**Roadmap:** [2026-02-28-roadmap-phase8-analysis-insights-and-history.md](./2026-02-28-roadmap-phase8-analysis-insights-and-history.md) — Track progress
**Last Updated:** 2026-02-28

---

## Overview

Add two new pages to Runway: **Insights** (`/insights`) and **History** (`/history`), both accessible from the main nav. Insights analyzes existing parsed receipt data to surface actionable spending patterns — frequent items, spending trends, duplicate purchase flags, and optional AI-powered savings tips via Gemini. History lets users visualize and explore spending over flexible time ranges with interactive charts, category breakdowns, and drill-down into individual receipts.

---

## Prerequisites

- Phase 7 complete: Settings & Polish done, app is MVP feature-complete
- All prior phases complete: full data pipeline running end-to-end (receipts parsed, categorized, stored in SQLite)
- Navigation component exists (`app/components/Nav.tsx`) and can be extended with new links
- `line_items` and `receipts` tables populated with real or test data

---

## Success Criteria

### Insights
- `/insights` page loads for an authenticated user and displays data-driven insights
- Top 5 most frequent items displayed with purchase count and total spend
- Top 5 most expensive items displayed with price and date
- Month-over-month spending change per category shown (e.g., "Snacks +40% vs. last month")
- Duplicate purchase detection flags same item bought twice within 7 days
- Annualized spending projections shown for top recurring categories (e.g., "$X/week on Beverages = $X/year")
- Bulk buy suggestions surface items purchased ≥3 times in 30 days
- "Get AI Tips" button sends spending summary to Gemini and displays personalized savings suggestions
- Page handles empty state gracefully (new user with no data)

### History
- `/history` page loads for an authenticated user
- Time range selector supports: single month, custom date range, quarter, year, all time
- Spending chart renders total spend per month as a bar chart over the selected range
- Category breakdown renders as a stacked bar chart or toggleable category filter
- Summary stats shown for selected range: total spend, average per month, receipt count, top category
- Clicking a month/bar drills down to show individual receipts and their line items
- Charts are responsive at 375px (mobile) and 1280px (desktop)
- Page handles empty state gracefully

### General
- Both pages accessible from the main nav (Dashboard | Review Queue | Insights | History | Settings)
- No console errors on either page in production build (`next build` succeeds)
- Both pages are responsive at 375px and 1280px

---

## Implementation Steps

### Feature 1: Analysis & Insights

1. **Create insights data queries in lib**
   - File: `lib/insights.ts` (new)
   - `getTopFrequentItems(userId, dateRange)` — query `line_items` joined with `receipts`, group by normalized `name`, order by count DESC, limit 5
   - `getTopExpensiveItems(userId, dateRange)` — query `line_items` joined with `receipts`, order by `total_price` DESC, limit 5
   - `getCategoryTrends(userId, currentMonth)` — query spend per category for current month vs. previous month, return percentage change per category
   - `getDuplicatePurchases(userId, dateRange)` — query `line_items` joined with `receipts`, group by `name` where same item appears ≥2 times within 7 days of each other
   - `getAnnualizedSpending(userId)` — for each category, compute average weekly spend and project to annual
   - `getBulkBuySuggestions(userId)` — find items purchased ≥3 times within the last 30 days
   - All queries use `better-sqlite3` directly against the existing schema — no additional tables needed

2. **Create insights API route**
   - File: `app/api/insights/route.ts` (new)
   - Method: `GET`
   - Query params: `?month=2026-02` (optional, defaults to current month)
   - Requires authentication (check session)
   - Returns JSON: `{ frequentItems, expensiveItems, categoryTrends, duplicates, annualized, bulkBuySuggestions }`

3. **Create AI tips API route**
   - File: `app/api/insights/tips/route.ts` (new)
   - Method: `POST`
   - Body: `{ month: "2026-02" }` (optional)
   - Gathers the user's spending summary (top categories, top items, totals) from SQLite
   - Sends a structured prompt to Gemini: "Given this spending data, suggest 3–5 actionable ways to save money. Be specific with dollar estimates."
   - Returns JSON: `{ tips: string[] }`
   - Rate limit: cache tips per user per month to avoid excessive Gemini calls (store in a simple in-memory map or a `tips_cache` column — keep it simple)

4. **Create the insights page**
   - File: `app/insights/page.tsx` (new)
   - Mark as `'use client'`
   - Fetch `/api/insights` on mount
   - Sections:
     - **Spending Trends** — cards showing category changes vs. last month (green/red arrows)
     - **Top 5 Frequent Items** — table: rank, item name, times purchased, total spent
     - **Top 5 Most Expensive Items** — table: rank, item name, price, retailer, date
     - **Duplicate Purchase Alerts** — warning cards for items bought twice in one week
     - **Annualized Projections** — cards per category: "$X/week → $X/year"
     - **Bulk Buy Suggestions** — cards: "You bought [item] X times this month — consider buying in bulk"
     - **Get AI Tips** button — on click, calls `/api/insights/tips`, displays tips in a modal or expandable section
   - Empty state: friendly message "No spending data yet — scan your Gmail to get started" with link to dashboard

5. **Create insights loading skeleton**
   - File: `app/insights/loading.tsx` (new)
   - Pulse/skeleton UI matching the insights page layout

### Feature 2: History

6. **Install charting library**
   - Install `recharts` (lightweight, React-native, no D3 dependency, works with SSR/Next.js)
   - Run: `npm install recharts`
   - Commit the `package.json` and `package-lock.json` change separately

7. **Create history data queries in lib**
   - File: `lib/history.ts` (new)
   - `getMonthlySpending(userId, startDate, endDate)` — query `receipts` grouped by month (`strftime('%Y-%m', transaction_date)`), return `{ month, total }[]`
   - `getMonthlyCategorySpending(userId, startDate, endDate)` — same but grouped by month AND category, for stacked chart data
   - `getHistorySummary(userId, startDate, endDate)` — return `{ totalSpend, avgPerMonth, receiptCount, topCategory }`
   - `getReceiptsForMonth(userId, month)` — return all receipts for a given month with their line items (for drill-down)

8. **Create history API route**
   - File: `app/api/history/route.ts` (new)
   - Method: `GET`
   - Query params: `?start=2025-01&end=2026-02&view=monthly|category`
   - Requires authentication
   - Returns JSON: `{ monthlySpending, categorySpendings, summary }`

9. **Create history drill-down API route**
   - File: `app/api/history/[month]/route.ts` (new)
   - Method: `GET`
   - Returns all receipts and line items for the given month
   - Used when user clicks a bar in the chart

10. **Create the history page**
    - File: `app/history/page.tsx` (new)
    - Mark as `'use client'`
    - **Time range selector** — toolbar with preset buttons: "This Month", "Last 3 Months", "This Quarter", "This Year", "All Time", and a custom date range picker (two date inputs)
    - **Spending chart** — `recharts` `BarChart` or `ComposedChart` showing total spend per month
    - **Category breakdown** — `recharts` `BarChart` with `stackId` per category (stacked bars), or a toggle to switch between stacked and line view
    - **Summary stats** — four stat cards: Total Spend, Avg/Month, Receipts, Top Category
    - **Drill-down panel** — clicking a bar sets a selected month; below the chart, show a receipt list for that month with expandable line items
    - Responsive: charts use `ResponsiveContainer` from recharts; stat cards stack vertically on mobile
    - Empty state: "No spending history yet" with link to dashboard

11. **Create history loading skeleton**
    - File: `app/history/loading.tsx` (new)
    - Pulse/skeleton matching the history page layout

### Shared

12. **Update navigation**
    - File: `app/components/Nav.tsx` (modified)
    - Add "Insights" and "History" links between "Review Queue" and "Settings"
    - Nav order: Dashboard | Review Queue | Insights | History | Settings

13. **Polish and build verification**
    - Run `next build` — fix any TypeScript or build errors
    - Verify both pages at 375px and 1280px widths
    - Verify empty states render correctly
    - Verify drill-down navigation works (History → click bar → see receipts)

---

## File Structure

```
runway/
├── app/
│   ├── insights/
│   │   ├── page.tsx                        (new)
│   │   └── loading.tsx                     (new)
│   ├── history/
│   │   ├── page.tsx                        (new)
│   │   └── loading.tsx                     (new)
│   ├── components/
│   │   └── Nav.tsx                         (modified: add Insights + History links)
│   └── api/
│       ├── insights/
│       │   ├── route.ts                    (new)
│       │   └── tips/
│       │       └── route.ts               (new)
│       └── history/
│           ├── route.ts                    (new)
│           └── [month]/
│               └── route.ts               (new)
├── lib/
│   ├── insights.ts                         (new)
│   └── history.ts                          (new)
```

---

## Tech & Libraries

| Library | Purpose | Notes |
|---|---|---|
| `better-sqlite3` | All insight and history queries against `receipts` + `line_items` | Already installed |
| `recharts` | Bar charts, stacked bar charts, responsive containers for History page | **New dependency** — install via `npm install recharts` |
| `@google/generative-ai` | Gemini API call for "Get AI Tips" personalized savings suggestions | Already installed |
| `next-auth` | Session check on all new API routes and pages | Already installed |
| Tailwind CSS | Page layouts, stat cards, responsive design, modals | Already installed |

### Why Recharts?

- Pure React components — no DOM manipulation conflicts with Next.js
- Built-in `ResponsiveContainer` for mobile-friendly charts
- Supports stacked bar charts, tooltips, click handlers (for drill-down) out of the box
- ~45KB gzipped — lightweight compared to alternatives (Chart.js, D3, Nivo)
- No additional configuration or wrapper needed for Next.js App Router

---

## Testing Strategy

### Insights
1. Load `/insights` with populated data — confirm all six sections render with correct numbers
2. Verify "Top 5 Frequent Items" matches manual count from DB
3. Verify category trend percentages are mathematically correct (spot-check 2–3 categories)
4. Create a duplicate purchase scenario (same item, two receipts within 3 days) — confirm it appears in duplicate alerts
5. Verify bulk buy suggestion appears for an item purchased ≥3 times in 30 days
6. Click "Get AI Tips" — confirm Gemini returns tips and they display in the UI
7. Load `/insights` with no data (new user) — confirm empty state renders without errors
8. Verify the month selector changes the data displayed

### History
1. Load `/history` with populated data — confirm chart renders with correct bar heights
2. Select "This Month" — confirm only current month data shown
3. Select "All Time" — confirm all months with data appear
4. Select custom date range — confirm chart updates to match
5. Click a bar in the chart — confirm drill-down panel shows receipts for that month
6. Expand a receipt in drill-down — confirm line items are listed with correct totals
7. Verify stacked category chart shows correct category proportions (spot-check against DB)
8. Verify summary stats (total, avg, count, top category) are mathematically correct
9. Load `/history` with no data — confirm empty state renders without errors
10. Resize browser to 375px — confirm charts and cards reflow correctly

### General
11. Run `next build` — confirm zero errors
12. Verify Nav shows all five links with correct active highlighting
13. Load each page at 375px width — confirm no horizontal overflow

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Recharts SSR compatibility with Next.js App Router | Use `'use client'` directive on history page; recharts renders client-side only. If SSR issues arise, wrap chart components in a dynamic import with `ssr: false` |
| Large dataset performance (thousands of line items) | All queries are pre-aggregated in SQL (GROUP BY month/category) — the client receives summary data, not raw rows. Add `LIMIT` clauses and indexed queries if needed |
| Gemini API cost for "Get AI Tips" | Cache tips per user per month (in-memory or simple DB column). Button is opt-in, not auto-triggered. Show "Last generated: [date]" to discourage re-clicks |
| Duplicate detection false positives (legitimate repeat purchases) | Label as "Possible duplicates" not "Errors". Use 7-day window and exact name match to reduce false positives |
| Empty state for new users (no receipts parsed yet) | Every section checks for empty data and shows a friendly message with a CTA to scan Gmail |
| Month-over-month trends misleading for partial months | Add "(partial month)" label when current month is not yet complete |
| Recharts bundle size impact | Recharts is ~45KB gzipped — acceptable. Import only needed chart components (not `import * from 'recharts'`) to enable tree-shaking |

---

## Deliverables

- `lib/insights.ts` — all insight computation queries (frequent items, expensive items, trends, duplicates, projections, bulk buy)
- `lib/history.ts` — all history queries (monthly spending, category breakdown, summary, drill-down)
- `app/api/insights/route.ts` — insights data endpoint
- `app/api/insights/tips/route.ts` — Gemini-powered savings tips endpoint
- `app/api/history/route.ts` — history data endpoint
- `app/api/history/[month]/route.ts` — month drill-down endpoint
- `app/insights/page.tsx` — insights page with all six insight sections + AI tips
- `app/insights/loading.tsx` — loading skeleton
- `app/history/page.tsx` — history page with charts, time selector, summary stats, drill-down
- `app/history/loading.tsx` — loading skeleton
- `app/components/Nav.tsx` — updated with Insights and History links
- `recharts` added to `package.json`
- Clean `next build` with zero errors
- Both pages responsive at 375px and 1280px
