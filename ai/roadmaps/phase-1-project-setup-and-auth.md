# Phase 1 — Project Setup & Auth

**Timeline:** Days 1–2
**Status:** Not Started
**Roadmap:** [2026-02-28-roadmap-phase1-project-setup-and-auth.md](./2026-02-28-roadmap-phase1-project-setup-and-auth.md) — Track progress

---

## Overview

Bootstrap the Next.js application, establish the SQLite database with the full MVP schema, and wire up Google OAuth using NextAuth.js. When this phase is complete, a user can sign in with Google, their session is persisted server-side, and the project structure is ready for every subsequent phase.

---

## Prerequisites

None. This is the first phase.

---

## Success Criteria

- `npx next dev` starts without errors
- Visiting `/` redirects unauthenticated users to a sign-in page
- Clicking "Sign in with Google" completes the OAuth flow and returns the user to `/dashboard`
- The SQLite database file is created on first run with all four tables present (`receipts`, `line_items`, `budgets`, `rules`)
- A `GET /api/auth/session` returns a valid session object for a signed-in user
- Environment variables are documented in `.env.example`; no secrets are committed

---

## Implementation Steps

1. **Initialize the Next.js project**
   - File: root
   - Run `npx create-next-app@latest runway --ts --tailwind --app --no-src-dir --import-alias "@/*"`
   - Delete the boilerplate content from `app/page.tsx`, `app/globals.css`

2. **Install dependencies**
   - File: `package.json`
   - Run: `npm install next-auth better-sqlite3 uuid`
   - Run: `npm install -D @types/better-sqlite3`
   - Do not install an ORM — queries are written directly via `better-sqlite3`

3. **Configure environment variables**
   - File: `.env.local` (gitignored), `.env.example` (committed)
   - Required vars:
     ```
     NEXTAUTH_URL=http://localhost:3000
     NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
     GOOGLE_CLIENT_ID=
     GOOGLE_CLIENT_SECRET=
     DATABASE_PATH=./runway.db
     ```
   - Gotcha: `NEXTAUTH_URL` must match the OAuth redirect URI registered in Google Cloud Console exactly

4. **Create the database module**
   - File: `lib/db.ts`
   - Open (or create) the SQLite file at `process.env.DATABASE_PATH`
   - Export a single shared `db` instance — `better-sqlite3` is synchronous; do not wrap calls in Promises
   - See `ai/context7/better-sqlite3.md` for connection setup

5. **Run migrations on startup**
   - File: `lib/migrations.ts`
   - Call `db.exec(sql)` with the full schema from `aiDocs/context.md` (all four `CREATE TABLE IF NOT EXISTS` statements)
   - Import and call this function from `lib/db.ts` so migrations run before any query executes
   - Schema:
     - `receipts (id TEXT PK, user_id, retailer, transaction_date, subtotal, tax, total, order_number, raw_email_id, parsed_at)`
     - `line_items (id AUTOINCREMENT, receipt_id FK, raw_name, name, quantity, unit_price, total_price, category, subcategory, confidence, user_overridden)`
     - `budgets (id AUTOINCREMENT, category, subcategory, month, amount)`
     - `rules (id AUTOINCREMENT, match_pattern, category, subcategory, created_from)`

6. **Configure NextAuth**
   - File: `app/api/auth/[...nextauth]/route.ts`
   - Use the `GoogleProvider` with `gmail.readonly` scope appended to the default scopes
   - Store the access token and refresh token in the JWT callback so downstream API routes can call the Gmail API on the user's behalf
   - See `ai/context7/nextjs.md` for App Router route handler patterns
   - Gotcha: Google requires the `access_type=offline` param to issue a refresh token — pass it via `authorization.params` in the provider config

7. **Seed default categories**
   - File: `lib/migrations.ts` (extend the migration function)
   - After creating tables, insert the 9 default categories from `aiDocs/context.md` into `budgets` only if the table is empty
   - Categories: Groceries, Household, Baby & Kids, Health & Wellness, Personal Care, Electronics, Clothing & Apparel, Pet Supplies, Other

8. **Create auth middleware**
   - File: `middleware.ts` (root)
   - Use NextAuth's `withAuth` middleware to protect all routes under `/dashboard` and `/api` (except `/api/auth/*`)
   - Unauthenticated requests redirect to `/signin`

9. **Build the sign-in page**
   - File: `app/signin/page.tsx`
   - Render a single "Sign in with Google" button that calls `signIn('google')`
   - Keep the UI minimal — a centered card with the app name, one-line value prop, and the sign-in button

10. **Add a placeholder dashboard route**
    - File: `app/dashboard/page.tsx`
    - Render a static "Dashboard coming in Phase 5" placeholder — just enough to confirm the auth redirect works

---

## File Structure

```
runway/
├── .env.example
├── .env.local                  (gitignored)
├── middleware.ts
├── runway.db                   (gitignored, created at runtime)
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx                (redirects to /signin or /dashboard)
│   ├── signin/
│   │   └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx            (placeholder)
│   └── api/
│       └── auth/
│           └── [...nextauth]/
│               └── route.ts
├── lib/
│   ├── db.ts
│   └── migrations.ts
└── package.json
```

---

## Tech & Libraries

| Library | Purpose | Reference |
|---|---|---|
| `next` | Framework, App Router, API routes | `ai/context7/nextjs.md` |
| `next-auth` | Google OAuth, session management | — |
| `better-sqlite3` | SQLite database driver | `ai/context7/better-sqlite3.md` |
| `uuid` | Generating `receipts.id` values | — |
| Tailwind CSS | Utility-first styling | (installed by `create-next-app`) |

---

## Testing Strategy

1. Start the dev server: `npx next dev`
2. Visit `http://localhost:3000` — confirm redirect to `/signin`
3. Click "Sign in with Google" — complete the OAuth flow
4. Confirm redirect to `/dashboard` with the placeholder page
5. Open a SQLite viewer (e.g., `npx @sqlitecloud/cli` or DB Browser for SQLite) and verify all four tables exist
6. Call `GET /api/auth/session` in the browser — confirm a JSON session object is returned with `user.email` set
7. Sign out and confirm `/dashboard` redirects back to `/signin`

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Google OAuth redirect URI mismatch | Register both `http://localhost:3000/api/auth/callback/google` and the production Vercel URL in Google Cloud Console before starting |
| `gmail.readonly` scope requires Google verification for public apps | Stay under 100 users (internal testing exemption per `aiDocs/context.md`); add CASA to the project backlog |
| `better-sqlite3` requires native compilation | If CI or Vercel fails to build, pin a compatible Node.js version and ensure `@types/better-sqlite3` is installed |
| Refresh token not returned on subsequent sign-ins | Set `prompt: 'consent'` in `authorization.params` during development so a refresh token is always issued |

---

## Deliverables

- Working Next.js app at `http://localhost:3000`
- Google OAuth sign-in → session → redirect to `/dashboard`
- SQLite database with all four tables created on first run
- `lib/db.ts` and `lib/migrations.ts` modules usable by all future phases
- `.env.example` documenting all required environment variables
