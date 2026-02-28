# Runway — AI Agent Instructions

Runway is a consumer web app that extracts line items from Gmail receipt emails and displays item-level budget dashboards.

> These instructions apply to ALL AI agents working in this repo (Claude Code, Codex, etc.).

---

## Before Every Response

Read `aiDocs/context.md` before responding to any task in this project. It contains the tech stack, architecture, database schema, constraints, and glossary. Do not assume defaults that contradict it.

---

## Tech Stack (Do Not Deviate Without Asking)

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Auth:** NextAuth.js + Google OAuth
- **Database:** SQLite via `better-sqlite3` (no Supabase, no PostgreSQL)
- **LLM / Parsing:** Gemini API (not GPT-4o, not Claude)
- **Hosting:** Vercel

---

## Autonomous Execution Mode

This project is designed to be executed autonomously by an AI agent with no human input required. Follow these rules exactly:

### How to Work Through the Roadmap

1. Read `ai/roadmaps/high-level_mvp-project-roadmap.md` to understand the phase order and dependencies
2. Find the lowest-numbered phase whose roadmap status is **Not Started** or **In Progress**
3. Open that phase's roadmap doc (e.g. `ai/roadmaps/2026-02-28-roadmap-phase1-*.md`) and its detailed plan (e.g. `ai/roadmaps/phase-1-*.md`)
4. Execute tasks in order, one at a time
5. After completing each task: check it off in the roadmap doc, commit, and push to `main`
6. After completing all tasks in a phase: verify success criteria, check off deliverables, update status to **Complete**, commit, and push
7. Move to the next phase and repeat

### Commit & Push Rules (Autonomous Mode)

- **Commit after every completed task** — do not batch multiple tasks into one commit
- **Push to `main` immediately after every commit** — no feature branches
- Commit message format: `feat(phase-N): <short description of the task just completed>`
- Example: `feat(phase-1): add SQLite migrations for all four tables`
- After a full phase is done, add a summary commit: `feat(phase-N): complete phase N — <phase name>`

### Roadmap Tracking (Required After Every Task)

After completing a task, immediately update the roadmap doc before committing:
- Check off the completed task: change `- [ ]` to `- [x]`
- Update `**Status:**` to `In Progress` when the first task is done
- Update `**Status:**` to `Complete` when all tasks and success criteria are met
- Update `**Last Updated:**` to today's date

### Decision Rules (No Human Input Required)

- If a detail is ambiguous, choose the simplest implementation that satisfies the success criteria
- If a file already exists and conflicts, prefer the existing file's structure — do not rewrite unless the plan explicitly requires it
- If a dependency is missing (npm package not installed), install it and commit the `package.json` change as its own step
- If a build or type error is introduced, fix it before moving on — do not leave broken state in `main`
- Never skip a task — if a task cannot be completed, leave it unchecked and add a note in the roadmap's **Notes & Decisions** section, then continue with the next task

### Handling Blocked Tasks & User Input

If a task is blocked (missing API key, missing credential, missing env var, or any other external dependency):

1. Append the blocked item to `ai/todos/blocked.md` in this format:
   ```
   - [ ] [Phase N] <what is needed> — <why it's needed> — added <date>
   ```
2. Add a placeholder or stub so the code still compiles (e.g. `process.env.GEMINI_API_KEY ?? ''`)
3. Leave a `TODO:` comment at the exact line where the real value is needed
4. Continue to the next task immediately — do not wait or pause

If a human sends a message or provides input during execution:

1. Read it and determine if it is actionable
2. If actionable, append it to `ai/todos/blocked.md` as a new item
3. Do not stop or wait for further clarification — continue executing the current task
4. The human can review `ai/todos/blocked.md` at any time to see what needs their attention

`ai/todos/blocked.md` is the single handoff point between the agent and humans. Check it at the start of each phase — if any blocked items from a prior phase are now unblocked (e.g. an API key was added), resolve them before starting new tasks.

---

## Workflow Rules

- **Branch:** Always work on `main` directly
- **Commits:** Conventional commits — `feat:`, `fix:`, `chore:`, `refactor:`. Keep messages concise.
- **Auto-commit:** Commit after every completed task without waiting for human approval
- **Auto-push:** Push to `main` immediately after every commit without waiting for human approval
- **Tests:** Write tests for parsing logic and categorization rules. Skip tests for UI/layout unless asked.

---

## Code Style

- TypeScript everywhere
- Prefer explicit types over `any`
- Keep API routes thin — business logic goes in `/lib`
- Do not add comments unless the logic is genuinely non-obvious
- Do not add error handling for scenarios that can't happen

---

## Key Docs

- Full PRD: `aiDocs/prd.md`
- MVP spec + schema: `aiDocs/mvp.md`
- Detailed context: `aiDocs/context.md`
- High-level roadmap: `ai/roadmaps/high-level_mvp-project-roadmap.md`
- Phase roadmaps: `ai/roadmaps/2026-02-28-roadmap-phase*.md`
- Phase plans: `ai/roadmaps/phase-*.md`
