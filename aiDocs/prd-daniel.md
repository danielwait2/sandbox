# PlateMate — Product Requirements Document
**Version:** 1.0 (MVP)
**Status:** Draft
**Last updated:** 2026-02-23

---

## 1. Problem

Most people know they're overspending on food — restaurants, delivery, fast casual — but don't change anything. Not because they don't care, but because the alternative requires planning, research, and follow-through they don't have. Budgeting apps show them the damage after the fact. No one hands them a ready-to-go alternative.

The result: a slow, invisible drain. $80 at Chipotle when they could have made the same meal for $12.

---

## 2. Solution

PlateMate connects to a user's bank/credit card data, identifies restaurant and delivery spending patterns, and delivers a concrete, one-click alternative: a recipe that matches what they already like to eat, with ingredients pre-loaded into a Walmart grocery cart.

It closes the loop no one has closed: **transaction data → recipe → grocery cart.**

The MVP is food-only. Subscriptions, phone plans, and utilities come later.

---

## 3. Target User

**Primary:** US adults aged 22–40 who:
- Spend $150+/month at restaurants or on food delivery
- Already use at least one fintech app (Venmo, Cash App, a budgeting app, etc.)
- Live in a metro or suburban area with Walmart grocery availability
- Are not on a strict diet plan — they just eat what sounds good and spend without thinking

**They are not:** hardcore budgeters, meal preppers, or nutrition trackers. They're people who would cook more if it were as easy as ordering.

---

## 4. Competitive Landscape

| Competitor | What they do | What they miss |
|---|---|---|
| YNAB / Mint / Copilot | Track and categorize spending | Stop at charts and nudges — no action step |
| eMeals | Recipe planning + grocery cart integration | No bank data — doesn't know what you're overspending on |
| Mealime / Paprika | Recipe library and meal planning | Health/convenience lens, not savings-driven |
| Rocket Money / Trim | Subscription and bill optimization | Ignore high-frequency food spend entirely |

**PlateMate's moat:** The connection between what you *actually spent* and a *pre-built grocery alternative* that mirrors your taste. No one owns this yet.

---

## 5. MVP Scope

### In scope
- Bank/card connection via Plaid
- Automatic detection and categorization of restaurant/delivery transactions
- Weekly spending summary (food category only)
- Recipe suggestions based on detected restaurant habits (e.g., frequent Chipotle → burrito bowl recipe)
- One-click Walmart grocery cart population via Walmart affiliate/API
- Savings display: "You spent $X — this recipe costs $Y"
- Basic user account (email + password)
- Web app (mobile-responsive)

### Out of scope for MVP
- Subscription tracking
- Phone plan / utility optimization
- Native mobile app
- Multiple grocery retailers (Kroger, Instacart, etc.)
- Dietary preference filtering
- Social features
- AI chat interface

---

## 6. User Flow

### Onboarding
The onboarding is not a feature tour. It's a mirror. The goal is to make the user feel seen before we ask them to do anything.

**Screen 1 — The problem statement**
> "The average American spends $3,000 a year eating out. Most of it isn't even food they love — it's convenience, habit, and not having a better option ready."

No sign-up prompt yet. Just the truth.

**Screen 2 — The reframe**
> "You don't have a spending problem. You have a planning gap. PlateMate fills it."

One line. Then a single CTA: "Show me where my money is going."

**Screen 3 — Account creation**
Minimal friction. Email + password only. No phone number, no credit card.

**Screen 4 — Bank connection (Plaid)**
Don't lead with "connect your bank." Lead with the outcome:
> "To find your savings, we need to see where you're spending. We use Plaid — the same technology behind Venmo and Robinhood. We never see your login credentials."

One trust signal. One CTA.

**Screen 5 — The first value moment (immediate, personal)**
Within seconds of connecting:
> "Last month, you spent $340 eating out. Here's what that same food would cost you at home."

Show 2–3 specific swaps based on their actual transactions — not generic tips. This is the moment that earns everything that comes after.

### Core Weekly Loop
1. App detects restaurant/delivery transactions as they occur
2. Each Sunday, user receives a weekly summary:
   - Total food-away-from-home spend
   - Top merchants
   - Estimated savings if they swapped 2–3 meals
3. User taps a swap suggestion → sees a recipe card
4. Taps "Add to Walmart cart" → redirected to pre-filled Walmart cart
5. App tracks whether a Walmart purchase follows within 48 hours (affiliate signal)
6. Next week: "Last week you saved an estimated $28."

---

## 7. Key Features (MVP)

### 7.1 Plaid Connection
- Use Plaid Transactions API to pull up to 90 days of history on connect
- Webhook-based updates for new transactions
- Classify transactions into: restaurant, fast food, food delivery, grocery, other
- Use merchant name + MCC code for classification

### 7.2 Spending Dashboard
- Simple view: this week / this month food spend
- Breakdown by merchant
- Running "estimated savings" counter
- No charts for charts' sake — keep it to 2–3 numbers that matter

### 7.3 Recipe Matching
- Map top merchants to flavor profiles (e.g., Chipotle → Mexican, Chick-fil-A → chicken sandwiches, Domino's → pizza)
- Maintain a curated recipe library (~50 recipes at launch) matched to common fast casual categories
- Surface 2–3 recipe suggestions per week based on user's actual spend patterns
- Each recipe card shows: dish name, photo, cook time, estimated ingredient cost, savings vs. restaurant equivalent

### 7.4 Walmart Cart Integration
- Each recipe has a pre-mapped ingredient list with Walmart product IDs
- "Add to Walmart Cart" button generates a Walmart affiliate cart link
- Track click-throughs for monetization
- Fallback: if Walmart API unavailable, show a printable ingredient list

### 7.5 Savings Tracking
- Estimated savings = (restaurant transaction amount) minus (avg recipe ingredient cost)
- Show cumulative savings since account creation
- Weekly email/push summary with savings figure prominently displayed

---

## 8. Monetization (MVP)

**Primary:** Walmart affiliate commission on grocery cart click-throughs
- Low friction, no paywall, no subscription required at launch
- Aligns incentives: we only make money when users actually buy groceries

**Secondary (post-MVP):** Freemium subscription at ~$5/month for premium features (more recipes, dietary filters, multi-retailer support)

**Not at MVP:** Success-based fees, advertising, lead generation

---

## 9. Technical Requirements

### Stack (recommended, not final)
- **Frontend:** React (web, mobile-responsive)
- **Backend:** Node.js / Express or Python / FastAPI
- **Database:** PostgreSQL
- **Auth:** Clerk or Supabase Auth
- **Bank data:** Plaid Transactions API
- **Grocery:** Walmart Affiliate API / Walmart Open API
- **Hosting:** Vercel (frontend) + Railway or Render (backend)

### Integrations
| Integration | Purpose | Risk |
|---|---|---|
| Plaid | Transaction data | Medium — requires Plaid approval; sandbox available for dev |
| Walmart Affiliate API | Cart generation | Medium — approval required; deep link fallback available |
| Email (Resend / Postmark) | Weekly summary emails | Low |

### Data & Privacy
- Store only transaction metadata needed for classification (merchant, amount, date, category)
- Never store raw account numbers or credentials
- Clear data deletion flow required at launch
- Privacy policy and ToS required before Plaid goes live in production

---

## 10. Success Metrics (MVP)

| Metric | Target (90 days post-launch) |
|---|---|
| Accounts created | 500 |
| Plaid connections completed | 60% of signups |
| Weekly active users (opened app or email) | 40% of connected users |
| "Add to Walmart Cart" click-through rate | 15% of recipe suggestions shown |
| Avg estimated savings displayed per user/week | $20+ |
| User-reported satisfaction (post-onboarding survey) | 4/5+ |

---

## 11. What We're Not Optimizing For (MVP)

- Nutritional accuracy
- Dietary restriction support
- Price precision (estimates are fine — directional savings matter more than exactness)
- Retailer breadth (Walmart only for now)
- Real-time transaction processing (daily batch is fine)

---

## 12. Open Questions

- [ ] Can we get Walmart Affiliate API access quickly, or do we need a deep-link fallback at launch?
- [ ] What is the minimum recipe library size needed to cover 80% of common fast casual spending patterns?
- [ ] Do we need a native mobile app at launch, or is mobile-responsive web sufficient to validate?
- [ ] What Plaid plan tier do we need for webhook-based transaction updates?

---

## 13. Future Modules (Post-MVP Roadmap)

1. **Subscriptions** — detect recurring charges, surface cheaper bundles
2. **Phone plans** — compare actual usage vs. plan, recommend switches
3. **Utilities** — flag high bills, surface alternatives
4. **Multi-retailer** — add Kroger, Instacart, Target
5. **Mobile app** — iOS and Android
6. **AI coach** — natural language interface for savings questions

---

*Informed by market research in [ai/guides/quality-time-app-market-research.md](../ai/guides/quality-time-app-market-research.md)*
