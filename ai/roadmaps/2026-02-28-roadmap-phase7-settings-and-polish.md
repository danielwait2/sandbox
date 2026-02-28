# Phase 7 Roadmap: Settings & Polish

**Status:** In Progress
**Timeline:** Days 14–15
**Detailed Plan:** [phase-7-settings-and-polish.md](./phase-7-settings-and-polish.md)

---

## ⚠️ Development Philosophy

**Avoid over-engineering, cruft, and legacy-compatibility features in this clean code project.**

- Build only what's needed for this phase
- No "just in case" features
- Delete unused code immediately
- Keep it simple and focused

---

## Quick Overview

Build the Settings page covering Gmail disconnect, custom rules management, CSV data export, and delete-account with full data wipe. Add persistent navigation across all authenticated pages and apply a final polish pass. When this phase is done the MVP is feature-complete.

---

## Task Checklist

### API Routes
- [x] `app/api/auth/disconnect/route.ts` — DELETE: revoke OAuth token, sign out user
- [x] `app/api/rules/route.ts` — GET all rules, POST new rule
- [x] `app/api/rules/[id]/route.ts` — DELETE rule, call `clearRulesCache()`
- [ ] `app/api/items/export/route.ts` — GET: stream CSV of all user line items
- [ ] `app/api/account/route.ts` — DELETE: wipe all user data from all tables, sign out

### Settings Page
- [ ] `app/settings/page.tsx` — four sections: Gmail Connection, Custom Rules, Export Data, Danger Zone
- [ ] Gmail section: show email + connected status, "Disconnect Gmail" button
- [ ] Rules section: list all rules with delete per row
- [ ] Export section: "Export CSV" triggers browser download
- [ ] Danger Zone: "Delete Account" with confirmation modal (type "DELETE")

### Schema Fix
- [x] Add `user_id` to `rules` table migration (same fix as `budgets` in Phase 5)

### Navigation & Polish
- [ ] Persistent nav bar across `/dashboard`, `/review-queue`, `/settings` with active link highlight
- [ ] `app/dashboard/loading.tsx` and `app/review-queue/loading.tsx` skeleton screens
- [ ] Verify responsive layout at 375px on all pages
- [ ] Run `next build` — fix all TypeScript and build errors
- [ ] Confirm no raw email content stored anywhere in the DB

---

## Success Criteria

- [ ] `/settings` loads with all four sections populated
- [ ] Gmail disconnect revokes token and redirects to `/signin`
- [ ] Rule deletion removes rule from DB and cache
- [ ] CSV export downloads a valid file with all item columns
- [ ] Delete account wipes all user rows from every table and signs out
- [ ] `next build` completes with zero errors

---

## Key Deliverables

- [ ] `app/settings/page.tsx` — full settings UI
- [ ] `app/api/auth/disconnect/route.ts`
- [ ] `app/api/rules/route.ts` and `app/api/rules/[id]/route.ts`
- [ ] `app/api/items/export/route.ts`
- [ ] `app/api/account/route.ts`
- [ ] Persistent nav bar on all authenticated pages
- [ ] Clean `next build` — MVP feature-complete

---

## Notes & Decisions

<!-- Track decisions made during implementation here -->

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
**Next Phase:** MVP Complete 🎉
