# Blocked Items & Human Todos

> This file is maintained automatically by the AI agent.
> Humans: check this file to see what needs your attention.
> Agent: append blocked items here and keep moving. Check this at the start of each phase.

---

## Pending

- [ ] [Phase 3] Gemini free-tier quota exhausted — `gemini-2.5-flash` limited to 20 req/day; parse queue retries burn through quota. Options: (a) enable billing on the Google AI project, (b) switch to a model with higher free-tier limits, (c) add 429 backoff logic to `parseQueue.ts` — added 2026-02-28
- [ ] [Phase 3] ~25 unparsed receipts stuck in DB — old receipts with `parsed_at IS NULL` get retried on every scan, wasting Gemini quota. Need to either clear them or add retry limits — added 2026-02-28

---

## Resolved

- [x] [Phase 1] `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32` and add to `.env.local` — added 2026-02-28 — resolved 2026-02-28
- [x] [Phase 1] `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` — create OAuth credentials at console.cloud.google.com, enable Gmail API, add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI — added 2026-02-28 — resolved 2026-02-28
- [x] [Phase 3] `GEMINI_API_KEY` — generate at aistudio.google.com and add to `.env.local` — added 2026-02-28 — resolved 2026-02-28
