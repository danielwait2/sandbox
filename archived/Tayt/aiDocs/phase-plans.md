# Tayt MVP Execution Plans (Phases 1-6)
**Version:** 1.0  
**Status:** Draft  
**Last updated:** 2026-02-28  
**Primary PRD:** `Tayt/aiDocs/prd.md`  
**Primary Roadmap:** `Tayt/aiDocs/mvp-build-instructions.md`

---

## Phase 1 - Chrome Extension Receipt Extractor (Client-Side Only)
**Timeline:** 1-2 days  
**Status:** Not Started

### Overview
Build a Chrome extension that runs in Gmail and extracts receipt email data (Sam's Club, Walmart, Costco) directly in the browser. No backend, no database server, no API hosting. Data is stored locally in browser storage and can be exported/imported as JSON.

### Success Criteria
- [ ] Extension can be installed locally in Chrome (developer mode)
- [ ] User can click "Extract Receipts" from Gmail view
- [ ] At least 10 receipts parsed from supported merchants in one run
- [ ] Parsed data includes: merchant, date, subtotal, tax, total, line items
- [ ] Rules-based categorization works for all extracted line items
- [ ] Weekly and monthly spend summary is shown in extension popup/options page

### Prerequisites
- [ ] Final merchant list confirmed: Sam's Club, Walmart, Costco
- [ ] Category list confirmed: Food, Entertainment, Care/Maintenance, Clothes, Travel, Car, Other
- [ ] Sample receipt emails collected for each merchant

### Detailed Implementation Steps
#### 1. Extension scaffold
- [ ] Create Manifest V3 extension skeleton
- [ ] Add permissions: `storage`, `activeTab`, `scripting`
- [ ] Add host permissions for Gmail web pages

#### 2. Gmail content extraction
- [ ] Build content script to detect receipt message pages in Gmail
- [ ] Read visible message body HTML/text
- [ ] Identify merchant via sender/subject/body patterns
- [ ] Extract receipt fields using merchant parser modules

#### 3. Rules categorization
- [ ] Add keyword->category rule map in local config
- [ ] Categorize each parsed line item
- [ ] Default unknown items to `Other`
- [ ] Handle negative line items as returns (net reduction)

#### 4. Local storage + visualization
- [ ] Save extracted receipt records to `chrome.storage.local`
- [ ] Build popup/options dashboard with:
  - [ ] Spend by category
  - [ ] Spend by store
  - [ ] Weekly and monthly trend cards

#### 5. Export/import utilities
- [ ] Add "Export JSON" for extracted data
- [ ] Add "Import JSON" for test replay/demo

### Technical Stack & Tools
- Chrome Extension Manifest V3
- TypeScript (recommended)
- Minimal chart lib (e.g., Chart.js) for popup visualization
- No backend, no auth, no DB server
- References:
  - Chrome Extensions docs: https://developer.chrome.com/docs/extensions
  - Gmail UI constraints (for client-side extraction): https://support.google.com/mail
  - PRD context: `ai/guides/platemate-gemini-research-prompt.md`, `ai/guides/platemate-gap-research-prompt.md`

### File Structure
```text
Tayt/extension/
  manifest.json
  src/
    content/
      gmailExtractor.ts
      merchantDetection.ts
    parsers/
      walmart.ts
      costco.ts
      samsclub.ts
      shared.ts
    categorization/
      rules.ts
      categorize.ts
    popup/
      index.html
      popup.ts
      charts.ts
    options/
      index.html
      options.ts
    storage/
      schema.ts
      repository.ts
```

### Testing Strategy
- Unit tests
  - [ ] Merchant detection
  - [ ] Parser output structure per merchant
  - [ ] Categorization rules + returns
- Manual tests
  - [ ] Real Gmail receipt pages for each merchant
  - [ ] Export/import replay produces same totals
- Validation checks
  - [ ] Category totals = sum(line items net of returns)
  - [ ] Weekly + monthly aggregates are consistent

### Risks & Mitigation
- Gmail DOM changes break selectors
  - Mitigation: keep selector strategy centralized; fallback parsing by visible plain text
- Parser fragility across merchant template variants
  - Mitigation: parser-per-merchant + fixture tests per template
- Over-engineering risk
  - Mitigation: no auth/backend in this phase; local-only scope

### Deliverables
- [ ] Installable extension folder
- [ ] Working parser for 3 merchants
- [ ] Local dashboard in popup/options
- [ ] JSON export sample for demo

### References
- `Tayt/aiDocs/prd.md`
- `Tayt/aiDocs/mvp-build-instructions.md`
- `ai/research/itemized_budget_market_initial_research_Tayt_Gemini.md`

---

## Phase 2 - Web App Foundation + Gmail OAuth + Historical Sync (Weeks 1-4)
**Timeline:** Week 1 to Week 4  
**Status:** Not Started

### Overview
Move from extension proof to local web MVP foundation: Next.js app, Google Sign-In, Gmail read access, SQLite persistence, and historical sync window (1-12 months).

### Success Criteria
- [ ] User can sign in with Google
- [ ] User can set historical sync window (1-12 months)
- [ ] App imports receipt emails from Gmail API for supported merchants
- [ ] Deduplication works by Gmail message ID
- [ ] Receipt records persisted to SQLite

### Prerequisites
- [ ] Phase 1 parser logic validated on sample receipts
- [ ] Google Cloud project created with Gmail API enabled
- [ ] OAuth consent configured in testing mode

### Detailed Implementation Steps
#### 1. App bootstrap
- [ ] Create Next.js (App Router) app with TypeScript
- [ ] Install Prisma + SQLite
- [ ] Add base layout/routes (`/login`, `/settings`, `/sync`, `/dashboard`)

#### 2. Auth + Gmail scopes
- [ ] Configure NextAuth with Google provider
- [ ] Request scopes: `openid email profile gmail.readonly`
- [ ] Persist session and refresh token handling (minimal viable)

#### 3. Data model
- [ ] Create Prisma schema for `User`, `SyncConfig`, `ReceiptEmail`, `ParseIssue`
- [ ] Run migration and seed default settings

#### 4. Gmail sync service
- [ ] Build Gmail list query by date range and merchant sender patterns
- [ ] Fetch message metadata + body payload
- [ ] Optional attachment metadata capture (file IDs) for later parse stage
- [ ] Save raw parse-ready data in SQLite

#### 5. Sync UI
- [ ] Settings control for 1-12 month window
- [ ] "Run historical sync" action
- [ ] Sync status UI (running, success count, failed count)

### Technical Stack & Tools
- Next.js + React + TypeScript
- NextAuth (Google provider)
- Prisma ORM + SQLite
- Gmail API (REST)
- References:
  - Next.js: https://nextjs.org/docs
  - NextAuth: https://next-auth.js.org/getting-started/introduction
  - Prisma + SQLite: https://www.prisma.io/docs
  - Gmail API: https://developers.google.com/gmail/api
  - Product context: `ai/guides/platemate-gap-research-prompt.md`

### File Structure
```text
Tayt/app/
  src/
    app/
      (auth)/login/page.tsx
      settings/page.tsx
      sync/page.tsx
      dashboard/page.tsx
      api/auth/[...nextauth]/route.ts
      api/sync/run/route.ts
    lib/
      auth.ts
      gmail/client.ts
      gmail/queryBuilder.ts
      db.ts
    server/
      sync/
        syncService.ts
        receiptIngest.ts
  prisma/
    schema.prisma
    migrations/
```

### Testing Strategy
- [ ] Auth smoke test: login/logout/session
- [ ] Gmail API integration test (one account, known date window)
- [ ] Sync dedupe test using repeated run
- [ ] DB integrity check for required fields

### Risks & Mitigation
- OAuth misconfiguration delays progress
  - Mitigation: do auth-only spike first before any parser work
- Gmail quota/rate limits during testing
  - Mitigation: narrow queries + pagination + retry backoff
- Over-engineering risk
  - Mitigation: no bank sync, no multi-user org model, no billing

### Deliverables
- [ ] Running local web app
- [ ] Google Sign-In + Gmail read scope
- [ ] Historical receipt import to SQLite

### References
- `Tayt/aiDocs/prd.md`
- `Tayt/aiDocs/mvp-build-instructions.md`

---

## Phase 3 - Parsing, Rules, Returns, and Data Quality (Weeks 5-8)
**Timeline:** Week 5 to Week 8  
**Status:** Not Started

### Overview
Implement robust parsing and categorization pipeline using merchant-specific parsers and rules-only categorization. Include returns behavior and correction workflow.

### Success Criteria
- [ ] Parse success >= 85% on supported merchant emails
- [ ] Rules categorize >= 85% of parsed line items without manual edits
- [ ] Returns correctly reduce category/store totals
- [ ] User can edit rules and reprocess data

### Prerequisites
- [ ] Phase 2 ingestion data available in SQLite
- [ ] Receipt fixtures captured for each merchant and template variant

### Detailed Implementation Steps
#### 1. Merchant parser modules
- [ ] Implement parser for Walmart
- [ ] Implement parser for Costco
- [ ] Implement parser for Sam's Club
- [ ] Shared parser utilities for totals, currency, date, item row extraction

#### 2. Categorization rules engine
- [ ] Seed default keyword rules for category mapping
- [ ] Implement deterministic match priority (exact > contains > fallback)
- [ ] Default unmatched to `Other`

#### 3. Returns handling
- [ ] Detect return/refund lines (negative amounts/keywords)
- [ ] Mark item as `isReturn=true`
- [ ] Compute net spend by subtracting returns from totals

#### 4. Rule management UI
- [ ] Rules table in settings
- [ ] Add/edit/delete rules
- [ ] Reprocess action to apply updated rules to historical items

#### 5. Parse quality controls
- [ ] ParseIssue logging for failures
- [ ] "Needs Review" queue for low-confidence/unparsed receipts

### Technical Stack & Tools
- TypeScript parser modules
- Regex + text normalization utilities
- Prisma transactions for safe reprocessing
- References:
  - JS regex guide: https://developer.mozilla.org/docs/Web/JavaScript/Guide/Regular_expressions
  - Prisma transactions: https://www.prisma.io/docs/orm/prisma-client/queries/transactions
  - Context references: `ai/guides/platemate-gemini-research-prompt.md`

### File Structure
```text
Tayt/app/src/
  server/
    parsing/
      parsers/
        walmart.ts
        costco.ts
        samsclub.ts
      shared/
        normalize.ts
        money.ts
        date.ts
      pipeline/
        parseReceipt.ts
        parseDispatcher.ts
        returns.ts
    categorization/
      rulesEngine.ts
      seedRules.ts
      reprocess.ts
  app/
    settings/rules/page.tsx
    api/rules/route.ts
    api/reprocess/route.ts
```

### Testing Strategy
- Parser fixture tests (golden outputs)
- [ ] One fixture per merchant minimum; add edge cases
- Rules engine tests
- [ ] Keyword precedence
- [ ] Fallback behavior
- Returns tests
- [ ] Positive + negative mix net totals
- Reprocess tests
- [ ] Rule update changes historical categorization deterministically

### Risks & Mitigation
- Merchant template drift
  - Mitigation: fixture library + parser versioning per template
- Mis-categorization harms trust
  - Mitigation: easy rule edits + transparent `Other` fallback
- Over-engineering risk
  - Mitigation: no LLM in this phase, rules-only by requirement

### Deliverables
- [ ] Stable parser pipeline for 3 merchants
- [ ] Rules management + reprocessing
- [ ] Returns/net-spend computation

### References
- `Tayt/aiDocs/prd.md`
- `Tayt/aiDocs/mvp-build-instructions.md`

---

## Phase 4 - Dashboard, QA, and V1 Launch Readiness (Weeks 9-12)
**Timeline:** Week 9 to Week 12  
**Status:** Not Started

### Overview
Deliver V1 user-facing value: dashboard views, trend analysis, stability hardening, and demo-ready launch flow.

### Success Criteria
- [ ] Dashboard includes spend by category, spend by store, weekly trends, monthly trends
- [ ] End-to-end sync->parse->categorize->dashboard flow works locally
- [ ] Critical bugs for core flow = 0
- [ ] Basic validation instrumentation in place

### Prerequisites
- [ ] Phase 3 parsing + categorization stable
- [ ] Minimum test dataset loaded

### Detailed Implementation Steps
#### 1. Dashboard implementation
- [ ] Category totals with net returns applied
- [ ] Store totals with net returns applied
- [ ] Weekly trend series
- [ ] Monthly trend series

#### 2. UX hardening
- [ ] Loading states for sync and dashboard
- [ ] Empty states for no data
- [ ] Error states for parse failures + retry action

#### 3. Instrumentation (lightweight)
- [ ] Event logging: sign in, sync run, parse success/failure, dashboard viewed
- [ ] Basic metrics output for manual review

#### 4. Launch checklist
- [ ] Demo script (3-5 minutes)
- [ ] Setup README and env instructions
- [ ] Seed sample data command

### Technical Stack & Tools
- React charting (e.g., Recharts or Chart.js)
- Server-side aggregation queries via Prisma
- Lightweight logging (console/file/local DB table)
- References:
  - Recharts: https://recharts.org/en-US
  - React docs: https://react.dev
  - Next.js data fetching: https://nextjs.org/docs/app/building-your-application/data-fetching

### File Structure
```text
Tayt/app/src/
  app/
    dashboard/page.tsx
    components/
      SpendByCategory.tsx
      SpendByStore.tsx
      WeeklyTrend.tsx
      MonthlyTrend.tsx
      ParseHealth.tsx
  server/
    analytics/
      aggregates.ts
      trends.ts
  app/api/
    metrics/route.ts
```

### Testing Strategy
- [ ] Integration test: run sync and verify dashboard numbers
- [ ] Regression tests for trend aggregations
- [ ] Manual UAT with sample user data set
- [ ] Edge case test: all returns week (net negative)

### Risks & Mitigation
- Data mismatch between item table and chart totals
  - Mitigation: one aggregation path reused across widgets
- Performance issues on large history windows
  - Mitigation: indexed queries + pre-aggregated cache table only if required
- Over-engineering risk
  - Mitigation: do not add non-required widgets/features

### Deliverables
- [ ] V1 dashboard with required views
- [ ] Demo-ready end-to-end flow
- [ ] QA checklist completion report

### References
- `Tayt/aiDocs/prd.md`
- `Tayt/aiDocs/mvp-build-instructions.md`

---

## Phase 5 - Future Enhancement: Bank Matching + Collaboration
**Timeline:** Post-V1 (future)  
**Status:** Future

### Overview
Add bank transaction matching and true multi-user household collaboration after V1 proves value.

### Success Criteria
- [ ] Receipt-to-bank matching coverage target defined and met
- [ ] Shared household model supports invite/accept/roles
- [ ] Joint dashboard for household members

### Prerequisites
- [ ] V1 retention and usage validated
- [ ] OAuth/provider decision for bank integrations finalized

### Detailed Implementation Steps
- [ ] Add bank aggregator integration (future provider selection)
- [ ] Implement matching rules (date window, amount tolerance, merchant hints)
- [ ] Add household workspace model + invites
- [ ] Add conflict handling for category edits by multiple users

### Technical Stack & Tools
- Bank aggregator SDK/API (future)
- Expanded auth/authorization model
- References:
  - Product context docs in `ai/research/`

### File Structure
```text
Tayt/app/src/
  server/matching/
    matcher.ts
    scoring.ts
  server/households/
    invites.ts
    roles.ts
    membership.ts
```

### Testing Strategy
- [ ] Matching precision/recall tests
- [ ] Multi-user permission tests
- [ ] Merge/conflict workflow tests

### Risks & Mitigation
- Matching errors reduce trust
  - Mitigation: confidence thresholds + manual review path
- Collaboration complexity
  - Mitigation: start with simple owner/member roles

### Deliverables
- [ ] Bank-matched budget view
- [ ] Multi-user household collaboration

### References
- `Tayt/aiDocs/prd.md`

---

## Phase 6 - Future Enhancement: Extraction API Productization (B2B2C)
**Timeline:** Post-V1 (future)  
**Status:** Future

### Overview
Package extraction + itemization + categorization as an API platform for partner budgeting/fintech products.

### Success Criteria
- [ ] Stable API endpoints for ingestion, extraction, and categorized output
- [ ] API auth and usage metering in place
- [ ] At least one design partner integration pilot

### Prerequisites
- [ ] High parser reliability in consumer app
- [ ] Clear API schema and SLAs defined

### Detailed Implementation Steps
- [ ] Define API contract for receipt ingestion + normalized output
- [ ] Add API key auth + rate limits
- [ ] Build async job pipeline + webhook callbacks
- [ ] Add partner docs and sample client SDK

### Technical Stack & Tools
- REST API design + OpenAPI
- Queue workers for async parsing
- Basic API billing/metering hooks
- References:
  - OpenAPI spec: https://swagger.io/specification/

### File Structure
```text
Tayt/platform/
  api/
    openapi.yaml
    src/
      routes/
        ingest.ts
        result.ts
      auth/
        apiKeys.ts
      jobs/
        queue.ts
        worker.ts
  docs/
    integration-guide.md
    quickstart.md
```

### Testing Strategy
- [ ] Contract tests against OpenAPI
- [ ] Throughput/retry tests for async jobs
- [ ] Partner sandbox integration test

### Risks & Mitigation
- Support burden grows too fast
  - Mitigation: limited beta partner program first
- Reliability/latency expectations
  - Mitigation: clear SLAs + async-only initial model

### Deliverables
- [ ] API beta with docs
- [ ] Partner pilot integration

### References
- `Tayt/aiDocs/prd-b2b.md`
- `Tayt/aiDocs/prd.md`

---

## Decision Points Summary (Across Phases)
- [ ] Extension vs direct Gmail API first (chosen: extension first for Phase 1 only)
- [ ] Rules-only vs LLM categorization (chosen: rules-only for V1)
- [ ] SQLite local vs hosted DB (chosen: SQLite local for MVP)
- [ ] Single-user vs shared household (chosen: single-user for V1)

## No Over-Engineering Guardrails
- [ ] No backend in Phase 1
- [ ] No bank integration in Phases 2-4
- [ ] No billing/paywall in Phases 2-4
- [ ] No multi-user in Phases 2-4
- [ ] No API productization before V1 validation
