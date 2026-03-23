# Runway

Budgeting apps show "$300 at Costco." They can't tell you how much of that was groceries, household goods, baby supplies, or impulse buys. This is the **Granularity Gap** — merchant-level transaction data is too coarse to be useful for real budget tracking.

The workarounds are painful. Manually splitting a Costco trip in YNAB takes as long as the shopping did. Most people just don't do it, which means their budget categories are wrong by default.

Email receipts are the one consumer-accessible channel that already contains itemized data. Nobody had built a reliable extraction pipeline around them — until now.

Runway connects to your Gmail, finds your Walmart and Costco receipt emails, and uses an LLM to extract every line item. You get a real spending dashboard by category — automatically, with no manual entry.

---

## How It Works

1. Sign in with Google (read-only Gmail access)
2. Runway scans your last 90 days of email for Walmart and Costco receipts
3. Gemini extracts each line item: name, quantity, unit price, total
4. A rules engine categorizes each item (Groceries, Household, Health, etc.)
5. Low-confidence items surface in a Review Queue for one-click correction — each correction trains the rules engine for future receipts
6. Your dashboard updates automatically as new receipts arrive

---

## Features

- Gmail OAuth pipeline with receipt deduplication by order ID and total
- Gemini-powered line item extraction with per-item confidence scoring
- Hybrid categorization: deterministic rules engine with LLM fallback
- Budget dashboard: spend by category vs. targets, by store, top items, time period toggle
- Review queue: surfaces low-confidence categorizations for correction
- Price history tracking across receipts
- Spending insights and trends
- CSV export and full data deletion

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Auth | NextAuth.js + Google OAuth |
| Database | SQLite via `better-sqlite3` |
| LLM / Parsing | Gemini API |
| Email Ingestion | Gmail API (`gmail.readonly` scope) |
| Hosting | Vercel |

---

## Status

Built at the BYU MISM Sandbox Hackathon (February 27–28, 2026) in 24 hours. The Gmail OAuth pipeline and receipt extraction ran end-to-end at demo time. Not currently deployed — local setup only.

---

## Local Setup

```bash
cd runway
npm install
cp .env.local.example .env.local
# Add your Google OAuth credentials and Gemini API key to .env.local
npm run dev
```

Visit `http://localhost:3000`.

You will need:
- A Google Cloud project with the Gmail API enabled and OAuth credentials configured
- A Gemini API key
- Walmart or Costco email receipts in your Gmail inbox

---

## Privacy

Runway requests only the `gmail.readonly` scope — it can read but never send, delete, or modify email. Raw email content is never stored; only the structured line item data extracted from receipts is saved. Users can disconnect Gmail and delete all data at any time.

---

## Team

Built by Daniel Wait, Tayt Godwin, and McKay Kimball.

Daniel led product and built the Gmail ingestion and extraction pipeline.
