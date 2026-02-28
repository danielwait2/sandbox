# Fix Blockers — Gemini Quota & Parse Queue Resilience

**Timeline:** 1–2 hours
**Status:** Not Started
**Roadmap:** [2026-02-28-roadmap-fix-blockers.md](./2026-02-28-roadmap-fix-blockers.md) — Track progress

---

## Overview

The receipt parsing pipeline is code-complete but fails at runtime due to two related issues: the Gemini free-tier quota is too low for development (20 req/day on `gemini-2.5-flash`), and the parse queue has no rate-limit handling — it retries all unparsed receipts on every scan, burning through quota in seconds. This plan fixes both issues so the pipeline can be validated end-to-end.

---

## Prerequisites

- Phases 1–7 code-complete
- `.env.local` has valid `GEMINI_API_KEY`
- Dev server runs without build errors

---

## Success Criteria

- A test receipt email (sent from any team member's `DEV_TEST_EMAIL` address) is parsed successfully on scan
- Line items from the receipt appear on the dashboard with correct categories
- No 429 errors in terminal logs during a normal scan
- If Gemini is rate-limited mid-batch, the queue stops gracefully and logs a clear message
- Previously failed receipts do not retry indefinitely

---

## Implementation Steps

### Part A: Resolve Gemini Quota

1. **Choose a quota solution**
   - Option A: Enable billing on the Google AI project (removes free-tier caps)
   - Option B: Switch model to `gemini-1.5-flash` in `lib/gemini.ts` (1,500 req/day free tier)
   - Option C: Generate a new API key under a different Google Cloud project with higher limits
   - Decision should be based on team preference — Option B is the fastest, Option A is the most future-proof

2. **Apply the chosen solution**
   - If Option A: enable billing at [Google AI Studio](https://aistudio.google.com) or Google Cloud Console
   - If Option B: change the model string in `lib/gemini.ts` from `gemini-2.5-flash` to `gemini-1.5-flash`
   - If Option C: replace `GEMINI_API_KEY` in `.env.local`

3. **Verify with a single request**
   - Send a test receipt email to yourself, scan, and confirm Gemini responds with parsed JSON (check terminal logs)

### Part B: Clean Up Stuck Receipts

4. **Delete unparsed receipts from the database**
   - Run a one-time Node script against `runway.db`:
     ```js
     const Database = require('better-sqlite3');
     const db = new Database('./runway.db');
     db.prepare('DELETE FROM line_items WHERE receipt_id IN (SELECT id FROM receipts WHERE parsed_at IS NULL)').run();
     db.prepare('DELETE FROM receipts WHERE parsed_at IS NULL').run();
     ```
   - This removes ~25 stuck receipts that would otherwise retry on every scan

### Part C: Add Rate-Limit Resilience

5. **Re-throw 429 errors in `lib/receiptParser.ts`**
   - In the `catch` block of `parseReceipt()`, check if the error has `status === 429`
   - If so, re-throw the error instead of returning `null` — this lets the caller handle it
   - All other errors continue to return `null` as before

6. **Add early batch termination in `lib/parseQueue.ts`**
   - In the `catch` block of the receipt loop in `processUnparsedReceipts()`, check for `status === 429`
   - If caught, log `[parseQueue] Rate limited — stopping batch early`, count remaining receipts as failed, and `break`
   - This prevents burning quota on retries within a single scan

7. **(Optional) Add retry tracking**
   - Add a `parse_attempts INTEGER DEFAULT 0` column to the `receipts` table via migration
   - Increment `parse_attempts` on each failed parse
   - In `processUnparsedReceipts()`, skip receipts where `parse_attempts >= 3`
   - This prevents permanently broken receipts from retrying forever

---

## File Structure

```
runway/
├── lib/
│   ├── gemini.ts              (modified: model change if Option B)
│   ├── receiptParser.ts       (modified: re-throw 429)
│   ├── parseQueue.ts          (modified: early termination on 429)
│   └── migrations.ts          (modified: add parse_attempts column, if step 7)
```

---

## Testing Strategy

1. Clear stuck receipts from DB (step 4)
2. Send a fresh test receipt email from your `DEV_TEST_EMAIL` address
3. Click **Scan Receipts** on the dashboard
4. Check terminal logs — confirm:
   - `[scan] gmail result: scanned=1 new=1 skipped=0`
   - No 429 errors
   - `[scan] parse result: processed=1 failed=0`
   - `[scan] categorize result: categorized=N reviewQueue=M`
5. Confirm line items appear on the dashboard under the correct categories
6. (If testing 429 handling) Temporarily lower quota or use an exhausted key, scan, and confirm the queue stops after the first 429

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Chosen model produces lower-quality parses | `gemini-1.5-flash` is well-tested for structured extraction; quality difference is minimal for receipt parsing |
| Clearing DB removes receipts the user wants to keep | Only deletes receipts with `parsed_at IS NULL` — successfully parsed receipts are preserved |
| 429 handling masks other errors | Only catch 429 specifically; all other errors continue normal flow |
| `parse_attempts` migration breaks existing DB | Use `ALTER TABLE ... ADD COLUMN` with try/catch — safe for existing databases |

---

## Deliverables

- Gemini API responding successfully to parse requests
- Clean database with no stuck unparsed receipts
- Parse queue that stops gracefully on rate limits
- End-to-end validated pipeline: email → scan → parse → categorize → dashboard
