# Phase 3 Roadmap: Receipt Parsing

**Status:** Not Started
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
- [ ] Install `@google/generative-ai`
- [ ] Add `GEMINI_API_KEY` to `.env.local` and `.env.example`
- [ ] `lib/gemini.ts` — shared `gemini-1.5-flash` model instance

### Parser
- [ ] `lib/receiptParser.ts` — prompt template, Gemini call, JSON fence stripping, validation
- [ ] `lib/receiptParser.ts` — `persistParsedReceipt()` using a `better-sqlite3` transaction
- [ ] Handle parse failures: log error, leave `parsed_at = NULL`, continue

### Batch Pipeline
- [ ] `lib/parseQueue.ts` — fetch all `parsed_at IS NULL` receipts, run parser, handle failures per-item
- [ ] Wire `processUnparsedReceipts()` into `POST /api/receipts/scan` after the scan step

### API Route
- [ ] `app/api/receipts/[id]/route.ts` — GET receipt + line items for authenticated user

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

- [ ] `lib/gemini.ts` — initialized model instance
- [ ] `lib/receiptParser.ts` — parse + persist
- [ ] `lib/parseQueue.ts` — batch processor
- [ ] `app/api/receipts/[id]/route.ts` — receipt detail endpoint
- [ ] `POST /api/receipts/scan` updated to parse after scanning

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
**Next Phase:** [Phase 4 Roadmap](./2026-02-28-roadmap-phase4-categorization-engine.md)
