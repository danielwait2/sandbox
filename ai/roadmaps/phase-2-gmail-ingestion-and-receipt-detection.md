# Phase 2 — Gmail Ingestion & Receipt Detection

**Timeline:** Days 3–4
**Status:** Not Started
**Roadmap:** [2026-02-28-roadmap-phase2-gmail-ingestion-and-receipt-detection.md](./2026-02-28-roadmap-phase2-gmail-ingestion-and-receipt-detection.md) — Track progress

---

## Overview

Use the Gmail API (via the user's OAuth access token from Phase 1) to fetch emails, filter to Walmart and Costco receipts by sender domain, deduplicate against already-processed receipts, and queue raw email content for parsing. When this phase is complete, a triggered scan identifies all unprocessed receipt emails from the last 90 days and stores their raw IDs — no parsing yet.

---

## Prerequisites

- Phase 1 complete: Next.js app running, Google OAuth working, SQLite schema initialized
- The user's Gmail access token and refresh token are available in the NextAuth JWT
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in `.env.local`

---

## Success Criteria

- `POST /api/receipts/scan` with a valid session triggers a Gmail scan
- The scan fetches emails from the last 90 days (first run) or since the last scan (subsequent runs)
- Only emails from `@walmart.com` or `@costco.com` are returned
- Already-processed emails (matched by `raw_email_id`) are skipped
- New receipt emails are inserted into `receipts` with `parsed_at = NULL` (not yet parsed)
- The endpoint returns a JSON summary: `{ scanned: N, new: M, skipped: K }`
- Fetching a non-receipt email never inserts a row

---

## Implementation Steps

1. **Install the Google APIs client**
   - File: `package.json`
   - Run: `npm install googleapis`
   - This provides the typed `google.gmail` client

2. **Create a Gmail client factory**
   - File: `lib/gmail.ts`
   - Accept an access token string and return a configured `google.gmail('v1')` client with the token set on the OAuth2 client
   - See `ai/context7/gmail-api.md` for client initialization and token refresh patterns
   - Gotcha: access tokens expire after 1 hour; use the refresh token to obtain a new one before each scan. Store the refreshed token back in the session if needed.

3. **Build the receipt detector**
   - File: `lib/receiptDetector.ts`
   - Export a function `isReceiptEmail(from: string): { isReceipt: boolean; retailer: 'Walmart' | 'Costco' | null }`
   - Logic: check if `from` contains `@walmart.com` → `Walmart`; `@costco.com` → `Costco`; else `null`
   - Keep this pure (no I/O) — easy to unit-test

4. **Build the Gmail scanner**
   - File: `lib/gmailScanner.ts`
   - Export `scanGmail(userId: string, accessToken: string, refreshToken: string): Promise<ScanResult>`
   - Steps inside the function:
     1. Build a Gmail query: `from:(walmart.com OR costco.com) after:<90-days-ago-epoch>` for first scan; use a stored `last_scanned_at` timestamp for subsequent scans
     2. Call `gmail.users.messages.list` with the query — returns message IDs only (no content yet)
     3. For each message ID, check if `raw_email_id` already exists in `receipts` — skip if so
     4. For new IDs, call `gmail.users.messages.get` with `format: 'full'` to fetch headers and body
     5. Verify the `From` header passes `isReceiptEmail`; skip if not
     6. Extract: `From`, `Date`, `Subject` headers; full `payload` (HTML or plain text body)
     7. Insert a row into `receipts` with `parsed_at = NULL`, `raw_email_id = messageId`, and the detected `retailer`
   - See `ai/context7/gmail-api.md` for `messages.list` and `messages.get` usage
   - Gotcha: Gmail returns message body as base64url-encoded — decode with `Buffer.from(data, 'base64url').toString('utf-8')`
   - Gotcha: multipart emails have nested `parts` — walk the MIME tree to find `text/html` or `text/plain`

5. **Create the scan API route**
   - File: `app/api/receipts/scan/route.ts`
   - Method: `POST`
   - Get the session via `getServerSession(authOptions)`; return 401 if no session
   - Extract `accessToken` and `refreshToken` from the session JWT
   - Call `scanGmail(session.user.id, accessToken, refreshToken)`
   - Return `{ scanned, new: newCount, skipped }` as JSON

6. **Store last scan timestamp**
   - File: `lib/db.ts` (extend) or a new `lib/scanState.ts`
   - Persist a `last_scanned_at` ISO timestamp per `user_id` in a `scan_state` table (add to migrations in `lib/migrations.ts`)
   - Schema: `scan_state (user_id TEXT PK, last_scanned_at TEXT)`
   - On each scan, update this row after completion so the next scan only fetches new emails

7. **Deduplication logic**
   - File: `lib/gmailScanner.ts` (step 3 above)
   - Before inserting, run: `SELECT id FROM receipts WHERE raw_email_id = ? AND user_id = ?`
   - If a row is returned, increment the `skipped` counter and continue
   - Secondary dedup: after parsing (Phase 3), also check `order_number + total` — not needed here yet

---

## File Structure

```
runway/
├── lib/
│   ├── db.ts                    (modified: add scan_state migration)
│   ├── migrations.ts            (modified: add scan_state table)
│   ├── gmail.ts                 (new)
│   ├── gmailScanner.ts          (new)
│   └── receiptDetector.ts       (new)
└── app/
    └── api/
        └── receipts/
            └── scan/
                └── route.ts     (new)
```

---

## Tech & Libraries

| Library | Purpose | Reference |
|---|---|---|
| `googleapis` | Gmail API client | `ai/context7/gmail-api.md` |
| `better-sqlite3` | Deduplication queries, insert receipts | `ai/context7/better-sqlite3.md` |
| `next-auth` | Read session tokens in route handler | `ai/context7/nextjs.md` |

---

## Testing Strategy

1. Sign in with a Google account that has Walmart or Costco receipt emails
2. `POST /api/receipts/scan` — confirm response includes `{ scanned: N, new: M, skipped: 0 }` on first run
3. Open the SQLite DB and confirm rows exist in `receipts` with `parsed_at = NULL` and correct `retailer`
4. Run the scan a second time — confirm `new: 0` and `skipped: M` (deduplication working)
5. Unit-test `receiptDetector.ts`:
   - `isReceiptEmail('orders@walmart.com')` → `{ isReceipt: true, retailer: 'Walmart' }`
   - `isReceiptEmail('noreply@costco.com')` → `{ isReceipt: true, retailer: 'Costco' }`
   - `isReceiptEmail('noreply@amazon.com')` → `{ isReceipt: false, retailer: null }`
6. Confirm no raw email text is stored in the `receipts` table (only `raw_email_id`)

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Access token expired by scan time | Implement token refresh in `lib/gmail.ts` using the stored refresh token before making any Gmail API call |
| Gmail API rate limits (250 quota units/user/second) | `messages.list` = 5 units; `messages.get` = 5 units; 90-day first scan of ~100 emails = ~1000 units — well within limits |
| Multipart MIME parsing misses the email body | Walk all MIME parts recursively; prefer `text/html`, fall back to `text/plain` |
| User has no Walmart/Costco receipt emails | The scan returns `{ scanned: 0, new: 0, skipped: 0 }` — handle gracefully with a UI message in Phase 5 |
| Raw email body stored in memory during scan | Process emails one at a time; do not accumulate full bodies in an array |

---

## Deliverables

- `lib/gmail.ts` — authenticated Gmail client factory
- `lib/receiptDetector.ts` — pure domain-filter function (unit-testable)
- `lib/gmailScanner.ts` — full scan pipeline: list → deduplicate → fetch → insert
- `app/api/receipts/scan/route.ts` — POST endpoint that triggers the scan
- `scan_state` table tracking last scan timestamp per user
- Rows in `receipts` with `parsed_at = NULL` ready for Phase 3
