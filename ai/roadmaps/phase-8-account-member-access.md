# Phase 8 - Account Member Access for Shared Receipt Scanning

**Timeline:** Days 16-20  
**Status:** Complete  
**Roadmap:** [2026-02-28-roadmap-phase8-account-member-access.md](./2026-02-28-roadmap-phase8-account-member-access.md) - Track progress

---

## Overview

Implement shared account access for receipt scanning so one owner can add one member. Both users connect their own Gmail mailboxes and ingest receipts into a single shared account dataset. Reporting and totals are unified at the account level, with contributor attribution preserved and strict owner/member permission controls enforced. Existing analytics surfaces (`dashboard`, `insights`, `history`) must run at shared account scope for both users, with optional contributor filters.

---

## Prerequisites

- Phase 7 complete: settings foundation, account deletion, and export flows already exist.
- Current single-user pipeline stable for scan -> parse -> categorize -> report.
- Existing auth/session routes stable with Google OAuth.

---

## Success Criteria

- Owner can add one member from Settings by email.
- Member is activated when logging in with matching email.
- Owner and member can connect/disconnect their own Gmail independently.
- Scan runs use caller mailbox only and write into shared account.
- Dashboard, insights, and history totals are account-level by default for both owner and member.
- Contributor filter (`all`, `owner`, `member`) works consistently across reporting/analytics endpoints where filtering is supported.
- Owner and member see matching analytics results when using identical account/date/filter inputs.
- Member removal immediately blocks API/data access for removed user.
- Historical receipts from removed member remain in account totals/history.
- Account-level duplicate detection suppresses duplicates across contributors.
- Audit events are written for membership and mailbox lifecycle events.
- Backfill migration preserves existing single-user data without loss.

---

## Implementation Steps

1. **Introduce account and membership schema**
   - Files: `lib/migrations.ts`, `lib/db.ts` (if helpers are needed)
   - Add tables:
     - `accounts`
     - `account_memberships`
     - `mailbox_connections`
     - `audit_log`
   - Update existing tables:
     - `receipts`: add `account_id`, `contributor_user_id`, optional dedupe hash field
     - `scan_state`: scope by mailbox connection identity
   - Add indexes for account-level querying and dedupe paths.

2. **Backfill legacy single-user data**
   - File: `lib/migrations.ts`
   - For each existing user (email identity), create one account and owner membership.
   - Map old `receipts.user_id` to:
     - `receipts.account_id` (derived account)
     - `receipts.contributor_user_id` (legacy user identity)
   - Ensure migration is idempotent and safe for repeated startup execution.

3. **Add auth account context resolver**
   - File: `lib/auth.ts` and/or new helper in `lib`
   - Resolve `currentUserId`, `currentAccountId`, `currentRole` from session + memberships.
   - Ensure all account-scoped APIs use this resolver.

4. **Build member management APIs**
   - Files:
     - `app/api/account/members/route.ts` (`GET`, `POST`)
     - `app/api/account/members/[userId]/route.ts` (`DELETE`)
   - Enforce:
     - Owner-only add/remove
     - One-member limit for v1
     - Self-invite rejected
     - Member status lifecycle (`pending`, `active`, `removed`)
   - Add audit events for all membership mutations.

5. **Update settings UI for account members**
   - File: `app/settings/page.tsx`
   - Add `Account Members` section with:
     - Owner controls: add member by email, remove member
     - Member view: read-only account membership status
     - Clear status chips (`pending`, `active`, `removed`)
   - Add explicit warning on removal: historical receipts are retained.

6. **Implement per-user mailbox connection model**
   - Files:
     - `app/api/mailbox/connect/route.ts`
     - `app/api/mailbox/disconnect/route.ts`
     - `lib/gmail.ts`, `lib/auth.ts` (as needed)
   - Store OAuth tokens per user mailbox connection (encrypted at rest).
   - Prevent any cross-user mailbox access by deriving mailbox from authenticated caller only.

7. **Refactor scan, parse, categorize for shared account**
   - Files:
     - `app/api/receipts/scan/route.ts`
     - `lib/gmailScanner.ts`
     - `lib/parseQueue.ts`
     - `lib/categorizer.ts`
   - Behavior:
     - Scan caller mailbox only.
     - Persist receipts with shared `account_id` and immutable `contributor_user_id`.
     - Keep parse/categorize scoped to the same caller/account context.
   - Add audit events for scan start/end and failures.

8. **Convert reporting/data APIs to account scope**
   - Files:
     - `app/api/dashboard/summary/route.ts`
     - `app/api/insights/route.ts`
     - `app/api/insights/tips/route.ts`
     - `app/api/history/route.ts`
     - `app/api/history/[month]/route.ts`
     - `app/api/items/route.ts`
     - `app/api/review-queue/route.ts`
     - `app/api/receipts/[id]/route.ts`
     - `app/api/items/export/route.ts`
   - Replace `user_id` filters with `account_id`.
   - Add contributor filter support where appropriate.
   - Ensure analytics parity for owner/member on dashboard, insights, and history for identical filters.
   - Include contributor identity in detail/export payloads.

9. **Implement duplicate detection and suppression**
   - Files: `lib/gmailScanner.ts`, optional helper in `lib`
   - Primary duplicate key: `(account_id, provider, raw_email_id)`.
   - Secondary heuristic hash: normalized `(retailer, transaction_date, total, order_number_suffix)`.
   - On duplicate: skip insert, log duplicate event in `audit_log`.

10. **Harden account deletion behavior for shared model**
    - File: `app/api/account/route.ts`
    - Owner-only delete-account for shared account.
    - Confirm account-wide wipe semantics are explicit and tested.
    - Ensure member cannot delete owner account.

11. **Testing and verification**
    - Add migration tests for single-user -> account model conversion.
    - Add integration tests:
      - owner vs member permissions
      - mailbox isolation
      - account-level aggregation
      - member removal behavior with retained receipts
      - duplicate suppression across contributors
    - Run `next build` and fix all build/type errors.

---

## File Structure

```text
runway/
|-- app/
|   |-- settings/
|   |   `-- page.tsx                                (modified)
|   `-- api/
|       |-- account/
|       |   |-- route.ts                            (modified)
|       |   `-- members/
|       |       |-- route.ts                        (new)
|       |       `-- [userId]/
|       |           `-- route.ts                    (new)
|       |-- mailbox/
|       |   |-- connect/
|       |   |   `-- route.ts                        (new)
|       |   `-- disconnect/
|       |       `-- route.ts                        (new)
|       |-- receipts/
|       |   `-- scan/
|       |       `-- route.ts                        (modified)
|       |-- dashboard/
|       |   `-- summary/
|       |       `-- route.ts                        (modified)
|       |-- items/
|       |   |-- route.ts                            (modified)
|       |   `-- export/
|       |       `-- route.ts                        (modified)
|       |-- review-queue/
|       |   `-- route.ts                            (modified)
|       `-- receipts/
|           `-- [id]/
|               `-- route.ts                        (modified)
`-- lib/
    |-- migrations.ts                               (modified)
    |-- gmailScanner.ts                             (modified)
    |-- parseQueue.ts                               (modified)
    |-- categorizer.ts                              (modified)
    |-- gmail.ts                                    (modified)
    `-- auth.ts                                     (modified)
```

---

## Testing Strategy

1. Owner adds member email in Settings; member row appears as `pending`.
2. Pending member logs in with matching email; status transitions to `active`.
3. Member attempts to add/remove member via API; receives `403`.
4. Owner scan imports only owner mailbox messages.
5. Member scan imports only member mailbox messages.
6. Dashboard totals match account-wide line-item sum for selected period.
7. Insights data and generated tips are based on account-scoped totals by default, with contributor filter support where applicable.
8. History summary and month drill-down are account-scoped by default, with contributor filter support where applicable.
9. Contributor filter returns expected subsets and totals.
10. Remove member:
   - user loses access immediately
   - prior receipts remain in account history/totals
11. Duplicate receipt from second user is suppressed and logged.
12. Run `next build` with zero errors.

---

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Migration regressions in existing data | Implement idempotent migration + pre/post migration assertions |
| Permission leaks across accounts | Centralize auth context resolver and require it in every account API |
| Token misuse between users | Enforce mailbox lookup by authenticated user only |
| Duplicate false positives | Use two-step dedupe (message id first, heuristic second) and log suppressions |
| Query performance degradation after account joins | Add indexes on `receipts(account_id, transaction_date)` and membership lookups |

---

## Deliverables

- Account-sharing schema and migrations
- Owner/member membership APIs
- Settings membership management UI
- Per-user mailbox connection model
- Account-scoped scan/parse/categorize pipeline
- Account-scoped dashboard, insights, and history endpoints with contributor filter
- Account-level dedupe and audit logging
- Migration/integration tests for shared account behavior

---

## Completion Notes

- Implemented owner/member membership APIs (`GET/POST/DELETE`) and Settings management UX.
- Added account context resolver with pending-to-active activation flow.
- Added per-user mailbox connection storage and connect/disconnect APIs.
- Migrated dashboard/insights/history plus items/review/export/detail routes to account scope.
- Added contributor filters and contributor attribution in history detail/export.
- Added account-level dedupe (raw email id + heuristic hash) and audit events.
- Added integration coverage for parity, filters, member removal, mailbox isolation, and migration backfill.
