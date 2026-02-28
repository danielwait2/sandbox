# Runway — Blocker Fix Roadmap

**Created:** 2026-02-28
**Status:** Not Started
**Goal:** Resolve the two open blockers preventing live validation of the receipt parsing pipeline.

---

## Blocker 1: Gemini Free-Tier Quota (20 req/day)

**Problem:** `gemini-2.5-flash` free tier only allows 20 requests/day and 5/minute. The parse queue burns through this instantly when retrying multiple receipts.

### Options (pick one)

| Option | Pros | Cons |
|--------|------|------|
| A. Enable billing on Google AI project | Unlimited requests, keeps `gemini-2.5-flash` | Costs money (~$0.15/1M input tokens) |
| B. Switch to `gemini-1.5-flash` | 1,500 req/day free tier, proven model | Slightly older model |
| C. Use a different API key with higher limits | No code changes needed | Requires new project/key setup |

### Tasks

- [ ] 1. Decide which option to pursue (A, B, or C)
- [ ] 2. Implement the chosen option (update `.env.local` or `lib/gemini.ts`)
- [ ] 3. Verify Gemini responds successfully to a single test request

---

## Blocker 2: Stuck Unparsed Receipts + No Rate-Limit Handling

**Problem:** ~25 old receipts with `parsed_at IS NULL` get retried on every scan. Combined with no 429 backoff, a single scan can fire 25+ Gemini requests and exhaust the entire daily quota.

### Tasks

- [ ] 1. Clear stuck unparsed receipts from the DB (one-time cleanup)
  - Run a Node script or add a `/api/admin/reset` endpoint to delete receipts where `parsed_at IS NULL`
- [ ] 2. Add 429 rate-limit handling to `lib/receiptParser.ts`
  - Re-throw 429 errors instead of swallowing them as `null`
- [ ] 3. Add early batch termination to `lib/parseQueue.ts`
  - Catch 429 from the parser, log it, and `break` the loop immediately
- [ ] 4. (Optional) Add a max-retry count per receipt
  - Add a `parse_attempts` column to `receipts` table
  - Skip receipts that have failed N times (e.g., 3)

---

## Validation

After fixing both blockers:

- [ ] Send a test receipt email from your `DEV_TEST_EMAIL` address
- [ ] Click **Scan Receipts** on the dashboard
- [ ] Confirm line items appear on the dashboard (Gemini parsed successfully)
- [ ] Confirm no 429 errors in the terminal logs
- [ ] Confirm the Gemini API key blocker in `blocked.md` can be marked resolved

---

## Dependencies

- Blocker 1 must be resolved before validation can proceed
- Blocker 2 tasks are independent and can be done in parallel with Blocker 1
