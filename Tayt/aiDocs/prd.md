# Tayt - Product Requirements Document

**Version:** 1.0 (MVP)
**Status:** Draft
**Last updated:** 2026-02-28

---

## 1. Product Summary

This is a grocery receipt budgeting app for family households that need accurate spend visibility from mixed-store purchases.

The MVP reads grocery/retail receipt emails from Gmail (starting with Walmart and Costco), extracts line items, and auto-organizes spending into budget categories.

Core user value: no manual receipt math, no merchant-level guesswork.

---

## 2. Problem

Families shopping at Costco, Walmart, and similar stores buy mixed baskets (groceries + household + pharmacy + discretionary) in one trip. Most budgeting apps categorize these transactions at merchant level only, which makes category totals inaccurate.

Current workaround is manual splitting, which is high-friction and inconsistent.

Result:

- Budget buckets are wrong
- Users cannot trust spending reports
- Many users stop maintaining detailed budgets

---

## 3. Solution

This ingests receipt emails from Gmail and converts unstructured receipt content into itemized, categorized spend data.

Pipeline:

1. Connect Gmail
2. Detect relevant receipt emails (Walmart, Costco first)
3. Extract line items, prices, taxes, totals
4. Categorize each item into budget buckets
5. Show dashboard with item/category trends and review queue

---

## 4. Target User

**Primary ICP:**

- US household budget manager (often a parent)
- Shops frequently at Costco/Walmart
- Wants category-level control without manual split work
- Already uses spreadsheets or a budgeting app but feels data is too broad

**Secondary ICP:**

- HSA/FSA-conscious household shoppers
- Multi-person households sharing grocery/household budgets

**Not the focus in MVP:**

- College students
- Solo users with low grocery volume
- Users unwilling to connect email

---

## 5. Positioning and Competitive Landscape

Based on saved research in `ai/research/`:

- Most incumbents (YNAB, Rocket Money, Simplifi, EveryDollar) are strong at merchant-level budgeting but weak at automated item-level receipt classification.
- Newer tools (Monarch/Copilot) have validated demand for deeper transaction understanding, but coverage and reliability for broad grocery itemization remain limited.
- There is a clear white space for a simple, reliable "email receipt -> itemized budget" workflow focused on families.

**Positioning statement:**
"turns your Walmart and Costco receipts into real budget categories automatically."

---

## 6. MVP Scope

### In Scope

- Gmail OAuth connect
- Receipt detection from Walmart and Costco email formats
- Item extraction (description, qty when available, unit/line price, total)
- Budget categorization engine (rules-first)
- Dashboard: spend by category, store, and top items
- "Needs Review" queue for low-confidence classifications
- Basic correction flow with reusable rules (e.g., always map diapers -> Baby)
- CSV export for manual accounting/spreadsheet users

### Out of Scope

- Bank connection/transaction matching
- Native mobile app (web app first)
- Multi-email provider support (Outlook, iCloud)
- Full tax/HSA filing workflows
- Family collaboration permissions
- Advanced AI coach/chat

---

## 7. User Flow

### Onboarding

1. User lands on value prop and example dashboard
2. User signs up
3. User connects Gmail
4. User selects retailer sources to import (Walmart/Costco)
5. System imports last 60-90 days of matching receipts

### Core Loop

1. New receipt email arrives
2. parses and categorizes items
3. Dashboard updates automatically
4. User checks "Needs Review" items only
5. User sees weekly trend summary

---

## 8. Key Features (MVP)

### 8.1 Gmail Receipt Ingestion

- OAuth-based read access with explicit consent
- Filter by sender/domain/subject patterns for supported retailers
- Deduplicate receipts by order ID + timestamp + total

### 8.2 Receipt Parsing and Itemization

- Extract merchant, date, subtotal, tax, total
- Parse line items from email HTML/text
- Normalize item names for categorization

### 8.3 Categorization Engine

- Rules-based taxonomy for MVP
- Initial buckets:
  - Groceries
  - Household
  - Baby
  - Pharmacy/Health
  - Personal Care
  - Pet
  - Electronics
  - Apparel
  - Other
- Confidence scoring + fallback to review queue

### 8.4 Budget Dashboard

- Spend by category (month/week)
- Spend by store
- Top items by spend
- Category drift/trend highlights

### 8.5 Review and Corrections

- Single-click recategorization
- Save as global rule
- Reprocess past matching items using updated rules

---

## 9. Validation-First Build Plan

### Phase 0 (1-2 weeks): Spreadsheet Concierge

- Manually collect sample receipt emails from 10-15 target users
- Parse and categorize in spreadsheet
- Deliver weekly report screenshots
- Goal: confirm users care about item-level visibility

### Phase 1 (3-6 weeks): Basic Web MVP

- Gmail connect
- Walmart + Costco import
- Basic parsing + dashboard
- Manual/admin-assisted correction behind scenes if needed

### Phase 2 (6-10 weeks): Reliability and Rule Learning

- Improve parser robustness
- Add reusable rules and review queue quality
- Tighten weekly summary and retention loop

---

## 10. Monetization

### MVP Strategy

- Consumer app to prove demand and retention

### Early Pricing Hypothesis

- Free trial (14-30 days)
- Paid plan: $8-$12/month

### Long-Term "Bread and Butter"

- Productize backend extraction + itemization API
- License to budgeting/fintech apps that need SKU-level receipt intelligence

---

## 11. Technical Requirements

### Suggested Stack (not final)

- Frontend: React web app
- Backend: Node.js/TypeScript or Python/FastAPI
- DB: PostgreSQL
- Auth: Clerk/Supabase Auth
- Jobs: queue worker for email parsing pipeline
- Hosting: Vercel + managed backend

### Core Systems

- Gmail integration service
- Receipt parser service
- Categorization/rules service
- Analytics + reporting layer

### Data and Privacy

- Minimum necessary Gmail scopes
- Encrypt data in transit/at rest
- Easy disconnect + delete data flow
- Transparent consent and data usage page

---

## 12. Success Metrics (MVP)

| Metric                                           | Target (first 90 days) |
| ------------------------------------------------ | ---------------------- |
| Signup to Gmail connect rate                     | 50%+                   |
| Connected users with at least 10 parsed receipts | 60%+                   |
| Parse success rate on supported retailers        | 85%+                   |
| Categorization precision on reviewed sample      | 85%+                   |
| Week-4 retention (connected users)               | 25%+                   |
| Users reporting "better budget clarity"          | 70%+                   |

---

## 13. Risks and Mitigations

- **Email format changes break parsing**
  - Mitigation: modular parsers per retailer + monitoring alerts + fallback manual review
- **Privacy concerns with Gmail access**
  - Mitigation: limited scopes, clear consent, visible controls, data deletion
- **Categorization trust issues**
  - Mitigation: confidence scoring, review queue, user rules
- **Low recurring usage after setup**
  - Mitigation: weekly digest with actionable category insights

---

## 14. Open Questions

- [ ] Is Walmart + Costco enough for initial retention, or do we need Target in MVP?
- [ ] What minimum parse accuracy is required before users trust automation?
- [ ] Which metric is strongest for pricing readiness: retention, correction rate, or perceived savings?
- [ ] When should bank matching be introduced post-MVP?

---

## 15. Future Roadmap (Post-MVP)

1. Add bank transaction matching for end-to-end ledger accuracy
2. Add more retailers (Target, Kroger, Amazon)
3. Add Outlook/iCloud mail providers
4. Add shared household views and split budgeting
5. Launch extraction API for B2B licensing

---

_Informed by `ai/research/itemized_budget_market_initial_research_Tayt_Gemini.md`, `ai/research/comparison_between_b2c_and_b2b_Tayt_gemini.md`, and `ai/research/sku-market-initial-research-gemini.md`._
