# Phase 4 — Categorization Engine

**Timeline:** Days 7–8
**Status:** Not Started
**Roadmap:** [2026-02-28-roadmap-phase4-categorization-engine.md](./2026-02-28-roadmap-phase4-categorization-engine.md) — Track progress

---

## Overview

Assign a category (and optional subcategory) to every `line_items` row. The engine runs rules-based matching first — deterministic, instant, no API cost. Items not matched by a rule fall back to Gemini for classification. Items where Gemini confidence is below 0.80 are flagged for the review queue (`user_overridden = 0`, `confidence < 0.80`). When this phase is complete, every line item has a category and the review queue has its initial population.

---

## Prerequisites

- Phase 1 complete: SQLite schema including `rules` table
- Phase 3 complete: `line_items` rows exist with `raw_name` and `name` fields; `category` is empty/null

---

## Success Criteria

- Every `line_items` row has a non-null `category` after the categorization pipeline runs
- Items matching a rule in the `rules` table get the rule's category instantly (no Gemini call)
- Items not matched by rules go to Gemini and receive a category + confidence score
- Items with `confidence < 0.80` are accessible via `GET /api/review-queue` (Phase 6 UI, but the data must exist here)
- `GET /api/items` returns all items with their categories and confidence scores
- ≥85% of auto-categorized items land in the correct category on spot-check

---

## Implementation Steps

1. **Define the category taxonomy as a constant**
   - File: `lib/categories.ts`
   - Export `CATEGORIES` — an object mapping each category name to its allowed subcategories
   - Source of truth: the taxonomy table in `aiDocs/context.md`
   - Export `DEFAULT_CATEGORIES` — the ordered list of 9 category names used for seeding

2. **Build the rules engine**
   - File: `lib/rulesEngine.ts`
   - Export `applyRules(itemName: string): { category: string; subcategory: string | null } | null`
   - Fetch all rows from the `rules` table on first call; cache in module-level memory (rules change rarely)
   - Match `itemName.toLowerCase()` against `match_pattern` using `String.includes` (substring match)
   - Return the first match's `category` and `subcategory`, or `null` if no rule matches
   - Gotcha: load rules fresh from DB if a new rule is added (expose a `clearRulesCache()` export)

3. **Build the Gemini categorization function**
   - File: `lib/categorizer.ts`
   - Export `categorizeWithGemini(itemName: string): Promise<{ category: string; subcategory: string | null; confidence: number }>`
   - Prompt template:
     ```
     Categorize this grocery/retail item into exactly one of the following categories.
     Return ONLY valid JSON — no markdown, no explanation.

     Categories: Groceries, Household, Baby & Kids, Health & Wellness, Personal Care,
     Electronics, Clothing & Apparel, Pet Supplies, Other

     Subcategories (use only if applicable):
     Groceries: Produce, Dairy & Eggs, Meat & Seafood, Pantry, Snacks, Beverages, Frozen, Bakery
     Household: Cleaning, Paper Goods, Storage & Organization
     Baby & Kids: Diapers, Formula, Clothing, Toys
     Health & Wellness: OTC Medicine, First Aid, Supplements
     Personal Care: Beauty, Hygiene
     Electronics: Devices, Accessories
     Pet Supplies: Food, Accessories

     Item name: "<ITEM_NAME>"

     Required format:
     { "category": "...", "subcategory": "..." | null, "confidence": 0.0–1.0 }
     ```
   - Parse response with the same JSON/fence-stripping logic from Phase 3
   - Return `{ category: 'Other', subcategory: null, confidence: 0.5 }` on any parse failure

4. **Build the categorization pipeline**
   - File: `lib/categorizer.ts`
   - Export `categorizeItems(userId: string): Promise<{ categorized: number; rulesHit: number; llmUsed: number; reviewQueue: number }>`
   - Fetch all `line_items` rows where `category IS NULL OR category = ''` joined to `receipts.user_id = userId`
   - For each item:
     1. Try `applyRules(item.name)` → if match, use result, set `confidence = 1.0`
     2. Else call `categorizeWithGemini(item.name)` → use result
     3. Update `line_items` row: set `category`, `subcategory`, `confidence`
   - Use a `better-sqlite3` prepared statement for the update — run in a transaction per batch of 50 items
   - See `ai/context7/better-sqlite3.md` for prepared statements

5. **Wire categorization into the scan pipeline**
   - File: `app/api/receipts/scan/route.ts`
   - After `processUnparsedReceipts` completes, call `categorizeItems(userId)`
   - Return updated summary: `{ scanned, new, skipped, parsed, parseFailed, categorized, reviewQueue }`

6. **Create the items API route**
   - File: `app/api/items/route.ts`
   - Method: `GET`
   - Query params: `category` (optional filter), `month` (optional filter: `YYYY-MM`)
   - Return all `line_items` joined to `receipts` for the authenticated user
   - Sort by `total_price DESC` by default

7. **Create the re-categorize API route**
   - File: `app/api/items/[id]/categorize/route.ts`
   - Method: `PATCH`
   - Body: `{ category: string; subcategory?: string }`
   - Update `line_items`: set `category`, `subcategory`, `user_overridden = 1`, `confidence = 1.0`
   - Create a new row in `rules`: `{ match_pattern: item.name, category, subcategory, created_from: 'manual' }`
   - Call `clearRulesCache()` to invalidate the in-memory rules cache

---

## File Structure

```
runway/
├── lib/
│   ├── categories.ts           (new)
│   ├── rulesEngine.ts          (new)
│   └── categorizer.ts          (new)
└── app/
    └── api/
        ├── receipts/
        │   └── scan/
        │       └── route.ts    (modified: calls categorizeItems)
        └── items/
            ├── route.ts        (new)
            └── [id]/
                └── categorize/
                    └── route.ts (new)
```

---

## Tech & Libraries

| Library | Purpose | Reference |
|---|---|---|
| `@google/generative-ai` | Gemini fallback categorization | `ai/context7/gemini-sdk.md` |
| `better-sqlite3` | Rules lookup, line_items update | `ai/context7/better-sqlite3.md` |

---

## Testing Strategy

1. Unit-test `rulesEngine.ts`:
   - Seed a rule `{ match_pattern: 'pampers', category: 'Baby & Kids', subcategory: 'Diapers' }`
   - `applyRules('Pampers Swaddlers Size 3')` → `{ category: 'Baby & Kids', subcategory: 'Diapers' }`
   - `applyRules('Organic Whole Milk')` → `null`
2. Unit-test `categorizeWithGemini` with a mock Gemini response — confirm JSON parsing and fence stripping
3. Integration test: seed 5 `line_items` rows with known item names, run `categorizeItems`, confirm all have non-null `category`
4. Spot-check 20 real items — confirm ≥17 land in the correct category
5. Confirm items with `confidence < 0.80` are queryable via the review-queue filter
6. Test `PATCH /api/items/[id]/categorize` — confirm `user_overridden = 1` and a new rule is created

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Gemini categorizes ambiguous items inconsistently | Include subcategory examples in the prompt; test with a fixed item set across multiple runs |
| Rules engine has false positives (e.g., "PAMPERS WIPES" matches a rule for "pampers" but wrong subcategory) | Use the most specific `match_pattern` possible; user corrections in Phase 6 refine rules over time |
| Gemini API latency slows the scan pipeline | Items are categorized in batch after parsing; user sees a loading state — acceptable for MVP |
| Large batches of uncategorized items trigger many Gemini calls | Batch categorization per-user; add a simple rate-limit guard (max 100 Gemini calls per scan) |

---

## Deliverables

- `lib/categories.ts` — canonical taxonomy constant
- `lib/rulesEngine.ts` — rules-based matcher with cache invalidation
- `lib/categorizer.ts` — Gemini fallback + batch pipeline
- `app/api/items/route.ts` — filterable items endpoint
- `app/api/items/[id]/categorize/route.ts` — re-categorize + auto-rule-creation endpoint
- All `line_items` rows have a non-null `category` after a full scan cycle
- Low-confidence items (`confidence < 0.80`) flagged and queryable for the review queue
