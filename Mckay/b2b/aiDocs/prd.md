# Runway B2B — Product Requirements Document

## 1. Problem

**The Item-Level Blind Spot in Corporate Expense Management**

Corporate expense tools (Ramp, Brex, Expensify, Airbase) enforce spend policies at the merchant level — "no charges over $500" or "restaurants capped at $100/person." But they cannot see what was actually purchased. An employee can buy $400 of office supplies and $50 of personal items on the same Costco receipt, and the system approves the entire transaction because the total is within policy.

**Data points:**
- Organizations lose an average of 40.3 days waiting for expense report payments due to manual processing
- Manual expense auditing takes 10 days per invoice on average
- Fraud and maverick spending erode corporate margins by 5-10%
- IRS requires itemized receipt proof for business expenses >$75
- No existing expense platform offers item-level policy enforcement

**Who has this problem:**
- Finance teams at SMBs (50-300 employees) managing corporate card programs
- Accounting departments manually auditing expense reports for policy compliance
- CFOs and controllers who lack visibility into what employees are actually buying
- Companies in regulated industries requiring detailed audit trails

**Why it hasn't been solved:**
- Consumer payment processing only captures Level 1 data (merchant name, total, date)
- Level 3 data (line-item detail) exists but is restricted to B2B corporate purchasing cards and requires specialized POS integrations
- Existing expense tools built on bank feed data inherit this merchant-level limitation
- Receipt OCR tools (Expensify, Veryfi) extract data but don't connect it to a policy enforcement engine
- Building both extraction AND enforcement is a compound problem most tools avoid

**Competitor gaps:**

| Competitor | Gap |
|-----------|-----|
| Ramp (free/interchange) | Merchant-level controls; cannot flag specific items |
| Brex (free/tiered) | Corporate card controls; no receipt-level policy |
| Expensify ($5-$18/user/mo) | OCR capture but no item-level policy enforcement |
| Airbase (custom) | Category-level spend controls, not SKU-level |
| Navan (custom) | Travel-focused; no general expense item analysis |

## 2. Solution

Runway B2B is a web platform where employees submit receipts (photo upload or email forwarding) and the system automatically extracts every line item, validates each against company spend policies, flags violations, and routes flagged expenses to managers for approval — giving finance teams item-level audit trails and automated policy enforcement without manual receipt review.

**Core features:**
1. **Receipt Submission** — Employee uploads photo/PDF or forwards receipt email to a company-specific address
2. **LLM-Powered Line-Item Extraction** — GPT-4o parses receipts into structured data (item, price, quantity, category, tax)
3. **Policy Engine** — Configurable rules per department/role: category restrictions, amount thresholds, prohibited items
4. **Automated Violation Detection** — Items that violate policy are auto-flagged with specific reason ("Alcohol purchase on corporate card")
5. **Manager Approval Workflow** — Flagged expenses routed to manager with item-level detail; approve/reject/request clarification
6. **Finance Dashboard** — Org-wide spend analytics at the item level; policy compliance rates; fraud detection alerts
7. **Immutable Audit Log** — Every action timestamped for compliance and IRS requirements

**The hook:** "See every item on every receipt — and automatically enforce your spend policy."

## 3. Target User

### Primary: The SMB Finance Manager (60% of target)
- **Company size:** 50-300 employees
- **Role:** Finance Manager, Controller, or VP Finance
- **Motivation:** "I spend 2 days a month manually reviewing expense receipts to catch policy violations. Most get rubber-stamped because I don't have time to check every item."
- **Context:** Uses Ramp or Brex for corporate cards; QuickBooks or NetSuite for accounting; expense policy exists but is unevenly enforced
- **Budget authority:** Authorized to approve $200-$800/mo for finance tools

### Secondary: The Compliance-Driven Enterprise (25% of target)
- **Company size:** 300-2,000 employees
- **Role:** Director of Finance, Internal Audit Lead
- **Motivation:** "Our auditors flagged us for insufficient expense documentation. We need itemized records for everything over $75."
- **Context:** Regulated industry (healthcare, government contracting, financial services); SOC 2 or equivalent required; existing expense tool doesn't meet audit standards

### Secondary: The Startup CFO (15% of target)
- **Company size:** 20-100 employees
- **Role:** CFO or Head of Finance (often part-time or fractional)
- **Motivation:** "I don't have time to audit expenses but I can't afford fraud at our burn rate"
- **Context:** Fast-growing startup; employees use corporate cards freely; no formal expense policy enforcement

### NOT targeting:
- Sole proprietors or freelancers
- Enterprises with 5,000+ employees (require custom integrations, long sales cycles)
- Travel-only expense management (Navan's territory)
- Consumer/personal budgeting (separate B2C product)
- Companies without corporate card programs

## 4. Competitive Positioning

| Competitor | Their Moment | Their Gap vs. Runway B2B |
|-----------|-------------|------------------------|
| Ramp | "The corporate card that saves you money" — spend controls + cashback | Controls at merchant/category level only; cannot flag specific items |
| Brex | "All-in-one finance for growing companies" — cards + travel + bills | Card-level limits; no receipt parsing into policy enforcement |
| Expensify | "Expense reports that don't suck" — OCR + SmartScan | Extracts receipt data but doesn't enforce item-level policy |
| Airbase | "All-in-one spend management" — AP + cards + reimbursements | Spend controls at category level; manual receipt review still required |
| SAP Concur | Enterprise expense management — Fortune 500 standard | Legacy UX; slow; category-level only; no AI extraction |

**Positioning statement:** Runway B2B is the only expense management tool that reads every item on every receipt and automatically enforces your company's spend policy at the line-item level — so your finance team stops rubber-stamping and starts controlling.

## 5. Core Product — MVP Scope

### Screen 1: Company Setup (Admin)
- **What the user sees:** Company name, industry, number of employees, logo upload; invite team members (email); set up departments
- **What logic runs:** Creates organization record; generates company-specific receipt forwarding email (receipts@company.tayt.app); sends invite emails
- **What the user does:** Fills form → invites first batch of employees → proceeds to policy setup

### Screen 2: Policy Configuration (Admin/Finance)
- **What the user sees:** Policy builder interface:
  - Category rules: Toggle categories on/off (e.g., "Block: Alcohol, Tobacco, Entertainment")
  - Amount thresholds: "Meals > $75 require manager approval"
  - Department budgets: Monthly caps per department per category
  - Role-based rules: "Interns: max $50/transaction"
- **What logic runs:** CRUD on policy rules table; rules stored as structured JSON for the policy engine
- **What the user does:** Configures policies → saves → applies to all future submissions

### Screen 3: Receipt Submission (Employee)
- **What the user sees:** Upload zone (drag & drop or camera capture for photo); OR instructions to forward email receipts to receipts@company.tayt.app; status of recent submissions (Processing / Approved / Flagged / Rejected)
- **What logic runs:** Receipt ingested → GPT-4o extraction → line items created → policy engine evaluates each item → status determined
- **What the user does:** Uploads receipt → sees processing status → gets notified if flagged

### Screen 4: Expense Detail View (Employee)
- **What the user sees:** Parsed receipt showing: merchant, date, all line items (name, qty, price, category), total, tax; policy status per item (green check / red flag with reason); overall status
- **What logic runs:** Display of parsed data + policy evaluation results
- **What the user does:** Views results; can add notes or context to flagged items ("Client dinner — pre-approved by VP Sales")

### Screen 5: Manager Approval Queue
- **What the user sees:** List of pending expenses from direct reports; each shows: employee name, merchant, total, number of flagged items, date submitted; expandable to see full item-level detail with specific violation reasons
- **What logic runs:** Query expenses where status=flagged AND manager=current_user
- **What the user does:** Reviews flagged items → Approve / Reject / Request clarification per item or per receipt

### Screen 6: Finance Dashboard (Admin/Finance)
- **What the user sees:**
  - Monthly spend overview by department and category
  - Policy compliance rate (% of expenses passing without flags)
  - Top violation types (bar chart)
  - Flagged expense trend line
  - Recent activity feed
  - Export to CSV
- **What logic runs:** Aggregation queries across all org expenses; compliance metrics calculated
- **What the user does:** Monitors org-wide spending; identifies problem areas; adjusts policies

### Screen 7: Audit Log (Admin/Finance)
- **What the user sees:** Searchable, filterable log of all actions: submission, approval, rejection, policy changes; each entry shows: timestamp, actor, action, affected items
- **What logic runs:** Immutable append-only log queries
- **What the user does:** Searches for specific transactions; exports for auditors; filters by date range, employee, department

### What Is Explicitly Out of Scope for MVP:
- Corporate card issuance
- Bank feed integration / Plaid
- ERP integrations (QuickBooks, NetSuite, SAP)
- Mileage tracking
- Travel booking
- SSO / SAML (email + password auth for MVP)
- Mobile native app
- Multi-currency support
- Automated reimbursement / payment
- API for third-party integrations
- SOC 2 certification (required for enterprise but not for validation)
- Receipt matching to bank transactions

## 6. Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Platform | Web app (Next.js) | Fastest to prototype; accessible from any device; no app store friction |
| Receipt ingestion | Email forwarding + manual upload | Consensual data (employee submits voluntarily); lowest legal risk; no scraping |
| Parsing engine | GPT-4o API | ~100% accuracy on fragmented POS descriptions; handles multi-format receipts (thermal, digital, PDF); 7-10s latency acceptable |
| Policy engine | Rules-based (structured JSON) | Deterministic enforcement; auditable; no AI ambiguity in compliance decisions |
| Database | Supabase (PostgreSQL) | Row-level security for multi-tenant; free tier for MVP; strong relational model for org hierarchy |
| Auth | NextAuth.js (email/password) | Simple for MVP; SSO/SAML deferred to post-MVP |
| Audit log | Append-only PostgreSQL table | Immutable; queryable; no external dependency |
| Hosting | Vercel | Zero-config Next.js; edge functions for API routes |
| File storage | Supabase Storage | Receipt images/PDFs stored with org-level access control |

## 7. Content & Tone

**Voice:** Professional, clear, trustworthy — speaks like a competent finance colleague, not a salesperson. Avoids jargon but doesn't oversimplify.

**Reading level:** Professional business English. Assume the reader is competent but busy.

**Key copy principles:**
- Lead with control and compliance ("Enforce your policy automatically") not technology ("AI-powered receipt parsing")
- Quantify the pain ("How many hours does your team spend reviewing receipts?")
- Emphasize audit readiness ("Every item. Every receipt. Every time.")

## 8. Legal / Regulatory Guardrails

**What this product IS:** A corporate expense management tool that helps finance teams enforce spend policies at the item level.

**What this product is NOT:** An employee surveillance tool, a corporate card issuer, or a financial advisor.

**Hard lines:**
- Receipt data belongs to the organization, not Runway — customers can export and delete at any time
- Employee receipt data is only visible to authorized roles (submitter, manager, finance)
- No data sharing between organizations
- Audit logs are immutable — no backdating or deletion
- No automated termination or disciplinary recommendations based on expense data

**Compliance requirements:**
- SOC 2 Type II required before enterprise sales (est. cost $10K-$80K; target: Phase 3)
- GDPR compliance if serving EU companies (data processing agreements required)
- IRS compliance: system must support itemized documentation requirements for expenses >$75

**When to revisit:** When pursuing Fortune 500 clients, legal review of data residency, HIPAA (healthcare clients), and government contracting requirements (FedRAMP) will be needed.

## 9. Success Metrics

| Metric | Definition | MVP Target |
|--------|-----------|------------|
| Companies Onboarded | Orgs that complete setup + submit first receipt | 5 in first 60 days |
| Receipts Processed | Total receipts successfully parsed | 200+ across all orgs |
| Extraction Accuracy | % of line items correctly parsed (verified by finance team) | >90% |
| Policy Violations Caught | Flagged items that finance confirms as true violations | >70% precision |
| Time Saved | Self-reported reduction in manual receipt review time | >50% reduction |
| Manager Approval Time | Median time from flag to approve/reject | <24 hours |
| NPS | Net Promoter Score from finance admin survey | >30 |
| Expansion Interest | % of pilot companies requesting paid tier / more seats | >40% |

These metrics are directional — the goal is validating demand and workflow fit, not hitting exact numbers.

## 10. Build Plan

| Day | Focus | Deliverable |
|-----|-------|-------------|
| 1 (Hackathon) | Core pipeline | Receipt upload + GPT-4o extraction + basic policy engine |
| 1 (Hackathon) | Basic UI | Company setup + employee submission + admin dashboard skeleton |
| 2 (Post-hackathon) | End-to-end | Full flow: upload → parse → evaluate → flag → approve |
| 3 | Policy builder | UI for configuring category rules, thresholds, department budgets |
| 4-5 | Manager workflow | Approval queue, notification emails, rejection with comments |
| Week 2 | Email forwarding | receipts@company.tayt.app ingestion pipeline |
| Week 3 | Audit log + export | Immutable log, CSV export, search/filter |
| Week 4 | Pilot | 3-5 companies beta testing; collect accuracy + workflow feedback |

## 11. Future Phases

- **Phase 2:** Email receipt forwarding pipeline (auto-ingestion without manual upload)
- **Phase 3:** SOC 2 Type II certification; SSO/SAML authentication
- **Phase 4:** QuickBooks + NetSuite integrations (auto-sync approved expenses)
- **Phase 5:** Bank transaction matching (correlate receipts with corporate card charges)
- **Phase 6:** Mobile app (iOS/Android) with camera capture
- **Phase 7:** Advanced analytics (department benchmarking, trend detection, anomaly alerts)
- **Phase 8:** API for third-party integrations (build expense enforcement into existing tools)
- **Long-term:** White-label policy engine for existing expense platforms (Ramp, Brex); data licensing for spend intelligence
