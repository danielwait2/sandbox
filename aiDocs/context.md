# Project Context — Runway

> This is the canonical context reference for AI assistants. Read this before responding to any prompt in this project.

---

## What This Project Is

**Runway** is a consumer web app that solves the "Granularity Gap" in personal finance: budgeting apps show "$300 at Costco" but can't tell you how much of that was groceries vs. household goods vs. baby supplies.

Runway connects to a user's Gmail, finds receipt emails from major retailers (Walmart and Costco first), extracts every line item using an LLM (Gemini), categorizes each item, and shows a clean spending dashboard by category.

**Core value proposition:** No manual receipt math. No merchant-level guesswork. Automatic item-level budget clarity from email receipts.

---

## Current Phase

**Phase: Pre-MVP / Hackathon Sprint (Sandbox Hackathon, Feb 27–28, 2026)**

- Team: Daniel, Tayt, McKay (MISM1 cohort)
- Customer validation complete (3 interviews: Spencer, Channing, Braden)
- Market research complete
- PRD and MVP scope defined
- No production code written yet — rapid prototyping phase
- Primary goal: prove the extraction pipeline works and users find it valuable

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js (App Router) | SSR, API routes, rapid prototyping |
| Styling | Tailwind CSS | Fast iteration |
| Auth | NextAuth.js + Google OAuth | Gmail OAuth required; natural app auth extension |
| Database | SQLite (via `better-sqlite3`) | Simple, zero-config, runs locally; no cloud DB needed for MVP |
| Receipt Parsing | Gemini API | Google's LLM; handles fragmented POS descriptions well; 7–10s latency acceptable for batch |
| Categorization | Rules-based + LLM hybrid | Rules for known items; Gemini for ambiguous; confidence scoring |
| Email Ingestion | Gmail API (`gmail.readonly` scope) | User's own data; no retailer ToS violation |
| Hosting | Vercel | Zero-config Next.js deployment |

---

## Architecture

```
User's Gmail ──→ Gmail API (OAuth 2.0) ──→ Runway Backend (Next.js API routes)
                                                │
                                                ├── Receipt Detector
                                                │     └── Filter by sender domain (walmart.com, costco.com)
                                                │
                                                ├── Receipt Parser (Gemini API)
                                                │     └── Extracts: items, prices, quantities, tax, order #
                                                │
                                                ├── Categorization Engine
                                                │     ├── Rules-based (user-trained: "Pampers → Baby & Kids")
                                                │     ├── Gemini classification (ambiguous descriptions)
                                                │     └── Confidence scoring (high → auto; low → review queue)
                                                │
                                                ├── SQLite (via better-sqlite3)
                                                │     ├── receipts, line_items
                                                │     └── categories, rules, budgets
                                                │
                                                └── Dashboard (Next.js pages)
                                                      ├── Budget overview (category-level)
                                                      ├── Category drill-down (item-level)
                                                      ├── Review queue (low-confidence items)
                                                      └── Settings, CSV export
```

---

## Key Constraints

- **Gmail Restricted Scopes**: Public launch requires Google CASA security assessment (~$540–$75K). MVP runs under 100 users (internal testing exemption). Plan for CASA cost before public launch.
- **Retailer ToS**: Amazon/Walmart prohibit scraping. Email-based extraction is legally safe — users receive these emails; we're only reading their own data.
- **Privacy sensitivity**: Receipts can reveal sensitive purchases (medical, personal). Enforce minimal storage: no raw email content stored beyond extracted structured data.
- **CFPB Rule 1033**: Mandates bank data sharing but does NOT extend to retailer account history — no regulatory shortcut to SKU data via bank feeds.
- **Gemini cost**: Monitor per-request costs; cache parsed results; consider fine-tuning post-MVP at scale.

---

## Database Schema (SQLite, MVP)

```sql
-- One row per receipt email
CREATE TABLE receipts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  retailer TEXT NOT NULL,
  transaction_date TEXT NOT NULL,  -- ISO date: "2026-02-13"
  subtotal REAL,
  tax REAL,
  total REAL NOT NULL,
  order_number TEXT,
  raw_email_id TEXT,
  parsed_at TEXT NOT NULL          -- ISO timestamp
);

-- One row per line item
CREATE TABLE line_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  receipt_id TEXT NOT NULL REFERENCES receipts(id),
  raw_name TEXT NOT NULL,
  name TEXT NOT NULL,              -- LLM-normalized human-readable name
  quantity INTEGER DEFAULT 1,
  unit_price REAL NOT NULL,
  total_price REAL NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  confidence REAL,                 -- 0.0–1.0
  user_overridden INTEGER DEFAULT 0  -- 1 if user manually recategorized
);

-- User-set budget targets
CREATE TABLE budgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  subcategory TEXT,                -- NULL = applies to whole category
  month TEXT NOT NULL,             -- "2026-02"
  amount REAL NOT NULL
);

-- Auto-categorization rules (trained by user corrections)
CREATE TABLE rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_pattern TEXT NOT NULL,     -- matched against normalized item name
  category TEXT NOT NULL,
  subcategory TEXT,
  created_from TEXT DEFAULT 'manual'  -- 'auto' or 'manual'
);
```

---

## Parsed Item JSON Schema

Output from Gemini parser per receipt:

```json
{
  "receipt_id": "uuid",
  "retailer": { "name": "Walmart", "store_id": "optional" },
  "transaction": {
    "date": "2026-02-13",
    "subtotal": 52.03,
    "tax": 1.56,
    "total": 53.59
  },
  "items": [
    {
      "raw_name": "SLT BTR QTRS",
      "name": "Salted Butter Quarters",
      "quantity": 1,
      "unit_price": 8.44,
      "total_price": 8.44,
      "category": "Groceries",
      "subcategory": "Dairy & Eggs",
      "confidence": 0.97
    }
  ]
}
```

---

## Category Taxonomy (Default)

| Category | Subcategories |
|---|---|
| Groceries | Produce, Dairy & Eggs, Meat & Seafood, Pantry, Snacks, Beverages, Frozen, Bakery |
| Household | Cleaning, Paper Goods, Storage & Organization |
| Baby & Kids | Diapers, Formula, Clothing, Toys |
| Health & Wellness | OTC Medicine, First Aid, Supplements |
| Personal Care | Beauty, Hygiene |
| Electronics | Devices, Accessories |
| Clothing & Apparel | — |
| Pet Supplies | Food, Accessories |
| Other | Uncategorized (fallback) |

---

## Customer Validation Summary

| Person | Pain Point | WTP | Key Quote |
|---|---|---|---|
| Spencer | Costco/Walmart lumps diapers + food + clothes into one charge | "I would pay for that" | "If you could figure it out, that'd be incredible" |
| Braden | Wants actionable savings; privacy-conscious | Would pay more for savings suggestions | "Promise me security and I'll use it" |
| Channing | Pays $95/yr for Copilot; wants better forecasting | Open to switching | "I care more about over/under for the month" |

---

## Competitive Landscape

| Competitor | Pricing | Item-Level Support | Gap |
|---|---|---|---|
| YNAB | $109/yr | NO (manual splits) | High friction |
| Monarch Money | $99.99/yr | Amazon only (2026) | No Walmart/Costco |
| Copilot | $95/yr | Amazon (unstable) | Re-auth required weekly |
| Rocket Money | $6–$12/mo | NO | Focused on bill cancellation |
| Fetch | Free | NO | Rewards points, not budgeting |

**Our wedge:** Email-based, no browser extension, multi-retailer, works on any device.

---

## Supported Retailers (MVP)

- **Walmart** — `@walmart.com` sender domain
- **Costco** — `@costco.com` sender domain

Post-MVP additions (in order): Target, Amazon, Kroger, Sam's Club

---

## What Is Out of Scope (Current Phase)

- Bank/Plaid sync
- Browser extension
- Mobile native app
- Retailers beyond Walmart + Costco email receipts
- FSA/HSA auto-flagging
- Shared household / multi-user accounts
- B2B corporate expense management (separate product track — docs in `Mckay/b2b/aiDocs/`)

---

## Long-Term Vision

The consumer app validates the core extraction technology. The real business is licensing the backend itemization API to budgeting apps, HSA/FSA platforms, and CPG data companies.

**B2B corporate track** (deferred): Item-level expense management + policy engine for SMB finance teams. Higher unit economics but longer sales cycle. Resume after B2C validates core extraction.

---

## Privacy Rules (Hard Lines)

- Receipt data is never sold to third parties
- No ad targeting based on purchase data
- OAuth tokens only — no Gmail password storage
- Raw email content is not stored — only extracted structured data
- Users can delete all their data at any time

---

## Glossary

| Term | Meaning |
|---|---|
| Granularity Gap | The inability of existing budgeting apps to show spending below the merchant level |
| Line item | A single product on a receipt (e.g., "Salted Butter Quarters, qty 1, $8.44") |
| Receipt parsing | Using Gemini to convert raw email HTML/text into structured JSON line items |
| Confidence score | 0.0–1.0 score per extracted item; items below 0.80 go to the Review Queue |
| Review Queue | UI where users confirm or correct low-confidence categorizations |
| Rules engine | Stores user-trained mappings applied to future receipts |
| CASA | Google's Cloud Application Security Assessment — required before public launch with Gmail restricted scopes |
| Level 1 / Level 3 data | Payment data tiers: Level 1 = merchant + total; Level 3 = SKU-level line items |
