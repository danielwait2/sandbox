# MVP Spec — Runway

**Goal:** Validate that consumers will connect their Gmail, let an AI parse their Walmart/Costco receipts, and return to a dashboard that shows item-level spending by category.

This is a **validation MVP** — prove the loop works and that users find it valuable before building more.

---

## The Core Loop

```
Receipt email arrives in Gmail
        ↓
Gmail API (polling every 6 hours)
        ↓
GPT-4o parses email → extracts line items + categories
        ↓
Structured data saved to Supabase
        ↓
Dashboard updates: spend by category, review queue
```

---

## What's In

### 1. Gmail OAuth Connection
- Google sign-in with `gmail.readonly` scope
- Scan last 90 days on first connect; poll every 6 hours for new receipts
- Receipt deduplication by order ID + total
- Disconnect option in settings

### 2. Receipt Detection & Parsing (Walmart + Costco only)
- Detect receipts by sender domain (`@walmart.com`, `@costco.com`)
- GPT-4o extracts per receipt:
  - Merchant, date, order number
  - Each line item: raw name, normalized name, qty, unit price, total price
  - Subtotal, tax, total
  - Confidence score per item
- Failed parses are logged and skipped silently

### 3. Auto-Categorization
- Rules-based engine for known products → instant, deterministic
- LLM fallback for unknown/ambiguous items
- Default categories: Groceries, Household, Baby & Kids, Health & Wellness, Personal Care, Electronics, Clothing & Apparel, Pet Supplies, Other
- Items with confidence <80% → Review Queue

### 4. Dashboard
- Monthly spend per category vs. budget target (progress bars, green/yellow/red)
- Time toggle: This Month / Last Month / 3 Months
- Summary stats: total spend, receipt count, top category, most frequent item
- Tap category → drill-down list of all items (sorted by spend)

### 5. Review Queue
- Cards: "Is 'KS ORG QUINOA 4.5LB' → Groceries correct?" with Confirm / Recategorize / Skip
- Each action creates a permanent rule for future receipts
- Badge count on dashboard; weekly email digest with link

### 6. Budget Targets
- Optional: user sets monthly target per category
- Default: tracking-only (no budget required to use the app)

### 7. Settings
- Gmail connection status + disconnect
- Custom rules (view/edit/delete)
- CSV export of all parsed items
- Delete account (removes all data permanently)

---

## What's Out

| Feature | When to add |
|---|---|
| Bank/Plaid sync | Phase 6 — after receipt parsing proves standalone value |
| Target, Amazon, Kroger receipts | Phase 2 |
| FSA/HSA auto-flagging | Phase 4 |
| Shared household / multi-user | Phase 5 |
| Mobile native app | Phase 8 |
| Browser extension | Phase 3 (higher legal risk) |
| PDF receipt upload | Phase 2 |
| Real-time alerts | Phase 6+ |
| B2B expense management | Separate product track |

---

## Data Schema (Minimal)

**`receipts`** — one row per receipt email
```
id, user_id, retailer, transaction_date, subtotal, tax, total, order_number, raw_email_id, parsed_at
```

**`line_items`** — one row per line item
```
id, receipt_id, raw_name, name, quantity, unit_price, total_price, category_id, confidence, user_overridden
```

**`categories`** — user's category setup
```
id, user_id, name, budget_target, display_order
```

**`rules`** — auto-categorization rules (user-trained)
```
id, user_id, match_pattern, category_id, created_from (auto/manual)
```

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) |
| Styling | Tailwind CSS |
| Auth | NextAuth.js + Google OAuth |
| Database | SQLite via `better-sqlite3` |
| Parsing | Gemini API |
| Hosting | Vercel |

> **Demo shortcut (Wizard of Oz):** For a hackathon demo, email forwarding to a shared inbox is acceptable instead of full Gmail OAuth. Seed the database with a few months of real-looking receipts so the dashboard looks populated.

---

## Key API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/auth/[...nextauth]` | GET/POST | Google OAuth flow |
| `/api/receipts/scan` | POST | Trigger Gmail scan |
| `/api/receipts/[id]` | GET | Parsed receipt + line items |
| `/api/items` | GET | All items (filterable) |
| `/api/items/[id]/categorize` | PATCH | Re-categorize item |
| `/api/categories` | GET/PUT | Budget categories + targets |
| `/api/rules` | GET/POST/DELETE | Auto-categorization rules |
| `/api/dashboard/summary` | GET | Aggregated spend data |
| `/api/review-queue` | GET | Items needing review |

---

## MVP Success Criteria

The MVP is successful if:
- [ ] ≥85% of Walmart/Costco receipts parse successfully (spot-check 50 receipts)
- [ ] ≥50 users complete Gmail OAuth and reach the dashboard within 30 days
- [ ] ≥30% of users return to the dashboard at least once/week after week 2
- [ ] ≥85% of auto-categorized items confirmed correct via review queue data
- [ ] ≥25% of active users say they'd pay for it when surveyed
- [ ] At least 3 users independently call it "must-have" in feedback

---

## Risks

| Risk | Mitigation |
|---|---|
| Gmail CASA blocks public launch | Stay under 100 users (internal testing exemption); pursue CASA in parallel |
| Users uncomfortable granting Gmail access | Strong privacy messaging; "read-only" emphasis; delete-all-data option prominent during onboarding |
| Low receipt volume (users don't get email receipts) | Ask in onboarding: "Do you get Walmart or Costco email receipts?" — filter non-matches early |
| Walmart/Costco email format changes | LLM parsing is format-resilient; monitor accuracy; alert on drops |
| GPT-4o cost | ~$0.05–0.10/receipt at current pricing; fine-tune post-MVP if needed |
