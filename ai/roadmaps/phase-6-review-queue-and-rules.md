# Phase 6 — Review Queue & Rules

**Timeline:** Days 12–13
**Status:** Not Started
**Roadmap:** [2026-02-28-roadmap-phase6-review-queue-and-rules.md](./2026-02-28-roadmap-phase6-review-queue-and-rules.md) — Track progress

---

## Overview

Surface low-confidence categorizations for user review. Each queued item shows its Gemini-suggested category with a Confirm / Recategorize / Skip action. Confirmed or corrected items create a permanent rule for future receipts. When this phase is complete, the review queue drives continuous improvement of categorization accuracy and the rules engine has a user-training feedback loop.

---

## Prerequisites

- Phase 4 complete: `line_items` rows exist with `confidence` scores; items with `confidence < 0.80` are queryable
- Phase 1 complete: `rules` table exists in the schema

---

## Success Criteria

- `GET /api/review-queue` returns all line items where `confidence < 0.80` and `user_overridden = 0`, for the authenticated user
- The review queue UI shows cards for each item with the suggested category and three action buttons
- **Confirm**: sets `user_overridden = 1`, `confidence = 1.0`; creates a rule matching `item.name → category`
- **Recategorize**: opens a category picker; on selection, updates the item and creates a rule
- **Skip**: sets `user_overridden = 1` without creating a rule (item leaves the queue)
- After any action, the card is removed from the queue without a full page reload
- The dashboard badge count reflects the current queue length
- A new rule created here is applied to all future receipt scans (via `rulesEngine.ts`)

---

## Implementation Steps

1. **Create the review queue API route**
   - File: `app/api/review-queue/route.ts`
   - Method: `GET`
   - Query:
     ```sql
     SELECT li.*, r.retailer, r.transaction_date
     FROM line_items li
     JOIN receipts r ON li.receipt_id = r.id
     WHERE r.user_id = ? AND li.confidence < 0.80 AND li.user_overridden = 0
     ORDER BY li.confidence ASC
     ```
   - Return array of items with retailer and date context

2. **Build the review card component**
   - File: `app/review-queue/components/ReviewCard.tsx`
   - Props: `item` (line item with retailer/date), `onAction: (action: 'confirm' | 'skip' | 'recategorize', category?: string) => void`
   - Render:
     - Item name (`item.name`) and raw name (`item.raw_name`) in smaller text
     - Current suggested category as a highlighted tag
     - Retailer + date context line
     - Three buttons: **Confirm** (green), **Recategorize** (blue), **Skip** (gray)
   - On "Recategorize": show an inline `<select>` with all 9 categories from `lib/categories.ts`

3. **Wire actions to the PATCH endpoint**
   - Re-use `PATCH /api/items/[id]/categorize` from Phase 4 for both Confirm and Recategorize
   - For Confirm: send the existing `item.category` as the new category
   - For Skip: call a new `PATCH /api/items/[id]/skip` endpoint (see step 4)
   - After a successful response, remove the card from the local state array (optimistic UI)

4. **Create the skip endpoint**
   - File: `app/api/items/[id]/skip/route.ts`
   - Method: `PATCH`
   - Update: `SET user_overridden = 1` (category unchanged, no rule created)
   - Return 200 OK

5. **Build the review queue page**
   - File: `app/review-queue/page.tsx`
   - Mark as `'use client'`
   - Fetch `GET /api/review-queue` on mount; store in local state
   - Render a list of `<ReviewCard>` components
   - On action: call the appropriate endpoint, then remove the card from state
   - Show "All caught up! No items need review." when the queue is empty
   - Show a count at the top: "N items need your review"

6. **Add queue badge to the dashboard**
   - File: `app/dashboard/page.tsx` (from Phase 5)
   - Fetch `GET /api/review-queue` and use the array length as the badge count
   - Render a small red badge next to a "Review" link in the dashboard header
   - Link navigates to `/review-queue`

7. **Confirm rules are applied on next scan**
   - File: `lib/rulesEngine.ts` (from Phase 4)
   - No code change needed — the `clearRulesCache()` call in `PATCH /api/items/[id]/categorize` already handles this
   - Verify by creating a rule via the review queue, then re-triggering a scan with a matching item

---

## File Structure

```
runway/
├── app/
│   ├── review-queue/
│   │   ├── page.tsx                        (new)
│   │   └── components/
│   │       └── ReviewCard.tsx              (new)
│   ├── dashboard/
│   │   └── page.tsx                        (modified: add badge count)
│   └── api/
│       ├── review-queue/
│       │   └── route.ts                    (new)
│       └── items/
│           └── [id]/
│               └── skip/
│                   └── route.ts            (new)
```

---

## Tech & Libraries

| Library | Purpose | Reference |
|---|---|---|
| `better-sqlite3` | Review queue query, user_overridden update | `ai/context7/better-sqlite3.md` |
| `next` | Client component state, fetch, routing | `ai/context7/nextjs.md` |
| `lib/categories.ts` | Category list for the recategorize picker | (Phase 4 deliverable) |
| `lib/rulesEngine.ts` | Cache invalidation after new rule | (Phase 4 deliverable) |

---

## Testing Strategy

1. Seed 5 `line_items` rows with `confidence = 0.60` and `user_overridden = 0`
2. `GET /api/review-queue` — confirm all 5 are returned
3. Load `/review-queue` in the browser — confirm 5 cards render
4. Click "Confirm" on item 1 — confirm card disappears; `GET /api/review-queue` returns 4; a rule exists in `rules` for that item name
5. Click "Recategorize" on item 2 — select a different category — confirm item updated, rule created with the new category
6. Click "Skip" on item 3 — confirm card disappears; no rule created; `user_overridden = 1`
7. Trigger a new scan with an item matching the rule from step 4 — confirm it gets the correct category with `confidence = 1.0` and does not re-appear in the queue
8. Verify the dashboard badge shows the correct count before and after actions

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| User confirms a wrong category (bad rule created) | Allow rules to be viewed and deleted in Phase 7 Settings |
| Large review queues overwhelm the user | Paginate: return max 20 items per call; add "Load more" |
| Skip overrides `user_overridden = 1` but item might still be wrong | This is acceptable for MVP — skipped items are not re-shown; user can find them in the items list |
| Rule creation on every "Confirm" floods the `rules` table | Rules are keyed by `match_pattern` — add a `UNIQUE` constraint on `match_pattern` and use `INSERT OR REPLACE` |

---

## Deliverables

- `app/api/review-queue/route.ts` — items with `confidence < 0.80` and `user_overridden = 0`
- `app/api/items/[id]/skip/route.ts` — dismiss without rule
- `app/review-queue/page.tsx` — queue UI with Confirm / Recategorize / Skip
- `app/review-queue/components/ReviewCard.tsx` — single item card
- Dashboard badge count showing pending review items
- Rules created via Confirm/Recategorize applied on next scan
