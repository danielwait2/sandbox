# Phase 2 Roadmap: Gmail Ingestion & Receipt Detection

**Status:** In Progress
**Timeline:** Days 3–4
**Detailed Plan:** [phase-2-gmail-ingestion-and-receipt-detection.md](./phase-2-gmail-ingestion-and-receipt-detection.md)

---

## ⚠️ Development Philosophy

**Avoid over-engineering, cruft, and legacy-compatibility features in this clean code project.**

- Build only what's needed for this phase
- No "just in case" features
- Delete unused code immediately
- Keep it simple and focused

---

## Quick Overview

Use the user's Gmail OAuth token to fetch emails, filter to Walmart and Costco receipts by sender domain, deduplicate against already-stored receipts, and insert new receipt stubs into SQLite. Parsing happens in Phase 3 — this phase only identifies and records which emails need processing.

---

## Task Checklist

### Gmail Client
- [x] Install `googleapis`
- [x] `lib/gmail.ts` — authenticated Gmail client factory with token refresh

### Receipt Detection
- [x] `lib/receiptDetector.ts` — pure `isReceiptEmail(from)` function (no I/O, unit-testable)

### Scanner
- [x] `lib/gmailScanner.ts` — Gmail query, message list, deduplication, body fetch, receipt insert
- [x] `lib/migrations.ts` — add `scan_state (user_id, last_scanned_at)` table
- [x] Store and update `last_scanned_at` per user after each scan

### API Route
- [x] `app/api/receipts/scan/route.ts` — POST, auth-gated, calls `scanGmail`, returns summary JSON

---

## Success Criteria

- [ ] `POST /api/receipts/scan` triggers a Gmail scan for the authenticated user
- [ ] Only `@walmart.com` and `@costco.com` emails are inserted
- [ ] Second scan returns `new: 0, skipped: N` (deduplication works)
- [ ] `receipts` rows have `parsed_at = NULL` (ready for Phase 3)
- [ ] No raw email body stored in the DB
- [ ] Non-receipt emails never produce a DB row

---

## Key Deliverables

- [ ] `lib/gmail.ts` — Gmail client with token refresh
- [ ] `lib/receiptDetector.ts` — domain filter (with unit tests)
- [ ] `lib/gmailScanner.ts` — full scan pipeline
- [ ] `app/api/receipts/scan/route.ts` — POST scan endpoint
- [ ] `scan_state` table tracking last scan per user

---

## Notes & Decisions

<!-- Track decisions made during implementation here -->

---

## Completion Checklist

Before moving to `ai/roadmaps/complete`:
- [ ] All tasks completed
- [ ] Success criteria met
- [ ] Deliverables created
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Changelog updated

---

**Created:** 2026-02-28
**Last Updated:** 2026-02-28
**Next Phase:** [Phase 3 Roadmap](./2026-02-28-roadmap-phase3-receipt-parsing.md)
