# Tayt B2B - Product Requirements Document
**Version:** 1.0 (MVP)
**Status:** Draft
**Last updated:** 2026-02-28

---

## 1. Problem
Finance teams still review spend mostly at merchant level, not item level.

A single company-card charge at Walmart/Amazon can include both approved and non-approved items. Existing spend tools are strong on card controls and workflow, but item-level policy enforcement is still manual in many teams.

Result:
- Slow approvals and month-end close friction
- Missed policy violations in mixed receipts
- Higher audit/compliance effort

---

## 2. Solution
Tayt B2B is an item-level spend approval layer for finance teams.

MVP flow:
1. Ingest company card transactions + receipt emails/uploads
2. Extract line items from receipts
3. Apply item-level policy rules (`allow`, `review`, `flag`)
4. Show an approvals dashboard with exception queue and audit trail

Core promise: **fewer manual receipt checks, tighter policy enforcement, cleaner auditability.**

---

## 3. Target User (Single ICP for MVP)
**Primary ICP:**
- US SMB/mid-market companies (50-300 employees)
- Lean finance team (Controller/Finance Manager + 1-3 staff)
- Meaningful employee card spend and frequent mixed merchant purchases
- Current workflow includes manual receipt review + spreadsheet reconciliation

**Champion:** Controller / Finance Manager
**Economic buyer:** CFO or VP Finance

---

## 4. Positioning and Competitive Landscape
Based on `ai/research/comparison_between_b2c_and_b2b_Tayt_gemini.md` and meeting notes:

- Ramp/Brex/Airbase/Navan provide strong card and spend workflows.
- Gap to exploit: consistent, explainable **item-level policy enforcement** across mixed receipts.
- Team’s meeting insight: fraud/compliance and accounting classification pain are immediate business drivers, stronger than consumer habit-change dynamics.

**Positioning statement:**
"The item-level policy engine for company spend."

---

## 5. MVP Scope
### In Scope
- CSV/API import for company card transactions
- Receipt ingestion via:
  - Forwarded receipt email inbox
  - Manual upload (PDF/image)
- Receipt line-item extraction and normalization
- Policy rule engine at item level:
  - `allow`
  - `review`
  - `flag`
- Approvals dashboard:
  - Exception queue
  - Reviewer action history
  - Immutable audit log entries
- Basic export for accounting handoff (CSV)

### Out of Scope (MVP)
- Issuing corporate cards
- Full ERP two-way sync (start with export)
- Broad travel/per-diem modules
- Procurement suite replacement
- Automated reimbursements without review

---

## 6. User Flow
### Onboarding
1. Finance admin creates org
2. Uploads/imports card transactions (last 30 days)
3. Connects receipt intake (email forward + upload fallback)
4. Defines first policy set (simple rules)

### Daily/Weekly Loop
1. New transactions + receipts arrive
2. Tayt extracts and itemizes
3. Rules classify items (`allow/review/flag`)
4. Reviewer resolves exceptions in queue
5. Finance exports approved results to accounting workflow

---

## 7. Key Features (MVP)
### 7.1 Receipt Intake
- Shared receipt inbox for forwarded receipts
- Drag-and-drop upload for missing docs
- Duplicate detection by vendor/date/total

### 7.2 Itemization Engine
- Parse merchant, tax, subtotal, total, line items
- Normalize item names/quantities/amounts
- Confidence score per extracted line

### 7.3 Policy Rule Engine
- Rule templates:
  - Blocked item keywords/categories
  - Allowed categories by team/cardholder
  - Amount thresholds requiring review
- Rule result attached to each line item with explanation

### 7.4 Approvals and Audit Trail
- Exception queue by severity/age/cardholder
- Reviewer decisions with reason codes
- Immutable decision log for audit review

### 7.5 Export Layer
- CSV export with transaction, line-item, policy status, reviewer decision
- Accounting-friendly schema for manual import

---

## 8. Validation-First Plan
### Phase 0 (1-2 weeks): Spreadsheet Pilot
- Run "shadow audits" for 3-5 target companies
- Manually itemize one month of sample receipts + card statements
- Report: policy leakage, review-time estimate, potential savings

### Phase 1 (3-6 weeks): Simple Web MVP
- Receipt inbox + uploads
- Basic itemization
- Rule engine + exception queue
- Manual CSV export

### Phase 2 (6-10 weeks): Reliability + Early Pilots
- Improve parser accuracy on top merchant formats
- Tighten rule explainability and reviewer UX
- Run 2-3 live design partner pilots

---

## 9. Monetization
### MVP pricing hypothesis
- SaaS subscription for finance teams
- Starting range: $200-$800/month (depends on volume/users)

### Long-term model
- Core product: spend approval app
- Platform extension: backend extraction + policy API licensing to other fintech/spend tools

---

## 10. Technical Requirements
### Suggested stack (not final)
- Frontend: React web app
- Backend: Node.js/TypeScript or Python/FastAPI
- DB: PostgreSQL
- Jobs: queue workers for parsing pipeline
- File storage: secure object store

### Systems
- Transaction ingestion service
- Receipt ingestion + parser service
- Policy engine service
- Approval/audit log service

### Security/Compliance baseline
- Role-based access control
- Data encryption in transit/at rest
- Audit log immutability for decisions
- SOC 2 Type I preparation path after MVP validation

---

## 11. Success Metrics (first 90 days)
| Metric | Target |
|---|---|
| Pilot companies engaged | 5 |
| LOIs or paid pilots | 2-3 |
| Receipt parse success (supported formats) | 85%+ |
| Itemization precision (reviewed sample) | 90%+ |
| Exception queue resolution SLA | < 48 hours |
| Reported review-time reduction | 30%+ |

---

## 12. Risks and Mitigations
- **Receipt format variance reduces parser accuracy**
  - Mitigation: merchant-specific parser modules + confidence queue
- **Weak buyer urgency**
  - Mitigation: lead with shadow-audit ROI proof and quantified leakage
- **Integration burden expands scope too early**
  - Mitigation: CSV/export-first, defer deep ERP integrations
- **Security/compliance concerns block sales**
  - Mitigation: minimal data scope, access controls, early SOC2 readiness plan

---

## 13. Open Questions
- [ ] Which first vertical has strongest urgency (agencies, services, healthcare ops, etc.)?
- [ ] Which policy templates drive fastest pilot ROI?
- [ ] What parse accuracy threshold is required for finance team trust?
- [ ] When to move from export-first to direct accounting integrations?

---

## 14. Future Roadmap (Post-MVP)
1. Direct accounting integrations (QuickBooks, NetSuite)
2. Deeper card feed integrations
3. Advanced policy simulation and anomaly detection
4. Auto-remediation workflows and pre-spend recommendations
5. API productization for external platform licensing

---

*Informed by `ai/research/comparison_between_b2c_and_b2b_Tayt_gemini.md`, `ai/research/itemized_budget_market_initial_research_Tayt_Gemini.md`, `ai/research/sku-market-initial-research-gemini.md`, and `meeting-notes/meeting-transcripts/hackathon-kickoff-first-hour.md`.*
