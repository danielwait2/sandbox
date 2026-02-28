# Phase 3 — Receipt Parsing

**Timeline:** Days 5–6
**Status:** Not Started
**Roadmap:** [2026-02-28-roadmap-phase3-receipt-parsing.md](./2026-02-28-roadmap-phase3-receipt-parsing.md) — Track progress

---

## Overview

Send raw receipt email content to Gemini and extract structured line-item JSON. Persist the parsed output (merchant, date, order number, totals, and each line item) to SQLite. Mark the receipt as parsed by setting `parsed_at`. Failed parses are logged and skipped — they do not crash the pipeline. When this phase is complete, all receipts in the DB that have `parsed_at = NULL` can be batch-processed into fully structured line items.

---

## Prerequisites

- Phase 1 complete: SQLite schema initialized, `lib/db.ts` available
- Phase 2 complete: `receipts` rows exist with `parsed_at = NULL` and raw email bodies accessible
- `GEMINI_API_KEY` is set in `.env.local`

---

## Success Criteria

- Calling the parse pipeline on a `receipts` row with `parsed_at = NULL` produces `line_items` rows in the DB
- Each `line_items` row has: `raw_name`, `name`, `quantity`, `unit_price`, `total_price`, `category` (placeholder from Gemini), `confidence`
- `receipts.parsed_at` is updated to the current ISO timestamp after successful parsing
- Failed parses (Gemini error, malformed JSON, missing required fields) log the error and leave `parsed_at = NULL`; they do not throw
- `GET /api/receipts/[id]` returns the parsed receipt with its line items
- ≥85% parse success rate on a spot-check of 10 real Walmart/Costco receipt emails

---

## Implementation Steps

1. **Add `GEMINI_API_KEY` to env**
   - File: `.env.local`, `.env.example`
   - Add: `GEMINI_API_KEY=`

2. **Install the Gemini SDK**
   - File: `package.json`
   - Run: `npm install @google/generative-ai`
   - See `ai/context7/gemini-sdk.md` for initialization and `generateContent` usage

3. **Create the Gemini client**
   - File: `lib/gemini.ts`
   - Initialize `GoogleGenerativeAI` with `process.env.GEMINI_API_KEY`
   - Export a single shared model instance using `gemini-1.5-flash` (fast, cost-effective for batch)
   - See `ai/context7/gemini-sdk.md`

4. **Write the parsing prompt**
   - File: `lib/receiptParser.ts`
   - The prompt must instruct Gemini to return **only** valid JSON matching the schema in `aiDocs/context.md` — no markdown fences, no prose
   - Prompt template (embed the email HTML/text as the variable):
     ```
     You are a receipt parser. Extract all line items from the following retail receipt email.
     Return ONLY a valid JSON object — no markdown, no explanation.

     Required format:
     {
       "retailer": { "name": "Walmart" | "Costco" },
       "transaction": { "date": "YYYY-MM-DD", "subtotal": number, "tax": number, "total": number, "order_number": "string | null" },
       "items": [
         { "raw_name": "...", "name": "...", "quantity": number, "unit_price": number, "total_price": number, "confidence": number }
       ]
     }

     Rules:
     - "raw_name" is the exact text from the receipt; "name" is a human-readable normalized version
     - "confidence" is 0.0–1.0 representing how certain you are about this line item's data
     - Omit items that are clearly not products (e.g., subtotal lines, tax lines, loyalty rewards)
     - If a field is missing from the email, use null

     Receipt email:
     <EMAIL_CONTENT>
     ```
   - Gotcha: Gemini sometimes wraps JSON in ```json fences despite instructions — strip them before `JSON.parse`

5. **Build the parser function**
   - File: `lib/receiptParser.ts`
   - Export `parseReceipt(emailBody: string, retailer: string): Promise<ParsedReceipt | null>`
   - Steps:
     1. Build the prompt with `emailBody` inserted
     2. Call `model.generateContent(prompt)`
     3. Extract the text response; strip any markdown fences
     4. `JSON.parse` the result — wrap in try/catch; return `null` on failure
     5. Validate required fields (`transaction.date`, `transaction.total`, `items` array non-empty); return `null` if invalid
     6. Return the typed `ParsedReceipt` object

6. **Build the persist function**
   - File: `lib/receiptParser.ts` (or a separate `lib/receiptPersister.ts`)
   - Export `persistParsedReceipt(receiptId: string, parsed: ParsedReceipt): void`
   - Steps:
     1. Update `receipts` row: set `transaction_date`, `order_number`, `subtotal`, `tax`, `total`, `parsed_at = now`
     2. For each item in `parsed.items`, insert into `line_items`
        - `category` and `subcategory` are left empty/null here — Phase 4 fills them
        - Store `confidence` from Gemini output
     3. Use a `better-sqlite3` transaction so both updates are atomic
   - See `ai/context7/better-sqlite3.md` for transaction syntax

7. **Build the batch processing pipeline**
   - File: `lib/parseQueue.ts`
   - Export `processUnparsedReceipts(userId: string): Promise<{ processed: number; failed: number }>`
   - Fetch all `receipts` rows where `parsed_at IS NULL AND user_id = ?`
   - For each: fetch the email body via Gmail API (re-use `lib/gmail.ts`), call `parseReceipt`, call `persistParsedReceipt`
   - On failure: log `{ receiptId, error }` to console; continue to next receipt (do not throw)
   - Gotcha: do not store the raw email body in SQLite — fetch it fresh from Gmail each time using `raw_email_id`

8. **Wire into the scan endpoint**
   - File: `app/api/receipts/scan/route.ts` (from Phase 2)
   - After the scan completes, call `processUnparsedReceipts(userId)` so scanning and parsing happen in one request
   - Return combined summary: `{ scanned, new, skipped, parsed, parseFailed }`

9. **Create the receipt detail API route**
   - File: `app/api/receipts/[id]/route.ts`
   - Method: `GET`
   - Query `receipts` joined with `line_items` where `receipts.id = ?` and `receipts.user_id = session.user.id`
   - Return the receipt object with a nested `items` array

---

## File Structure

```
runway/
├── lib/
│   ├── gemini.ts               (new)
│   ├── receiptParser.ts        (new)
│   └── parseQueue.ts           (new)
└── app/
    └── api/
        └── receipts/
            ├── scan/
            │   └── route.ts    (modified: calls parseQueue after scan)
            └── [id]/
                └── route.ts    (new)
```

---

## Tech & Libraries

| Library | Purpose | Reference |
|---|---|---|
| `@google/generative-ai` | Gemini API client for receipt parsing | `ai/context7/gemini-sdk.md` |
| `better-sqlite3` | Persist parsed receipts and line items atomically | `ai/context7/better-sqlite3.md` |
| `googleapis` | Re-fetch email body by `raw_email_id` | `ai/context7/gmail-api.md` |

---

## Testing Strategy

1. Seed a known Walmart receipt email body into a test fixture file
2. Unit-test `parseReceipt` with the fixture — confirm the returned object matches expected shape
3. Unit-test the JSON fence stripping (test with and without ```json``` wrappers in mock Gemini response)
4. Integration test: trigger `POST /api/receipts/scan`, then `GET /api/receipts/[id]` and confirm `items` is non-empty
5. Spot-check 10 real receipt emails — confirm ≥ 8 parse successfully with plausible line items
6. Confirm a failed parse (malformed email) leaves `parsed_at = NULL` and does not crash the endpoint

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Gemini returns malformed JSON | Wrap `JSON.parse` in try/catch; log the raw response; return `null` |
| Gemini wraps output in markdown fences | Strip ` ```json ` and ` ``` ` before parsing — apply unconditionally |
| Walmart/Costco changes email format | Gemini's instruction-following is format-resilient; monitor accuracy rate and alert if it drops below 85% |
| Parse takes >30s for large receipts | `gemini-1.5-flash` typical latency is 3–7s per request; acceptable for batch mode — surface progress to user in UI |
| Raw email body larger than Gemini context window | Trim non-product sections (headers, footers, legal text) using a pre-processing step before sending to Gemini |
| Cost per receipt | `gemini-1.5-flash` is cost-efficient; cache `parsed_at` so receipts are never re-parsed |

---

## Deliverables

- `lib/gemini.ts` — initialized Gemini model instance
- `lib/receiptParser.ts` — prompt construction, Gemini call, JSON validation, persistence
- `lib/parseQueue.ts` — batch processor for all unparsed receipts
- `app/api/receipts/[id]/route.ts` — GET endpoint returning parsed receipt + line items
- `app/api/receipts/scan/route.ts` updated to parse immediately after scan
- `line_items` rows populated in SQLite for all successfully parsed receipts
