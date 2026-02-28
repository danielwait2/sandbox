# Phase 1 Roadmap: Project Setup & Auth

**Status:** In Progress
**Timeline:** Days 1–2
**Detailed Plan:** [phase-1-project-setup-and-auth.md](./phase-1-project-setup-and-auth.md)

---

## ⚠️ Development Philosophy

**Avoid over-engineering, cruft, and legacy-compatibility features in this clean code project.**

- Build only what's needed for this phase
- No "just in case" features
- Delete unused code immediately
- Keep it simple and focused

---

## Quick Overview

Bootstrap the Next.js app with Tailwind, wire up Google OAuth via NextAuth.js, and initialize the SQLite database with the full MVP schema. By the end of this phase a user can sign in with Google and land on a placeholder dashboard — every other phase builds directly on this foundation.

---

## Task Checklist

### Project Init
- [x] `create-next-app` with TypeScript, Tailwind, App Router
- [x] Install `next-auth`, `better-sqlite3`, `@types/better-sqlite3`, `uuid`
- [x] Create `.env.example` and `.env.local` with all required vars

### Database
- [x] `lib/db.ts` — singleton `better-sqlite3` connection
- [x] `lib/migrations.ts` — `CREATE TABLE IF NOT EXISTS` for all 4 tables on startup
- [x] Seed 9 default categories into `budgets` if empty

### Auth
- [x] `app/api/auth/[...nextauth]/route.ts` — GoogleProvider with `gmail.readonly` scope + `access_type=offline`
- [x] Store `accessToken` and `refreshToken` in JWT callback
- [x] `middleware.ts` — protect `/dashboard` and `/api/*` (except `/api/auth/*`)

### Pages
- [x] `app/signin/page.tsx` — centered sign-in card, "Sign in with Google" button
- [ ] `app/dashboard/page.tsx` — placeholder ("Dashboard coming in Phase 5")
- [ ] `app/page.tsx` — redirect to `/signin` or `/dashboard` based on session

---

## Success Criteria

- [ ] `npx next dev` starts without errors
- [ ] Unauthenticated visit to `/dashboard` redirects to `/signin`
- [ ] Full Google OAuth flow completes and lands on `/dashboard`
- [ ] All 4 SQLite tables exist after first run
- [ ] `GET /api/auth/session` returns session with `user.email`
- [ ] No secrets committed — `.env.local` is gitignored

---

## Key Deliverables

- [ ] Working Next.js app at `localhost:3000`
- [ ] `lib/db.ts` and `lib/migrations.ts` (reused by all phases)
- [ ] Google OAuth sign-in → session → redirect working
- [ ] SQLite DB with schema initialized on first run
- [ ] `.env.example` documenting all required vars

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
**Next Phase:** [Phase 2 Roadmap](./2026-02-28-roadmap-phase2-gmail-ingestion-and-receipt-detection.md)
