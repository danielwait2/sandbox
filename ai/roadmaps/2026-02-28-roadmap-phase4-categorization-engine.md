# Phase 4 Roadmap: Categorization Engine

**Status:** In Progress
**Timeline:** Days 7–8
**Detailed Plan:** [phase-4-categorization-engine.md](./phase-4-categorization-engine.md)

---

## ⚠️ Development Philosophy

**Avoid over-engineering, cruft, and legacy-compatibility features in this clean code project.**

- Build only what's needed for this phase
- No "just in case" features
- Delete unused code immediately
- Keep it simple and focused

---

## Quick Overview

Assign a category to every line item using a two-step hybrid: rules-based matching first (deterministic, free), Gemini fallback for unknowns. Items where confidence is below 0.80 are flagged for the review queue. This phase makes all line item data queryable by category and creates the feedback loop that the review queue (Phase 6) trains.

---

## Task Checklist

### Taxonomy & Rules Engine
- [x] `lib/categories.ts` — 9-category taxonomy constant with subcategories
- [x] `lib/rulesEngine.ts` — substring matcher against `rules` table, module-level cache, `clearRulesCache()`

### Gemini Categorizer
- [x] `lib/categorizer.ts` — `categorizeWithGemini()` with prompt, JSON parsing, fallback on error
- [x] `lib/categorizer.ts` — `categorizeItems(userId)` batch pipeline: rules first, Gemini fallback, DB update

### Wire Into Scan
- [x] Call `categorizeItems()` in `POST /api/receipts/scan` after parsing
- [x] Return `{ categorized, reviewQueue }` counts in scan summary

### API Routes
- [x] `app/api/items/route.ts` — GET all items with optional `category` and `month` query filters
- [x] `app/api/items/[id]/categorize/route.ts` — PATCH: update category, set `user_overridden = 1`, create rule, clear cache

---

## Success Criteria

- [ ] Every `line_items` row has a non-null `category` after a full scan
- [ ] Rules hits bypass Gemini (no API call, `confidence = 1.0`)
- [ ] Items with `confidence < 0.80` are queryable (review queue data exists)
- [ ] `GET /api/items` returns items filterable by category and month
- [ ] `PATCH /api/items/[id]/categorize` updates item and creates a rule
- [ ] ≥85% of spot-checked items land in the correct category

---

## Key Deliverables

- [x] `lib/categories.ts` — taxonomy constant
- [x] `lib/rulesEngine.ts` — rules matcher with cache
- [x] `lib/categorizer.ts` — Gemini fallback + batch pipeline
- [x] `app/api/items/route.ts` — filterable items endpoint
- [x] `app/api/items/[id]/categorize/route.ts` — recategorize + rule creation

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
**Last Updated:** 2026-02-28 (all tasks complete; success criteria blocked on live validation)
**Next Phase:** [Phase 5 Roadmap](./2026-02-28-roadmap-phase5-dashboard.md)
