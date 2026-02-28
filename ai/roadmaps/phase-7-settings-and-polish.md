# Phase 7 — Settings & Polish

**Timeline:** Days 14–15
**Status:** Not Started
**Roadmap:** [2026-02-28-roadmap-phase7-settings-and-polish.md](./2026-02-28-roadmap-phase7-settings-and-polish.md) — Track progress

---

## Overview

Build the Settings page with Gmail connection status and disconnect, custom rules management, CSV export of all parsed items, and delete-account (permanently removes all user data). Apply final UI polish across all screens. When this phase is complete, the app is feature-complete for the MVP and meets all success criteria defined in `aiDocs/mvp.md`.

---

## Prerequisites

- Phase 5 complete: Dashboard functional
- Phase 6 complete: Rules are created and stored in the `rules` table
- All earlier phases complete: full data pipeline running end-to-end

---

## Success Criteria

- `/settings` page loads for an authenticated user
- Gmail connection status shows "Connected" with the user's Google account email
- "Disconnect Gmail" revokes the OAuth token and clears stored tokens from the session
- Custom rules list shows all rows from `rules` for the user with Delete action per rule
- Deleting a rule removes it from the DB and calls `clearRulesCache()`
- "Export CSV" downloads a `.csv` file of all the user's `line_items` joined with receipt date and retailer
- "Delete Account" shows a confirmation dialog; on confirm, deletes all user data from all tables and signs the user out
- All pages are responsive at 375px width (mobile) and 1280px (desktop)
- No console errors on any page in production build (`next build` succeeds)

---

## Implementation Steps

1. **Create the settings page layout**
   - File: `app/settings/page.tsx`
   - Mark as `'use client'`
   - Sections: Gmail Connection, Custom Rules, Export Data, Danger Zone
   - Use Tailwind dividers between sections

2. **Gmail connection status section**
   - File: `app/settings/page.tsx`
   - Fetch session to get `user.email` and `user.image`
   - Display: avatar, email, "Connected via Google" label, green connected indicator
   - "Disconnect Gmail" button: calls `DELETE /api/auth/disconnect`

3. **Create the disconnect endpoint**
   - File: `app/api/auth/disconnect/route.ts`
   - Method: `DELETE`
   - Call Google's OAuth token revoke endpoint: `POST https://oauth2.googleapis.com/revoke?token=<accessToken>`
   - Sign the user out via `signOut()` server-side (or return a response that triggers client-side `signOut()`)
   - Gotcha: revoking the token does not delete the user's parsed data — that's the separate Delete Account action

4. **Custom rules section**
   - File: `app/settings/page.tsx`
   - Fetch `GET /api/rules` on mount
   - Render a list: each rule shows `match_pattern` → `category` (subcategory if present), and a Delete button
   - On delete: call `DELETE /api/rules/[id]`, remove from local state

5. **Create the rules API routes**
   - File: `app/api/rules/route.ts`
   - `GET`: return all `rules` rows for the authenticated user
   - `POST`: insert a new rule (for manual creation — body: `{ match_pattern, category, subcategory }`)
   - Note: `rules` table has no `user_id` in the current schema — add `user_id` to the migration (same issue as `budgets` in Phase 5). For single-user MVP, this is a no-op; for multi-user, it's required.
   - File: `app/api/rules/[id]/route.ts`
   - `DELETE`: remove the rule by `id`; call `clearRulesCache()`

6. **CSV export**
   - File: `app/api/items/export/route.ts`
   - Method: `GET`
   - Query all `line_items` joined to `receipts` for the user (no date filter — all time)
   - Build CSV string: headers + one row per item
   - CSV columns: `Date, Retailer, Order Number, Item Name, Raw Name, Quantity, Unit Price, Total Price, Category, Subcategory, Confidence`
   - Return with headers: `Content-Type: text/csv`, `Content-Disposition: attachment; filename="runway-export.csv"`
   - File: `app/settings/page.tsx`
   - "Export CSV" button: `window.location.href = '/api/items/export'` (triggers browser download)

7. **Delete account**
   - File: `app/api/account/route.ts`
   - Method: `DELETE`
   - Require the user to type "DELETE" to confirm (check in the API body or via a client-side guard before calling)
   - Delete all rows from: `line_items` (via cascade or explicit delete), `receipts`, `budgets`, `rules`, `scan_state` — all filtered by `user_id`
   - Sign out the user after deletion
   - File: `app/settings/page.tsx`
   - "Delete Account" button opens a modal: "Type DELETE to confirm". On confirm, call the endpoint, then redirect to `/signin`

8. **Navigation**
   - File: `app/dashboard/page.tsx` (and other pages)
   - Add a persistent nav bar or header with links: Dashboard | Review Queue | Settings
   - Highlight the active link using `usePathname()`

9. **Polish pass**
   - Verify all pages render without hydration errors
   - Add `loading.tsx` skeleton files for `/dashboard` and `/review-queue` (Next.js App Router convention)
   - Confirm Tailwind responsive classes work at 375px
   - Run `next build` — fix any TypeScript or build errors
   - Confirm no raw email content is stored anywhere in the DB (privacy check)

---

## File Structure

```
runway/
├── app/
│   ├── settings/
│   │   └── page.tsx                        (new)
│   ├── dashboard/
│   │   ├── page.tsx                        (modified: add nav)
│   │   └── loading.tsx                     (new)
│   ├── review-queue/
│   │   ├── page.tsx                        (modified: add nav)
│   │   └── loading.tsx                     (new)
│   └── api/
│       ├── auth/
│       │   └── disconnect/
│       │       └── route.ts                (new)
│       ├── rules/
│       │   ├── route.ts                    (new)
│       │   └── [id]/
│       │       └── route.ts               (new)
│       ├── items/
│       │   └── export/
│       │       └── route.ts               (new)
│       └── account/
│           └── route.ts                   (new)
```

---

## Tech & Libraries

| Library | Purpose | Reference |
|---|---|---|
| `better-sqlite3` | Rules CRUD, bulk delete for account deletion, CSV data query | `ai/context7/better-sqlite3.md` |
| `next-auth` | Session for disconnect, server-side sign-out | `ai/context7/nextjs.md` |
| Tailwind CSS | Settings layout, modal, responsive nav | — |

---

## Testing Strategy

1. Load `/settings` — confirm all four sections render with correct data
2. Test Gmail disconnect: click "Disconnect", confirm redirect to `/signin`, confirm re-auth is required
3. Test rule deletion: delete a rule, trigger a new scan with a matching item — confirm the item goes to Gemini (no rule hit)
4. Test CSV export: click "Export CSV", open the downloaded file — confirm all columns present, row count matches DB
5. Test delete account: type "DELETE" in the modal, submit — confirm all DB tables are empty for that user, confirm redirect to `/signin`
6. Test delete account guard: submit without typing "DELETE" — confirm the action is blocked
7. Run `next build` — confirm zero errors and zero TypeScript errors
8. Load each page at 375px width — confirm layout is usable (no horizontal overflow)

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| `rules` and `budgets` tables lack `user_id` (schema gap) | Add `user_id` column to both tables in `lib/migrations.ts` using `ALTER TABLE ... ADD COLUMN` with `IF NOT EXISTS` guard — this is a backward-compatible migration |
| Delete account misses a table (data leak) | Enumerate every table explicitly in the DELETE endpoint; add a comment listing all tables |
| CSV with special characters (commas, quotes in item names) | Wrap all string fields in double quotes and escape internal double quotes per RFC 4180 |
| Token revoke call fails (Google API error) | Log the error but proceed with local sign-out regardless — don't leave user stuck on the settings page |
| `next build` fails due to missing types | Run `tsc --noEmit` frequently during development; fix errors before this phase |

---

## Deliverables

- `app/settings/page.tsx` — Gmail status, rules list, CSV export, delete account
- `app/api/auth/disconnect/route.ts` — OAuth token revocation
- `app/api/rules/route.ts` and `app/api/rules/[id]/route.ts` — rules CRUD
- `app/api/items/export/route.ts` — CSV download
- `app/api/account/route.ts` — full account + data deletion
- Persistent navigation across all authenticated pages
- `loading.tsx` files for dashboard and review queue
- Clean `next build` with zero errors
- MVP feature-complete: all 7 MVP features from `aiDocs/mvp.md` implemented and working end-to-end
