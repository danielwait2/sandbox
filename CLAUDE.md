# Runway — Claude Code Instructions

Runway is a consumer web app that extracts line items from Gmail receipt emails and displays item-level budget dashboards.

## Before Every Response

Read `aiDocs/context.md` before responding to any task in this project. It contains the tech stack, architecture, database schema, constraints, and glossary. Do not assume defaults that contradict it.

## Tech Stack (Do Not Deviate Without Asking)

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Auth:** NextAuth.js + Google OAuth
- **Database:** SQLite via `better-sqlite3` (no Supabase, no PostgreSQL)
- **LLM / Parsing:** Gemini API (not GPT-4o, not Claude)
- **Hosting:** Vercel

## Workflow Rules

- **Branching:** Feature branches off `main`. Name: `feat/<short-description>` or `fix/<short-description>`.
- **Commits:** Conventional commits — `feat:`, `fix:`, `chore:`, `refactor:`. Keep messages concise.
- **No auto-commit:** Never commit without being explicitly asked.
- **No auto-push:** Never push to remote without being explicitly asked.
- **Tests:** Write tests for parsing logic and categorization rules. Skip tests for UI/layout unless asked.

## Code Style

- TypeScript everywhere
- Prefer explicit types over `any`
- Keep API routes thin — business logic goes in `/lib`
- Do not add comments unless the logic is genuinely non-obvious
- Do not add error handling for scenarios that can't happen

## Key Docs

- Full PRD: `aiDocs/prd.md`
- MVP spec + schema: `aiDocs/mvp.md`
- Detailed context: `aiDocs/context.md`
