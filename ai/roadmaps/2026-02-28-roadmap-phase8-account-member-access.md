# Phase 8 Roadmap: Account Member Access

**Status:** Not Started  
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

Add shared-account support so one owner can add one member, both can connect and scan their own Gmail accounts, and the app reports unified totals at the account level. Enforce clear owner/member permissions, contributor attribution, duplicate protection, and audit logging.

---

## Task Checklist

### Data Model and Migrations
- [ ] Add `accounts`, `users` (if needed), `account_memberships`, `mailbox_connections`, and `audit_log` tables
- [ ] Update `receipts` to include `account_id` and `contributor_user_id`
- [ ] Update `scan_state` to be mailbox-scoped (`mailbox_connection_id` or `(user_id, provider)`)
- [ ] Add required indexes for account-level reads and dedupe paths
- [ ] Backfill single-user data into account model with safe migration logic

### Auth Context and Authorization
- [ ] Add account context resolver (`currentUserId`, `currentAccountId`, `currentRole`)
- [ ] Enforce account membership checks on all authenticated APIs
- [ ] Enforce owner-only access for member management APIs
- [ ] Add membership state handling (`pending`, `active`, `removed`)

### Settings and Membership Management UX
- [ ] Add `Account Members` section to `app/settings/page.tsx`
- [ ] Implement owner "Add Member by Email" flow (v1: one additional member)
- [ ] Implement owner "Remove Member" flow with explicit retention warning
- [ ] Show member status and owner identity for non-owner users
- [ ] Add clear error states (self-invite, slot full, pending member)

### Mailbox Connections and Scan Pipeline
- [ ] Implement per-user mailbox connect/disconnect endpoints
- [ ] Update `/api/receipts/scan` to run only against caller mailbox credentials
- [ ] Ensure parsed receipts are written to shared `account_id` with immutable contributor attribution
- [ ] Keep disconnect isolated to caller mailbox only
- [ ] Add mailbox re-auth state handling and user-facing messaging

### Aggregation, Reporting, and Exports
- [ ] Convert dashboard, review queue, items, and receipt detail queries to `account_id` scope
- [ ] Add optional contributor filter (`all`, `owner`, `member`) to summary endpoints
- [ ] Include contributor attribution in receipt detail payloads and CSV export
- [ ] Verify account-wide totals match sum of account line items for selected range

### Duplicate Detection and Auditing
- [ ] Implement account-level duplicate detection using `(account_id, provider, raw_email_id)`
- [ ] Add secondary duplicate heuristic hash (`retailer + transaction_date + total + order suffix`)
- [ ] Log duplicate-suppression and key account events in `audit_log`
- [ ] Add audit events for add/remove member, mailbox connect/disconnect, scan start/end

### QA and Hardening
- [ ] Add migration tests for legacy single-user data
- [ ] Add integration tests for permissions and member removal behavior
- [ ] Add ingestion tests for owner/member mailbox isolation
- [ ] Add reporting tests for combined totals and contributor filters
- [ ] Run `next build` and resolve all TypeScript/build failures

---

## Success Criteria

- [ ] Owner can add exactly one member from Settings by email
- [ ] Member cannot add/remove users
- [ ] Owner and member can each connect and scan their own Gmail mailbox
- [ ] All dashboard totals are account-level by default for both users
- [ ] Contributor filters return deterministic totals
- [ ] Removing member immediately revokes access while preserving historical receipts
- [ ] Duplicate receipts across users are suppressed at account level
- [ ] Account-level audit logs are written for all critical actions
- [ ] Legacy single-user accounts migrate without data loss
- [ ] `next build` passes with zero errors

---

## Key Deliverables

- [ ] Account/membership schema migrations and backfill logic in `lib/migrations.ts`
- [ ] Member management APIs under `app/api/account/members/*`
- [ ] Mailbox connection APIs under `app/api/mailbox/*`
- [ ] Updated scan/parse/categorization pipelines for account + contributor model
- [ ] Updated reporting APIs and UI filters for shared totals
- [ ] Settings UI updates for membership management
- [ ] Duplicate detection + audit logging
- [ ] Integration and migration test coverage for this phase

---

## Notes and Decisions

<!-- Track implementation decisions and tradeoffs here -->

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
**Next Phase:** TBD
