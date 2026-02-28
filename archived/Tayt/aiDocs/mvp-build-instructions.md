# Tayt MVP Build Instructions (B2C Receipt Budgeting)
**Version:** 1.0
**Status:** Ready to Execute
**Last updated:** 2026-02-28
**Source PRD:** `Tayt/aiDocs/prd.md`

---

## Scope Lock (Tonight)
- [ ] Single-user MVP (no shared household/workspace)
- [ ] Web-only proof of concept
- [ ] Google Sign-In auth
- [ ] Gmail receipt ingestion (body + potential attachments)
- [ ] Merchants: Sam's Club, Walmart, Costco
- [ ] Historical sync window selectable from 1 month to 12 months
- [ ] No bank integration for this version
- [ ] Rules-only categorization
- [ ] Returns included as negative spend (reduce category/store totals)
- [ ] Dashboard views: spend by category, spend by store, weekly/monthly trends
- [ ] Local-first stack: Next.js + Prisma + SQLite

---

## Stage 1: Project Bootstrap
### Goal
Create a local web app foundation with auth and database.

### Checklist
- [ ] Create Next.js TypeScript app
- [ ] Add Tailwind CSS (optional but recommended for fast UI)
- [ ] Add Prisma + SQLite
- [ ] Add NextAuth
- [ ] Create `.env.local` with:
  - [ ] `DATABASE_URL`
  - [ ] `NEXTAUTH_SECRET`
  - [ ] `GOOGLE_CLIENT_ID`
  - [ ] `GOOGLE_CLIENT_SECRET`
- [ ] Create base routes/pages:
  - [ ] `/login`
  - [ ] `/dashboard`
  - [ ] `/settings`
  - [ ] `/sync`

### Exit Criteria
- [ ] App runs locally
- [ ] SQLite DB connects and migrations run

---

## Stage 2: Google Auth + Gmail API Access
### Goal
Enable Google sign-in and Gmail read access.

### Checklist
- [ ] Create Google Cloud project
- [ ] Enable Gmail API
- [ ] Configure OAuth consent screen (Testing mode)
- [ ] Add your Google account as a test user
- [ ] Configure OAuth redirect URI for local app
- [ ] In NextAuth, request scopes:
  - [ ] `openid`
  - [ ] `email`
  - [ ] `profile`
  - [ ] `https://www.googleapis.com/auth/gmail.readonly`
- [ ] Implement login/logout flow
- [ ] Verify access token can call Gmail API endpoint

### Exit Criteria
- [ ] Sign in with Google works
- [ ] Gmail API can be called for signed-in user

---

## Stage 3: Data Model (Prisma)
### Goal
Create core tables for receipt ingestion, parsing, categorization, and dashboard stats.

### Checklist
- [ ] `User`
- [ ] `SyncConfig` (monthsBack: 1-12)
- [ ] `ReceiptEmail` (gmailMessageId, merchant, subject, sender, sentAt)
- [ ] `ReceiptSummary` (subtotal, tax, total, store, currency)
- [ ] `ReceiptItem` (name, qty, unitPrice, lineTotal, category, isReturn)
- [ ] `CategoryRule` (keyword, category, priority)
- [ ] `ParseIssue` (messageId, reason, status)
- [ ] Add indexes for:
  - [ ] `gmailMessageId` (unique)
  - [ ] `sentAt`
  - [ ] `store`
  - [ ] `category`

### Exit Criteria
- [ ] Migration succeeds
- [ ] Seed script inserts default categories/rules

---

## Stage 4: Gmail Ingestion (Historical + Incremental)
### Goal
Pull receipt emails from selected date window and persist raw records.

### Checklist
- [ ] Settings UI for sync range (1-12 months)
- [ ] Build Gmail query filters for:
  - [ ] Sam's Club senders/subject patterns
  - [ ] Walmart senders/subject patterns
  - [ ] Costco senders/subject patterns
- [ ] Pull message metadata + body content
- [ ] Pull attachments when available (PDF/image)
- [ ] Store raw message reference + parsed plain text/html
- [ ] Deduplicate by `gmailMessageId`
- [ ] Add manual "Run Sync" button

### Exit Criteria
- [ ] User can import historical receipts
- [ ] Duplicate imports do not create duplicate rows

---

## Stage 5: Parser + Rules Categorization
### Goal
Extract line items and categorize without LLM.

### Checklist
- [ ] Create parser modules:
  - [ ] `parsers/walmart.ts`
  - [ ] `parsers/costco.ts`
  - [ ] `parsers/samsclub.ts`
- [ ] Parse receipt summary fields (subtotal/tax/total/date/store)
- [ ] Parse line items (name/qty/price)
- [ ] Detect returns from negative line items/return markers
- [ ] Apply rules-based category mapping
- [ ] Unmatched items -> `Other`
- [ ] Build "Rules" settings page:
  - [ ] Add rule (keyword -> category)
  - [ ] Edit/delete rules
  - [ ] Re-run categorization for existing items

### Categories (MVP)
- [ ] Food
- [ ] Entertainment
- [ ] Care/Maintenance
- [ ] Clothes
- [ ] Travel
- [ ] Car
- [ ] Other

### Returns Behavior
- [ ] Option A implemented: returns reduce totals for category/store (net spend)

### Exit Criteria
- [ ] At least one real receipt per merchant parses into items
- [ ] Categories assign via rules
- [ ] Returns reduce net totals correctly

---

## Stage 6: Dashboard (Proof of Value)
### Goal
Show core budget insights from parsed data.

### Checklist
- [ ] Spend by Category chart/table
- [ ] Spend by Store chart/table
- [ ] Trends:
  - [ ] Weekly net spend
  - [ ] Monthly net spend
- [ ] Date range filters
- [ ] Parse health widget (imported/parsed/failed)

### Exit Criteria
- [ ] Dashboard updates after sync
- [ ] Weekly and monthly trends render from real data

---

## Stage 7: Hardening + Demo Readiness
### Goal
Make the MVP usable for a validation demo tonight.

### Checklist
- [ ] Basic loading/error states for sync/parsing
- [ ] Retry action for failed message parses
- [ ] Minimal onboarding copy in login/settings/sync pages
- [ ] Local test script with sample messages/fixtures
- [ ] README setup instructions
- [ ] 3-minute demo path documented

### Exit Criteria
- [ ] New user can sign in, sync receipts, and view dashboard end-to-end
- [ ] Demo works on local machine without manual DB edits

---

## Fast Validation Plan (After Build)
- [ ] Run with 3-5 test users (family-heavy shoppers)
- [ ] Ask each to connect Gmail and sync 3-12 months
- [ ] Track:
  - [ ] Time to first value
  - [ ] Parse success by merchant
  - [ ] "Would you use this monthly?" response
- [ ] Record friction points and top requested fixes

---

## Done Definition (Tonight)
- [ ] Google login works
- [ ] Gmail historical sync works (1-12 month user-selected window)
- [ ] Sam's Club, Walmart, Costco ingestion attempts run
- [ ] Item extraction works on at least sample receipts
- [ ] Rules-based categorization works
- [ ] Returns reduce net totals
- [ ] Dashboard shows category/store/weekly/monthly insights

---

## Stretch (Only If Time Remains)
- [ ] Attachment OCR fallback for image/PDF receipts
- [ ] Better merchant parser coverage
- [ ] Export endpoint for future B2B API direction

