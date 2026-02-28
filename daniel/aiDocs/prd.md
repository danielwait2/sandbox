# Product Requirements Document
## Grocery Receipt Budgeting App (Working Title: "ReceiptMate")

**Version:** 0.1 — MVP
**Date:** February 2026
**Status:** Draft

---

## 1. Problem Statement

Families — especially high-volume shoppers at Costco, Walmart, and Amazon — have no easy way to understand *what* they actually bought. Traditional budgeting apps (YNAB, Monarch, Rocket Money) only show merchant-level transactions. A $300 Costco trip is just labeled "Costco." There is no visibility into how much of that was groceries vs. household goods vs. impulse buys.

The result: families can't meaningfully track or control their grocery spending. This is the "Granularity Gap."

---

## 2. Target User

**Primary:** Budget-conscious household manager, often a parent, who does large weekly or bi-weekly grocery runs at Costco, Walmart, or similar big-box stores.

- Shops at 2–3 major retailers regularly
- Already spends time trying to budget but feels like their apps don't show the full picture
- Gets confirmation emails from Walmart.com, Costco, Amazon Fresh, etc.
- Not a tech power user — wants things to "just work"

**Out of scope for MVP:** College students, small business owners, HSA/FSA tracking, roommate splitting.

---

## 3. Goal

Validate whether families will use an app that automatically extracts grocery receipts from their email and shows them a clear spending breakdown by category.

This is a validation-first MVP. We are not trying to build the full product — we are trying to prove people want it.

---

## 4. MVP Scope

### What we're building

A simple web app that:

1. **Connects to Gmail** via OAuth (read-only) and scans for receipt emails from major grocery/big-box retailers
2. **Extracts line items** from those emails using an LLM (e.g., Claude or GPT-4o)
3. **Categorizes items** into simple buckets: Groceries, Household, Personal Care, Other
4. **Displays a dashboard** showing total spend by category over time, and a list of recent purchases

### Supported retailers at launch
- Walmart (online order confirmation emails)
- Costco (email receipts)
- Amazon / Amazon Fresh

### What we are NOT building in MVP
- Mobile app (web only)
- Bank account / credit card syncing
- Manual receipt photo upload
- Sharing / multi-user households
- Notifications or alerts
- Price-per-unit comparisons
- Nutrition tracking

---

## 5. User Flow

1. User lands on homepage → sees the value prop ("See exactly what you spent on groceries last month")
2. User signs up with email
3. User connects Gmail account via Google OAuth
4. App scans inbox for receipt emails from supported retailers (last 90 days)
5. App extracts and categorizes line items
6. User sees dashboard: spend by category, spend over time, recent item list
7. User can manually recategorize an item if it's wrong

---

## 6. Technical Approach

**Email ingestion:** Gmail API with `gmail.readonly` scope via OAuth 2.0. User never shares their password. App only reads emails from supported retailer domains.

**Parsing:** LLM-based extraction (Claude or GPT-4o) to handle inconsistent receipt formats. More robust than regex and self-adapting to template changes.

**Categorization:** Simple taxonomy for MVP — 4 buckets: Groceries, Household, Personal Care, Other. LLM assigns categories with a confidence score. Low-confidence items are flagged for user review.

**Stack:** Keep it simple. Standard web stack (e.g., Next.js + simple backend). No native mobile app for MVP.

**Privacy:** OAuth only — no password storage. Only process emails from known retailer domains. Do not store raw email content beyond what's needed.

> Note: Gmail's `gmail.readonly` scope may trigger a Google CASA security audit at scale (~$540–$1,000/yr at Tier 2). For MVP/beta, use a limited test user list to stay below Google's review threshold. Plan for this cost before public launch.

---

## 7. Success Metrics

This is a validation MVP. We succeed if:

| Metric | Target |
|---|---|
| Users who connect Gmail and see their dashboard | > 20 in first 30 days |
| "Very Disappointed" if they lost the app (Sean Ellis test) | > 40% |
| Users who return to the app after first session | > 30% week-1 retention |
| Users willing to pay $9.99/mo after 3 free receipt syncs | > 5% conversion |

---

## 8. Competitive Context

The major budgeting apps have started to move into this space but haven't solved it:

- **Monarch Money** launched a Chrome extension for Amazon sync (late 2024) — breaks frequently, Amazon-only
- **Copilot** has Amazon Labs integration — requires re-auth every few weeks, iOS only
- **YNAB** requires fully manual receipt splitting — users describe it as "exhausting"

Our wedge: **email-based, zero-browser-extension, multi-retailer.** No extension to install, no credential sharing beyond OAuth. Works on any device.

---

## 9. Longer-Term Vision (Not MVP)

The consumer app is proof-of-concept. The real business is the **extraction and itemization backend** — a service that turns receipt emails into structured SKU-level data. This can be licensed to:

- YNAB, Copilot, Monarch, and other budgeting apps
- HSA/FSA platforms
- CPG data companies

This B2B data licensing model has significantly higher margins and TAM than the consumer app alone. MVP validates the core extraction technology and demand signal before we pitch it to partners.

---

## 10. Open Questions

- What do we call this? Need a name.
- Do we support Instacart and grocery delivery receipts in V1?
- How do we handle returns/refunds in the data?
- What does "good enough" categorization accuracy look like before we show users? (Suggested: >85% correct before launch)
- Do we need a waitlist page before we build, to validate demand first?

---

## 11. Next Steps

1. Build a landing page / waitlist to test demand before writing code
2. Do 5–10 user interviews with target users (large-family grocery shoppers)
3. Build a "concierge MVP": manually process 10 users' receipt emails using an LLM, send them a spending report, and ask if they'd pay for it
4. If validated, build the Gmail OAuth + parsing pipeline
