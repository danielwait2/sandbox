# Phase 8 Roadmap: Account Member Access

**Status:** Complete  
**Timeline:** Days 16-20  
**Detailed Plan:** [phase-8-account-member-access.md](./phase-8-account-member-access.md)

---

## Development Philosophy

**Avoid over-engineering, cruft, and legacy-compatibility features in this clean code project.**

- Build only what is needed for this phase.
- No "just in case" features.
- Delete unused code immediately.
- Keep it simple and focused.

---

## Quick Overview

Add shared-account support so one owner can add one member, both can connect and scan their own Gmail accounts, and the app reports unified totals at the account level. Explicitly convert existing Dashboard + Insights + History analytics to shared account scope for both users, with optional contributor filters. Enforce clear owner/member permissions, contributor attribution, duplicate protection, and audit logging.

---

## Task Checklist

### Data Model and Migrations
- [x] Add `accounts`, `users` (if needed), `account_memberships`, `mailbox_connections`, and `audit_log` tables
- [x] Update `receipts` to include `account_id` and `contributor_user_id`
- [x] Update `scan_state` to be mailbox-scoped (`mailbox_connection_id` or `(user_id, provider)`)
- [x] Add required indexes for account-level reads and dedupe paths
- [x] Backfill single-user data into account model with safe migration logic

### Auth Context and Authorization
- [x] Add account context resolver (`currentUserId`, `currentAccountId`, `currentRole`)
- [x] Enforce account membership checks on all authenticated APIs
- [x] Enforce owner-only access for member management APIs
- [x] Add membership state handling (`pending`, `active`, `removed`)

### Settings and Membership Management UX
- [x] Add `Account Members` section to `app/settings/page.tsx`
- [x] Implement owner "Add Member by Email" flow (v1: one additional member)
- [x] Implement owner "Remove Member" flow with explicit retention warning
- [x] Show member status and owner identity for non-owner users
- [x] Add clear error states (self-invite, slot full, pending member)

### Mailbox Connections and Scan Pipeline
- [x] Implement per-user mailbox connect/disconnect endpoints
- [x] Update `/api/receipts/scan` to run only against caller mailbox credentials
- [x] Ensure parsed receipts are written to shared `account_id` with immutable contributor attribution
- [x] Keep disconnect isolated to caller mailbox only
- [x] Add mailbox re-auth state handling and user-facing messaging

### Aggregation, Reporting, and Exports
- [x] Convert dashboard, review queue, items, and receipt detail queries to `account_id` scope
- [x] Convert existing analytics endpoints to shared account scope:
- [x] `/api/dashboard/summary`
- [x] `/api/insights`
- [x] `/api/insights/tips`
- [x] `/api/history`
- [x] `/api/history/[month]`
- [x] Add optional contributor filter (`all`, `owner`, `member`) to analytics/reporting endpoints where filtering is supported
- [x] Ensure owner and member see identical shared totals on `dashboard`, `insights`, and `history` for same account/date/filter selection
- [x] Include contributor attribution in receipt detail payloads and CSV export
- [x] Verify account-wide totals match sum of account line items for selected range

### Duplicate Detection and Auditing
- [x] Implement account-level duplicate detection using `(account_id, provider, raw_email_id)`
- [x] Add secondary duplicate heuristic hash (`retailer + transaction_date + total + order suffix`)
- [x] Log duplicate-suppression and key account events in `audit_log`
- [x] Add audit events for add/remove member, mailbox connect/disconnect, scan start/end

### QA and Hardening
- [x] Add migration tests for legacy single-user data
- [x] Add integration tests for permissions and member removal behavior
- [x] Add ingestion tests for owner/member mailbox isolation
- [x] Add reporting tests for combined totals and contributor filters across dashboard, insights, and history APIs
- [x] Add parity tests to verify owner/member shared-account analytics match for equivalent filters
- [x] Run `next build` and resolve all TypeScript/build failures

---

## Success Criteria

- [x] Owner can add exactly one member from Settings by email
- [x] Member cannot add/remove users
- [x] Owner and member can each connect and scan their own Gmail mailbox
- [x] All dashboard totals are account-level by default for both users
- [x] Insights and history totals are account-level by default for both users
- [x] Contributor filters return deterministic totals across dashboard, insights, and history
- [x] Removing member immediately revokes access while preserving historical receipts
- [x] Duplicate receipts across users are suppressed at account level
- [x] Account-level audit logs are written for all critical actions
- [x] Legacy single-user accounts migrate without data loss
- [x] `next build` passes with zero errors

---

## Key Deliverables

- [x] Account/membership schema migrations and backfill logic in `lib/migrations.ts`
- [x] Member management APIs under `app/api/account/members/*`
- [x] Mailbox connection APIs under `app/api/mailbox/*`
- [x] Updated scan/parse/categorization pipelines for account + contributor model
- [x] Updated dashboard, insights, and history APIs/UI filters for shared totals
- [x] Settings UI updates for membership management
- [x] Duplicate detection + audit logging
- [x] Integration and migration test coverage for this phase

---

## Notes and Decisions

<!-- Track implementation decisions and tradeoffs here -->

---

## Completion Checklist

Before moving to `ai/roadmaps/complete`:
- [x] All tasks completed
- [x] Success criteria met
- [x] Deliverables created
- [x] Tests passing
- [x] Documentation updated
- [x] Changelog updated

---

**Created:** 2026-02-28  
**Last Updated:** 2026-02-28  
**Next Phase:** TBD
