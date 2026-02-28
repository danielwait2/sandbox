# Phase 3 Roadmap: Receipt Parsing

**Status:** In Progress
**Timeline:** Days 5–6
**Detailed Plan:** [phase-3-receipt-parsing.md](./phase-3-receipt-parsing.md)

---

## ⚠️ Development Philosophy

**Avoid over-engineering, cruft, and legacy-compatibility features in this clean code project.**

- Build only what's needed for this phase
- No "just in case" features
- Delete unused code immediately
- Keep it simple and focused

---

## Quick Overview

Send raw receipt email content to Gemini and extract structured line-item JSON. Persist the parsed output to SQLite and mark receipts as parsed. Failed parses are logged and skipped silently — the pipeline never crashes. This phase closes the loop between email ingestion and structured data.

---

## Task Checklist

### Gemini Setup
- [x] Install `@google/generative-ai`
- [x] Add `GEMINI_API_KEY` to `.env.local` and `.env.example`
- [x] `lib/gemini.ts` — shared `gemini-1.5-flash` model instance

### Parser
- [x] `lib/receiptParser.ts` — prompt template, Gemini call, JSON fence stripping, validation
- [x] `lib/receiptParser.ts` — `persistParsedReceipt()` using a `better-sqlite3` transaction
- [x] Handle parse failures: log error, leave `parsed_at = NULL`, continue

### Batch Pipeline
- [x] `lib/parseQueue.ts` — fetch all `parsed_at IS NULL` receipts, run parser, handle failures per-item
- [x] Wire `processUnparsedReceipts()` into `POST /api/receipts/scan` after the scan step

### API Route
- [x] `app/api/receipts/[id]/route.ts` — GET receipt + line items for authenticated user

---

## Success Criteria

- [ ] Parsed receipts have `parsed_at` set and `line_items` rows in the DB
- [ ] Each line item has: `raw_name`, `name`, `quantity`, `unit_price`, `total_price`, `confidence`
- [ ] Failed parses leave `parsed_at = NULL` and do not crash the endpoint
- [ ] `GET /api/receipts/[id]` returns receipt with nested `items` array
- [ ] ≥85% parse success on a spot-check of 10 real receipt emails
- [ ] No raw email body stored in SQLite

---

## Key Deliverables

- [x] `lib/gemini.ts` — initialized model instance
- [x] `lib/receiptParser.ts` — parse + persist
- [x] `lib/parseQueue.ts` — batch processor
- [x] `app/api/receipts/[id]/route.ts` — receipt detail endpoint
- [x] `POST /api/receipts/scan` updated to parse after scanning

---

## Notes & Decisions

- Live validation of parse accuracy is blocked until `GEMINI_API_KEY` is added to `.env.local` and the Gmail scan pipeline has real receipt emails to process.
- Success criteria marked pending until live e2e test is run.

---

## Completion Checklist

Before moving to `ai/roadmaps/complete`:
- [x] All tasks completed
- [ ] Success criteria met (blocked: needs GEMINI_API_KEY + real receipts)
- [x] Deliverables created
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Changelog updated

---

**Created:** 2026-02-28
**Last Updated:** 2026-02-28
**Next Phase:** [Phase 4 Roadmap](./2026-02-28-roadmap-phase4-categorization-engine.md)
