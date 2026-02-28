# PRD: Account Member Access for Shared Receipt Scanning (v1)

## Summary
Add account-level sharing so one `owner` can add one `member` from Settings. Each person connects their own Gmail and runs scanning from their own mailbox, while receipts roll up into a shared account dataset and shared totals.  
v1 is intentionally constrained to `1 owner + 1 member`, with schema/API designed to scale to many members later.

## 1. Problem Statement
The app is currently single-user and keys data by user email (`user_id`). Households/partners cannot combine spending without sharing one mailbox/login, causing incomplete totals, fragmented receipt history, and poor collaboration.

## 2. Goals and Non-Goals
### Goals
1. Owner can add/remove one member by email from Settings.
2. Owner and member can each connect Gmail and ingest receipts into one shared account.
3. Dashboard/reporting shows unified totals across all account receipts by default.
4. Permissions, auditability, and data ownership are explicit and enforceable.

### Non-Goals (v1)
1. More than one additional member.
2. Granular per-category/member permissions.
3. Real-time collaborative editing conflicts.
4. Non-Gmail providers.
5. Backfilling historical receipts beyond current scanner behavior.

## 3. User Personas and User Stories
### Personas
- Owner: Primary account holder managing membership and data governance.
- Member: Secondary collaborator contributing receipts and viewing shared analytics.

### User Stories
- As an owner, I can add my partner so we track shared spend in one place.
- As a member, I can connect my own Gmail without exposing full mailbox data to owner.
- As either user, I can scan and see combined totals immediately.
- As an owner, I can remove a member without losing historical accounting integrity.

## 4. Functional Requirements
1. Create/resolve an `account` for each owner login.
2. Owner can add one member by email from Settings (`Auto-Add by Email`).
3. Member becomes active when they next authenticate with matching email.
4. Both users can connect/disconnect Gmail independently.
5. Manual scan runs against caller's own Gmail tokens only.
6. New receipts are stored under shared `account_id` and attributed to `contributor_user_id`.
7. All dashboard totals default to account-wide aggregation.
8. Filters allow optional contributor breakdown (owner/member/all).
9. Owner can remove member.
10. Removed member immediately loses access.
11. Historical receipts from removed member remain in account totals and history.
12. System logs membership and scan/audit events.

## 5. UX Requirements (Settings flow for adding/removing users)
### Settings IA (v1)
- Section: `Account Members`
- Section: `Connected Mailboxes`
- Existing sections remain (rules/export/danger zone)

### Owner flow
1. Owner enters member email, clicks `Add Member`.
2. UI shows `Pending` until invited user logs in.
3. On acceptance (first login), status becomes `Active`.
4. Owner can click `Remove Member` with confirmation modal.

### Member flow
1. Member sees shared account name, owner email, own status `Active`.
2. Member can connect/disconnect only their own Gmail.
3. Member cannot invite/remove users.

### UX states/errors
- Member slot already used.
- Attempt to add self email.
- Added email not yet registered/logged in.
- Remove action includes warning that historical receipts are retained.

## 6. Data Model Changes (accounts, members, receipts ownership, aggregation)
### Important public interfaces/types changes
- Auth/session context must expose `currentUserId`, `currentAccountId`, `currentRole`.
- All backend read/write paths shift from `user_id` scoping to `account_id` scoping, with contributor metadata retained.

### New/updated tables
| Table | Change | Notes |
|---|---|---|
| `accounts` | New | `id`, `owner_user_id`, `name`, timestamps |
| `users` | New (or logical abstraction over email identity) | `id`, `email` unique, timestamps |
| `account_memberships` | New | `account_id`, `user_id`, `role` (`owner`,`member`), `status` (`active`,`removed`), `added_by`, `removed_at` |
| `mailbox_connections` | New | Per-user OAuth tokens/scopes/provider status; encrypted token fields |
| `membership_invites` | Optional in v1 with auto-add | Tracks add request lifecycle (`pending`,`accepted`,`revoked`) |
| `receipts` | Update | add `account_id`, rename old `user_id` to `contributor_user_id`, add dedupe hash fields |
| `scan_state` | Update | keyed by `mailbox_connection_id` or `(user_id, provider)` not global user email |
| `audit_log` | New | immutable events for membership/token/scan actions |

### Ownership and retention rules
- Data owner is `account`.
- Receipt contributor is immutable (`contributor_user_id`).
- On member removal: contributor remains, receipts retained, access revoked.

## 7. API/Backend Requirements
### Authorization model
- Every API resolves caller membership and role for target `account_id`.
- Reject if no active membership.
- Owner-only endpoints enforce role check.

### Endpoint additions/changes
| Endpoint | Method | Role | Behavior |
|---|---|---|---|
| `/api/account/members` | GET | owner/member | List active/pending/removed memberships (member sees limited fields) |
| `/api/account/members` | POST | owner | Add member email if slot available |
| `/api/account/members/:userId` | DELETE | owner | Remove member (soft revoke membership) |
| `/api/mailbox/connect` | POST | owner/member | Start/connect own Gmail OAuth |
| `/api/mailbox/disconnect` | DELETE | owner/member | Disconnect own mailbox only |
| `/api/receipts/scan` | POST | owner/member | Scan caller mailbox, write receipts to caller account |
| Existing reporting endpoints | GET | owner/member | Aggregate by `account_id`; optional `contributor` filter |

### Backend processing requirements
- Wrap membership writes in transactions.
- Add indexes:
- `receipts(account_id, transaction_date)`
- `receipts(account_id, contributor_user_id, raw_email_id)`
- `account_memberships(account_id, status, role)`

## 8. Email Integration Requirements (per-user mailbox connection and scan jobs)
1. OAuth token storage is per user mailbox, not per account.
2. Scan job always uses caller's mailbox connection.
3. Parse queue fetches only unparsed receipts for that caller and account.
4. Gmail disconnect affects only that user's future scans.
5. Failed mailbox auth marks mailbox `reauth_required`; does not impact other member.
6. Prevent cross-user token usage by deriving mailbox from authenticated user identity only.

## 9. Permissions and Security (roles, invitation flow, revocation, auditability)
### Roles/permissions
| Action | Owner | Member |
|---|---|---|
| View shared dashboard/receipts | Yes | Yes |
| Scan own mailbox into shared account | Yes | Yes |
| Connect/disconnect own Gmail | Yes | Yes |
| Add/remove member | Yes | No |
| Delete whole account | Yes | No |
| View full audit log | Yes | Limited/self events |

### Security/compliance requirements
1. Encrypt refresh/access tokens at rest.
2. Minimize OAuth scope to `gmail.readonly`.
3. Log consent, connect/disconnect, scan start/end, membership changes.
4. Enforce least privilege in APIs.
5. Provide explicit privacy notice: shared financial data visible to all active members.
6. Data deletion/export must be account-aware and role-gated.
7. Retain audit logs for minimum compliance window (e.g., 12 months).

## 10. Analytics and Reporting Requirements (combined totals and filters)
1. Default totals are account-wide (`all contributors`).
2. Filters:
- Date period
- Contributor: `all`, `owner`, `member`
- Retailer/category (existing behavior retained)
3. Dashboard cards:
- Total spend
- Receipt count
- Top category
- Most frequent item
4. Include contributor attribution in receipt detail views.
5. CSV export includes `contributor_email` and `account_id`.

### Total computation rule
`Unified total = SUM(line_items.total_price) for receipts WHERE receipts.account_id = current_account AND date range/filter matches`

## 11. Edge Cases and Error Handling
| Case | Expected Behavior |
|---|---|
| Owner tries to add second member when slot occupied | 409 + UI: "v1 supports 1 member" |
| Owner adds own email | 400 |
| Added email never logs in | Membership remains `pending` |
| Member removed during active session | Next API call fails 403; force re-fetch/logout |
| Member disconnects Gmail | Existing receipts remain; scans blocked until reconnect |
| Duplicate receipt appears across users | Deduplicate at account-level (see rule below) |
| OAuth refresh fails | Mark mailbox invalid; actionable reconnect prompt |
| Owner account deletion | Deletes account-wide data and memberships per existing danger-zone flow |

### Duplicate detection rule (explicit)
- Primary key for dedupe: `(account_id, provider='gmail', raw_email_id)` when message IDs collide within same account and provider.
- Secondary heuristic for forwarded/duplicate content: hash of normalized tuple `(retailer, transaction_date, total, last4(order_number))`.
- If duplicate detected:
- Do not create new receipt.
- Increment `duplicate_count`/log event with blocked contributor id.

## 12. Success Metrics / KPIs
1. Activation: `% owners who add a member within 14 days`.
2. Shared ingestion: `% shared accounts with scans from both users in 30 days`.
3. Coverage lift: change in monthly receipt count after member activation.
4. Reporting trust: decrease in "missing receipt" support issues.
5. Reliability: scan failure rate per mailbox connection.
6. Security: zero unauthorized cross-account access incidents.

## 13. Rollout Plan (phased release + migration strategy)
### Phase 0: Schema + compatibility
- Add new tables/columns.
- Backfill: create one account per existing user.
- Migrate existing rows:
- `receipts.user_id -> receipts.contributor_user_id`
- derive `receipts.account_id` from contributor's new account
- Keep compatibility read path temporarily with feature flag.

### Phase 1: Internal beta
- Enable membership APIs and UI for internal accounts only.
- Validate invitation/add/remove, scan isolation, dedupe, totals.

### Phase 2: Limited rollout (10-20%)
- Feature flag by account.
- Monitor scan errors, auth errors, duplicate suppression, KPI baselines.

### Phase 3: GA
- Enable for all accounts.
- Remove deprecated single-user query paths and old columns when stable.

## 14. Risks and Open Questions
### Risks
1. Token handling complexity increases attack surface.
2. Data-model migration may regress existing analytics if joins miss `account_id`.
3. Duplicate heuristic false positives could undercount receipts.
4. Owner/member expectations around privacy may differ without strong onboarding copy.

### Open Questions
1. Should member be allowed to view full audit log or only own actions?
2. Should owner be able to reassign ownership in future (not in v1)?
3. For future multi-member: keep single `member` role or introduce role tiers?

## 15. Acceptance Criteria (testable, implementation-ready)
1. Owner can add exactly one member email; second add blocked.
2. Added member becomes active on login with matching email.
3. Owner and member can each connect/disconnect Gmail independently.
4. Member cannot call add/remove member APIs (403).
5. Scan by owner ingests owner mailbox only; scan by member ingests member mailbox only.
6. Dashboard totals for both users match account-level aggregation.
7. Contributor filter changes totals deterministically.
8. Removing member revokes access immediately.
9. Removed member's historical receipts remain queryable and included in default totals.
10. Duplicate receipts across contributors are suppressed per defined dedupe rules.
11. Audit events exist for add/remove member, connect/disconnect mailbox, scan runs.
12. Existing single-user accounts are migrated without data loss.

## Assumptions and Defaults Chosen
1. Invitation model: `Auto-Add by Email` (no outbound invite email in v1).
2. Removal policy: keep historical receipts in account.
3. v1 supports exactly one active member in addition to owner.
4. Shared account is the sole data boundary; no per-receipt ACLs in v1.
5. Current Gmail provider remains the only mailbox provider.

## Engineering Handoff Checklist
1. Confirm schema migration SQL and rollback strategy.
2. Finalize auth context contract (`userId/accountId/role`) for all APIs.
3. Implement owner/member Settings UI with explicit status states.
4. Update scan, parse, categorize, dashboard queries to `account_id` model.
5. Implement dedupe (primary + secondary heuristic) and audit logging.
6. Add integration tests for permissions, ingestion isolation, totals, removal behavior.
7. Add telemetry/KPI events and dashboards before limited rollout.
8. Run phased flag rollout with error-rate guardrails and migration monitoring.
