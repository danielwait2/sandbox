# Runway B2B — MVP Definition

## MVP Goal

Validate that SMB finance teams will adopt an item-level expense review tool — specifically, that automated receipt parsing + policy enforcement saves meaningful time compared to manual receipt auditing, and that finance managers will pay for the capability.

---

## What's In

### 1. Company Setup & Team Management
- Admin creates organization (company name, industry, size)
- System generates company-specific receipt forwarding email (receipts@{company}.tayt.app)
- Admin invites employees via email (batch invite by pasting email list)
- Role assignment: Admin, Finance, Manager, Employee
- Department creation and employee assignment

### 2. Spend Policy Configuration
- Policy builder UI for finance admins:
  - **Category restrictions:** Block specific categories entirely (e.g., Alcohol, Tobacco, Entertainment)
  - **Amount thresholds:** "Any single item > $X requires approval" / "Total receipt > $Y requires approval"
  - **Department budgets:** Monthly spending cap per department per category
  - **Role-based rules:** Different thresholds by role (e.g., Intern vs. Director)
- Policies stored as structured JSON — deterministic enforcement, no AI ambiguity
- Default policy template provided (configurable starting point)

### 3. Receipt Submission (Employee)
- **Upload:** Drag-and-drop or click-to-upload (JPEG, PNG, PDF)
- **Email forwarding:** Employee forwards receipt email to receipts@{company}.tayt.app; system auto-associates to employee by sender address
- Status tracking: Processing → Approved / Flagged / Rejected
- Submission history with search

### 4. LLM-Powered Receipt Parsing
- GPT-4o processes uploaded image/PDF/email → structured JSON:
  - Merchant name
  - Transaction date
  - Each line item: name, quantity, unit price, total price
  - Subtotal, tax, total
  - Payment method (if visible)
- Confidence score per extracted field
- Failed parses logged with error reason; employee notified to re-upload

### 5. Automated Policy Evaluation
- Each extracted line item evaluated against all active policies
- Evaluation results per item:
  - **Pass:** Green checkmark — item within all policies
  - **Flag:** Red alert with specific violation reason ("Alcohol purchase prohibited on corporate card" / "Item exceeds $100 threshold")
- Receipt-level status:
  - **Approved:** All items pass → auto-approved, no manager action needed
  - **Flagged:** One or more items violate policy → routed to manager queue
- Employee can add notes/context to flagged items before manager review

### 6. Manager Approval Workflow
- Manager sees queue of flagged expenses from direct reports
- Each entry shows: employee name, merchant, date, total, flagged item count
- Expandable detail: full item list with pass/flag status and violation reasons
- Actions per receipt: Approve All / Reject All / Approve with exceptions
- Actions per item: Approve (override policy) / Reject
- Comment field for approval rationale (stored in audit log)
- Email notification to employee on approval/rejection

### 7. Finance Dashboard
- **Spend overview:** Monthly spend by department (bar chart)
- **Category breakdown:** Spend by category across org (pie/bar chart)
- **Compliance rate:** % of expenses auto-approved vs. flagged vs. rejected
- **Top violations:** Most common policy violation types (ranked list)
- **Trend line:** Flagged expenses over time (is compliance improving?)
- **Recent activity feed:** Latest submissions, approvals, rejections
- **Time period selector:** This month / Last month / Quarter / Custom range
- **Export:** CSV download of all expense data with line items

### 8. Audit Log
- Immutable, append-only record of every action:
  - Receipt submitted (by whom, when, what)
  - Items extracted (what was parsed)
  - Policy evaluated (which rules applied, results)
  - Manager action (approved/rejected, by whom, with what comment)
  - Policy changes (who changed what rule, when)
- Searchable by: date range, employee, department, action type, merchant
- Exportable for external auditors (CSV/PDF)

### 9. Employee Dashboard
- Employee's own submission history
- Status of each receipt (Approved / Flagged / Rejected)
- Detail view of any receipt with item-level breakdown
- Notification center (flagged items, rejections, requests for context)

---

## What's Explicitly Out

| Feature | Why It's Out | When to Reconsider |
|---------|-------------|-------------------|
| Corporate card issuance | Different product entirely; Ramp/Brex territory | Not planned |
| Bank feed / Plaid integration | Adds complexity; bank data has no item detail | Phase 5 |
| ERP integrations (QuickBooks, NetSuite, SAP) | Each integration is weeks of work; validate core value first | Phase 4 |
| SSO / SAML authentication | Enterprise requirement but not needed for SMB pilot | Phase 3 |
| Mobile native app | Web works on mobile; camera capture works in browser | Phase 6 |
| Multi-currency support | Focus on US market first | Phase 7+ |
| Automated reimbursement / payment | Different workflow; integrates with payroll | Phase 5+ |
| Mileage tracking | Different use case | Not planned |
| Travel booking | Navan's territory | Not planned |
| Receipt-to-bank-transaction matching | Requires Plaid; valuable but not core | Phase 5 |
| SOC 2 certification | Required for enterprise sales but ~$10K-$80K; validate product first | Phase 3 |
| API for third-party platforms | Build for direct use first; API later | Phase 8 |
| AI-generated receipt fraud detection | Valuable but edge case for MVP | Phase 7 |
| Automated GL coding | Requires accounting integration | Phase 4 |

---

## Success Criteria

The MVP is successful if:

- [ ] **Technical validation:** ≥90% of uploaded receipts are successfully parsed into accurate line items (verified by finance team spot-check of 50 receipts)
- [ ] **Company adoption:** ≥5 companies complete setup and submit receipts within 60 days of launch
- [ ] **Policy accuracy:** ≥70% of flagged items are confirmed as true policy violations by finance (precision)
- [ ] **Time savings:** Finance teams self-report ≥50% reduction in manual receipt review time
- [ ] **Workflow completion:** ≥80% of flagged expenses are resolved (approved/rejected) within 48 hours
- [ ] **Manager engagement:** Managers actively use the approval queue (not just rubber-stamping)
- [ ] **Expansion signal:** ≥40% of pilot companies ask about paid tier, more seats, or additional features
- [ ] **Qualitative validation:** At least 2 finance managers independently say this replaces a painful manual process

---

## User Journey Walkthrough

### Finance Admin Setup (Day 1)
```
1. Admin signs up at tayt.app/business
   └── Creates organization: "Acme Corp, 75 employees, SaaS"
   └── Gets forwarding address: receipts@acme.tayt.app

2. Policy Configuration
   └── Starts from default template
   └── Blocks: Alcohol, Tobacco
   └── Sets: Meals > $75 require approval
   └── Sets: Any item > $200 requires approval
   └── Sets: Marketing dept budget: $3K/mo office supplies

3. Team Invite
   └── Pastes 20 employee emails
   └── Assigns departments and managers
   └── Employees receive invite email with instructions
```

### Employee Submission (Daily Use)
```
4. Employee gets receipt after business lunch ($92)
   └── Forwards email receipt to receipts@acme.tayt.app
   └── OR uploads photo from phone via web app

5. System processes (7-15 seconds)
   └── Extracts: 4 meals ($18-$24 each), 2 drinks ($8 each), tax, tip
   └── Policy check: Total $92 > $75 meal threshold → FLAGGED
   └── Employee notified: "Your expense needs manager approval"

6. Employee adds context
   └── "Client lunch with Figma team — pre-approved by VP Sales"
   └── Submits for review
```

### Manager Approval (Same Day)
```
7. Manager gets email: "1 expense needs your review"
   └── Opens approval queue
   └── Sees: "Jane Doe — Restaurant XYZ — $92 — 1 flag"
   └── Expands: sees all items + flag reason ("Meal > $75")
   └── Reads Jane's note about client lunch
   └── Approves with comment: "Confirmed pre-approved"
   └── Jane notified: "Expense approved"
```

### Finance Review (Weekly/Monthly)
```
8. Finance manager checks dashboard
   └── Compliance rate: 78% auto-approved, 18% flagged, 4% rejected
   └── Top violation: "Meals over threshold" (12 instances)
   └── Action: Considers raising meal threshold to $100
   └── Exports monthly report for accounting
```

---

## Technical MVP Architecture

```
┌──────────────────────────────────────────────┐
│                   Vercel                      │
│  ┌───────────────────────────────────────┐   │
│  │          Next.js App                   │   │
│  │  ┌────────┐ ┌────────┐ ┌───────────┐ │   │
│  │  │ Pages  │ │  API   │ │   Auth    │ │   │
│  │  │(React) │ │ Routes │ │(NextAuth) │ │   │
│  │  └────────┘ └───┬────┘ └───────────┘ │   │
│  └──────────────────┼────────────────────┘   │
└─────────────────────┼────────────────────────┘
                      │
         ┌────────────┼─────────────┐
         │            │             │
         ▼            ▼             ▼
  ┌───────────┐ ┌──────────┐ ┌──────────┐
  │  Email    │ │ OpenAI   │ │ Supabase │
  │ Ingestion │ │ (GPT-4o) │ │(Postgres)│
  │           │ │          │ │          │
  │ - Receive │ │ - Parse  │ │ - Orgs   │
  │   forward │ │   receipt│ │ - Users  │
  │ - Match   │ │ - Extract│ │ - Items  │
  │   sender  │ │   items  │ │ - Policies│
  │           │ │          │ │ - Audit  │
  └───────────┘ └──────────┘ └──────────┘
                                  │
                            ┌─────┘
                            ▼
                     ┌──────────┐
                     │ Supabase │
                     │ Storage  │
                     │          │
                     │ - Receipt│
                     │   images │
                     │ - PDFs   │
                     └──────────┘
```

### Key API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/[...nextauth]` | GET/POST | Authentication flow |
| `/api/org/setup` | POST | Create organization |
| `/api/org/invite` | POST | Invite employees |
| `/api/org/policy` | GET/PUT | View and update spend policies |
| `/api/expenses/submit` | POST | Upload receipt (image/PDF) |
| `/api/expenses/[id]` | GET | Get parsed expense with line items + policy status |
| `/api/expenses/[id]/approve` | POST | Manager approves expense |
| `/api/expenses/[id]/reject` | POST | Manager rejects expense |
| `/api/expenses/queue` | GET | Manager's pending approval queue |
| `/api/expenses/history` | GET | Employee's submission history |
| `/api/dashboard/summary` | GET | Org-wide spend analytics |
| `/api/dashboard/compliance` | GET | Policy compliance metrics |
| `/api/audit-log` | GET | Searchable audit log |
| `/api/export` | GET | CSV export of expense data |

### Database Tables

| Table | Key Columns |
|-------|------------|
| `organizations` | id, name, industry, size, forwarding_email, created_at |
| `users` | id, org_id, email, role (admin/finance/manager/employee), department_id |
| `departments` | id, org_id, name, manager_id |
| `policies` | id, org_id, rule_type, rule_config (JSON), created_by, active |
| `expenses` | id, org_id, user_id, merchant, date, total, status (processing/approved/flagged/rejected), receipt_url |
| `line_items` | id, expense_id, name, quantity, unit_price, total_price, category, policy_status (pass/flag), violation_reason |
| `approvals` | id, expense_id, manager_id, action (approve/reject), comment, acted_at |
| `audit_log` | id, org_id, actor_id, action, target_type, target_id, details (JSON), created_at |

---

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Receipt photo quality too low for parsing | MEDIUM | HIGH | Provide upload guidelines; GPT-4o handles most quality issues; allow re-upload |
| Policy configuration too complex for SMBs | MEDIUM | MEDIUM | Default template covers 80% of cases; progressive disclosure (simple → advanced) |
| Managers ignore approval queue | MEDIUM | HIGH | Email reminders (24hr, 48hr); escalation to finance admin after 72hr |
| GPT-4o costs per receipt unsustainable | LOW (MVP) | MEDIUM | ~$0.05-0.10/receipt at current pricing; fine-tuned model post-MVP |
| Email forwarding unreliable | MEDIUM | MEDIUM | Manual upload as primary; email as convenience; track delivery rates |
| Companies want ERP integration before adopting | HIGH | MEDIUM | Position as "try it standalone first"; CSV export bridges gap; ERP in Phase 4 |
| SOC 2 required before any company will pilot | MEDIUM | HIGH | Target early-stage startups (20-100 employees) who don't require SOC 2 yet |

---

## Pricing Hypothesis

| Tier | Price | Includes |
|------|-------|---------|
| **Pilot (free)** | $0 | 10 users, 50 receipts/month, basic policy rules |
| **Starter** | $199/mo | 50 users, unlimited receipts, full policy engine, audit log |
| **Growth** | $499/mo | 200 users, department budgets, CSV export, priority support |
| **Enterprise** | Custom | Unlimited users, SSO, ERP integration, dedicated support, SLA |

Pricing is hypothetical — MVP validates willingness to pay before committing to tiers.

**Market reference:** B2B expense tools charge $5-$18/user/month (Expensify). At 50 users, that's $250-$900/month — our pricing is competitive while offering a unique capability (item-level enforcement) that no competitor provides.
