# Runway B2C — Project Context

## What This Project Is

Runway is a consumer receipt-budgeting app that solves the "granularity gap" in personal finance: most budgeting tools only show merchant-level spending (e.g., "$250 at Walmart") with zero visibility into what was actually purchased. Runway ingests digital receipts from email (Gmail OAuth) and retailer accounts, extracts line-item details using LLM-powered parsing, and auto-categorizes individual purchases into meaningful budget categories — enabling families, HSA/FSA holders, and roommates to finally see where their money actually goes.

## Current Phase

**Phase: Pre-MVP / Hackathon Sprint (Sandbox Hackathon, Feb 27-28, 2026)**

- Customer validation complete (3 interviews: Spencer, Channing, Braden)
- Market research complete (competitive landscape, technical feasibility, legal analysis)
- PRD and MVP scope defined
- No code written yet — rapid prototyping phase

## Tech Stack (Proposed)

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Frontend | Next.js (React) | SSR, API routes, rapid prototyping |
| Styling | Tailwind CSS | Fast iteration, consistent design |
| Auth | NextAuth.js + Gmail OAuth | Required for email receipt access |
| Database | Supabase (PostgreSQL) | Free tier, real-time, auth built-in |
| Receipt Parsing | GPT-4o API | ~100% accuracy on complex line items; 7-10s latency; superior to traditional OCR |
| Categorization | Rules-based + LLM hybrid | High-confidence items auto-categorized; low-confidence flagged for user review |
| Email Ingestion | Gmail API (restricted scope) | Digital receipts from Walmart, Costco, Target, Amazon |
| Deployment | Vercel | Zero-config Next.js hosting |

## Architecture Overview

```
User's Gmail ──→ Gmail API (OAuth 2.0) ──→ Runway Backend
                                              │
                                              ├── Receipt Parser (GPT-4o)
                                              │     └── Extracts: items, prices, quantities, tax
                                              │
                                              ├── Categorization Engine
                                              │     ├── Rules-based (user-defined: "Pampers = Baby")
                                              │     ├── LLM classification (fuzzy descriptions)
                                              │     └── Confidence scoring (high → auto; low → user review)
                                              │
                                              ├── Supabase (PostgreSQL)
                                              │     ├── Users, accounts, preferences
                                              │     ├── Transactions (merchant-level)
                                              │     ├── Line items (SKU-level)
                                              │     └── Categories & budgets
                                              │
                                              └── Dashboard (Next.js)
                                                    ├── Budget overview (category-level)
                                                    ├── Transaction drill-down (item-level)
                                                    ├── Weekly digest & review queue
                                                    └── Settings & category rules
```

## Key Constraints

- **Gmail Restricted Scopes**: Requires CASA security assessment ($540-$75K); must provide clear user benefit; no ad targeting; no third-party data transfers
- **Retailer ToS**: Amazon/Walmart prohibit scraping; email-based extraction is legally safer than browser extension scraping
- **Privacy Sensitivity**: Receipts reveal sensitive purchases (medical, adult, etc.); zero-knowledge storage principles required
- **CFPB Rule 1033**: Mandates bank data sharing but does NOT cover retailer account history — no regulatory shortcut to SKU data

## Customer Validation Summary

| Person | Pain Point | WTP | Key Quote |
|--------|-----------|-----|-----------|
| **Spencer** | Costco/Walmart lumps diapers + food + clothes into "groceries" | "I would pay for that" | "If you could figure it out, that'd be incredible" |
| **Braden** | Wants actionable savings, not just trends | Would pay more for savings suggestions | "Promise me security and I'll use it" |
| **Channing** | Already pays $95/yr for Copilot; wants better forecasting | Open to alternatives | "I care more about over/under for the month" |

## Competitive Landscape

| Competitor | Pricing | SKU/Line-Item Support | Gap |
|-----------|---------|----------------------|-----|
| YNAB | $109/yr | NO (manual splits) | Requires tedious manual receipt lookup |
| Monarch Money | $99.99/yr | YES (2026 AI Receipt Scan — Amazon only) | Limited to Amazon; no Walmart/Costco |
| Copilot | $95/yr | NO (manual splits) | Amazon Labs integration requires re-auth weekly |
| Rocket Money | $6-$12/mo | NO (merchant level) | Focused on subscription cancellation, not budgeting |

## Out of Scope (Current Phase)

- Bank account sync / Plaid integration
- Browser extension for retailer scraping
- Meal planning / recipe features
- B2B expense management (separate product track)
- Mobile app (web-first)
- Retailer partnerships / Banyan integration
