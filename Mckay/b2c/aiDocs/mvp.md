# Runway B2C — MVP Definition

## MVP Goal

Validate that consumers will connect their Gmail, let an AI parse their Walmart/Costco receipts, and return to a dashboard that shows item-level spending by category. The MVP proves (or disproves) that automated receipt itemization is a must-have for serious budgeters.

---

## What's In

### 1. Gmail OAuth Connection
- Google sign-in with read-only Gmail access (gmail.readonly scope)
- Secure OAuth 2.0 token storage (no password storage)
- Clear permission explanation screen before OAuth flow
- Disconnect option in settings

### 2. Receipt Detection & Ingestion
- Automated scan of Gmail inbox for receipts from:
  - **Walmart** (walmart.com order confirmations + digital receipts)
  - **Costco** (costco.com order confirmations)
- Scan last 3 months of email history on first connection
- Ongoing monitoring for new receipts (poll every 6 hours)
- Receipt deduplication (same order number = same receipt)

### 3. LLM-Powered Line-Item Extraction
- GPT-4o processes each receipt email → structured JSON output:
  - Item name (cleaned/normalized)
  - Quantity
  - Unit price
  - Total price
  - Tax (if available)
  - Merchant name
  - Transaction date
  - Order number
- Confidence score per item (0-100%)
- Error handling: receipts that fail parsing are logged and skipped (not shown to user)

### 4. Auto-Categorization
- Default category taxonomy (consumer-friendly):
  - Groceries (food & beverage)
  - Baby & Kids
  - Household & Cleaning
  - Health & Wellness
  - Personal Care
  - Electronics
  - Clothing & Apparel
  - Pet Supplies
  - Other
- Rules-based engine: known products mapped to categories (e.g., "Pampers" → Baby & Kids)
- LLM fallback: unknown items classified by GPT-4o with confidence score
- Items with confidence <80% routed to Review Queue

### 5. Budget Dashboard
- **Monthly overview:** Horizontal bar chart showing spend per category vs. budget target
- **Time periods:** This month / Last month / 3 months (toggle)
- **Summary stats:** Total parsed spend, number of items, top category, most frequent item
- **Color coding:** Green (under budget), Yellow (80-100% of budget), Red (over budget)

### 6. Category Drill-Down
- Tap any category → see all items in that category
- Sorted by total spend (descending)
- Each item shows: name, total spent, purchase count, last purchase date
- Re-categorize: tap item → select different category → creates permanent rule

### 7. Review Queue
- Low-confidence items (<80%) displayed as cards: "Is 'KS ORG QUINOA 4.5LB' → Groceries correct?"
- Actions: Confirm / Recategorize / Skip
- Each user action trains the rules engine for future receipts
- Weekly email digest linking to review queue (if items pending)

### 8. Budget Targets
- User sets monthly budget per category (optional)
- Defaults to "no budget" (tracking only) — users opt in to budgets
- Simple number input per category

### 9. Settings
- Connected accounts (Gmail status, disconnect option)
- Category management (rename, merge, hide categories)
- Custom rules list (view/edit/delete auto-categorization rules)
- Data export (CSV download of all parsed items)
- Delete account (removes all data permanently)

---

## What's Explicitly Out

| Feature | Why It's Out | When to Reconsider |
|---------|-------------|-------------------|
| Bank sync / Plaid | Adds complexity; doesn't solve the core problem (bank data has no item detail) | Phase 6 — after validating receipt parsing is valuable standalone |
| Browser extension | Higher legal risk (retailer ToS); additional engineering surface | Phase 3 — if email receipts prove insufficient coverage |
| Mobile native app | Web works on mobile; app store approval adds weeks | Phase 8 — after product-market fit validated |
| Retailers beyond Walmart & Costco | Scope creep; these two cover the highest mixed-basket pain | Phase 2 — add Target, Amazon, Kroger |
| FSA/HSA auto-flagging | Requires eligible item database; different user flow | Phase 4 — strong secondary use case |
| Roommate/household splits | Multi-user adds auth complexity; validate single-user first | Phase 5 |
| Shared/family accounts | Multi-user architecture not needed for validation | Phase 5 |
| PDF receipt upload | Email-only keeps pipeline simple; most retailers send email receipts | Phase 2 |
| Meal planning / recipes | Different product; validated as low-priority in customer interviews | Not planned |
| Savings suggestions / AI advice | Braden wanted this but it's a different value prop; validate tracking first | Phase 7+ |
| Real-time alerts | Batch processing is sufficient for budgeting; real-time adds infra cost | Phase 6+ |
| Data monetization | Legal complexity; requires anonymization infrastructure | Long-term only |

---

## Success Criteria

The MVP is successful if:

- [ ] **Technical validation:** ≥85% of Walmart/Costco email receipts are successfully parsed into accurate line items (verified by manual spot-check of 50 receipts)
- [ ] **User activation:** ≥50 users complete Gmail OAuth and reach the dashboard within 30 days of launch
- [ ] **Engagement signal:** ≥30% of users return to the dashboard at least once per week after week 2
- [ ] **Categorization quality:** ≥85% of auto-categorized items are confirmed correct by users (via review queue data)
- [ ] **Willingness to pay:** ≥25% of active users indicate they would pay for the service when surveyed
- [ ] **Qualitative validation:** At least 3 users independently describe the product as "must-have" or equivalent in feedback

---

## User Journey Walkthrough

```
1. User lands on tayt.app
   └── Sees: "See where your Walmart money actually goes"
   └── CTA: "Connect Your Gmail — Free"

2. User clicks CTA → Google OAuth consent screen
   └── Grants gmail.readonly access
   └── Redirected back to Runway

3. Onboarding: Receipt Scan
   └── Progress bar: "Scanning your inbox..."
   └── "Found 47 receipts from Walmart and Costco (312 items)"
   └── Processing: receipts parsed in background (GPT-4o)
   └── "Done! Here's your spending breakdown."

4. Category Setup
   └── Pre-populated categories based on detected items
   └── User adjusts if desired, sets budget targets (optional)
   └── "Save & View Dashboard"

5. Dashboard (daily use)
   └── Monthly budget bars by category
   └── Tap category → drill-down to items
   └── Badge: "3 items need your review"

6. Review Queue (weekly)
   └── Email: "We categorized 42 items this week. 3 need your input."
   └── User confirms/recategorizes uncertain items
   └── Rules engine learns

7. Ongoing
   └── New receipts auto-detected every 6 hours
   └── Dashboard updates automatically
   └── User checks in 1-2x/week to monitor budget
```

---

## Technical MVP Architecture

```
┌─────────────────────────────────────────────┐
│                  Vercel                       │
│  ┌──────────────────────────────────────┐    │
│  │         Next.js App                   │    │
│  │  ┌────────┐  ┌───────┐  ┌─────────┐ │    │
│  │  │ Pages  │  │  API   │  │ Auth    │ │    │
│  │  │        │  │ Routes │  │(NextAuth)│ │    │
│  │  └────────┘  └───┬───┘  └─────────┘ │    │
│  └───────────────────┼──────────────────┘    │
└──────────────────────┼───────────────────────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
   ┌──────────┐ ┌──────────┐ ┌──────────┐
   │ Gmail API│ │ OpenAI   │ │ Supabase │
   │          │ │ (GPT-4o) │ │ (Postgres)│
   │ - Fetch  │ │          │ │          │
   │   emails │ │ - Parse  │ │ - Users  │
   │ - Search │ │   receipt│ │ - Items  │
   │   filter │ │ - Categ. │ │ - Rules  │
   │          │ │          │ │ - Budgets│
   └──────────┘ └──────────┘ └──────────┘
```

### Key API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/[...nextauth]` | GET/POST | Google OAuth flow |
| `/api/receipts/scan` | POST | Trigger Gmail scan for new receipts |
| `/api/receipts/[id]` | GET | Get parsed receipt with line items |
| `/api/items` | GET | List all items (filterable by category, date) |
| `/api/items/[id]/categorize` | PATCH | Re-categorize an item |
| `/api/categories` | GET/PUT | List and update budget categories + targets |
| `/api/rules` | GET/POST/DELETE | Manage auto-categorization rules |
| `/api/dashboard/summary` | GET | Aggregated spend data for dashboard |
| `/api/review-queue` | GET | Items needing user review |

### Database Tables

| Table | Key Columns |
|-------|------------|
| `users` | id, email, google_token (encrypted), created_at |
| `receipts` | id, user_id, merchant, date, total, raw_email_id, parsed_at |
| `line_items` | id, receipt_id, name, quantity, unit_price, total_price, category_id, confidence, reviewed |
| `categories` | id, user_id, name, budget_target, display_order |
| `rules` | id, user_id, match_pattern, category_id, created_from (auto/manual) |

---

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Gmail CASA assessment blocks public launch | HIGH | HIGH | MVP runs as "internal testing" (100 users exempt); pursue CASA in parallel |
| Walmart/Costco email format changes break parser | MEDIUM | MEDIUM | LLM parsing is format-resilient; monitor for failures; alert on accuracy drops |
| Users uncomfortable granting Gmail access | HIGH | HIGH | Strong privacy messaging; "read-only" emphasis; delete-all-data option prominent |
| Low receipt volume (users don't get email receipts) | MEDIUM | HIGH | Onboarding check: "Do you receive Walmart email receipts?" — filter out non-matches early |
| GPT-4o costs exceed budget at scale | LOW (MVP) | MEDIUM | Batch processing; cache parsed results; consider fine-tuned model post-MVP |
| Categorization accuracy below 85% | MEDIUM | MEDIUM | Aggressive review queue; user corrections improve rules; manual taxonomy review |
