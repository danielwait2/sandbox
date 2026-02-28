# Product Requirements Document
## Runway — Item-Level Receipt Budgeting

**Version:** 1.0 (Consolidated)
**Status:** Active
**Last updated:** 2026-02-28

> **Note on naming:** Teammates used "Tayt," "Runway," and "ReceiptMate." This document uses **Runway** as the working product name until a final name is chosen.

---

## 1. Problem

Most budgeting apps show merchant-level transactions. A $300 Costco trip is one line: "$300 at Costco." There is no visibility into how much of that was groceries vs. household goods vs. baby supplies vs. impulse buys.

This is the **Granularity Gap**: families can't meaningfully track or control their spending because the data is too coarse. Workarounds (manual receipt splitting in YNAB, etc.) are described by users as "absurd" and a "time tax."

**Why it hasn't been solved:**
- Payment processing gives apps only Level 1 data: merchant name, date, total
- Level 3 SKU-level data is restricted to B2B purchasing cards
- Email receipts are the one consumer-accessible channel with itemized data — but no product has built a reliable extraction pipeline around them

**Data points supporting urgency:**
- 53.8% of consumers still rely on manual expense tracking
- Americans forfeit ~$4B/year in unused FSA/HSA funds because identifying eligible items from bulk receipts is too friction-heavy
- No major competitor covers Walmart/Costco receipt itemization reliably (Monarch's AI Receipt Scan is Amazon-only as of 2026)

---

## 2. Solution

Runway connects to a user's Gmail, automatically finds receipt emails from major retailers (Walmart and Costco first), extracts every line item, and auto-categorizes each purchase into budget categories — giving users true item-level visibility with no manual effort.

**Core pipeline:**
1. Gmail OAuth (read-only) → detect receipt emails
2. GPT-4o → extract structured line items from each receipt
3. Rules + LLM hybrid → categorize each item with confidence scoring
4. Dashboard → spend by category, trends, review queue for low-confidence items

**The hook:** "Connect your Gmail. See where your Walmart money actually goes."

---

## 3. Target Users

### Primary: Mixed-Basket Family (60%)
- US household budget manager, often a parent, age 25–45
- Shops weekly at Costco/Walmart; single trip includes groceries + household + baby + personal care
- Already uses YNAB/Monarch/Copilot but frustrated that category totals are wrong
- Validated by customer interview: *"If you could figure it out, that'd be incredible. I would pay for that."* (Spencer)

### Secondary: HSA/FSA Optimizer (25%)
- Age 30–55, employer-provided HSA/FSA
- Buys eligible items (OTC meds, first-aid, sunscreen) bundled with groceries
- Manually scavenges receipts at year-end — leaves money on the table

### Secondary: Roommate/Couple Splitter (15%)
- Age 20–30, shares big-box trips with a partner or roommates
- Needs per-item visibility to split costs fairly (Splitwise doesn't know which items are shared)

### Not targeting (MVP):
- Users who don't receive digital receipts via email
- College students / solo low-volume shoppers
- Enterprise/B2B expense management (separate product track — see Section 11)

---

## 4. Competitive Positioning

| Competitor | Gap vs. Runway |
|---|---|
| YNAB ($109/yr) | Manual splits only; no receipt automation |
| Monarch Money ($99.99/yr) | AI Receipt Scan is Amazon-only; no Walmart/Costco |
| Copilot ($95/yr) | Amazon Labs requires re-auth weekly; no other retailers |
| Rocket Money ($6–$12/mo) | Merchant-level only; focused on subscription cancellation |
| Fetch | Rewards points, not budget tracking |

**Positioning statement:** Runway is the first budgeting tool that automatically turns your Walmart and Costco email receipts into item-level budget data — so you can finally see what you're actually spending on, not just where you swiped.

**Wedge:** Email-based, zero browser extension, multi-retailer. Works on any device. No credential sharing beyond OAuth.

---

## 5. MVP Scope

### In Scope
- Gmail OAuth connection (read-only, `gmail.readonly` scope)
- Receipt detection and import for **Walmart** and **Costco** email formats
- LLM-powered line-item extraction (item name, qty, unit price, total, tax)
- Categorization engine (rules-first with LLM fallback + confidence scoring)
- Budget dashboard: spend by category, by store, top items, time period toggle
- Review queue: low-confidence items surfaced for one-click confirmation
- User correction flow: recategorize item → save as reusable rule
- Budget targets per category (optional; defaults to tracking-only)
- CSV export
- Settings: connected accounts, custom rules, data delete

### Out of Scope
- Bank/credit card sync (Plaid)
- Browser extension for retailer scraping
- Mobile native app (web-first)
- Retailers beyond Walmart and Costco email receipts
- FSA/HSA auto-flagging
- Shared household / multi-user accounts
- Real-time alerts
- Meal planning, nutrition tracking, savings advice

---

## 6. Key Features

### 6.1 Gmail Receipt Ingestion
- OAuth-based read-only access with explicit user consent
- Filter by sender domain/subject patterns for supported retailers
- Scan last 90 days on first connection; poll every 6 hours for new receipts
- Deduplicate by order ID + timestamp + total

### 6.2 Receipt Parsing
- GPT-4o processes each receipt email → structured JSON
- Extracts: merchant, date, order number, each line item (raw name, normalized name, qty, unit price, total price, tax), receipt total
- Confidence score per item; failed parses logged and skipped (not shown to user)

### 6.3 Categorization Engine
- Rules-based taxonomy for known products (fast, deterministic)
- LLM fallback for novel/ambiguous items
- Default categories: Groceries, Household, Baby & Kids, Health & Wellness, Personal Care, Electronics, Clothing & Apparel, Pet Supplies, Other
- Items with confidence <80% → Review Queue
- User corrections create permanent rules and reprocess past matching items

### 6.4 Budget Dashboard
- Monthly spend by category vs. budget targets (green/yellow/red)
- Time period toggle: this month / last month / 3 months
- Spend by store, top items by spend, category trends
- Category drill-down → all items in that category, sorted by spend

### 6.5 Review Queue
- Cards showing low-confidence categorizations: confirm / recategorize / skip
- Each action trains the rules engine
- Weekly email digest with link to queue (if items pending)

---

## 7. User Flow

**Onboarding:**
1. Land on homepage → value prop + CTA ("Connect Your Gmail — Free")
2. Google OAuth consent (read-only)
3. Inbox scan: "Found 47 receipts with 312 items"
4. Category setup: adjust defaults, set budget targets (optional)
5. See dashboard

**Core loop:**
1. New receipt email arrives → auto-detected every 6 hours
2. Parsed and categorized in background
3. Dashboard updates automatically
4. Weekly: check Review Queue for low-confidence items

---

## 8. Technical Requirements

| Layer | Choice | Rationale |
|---|---|---|
| Frontend | Next.js (React) | SSR, API routes, rapid prototyping; works on all devices |
| Styling | Tailwind CSS | Fast iteration |
| Auth | NextAuth.js + Google OAuth | Gmail OAuth required anyway; natural app auth extension |
| Database | SQLite via `better-sqlite3` | Simple, zero-config, no cloud infra needed for MVP |
| Receipt parsing | Gemini API | Handles fragmented POS descriptions well; format-resilient |
| Categorization | Rules-based + LLM hybrid | Rules for known items; Gemini for ambiguous; confidence scoring |
| Email ingestion | Gmail API (restricted scope) | Legal; user's own data; no retailer ToS violation |
| Hosting | Vercel | Zero-config Next.js deployment |

**Privacy requirements:**
- Minimum necessary Gmail scopes (`gmail.readonly`)
- No storage of raw email content beyond extracted structured data
- OAuth tokens only — no password storage
- Users can disconnect Gmail and delete all data at any time
- No ad targeting or third-party data sales

**Gmail CASA note:** Public launch at scale requires a Google CASA security assessment (~$540–$75K depending on tier). For MVP/beta, stay under 100 users to avoid mandatory review. Plan for this before public launch.

---

## 9. Success Metrics

| Metric | MVP Target (first 90 days) |
|---|---|
| Gmail OAuth completions | 50+ users |
| Receipts parsed | 500+ total |
| Parse success rate (Walmart/Costco) | ≥85% |
| Categorization accuracy (user-confirmed) | ≥85% |
| Week-4 retention (connected users) | ≥25–30% |
| Review queue engagement | ≥40% of flagged items reviewed |
| Willingness to pay | ≥25% of active users in survey |
| NPS | ≥40 |

These are directional — the goal is learning, not hitting exact numbers.

---

## 10. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Email format changes break parser | LLM parsing is format-resilient; modular retailer parsers; alert on accuracy drops |
| Privacy concerns with Gmail access | Limited scopes; clear consent; read-only emphasis; visible data deletion |
| Gmail CASA blocks public launch | Run as internal test (<100 users) while pursuing CASA in parallel |
| Low receipt volume (users don't get email receipts) | Onboarding filter: "Do you get Walmart/Costco email receipts?" |
| Categorization inaccuracy erodes trust | Aggressive review queue; user corrections improve rules; set expectations |
| Low recurring usage after setup | Weekly digest email with actionable category insights |
| GPT-4o cost at scale | Batch processing; cache results; fine-tuned model post-MVP |

---

## 11. Monetization

**MVP:** Free (validate demand and retention first)

**Early pricing hypothesis:**
- Free trial (14–30 days)
- Paid plan: $8–$12/month

**Long-term "bread and butter" (all teammates agree):**
The consumer app validates the extraction technology. The real business is licensing the backend extraction + itemization API to:
- Budgeting apps (YNAB, Monarch, Copilot) that need SKU-level receipt intelligence
- HSA/FSA platforms
- CPG data companies (aggregated, anonymized spend insights)

---

## 12. Future Roadmap

1. Add Target, Amazon, Kroger email receipt support
2. Add Outlook/iCloud mail providers
3. FSA/HSA auto-flagging with eligible item database
4. Shared household views and split budgeting
5. Bank transaction matching (Plaid) — correlate receipt items with bank charges
6. Mobile native app (iOS first)
7. **B2B track:** Item-level corporate expense management (policy engine + approval workflow for SMB finance teams) — separate product with higher unit economics; defer until B2C validates core extraction tech

---

## 13. Open Questions

- [ ] Final product name?
- [ ] Is Walmart + Costco enough for initial retention, or do we need Target in MVP?
- [ ] What minimum parse accuracy is needed before users trust the automation?
- [ ] When to introduce bank matching post-MVP?
- [ ] Build waitlist page before writing code to validate demand first?
