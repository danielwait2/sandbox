# Runway B2C — Product Requirements Document

## 1. Problem

**The Granularity Gap in Personal Finance**

Most budgeting apps rely on bank transaction data, which only provides merchant-level information: "$250 at Walmart," "$180 at Costco," "$95 at Target." For big-box retailers where consumers buy everything from groceries to tires to baby supplies in a single trip, this data is useless for real budgeting.

**Data points:**
- 53.8% of consumers still rely on manual expense tracking
- YNAB's "split transaction" feature requires manual receipt lookup and mental math — Reddit users characterize the effort as "absurd" and a "time tax"
- Monarch Money's 2026 AI Receipt Scan only covers Amazon — leaving Walmart, Costco, and Target (the highest mixed-basket retailers) unsolved
- Americans forfeit ~$4B annually in unused FSA/HSA funds because identifying eligible items from bulk receipts is too friction-heavy

**Who has this problem:**
- Families buying mixed baskets at Walmart/Costco (diapers + food + household goods = one "grocery" charge)
- HSA/FSA holders who need to identify eligible items (OTC meds, sunscreen, first-aid) from large receipts
- Roommates/couples sharing big-box trips where personal and shared items are mixed
- Health-conscious consumers who want to understand the nutritional composition of their grocery spending

**Why it hasn't been solved:**
- Payment processing architecture: Consumer transactions use Level 1 data (merchant name, total, date) — no line items. Level 3 data (SKU-level) is restricted to B2B corporate purchasing cards
- Financial aggregators (Plaid, Yodlee, MX) enrich merchant data but cannot access item-level detail
- Retailers actively guard purchase data and prohibit scraping (Amazon/Walmart ToS)
- Email receipts are the one channel where itemized data exists in a consumer-accessible format — but no product has built a robust extraction pipeline around it

**Competitor gaps:**

| Competitor | Gap |
|-----------|-----|
| YNAB ($109/yr) | Manual split transactions only; no receipt parsing |
| Monarch Money ($99.99/yr) | AI Receipt Scan limited to Amazon; no Walmart/Costco/Target |
| Copilot ($95/yr) | Amazon Labs requires re-auth every few weeks; no other retailers |
| Rocket Money ($6-$12/mo) | Merchant-level only; focused on subscription cancellation |
| Simplifi ($5.99/mo) | Merchant-level only; no receipt parsing |

## 2. Solution

Runway is a web app that connects to a user's Gmail, automatically finds and parses digital receipts from major retailers (starting with Walmart and Costco), extracts every line item, and auto-categorizes each purchase into budget categories — giving users true item-level visibility into their spending without any manual effort.

**Core features:**
1. **Gmail Receipt Ingestion** — OAuth connection to Gmail; auto-detect receipts from supported retailers
2. **LLM-Powered Line-Item Extraction** — GPT-4o parses receipt emails into structured data (item name, price, quantity, tax)
3. **Smart Auto-Categorization** — Hybrid rules + LLM engine assigns each item to a budget category with confidence scoring
4. **Category Budget Tracking** — Dashboard showing spend per category (Groceries, Baby, Household, Health, etc.) vs. budget targets
5. **Review Queue** — Low-confidence items surfaced weekly for quick user confirmation (swipe right/left)
6. **Custom Rules** — User-defined overrides ("Always tag Pampers as Baby Supplies")

**The hook:** "Connect your Gmail. See where your Walmart money actually goes."

## 3. Target User

### Primary: The Mixed-Basket Family (60% of target)
- **Age:** 25-45
- **Income:** $50K-$120K household
- **Motivation:** "I budget seriously but can't tell how much I spend on baby supplies vs. groceries vs. household stuff because it's all one Walmart charge"
- **Context:** Already uses or has tried YNAB/Monarch/Copilot; frustrated by merchant-level blindness; shops at Walmart + Costco weekly
- **Validated by:** Spencer — "I would pay for that... swipe card, auto-itemize, syncs to budgeting app"

### Secondary: The HSA/FSA Optimizer (25% of target)
- **Age:** 30-55
- **Income:** $60K-$150K
- **Motivation:** "I'm leaving money on the table because I can't easily identify which items from my Costco trip are FSA-eligible"
- **Context:** Has employer-provided HSA/FSA; buys eligible items (OTC meds, first-aid, sunscreen) bundled with groceries; manually scavenges receipts at year-end
- **Validated by:** Market data — $4B/yr in forfeited FSA/HSA funds

### Secondary: The Roommate Splitter (15% of target)
- **Age:** 20-30
- **Income:** $30K-$70K
- **Motivation:** "We share Costco trips but Splitwise doesn't know which items are mine vs. shared vs. theirs"
- **Context:** Uses Splitwise/Venmo for cost-sharing; friction when shared trips include personal items

### NOT targeting:
- Users who only shop at single-category stores (pure grocery stores, specialty shops)
- Users who don't receive digital receipts via email
- Enterprise/business expense management (separate B2B product)
- Users seeking investment advice or wealth management

## 4. Competitive Positioning

| Competitor | Their Moment | Their Gap vs. Runway |
|-----------|-------------|-------------------|
| YNAB | "Every dollar has a job" — envelope budgeting | Manual splits only; no receipt automation |
| Monarch Money | "Spiritual successor to Mint" — 4.9★, 28K reviews | AI Receipt Scan Amazon-only; no Walmart/Costco |
| Copilot | Apple-native design; AI categorization | Amazon Labs unstable (re-auth); no other retailers |
| Rocket Money | Bill negotiation + subscription cancellation | Merchant-level only; different core value prop |
| Fetch | Receipt scanning for rewards points | Gamification, not budgeting; no category tracking |

**Positioning statement:** Runway is the first budgeting tool that automatically turns your Walmart and Costco email receipts into item-level budget data — so you can finally see what you're actually spending on, not just where you swiped.

## 5. Core Product — MVP Scope

### Screen 1: Landing Page
- **What the user sees:** Headline ("See where your Walmart money actually goes"), subhead explaining email receipt parsing, CTA ("Connect Your Gmail — Free")
- **What happens:** User clicks CTA → Gmail OAuth flow
- **Design:** Single-page, mobile-responsive, trust signals (privacy badge, "We never store your email password")

### Screen 2: Gmail Connection (OAuth)
- **What the user sees:** Google OAuth consent screen requesting read-only access to Gmail
- **What logic runs:** OAuth 2.0 flow with restricted scope (gmail.readonly); token stored securely
- **What the user does:** Grants permission → redirected to onboarding

### Screen 3: Onboarding — Receipt Scan
- **What the user sees:** Progress indicator ("Scanning your inbox for receipts..."), count of receipts found, retailer breakdown
- **What logic runs:** Gmail API search for receipts from supported retailers (Walmart, Costco); LLM extraction pipeline processes each receipt; items categorized with confidence scores
- **What the user does:** Watches progress → sees "Found 47 receipts with 312 items" → continues to dashboard

### Screen 4: Category Setup
- **What the user sees:** Suggested budget categories pre-populated from their actual spending (Groceries, Baby & Kids, Household, Health & Wellness, Electronics, Clothing, Personal Care), each showing detected spend
- **What logic runs:** Clustering of extracted items into default taxonomy (modified GS1 GPC consumer categories)
- **What the user does:** Adjusts categories if desired, sets monthly budget targets per category → saves

### Screen 5: Dashboard (Primary View)
- **What the user sees:**
  - Monthly budget overview: category bars showing spend vs. budget (green/yellow/red)
  - Total spend across all parsed receipts
  - "This Month" / "Last Month" / "3 Month" toggle
  - Quick stats: "Top category: Groceries ($342)" / "Most frequent item: Whole milk (8x)"
- **What logic runs:** Aggregation queries on line-item data grouped by category and time period
- **What the user does:** Taps a category to drill down

### Screen 6: Category Drill-Down
- **What the user sees:** List of all items in that category, sorted by total spend; each item shows: name, total spent, frequency, last purchased date
- **What logic runs:** Line-item query filtered by category
- **What the user does:** Can re-categorize any item (drag to different category); changes create a permanent rule

### Screen 7: Review Queue
- **What the user sees:** Cards showing low-confidence categorizations: "Is 'KS ORG QUINOA 4.5LB' → Groceries correct?" with Yes/No/Recategorize options
- **What logic runs:** Items with confidence score below threshold (e.g., <80%) queued for review
- **What the user does:** Confirms or recategorizes; each action trains the rules engine
- **Frequency:** Weekly email digest with link to review queue; badge count on dashboard

### Screen 8: Settings
- **What the user sees:** Connected accounts (Gmail), supported retailers toggle, custom category rules list, notification preferences, data export (CSV), account deletion
- **What logic runs:** CRUD operations on user preferences and rules
- **What the user does:** Manages connections and rules

### What Is Explicitly Out of Scope for MVP:
- Bank account sync / Plaid integration
- Browser extension for retailer account scraping
- Mobile native app (iOS/Android)
- Shared household accounts / multi-user
- Bill negotiation or subscription management
- Investment tracking
- Meal planning or recipe suggestions
- Retailers beyond Walmart and Costco email receipts
- Real-time transaction alerts
- PDF receipt upload (email only)
- FSA/HSA auto-flagging (post-MVP)
- Roommate split functionality (post-MVP)

## 6. Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Platform | Web app (Next.js) | Fastest to prototype; no app store approval; works on all devices |
| Receipt source | Gmail API (email receipts) | Lower legal risk than scraping; receipts are user's own data; no retailer ToS violation |
| Parsing engine | GPT-4o API | ~100% accuracy on fragmented POS descriptions; handles "KS ORG QUINOA 4.5LB" → "Kirkland Organic Quinoa"; 7-10s latency acceptable for batch |
| Categorization | Rules-based + LLM hybrid | Rules handle known items instantly; LLM handles novel/ambiguous items; confidence scoring routes uncertain items to review queue |
| Taxonomy | Modified GS1 GPC (consumer-centric) | Industry standard adapted for household budgeting; Segment → Family → Class → Budget Bucket |
| Database | Supabase (PostgreSQL) | Free tier for MVP; row-level security; real-time subscriptions for dashboard updates |
| Auth | NextAuth.js + Google OAuth | Gmail OAuth required anyway; extends naturally to app auth |
| Hosting | Vercel | Zero-config Next.js deployment; generous free tier |

## 7. Content & Tone

**Voice:** Friendly, direct, confident — not salesy or preachy. Speaks like a smart friend who's good with money, not a financial advisor.

**Reading level:** 8th grade. If a busy parent can't understand a sentence while supervising kids at Costco, rewrite it.

**Key copy principles:**
- Lead with the outcome ("See where your money goes") not the technology ("AI-powered receipt parsing")
- Acknowledge the pain before presenting the solution ("You budget carefully. But your app just shows '$250 at Walmart.'")
- Privacy-first messaging at every touchpoint ("Your receipts. Your data. We never sell or share it.")

## 8. Legal / Regulatory Guardrails

**What this product IS:** A personal budgeting tool that helps users understand their own spending at the item level.

**What this product is NOT:** A data broker, advertising platform, financial advisor, or receipt rewards program.

**Hard lines:**
- Receipt data is never sold to third parties
- No advertising or ad targeting based on purchase data
- No storage of Gmail credentials (OAuth tokens only)
- Users can delete all their data at any time (GDPR/CCPA right to deletion)
- No automated financial advice or recommendations (informational only)

**Compliance requirements:**
- Gmail restricted scope compliance (CASA assessment required before public launch)
- CCPA: Right to opt-out, right to deletion, privacy policy disclosure
- GDPR (if serving EU users): Data minimization, purpose limitation, right to erasure

**When to revisit:** If Runway pursues data monetization (Model A / CPG data licensing), legal review of aggregation and anonymization practices is required before any data leaves the platform.

## 9. Success Metrics

| Metric | Definition | MVP Target |
|--------|-----------|------------|
| Gmail Connections | Users who complete OAuth flow | 50 in first 30 days |
| Receipts Parsed | Total receipts successfully extracted | 500+ across all users |
| Categorization Accuracy | % of items correctly categorized (user-confirmed) | >85% auto-correct rate |
| Review Queue Engagement | % of flagged items that users actually review | >40% |
| Weekly Retention | % of users who return to dashboard at least once/week | >30% after week 4 |
| NPS | Net Promoter Score from in-app survey | >40 |
| Willingness to Pay | % of users who say they'd pay for premium in survey | >25% |

These metrics are directional — the goal is learning, not hitting exact numbers.

## 10. Build Plan

| Day | Focus | Deliverable |
|-----|-------|-------------|
| 1 (Hackathon) | Core pipeline | Gmail OAuth + receipt detection + GPT-4o extraction for Walmart receipts |
| 1 (Hackathon) | Basic UI | Landing page + dashboard skeleton with hardcoded sample data |
| 2 (Post-hackathon) | End-to-end | Connect pipeline to dashboard; real receipt data displayed |
| 3 | Categorization | Rules engine + confidence scoring + review queue |
| 4-5 | Polish | Budget targets, category drill-down, settings, onboarding flow |
| Week 2 | Costco support | Add Costco email receipt parsing template |
| Week 3 | Testing | 10 beta users; collect accuracy data; iterate on categorization |
| Week 4 | Validation | User interviews on WTP; decide go/no-go on premium tier |

## 11. Future Phases

- **Phase 2:** Add Target, Amazon, Kroger email receipt support
- **Phase 3:** Browser extension for retailer account history (deeper data, higher risk)
- **Phase 4:** FSA/HSA auto-flagging with eligible item database
- **Phase 5:** Roommate/household split functionality
- **Phase 6:** Bank transaction matching (Plaid) — correlate receipt items with bank charges
- **Phase 7:** Banyan integration for real-time POS data (if partnership available)
- **Phase 8:** Mobile native app (iOS first)
- **Long-term:** B2B2C partnerships with HSA providers; data licensing (Model A) with aggregated, anonymized insights for CPG brands
