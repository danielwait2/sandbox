# Runway — MVP Project Roadmap

> Scoped strictly to `aiDocs/mvp.md`. Features not in the MVP do not appear here.

---

## Phases at a Glance

| # | Phase | Timeline | Status | Summary |
|---|---|---|---|---|
| 1 | Project Setup & Auth | Days 1–2 | Complete | Bootstrap Next.js app, configure SQLite schema, wire up Google OAuth via NextAuth. |
| 2 | Gmail Ingestion & Receipt Detection | Days 3–4 | Complete | Use Gmail API to fetch emails, detect Walmart/Costco receipts by sender domain, and deduplicate. |
| 3 | Receipt Parsing | Days 5–6 | Complete | Send raw email HTML to Gemini, parse structured line-item JSON, and persist to SQLite. |
| 4 | Categorization Engine | Days 7–8 | Complete | Apply rules-based matching first, fall back to Gemini for unknowns, score confidence, and route low-confidence items to the review queue. |
| 5 | Dashboard | Days 9–11 | Complete | Build the category spend overview, time toggle, summary stats, and category drill-down UI. |
| 6 | Review Queue & Rules | Days 12–13 | Complete | Surface low-confidence items for user confirmation; persist confirmed mappings as permanent rules. |
| 7 | Settings & Polish | Days 14–15 | Complete | Gmail disconnect, custom rules management, CSV export, and delete-account. |

| 9 | Receipt List & Detail | Days 19–20 | Not Started | `/receipts` page listing all ingested receipts with a drill-down to every line item on a single trip. Closes the trust gap — users can verify parsing is correct. |

**Total estimated sprint:** 15 days (MVP complete; phases 8+ are post-MVP improvements)

---

## Phase Dependencies

```
Phase 1 — Project Setup & Auth
    │
    └──▶ Phase 2 — Gmail Ingestion & Receipt Detection
              │
              └──▶ Phase 3 — Receipt Parsing
                        │
                        └──▶ Phase 4 — Categorization Engine
                                  │
                        ┌─────────┴──────────┐
                        ▼                    ▼
               Phase 5 — Dashboard   Phase 6 — Review Queue & Rules
                        │                    │
                        └─────────┬──────────┘
                                  ▼
                        Phase 7 — Settings & Polish
```

**Rule:** Each phase may only begin once all phases it depends on are complete.

---

## Dependency Narrative

- **Phase 1** has no prerequisites. It establishes the project skeleton every subsequent phase builds on.
- **Phase 2** requires Phase 1 (auth tokens stored in the DB, Next.js routes available).
- **Phase 3** requires Phase 2 (raw email content must be fetched before it can be parsed).
- **Phase 4** requires Phase 3 (line items must exist in the DB before they can be categorized).
- **Phase 5** requires Phase 4 (dashboard reads categorized line items and budget data).
- **Phase 6** requires Phase 4 (review queue surfaces items that categorization flagged as low-confidence).
- **Phase 7** requires Phases 5 and 6 (settings touch Gmail connection state, rules, and all stored data).

---

## MVP Success Criteria (from `aiDocs/mvp.md`)

- [ ] ≥85% of Walmart/Costco receipts parse successfully (spot-check 50 receipts)
- [ ] ≥50 users complete Gmail OAuth and reach the dashboard within 30 days
- [ ] ≥30% of users return to the dashboard at least once/week after week 2
- [ ] ≥85% of auto-categorized items confirmed correct via review queue data
- [ ] ≥25% of active users say they'd pay for it when surveyed
- [ ] At least 3 users independently call it "must-have" in feedback
