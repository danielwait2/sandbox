# Runway B2B — Project Context

## What This Project Is

Runway B2B is an item-level corporate expense management platform that solves the audit and compliance gap in business spending. Current expense tools (Ramp, Brex, Expensify) operate at the merchant level — they see "$450 at Costco" but cannot enforce spend policies at the item level. Runway B2B ingests corporate card receipts (uploaded or email-forwarded), extracts line-item details using LLM-powered parsing, and auto-validates purchases against company spend policies — enabling finance teams to catch policy violations, prevent fraud, and eliminate manual receipt auditing.

## Current Phase

**Phase: Pre-MVP / Hackathon Sprint (Sandbox Hackathon, Feb 27-28, 2026)**

- Customer validation complete (3 interviews informed both B2C and B2B angles)
- Market research complete (B2B spend management landscape, unit economics, legal analysis)
- PRD and MVP scope defined
- No code written yet — rapid prototyping phase

## Tech Stack (Proposed)

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Frontend | Next.js (React) | SSR, API routes, rapid prototyping |
| Styling | Tailwind CSS | Fast iteration, consistent design |
| Auth | NextAuth.js (email + SSO) | Enterprise needs SSO; email auth for MVP |
| Database | Supabase (PostgreSQL) | Free tier, row-level security for multi-tenant |
| Receipt Parsing | GPT-4o API | ~100% accuracy on complex line items; handles fragmented POS descriptions; 7-10s latency |
| Policy Engine | Rules-based + LLM | Configurable spend rules per category, department, employee role |
| Receipt Ingestion | Email forwarding + manual upload | Lower platform risk than scraping; consensual data (employee submits for reimbursement) |
| Deployment | Vercel | Zero-config Next.js hosting |

## Architecture Overview

```
Employee ──→ Uploads receipt (photo/PDF) or forwards receipt email
                │
                ▼
         Runway B2B Backend
                │
                ├── Receipt Parser (GPT-4o)
                │     └── Extracts: items, prices, quantities, tax, merchant, date
                │
                ├── Policy Engine
                │     ├── Category rules (e.g., "No alcohol on corporate card")
                │     ├── Amount thresholds (e.g., "Meals > $75 require manager approval")
                │     ├── Department budgets (e.g., "Marketing: $5K/mo office supplies")
                │     └── Violation flagging → auto-route to manager for review
                │
                ├── Supabase (PostgreSQL)
                │     ├── Organizations, departments, employees, roles
                │     ├── Expense reports & transactions
                │     ├── Line items (SKU-level)
                │     ├── Spend policies & rules
                │     └── Audit log (immutable)
                │
                └── Dashboard (Next.js)
                      ├── Employee: Submit receipts, view status
                      ├── Manager: Approve/reject flagged expenses
                      ├── Finance: Org-wide spend analytics, policy config
                      └── Audit: Full item-level trail with timestamps
```

## Key Constraints

- **SOC 2 Compliance**: Mandatory for enterprise sales ($10K-$80K entry cost); creates strong competitive moat
- **IRS Requirement**: Itemized receipt proof required for expenses >$75
- **Data Consent**: Lower legal risk than B2C — employees voluntarily submit receipts for reimbursement
- **Sales Cycle**: 1-2 quarters typical; 9-18 months for Fortune 500; 50-Day Rule (47% win rate within 50 days, drops to 20% after)

## Market Validation

**Market Size**: $31.93B global (Business Spend Management); US TAM $21.08B; CAGR 14.0%

**Unit Economics (vs B2C)**:
| Metric | B2B | B2C |
|--------|-----|-----|
| CAC | $536-$2,000 | $40-$150 |
| LTV:CAC | 3:1 to 7:1 | ~3:1 |
| Annual Churn | 5-10% | 30-60% |
| WTP | $50-$500/mo | $10-$15/mo |
| Payback Period | 6-24 months | ~11 months |

**Demand Driver**: Compliance-driven (must-have) vs behavioral/elective (nice-to-have in B2C). Organizations lose avg 40.3 days waiting for expense payments; manual auditing is a recurring "fire drill"; fraud/maverick spend erodes margins 5-10%.

## Competitive Landscape

| Competitor | Pricing | Item-Level Policy | Gap |
|-----------|---------|------------------|-----|
| Ramp | Free (interchange) | NO | Merchant-level controls only |
| Brex | Free/tiered | NO | Corporate card spend controls, not receipt-level |
| Expensify | $5-$18/user/mo | NO | OCR receipt capture but no policy enforcement at item level |
| Airbase | Custom | Partial | Spend controls at category level, not SKU |
| Navan | Custom | NO | Travel-focused, not general expense |

**Wedge**: No competitor offers granular item-level policy enforcement (e.g., "block alcohol purchases across all retailers"). This is the gap.

## Out of Scope (Current Phase)

- ERP/accounting integrations (QuickBooks, NetSuite, SAP)
- Corporate card issuance
- Direct bank feeds / Plaid integration
- SOC 2 certification (required for enterprise but not for MVP validation)
- Mobile app (web-first)
- API licensing to other platforms
- B2C consumer product (separate product track)
