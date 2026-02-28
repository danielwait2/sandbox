# Phase 6 Roadmap: Review Queue & Rules

**Status:** Complete
**Timeline:** Days 12–13
**Detailed Plan:** [phase-6-review-queue-and-rules.md](./phase-6-review-queue-and-rules.md)

---

## ⚠️ Development Philosophy

**Avoid over-engineering, cruft, and legacy-compatibility features in this clean code project.**

- Build only what's needed for this phase
- No "just in case" features
- Delete unused code immediately
- Keep it simple and focused

---

## Quick Overview

Surface low-confidence items (confidence < 0.80) for user review via Confirm / Recategorize / Skip actions. Confirmed and corrected items create permanent rules that apply to future scans. This phase closes the accuracy feedback loop and trains the rules engine over time.

---

## Task Checklist

### API Routes
- [x] `app/api/review-queue/route.ts` — GET items where `confidence < 0.80` and `user_overridden = 0`
- [x] `app/api/items/[id]/skip/route.ts` — PATCH: set `user_overridden = 1`, no rule created

### UI
- [x] `app/review-queue/components/ReviewCard.tsx` — item card with Confirm / Recategorize / Skip buttons and inline category picker
- [x] `app/review-queue/page.tsx` — fetch queue, render cards, remove card on action (optimistic), empty state

### Dashboard Integration
- [x] Add review queue badge count to `app/dashboard/page.tsx` header with link to `/review-queue`

### Rules Verification
- [x] Confirm `clearRulesCache()` is called on every Confirm/Recategorize action (via existing `PATCH /api/items/[id]/categorize`)
- [x] Verify new rules apply on the next scan

---

## Success Criteria

- [x] `GET /api/review-queue` returns only items with `confidence < 0.80` and `user_overridden = 0`
- [x] Confirm: item exits queue, `user_overridden = 1`, rule created for item name → category
- [x] Recategorize: item updated with new category, rule created, exits queue
- [x] Skip: item exits queue, `user_overridden = 1`, no rule created
- [x] Dashboard badge reflects current queue count
- [x] New rule from Confirm/Recategorize applied on next scan

---

## Key Deliverables

- [x] `app/api/review-queue/route.ts`
- [x] `app/api/items/[id]/skip/route.ts`
- [x] `app/review-queue/page.tsx`
- [x] `app/review-queue/components/ReviewCard.tsx`
- [x] Dashboard badge count linking to `/review-queue`

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
**Next Phase:** [Phase 7 Roadmap](./2026-02-28-roadmap-phase7-settings-and-polish.md)
