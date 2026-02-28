# Best Practices for AI-Assisted Project Setup

A reusable template for any project where you plan to build with Claude Code or similar AI coding assistants. Covers folder structure, documentation files, and workflow patterns that keep AI sessions consistent and productive.

---

## 1. The `CLAUDE.md` File (AI Instruction File)

The single most important file in your project. This is what the AI reads on every conversation start. It should contain:

| Section | Purpose |
|---|---|
| **What This Project Is** | One-paragraph summary so the AI never loses context on the product |
| **Read These First** | Ordered list of docs the AI must read before writing code |
| **Current Phase Status** | What's done, what's in progress, what's next — prevents the AI from building the wrong thing |
| **Tech Stack Table** | Every layer mapped to a specific choice — eliminates "should I use X or Y?" questions |
| **Locked Decisions (Summary)** | Bullet list of decisions that are settled — prevents re-litigation |
| **Domain-Specific Hard Lines** | Legal, regulatory, or business rules that must never be violated |
| **Workflow Rules** | Before/during/after task checklists so the AI follows your process |
| **File Structure** | Annotated tree of key paths so the AI knows where things live |
| **What Not To Do** | Explicit anti-patterns — the AI will follow these if you state them clearly |

**Key principle:** The `CLAUDE.md` is a *contract*, not a suggestion. Write it in imperative voice. Say "do not" and "always," not "try to" and "consider."

---

## 2. Documentation Folder (`aiDocs/`)

Committed to git. Contains all project knowledge that should persist across sessions and be visible to collaborators.

### Recommended files:

| File | What It Contains |
|---|---|
| `context.md` | Project overview, tech stack, architecture decisions, current focus, out-of-scope items. The "session anchor" — read first every time. |
| `decisions.md` | Locked decisions with rationale. Format: Decision → Why → When to revisit. Prevents the same debates from recurring. |
| `prd.md` | Full product requirements document. Problem, solution, scope, user stories, success metrics. |
| `changelog.md` | Append-only log. Date, what was built (technical), business impact (1–2 sentences), deferred items. |
| `copy-guidelines.md` | Voice/tone rules, canonical copy blocks, hard rules for what to never say. Critical for any product with legal or brand sensitivity. |
| `env-vars.md` | Every environment variable by phase — name, where used, client-safe or not, description. No actual values. |
| `hypothesis.md` | The founding hypothesis and falsification tests. Keeps the team honest about what they're actually testing. |
| `differentiation.md` | Competitive positioning. Who else is in the space, where you fit, why you're different. |

### Why `aiDocs/` and not just a wiki:

- **Committed to git** — versioned, reviewable, always in sync with the code
- **Always available to the AI** — no need to paste context into chat
- **Readable by humans too** — new team members get up to speed from the same docs

---

## 3. AI Workspace Folder (`ai/`)

**Gitignored.** Contains working documents that are useful during development but shouldn't be in the repo — research notes, library reference guides, local-only guides.

### Recommended structure:

```
ai/
  guides/          ← Library references, API docs, research notes
  roadmaps/        ← Phase plans + tracking checklists
```

### Roadmap files (two per phase):

1. **Phase plan** (`phase1-mvp.md`) — detailed implementation plan with architecture decisions, API designs, data models
2. **Roadmap tracker** (`roadmap-phase1-mvp.md`) — checkbox-based tracking doc with success criteria and day-by-day task lists

**Why two files:** The plan is the "what and why." The roadmap is the "is it done yet." Combining them makes both worse.

---

## 4. `.gitignore` Must-Haves

```gitignore
# AI workspace (local only, not committed)
ai/

# Editor and AI tool config
.cursorrules
.claude/

# Environment variables (never commit secrets)
.env
.env.local
.env*.local

# Dependencies (language-specific — pick what applies)
node_modules/          # JavaScript/TypeScript
vendor/                # PHP, Go
.venv/                 # Python
__pycache__/           # Python

# Build output (framework-specific — pick what applies)
.next/                 # Next.js
out/
dist/
build/

# OS files
.DS_Store
Thumbs.db

# Database files (local dev only)
*.db
*.db-shm
*.db-wal
*.sqlite

# Logs
*.log
npm-debug.log*
```

**Principle:** If it contains secrets, is machine-generated, or is only useful locally, it goes in `.gitignore`.

---

## 5. Source Code Organization

Adapt to your framework, but the principle is the same — separate concerns into clear top-level directories:

```
src/
  app/           ← Pages, routes, and entry points (framework-specific)
  components/    ← Reusable UI components
  data/          ← Static data files (mappings, constants, config)
  lib/           ← Utility functions, business logic, service clients
```

### Rules:

- **`lib/` is for pure logic** — no React, no UI. Functions here should be testable in isolation.
- **`data/` is for static mappings** — things that change rarely and are referenced by multiple components.
- **`components/` is for reusable UI** — if it's used on only one page, keep it in that page's file until you need it elsewhere.
- **Don't create abstractions for one-time operations.** Three similar lines of code is better than a premature helper.

---

## 6. Environment Variable Discipline

1. **Document every env var** in `aiDocs/env-vars.md` — name, purpose, which phase introduces it, whether it's client-safe
2. **Never expose secrets to the client bundle** — in Next.js this means no `NEXT_PUBLIC_` prefix on secrets; in Vite, no `VITE_` prefix. Know your framework's rules.
3. **Group by phase** — so you know exactly what's needed at each stage
4. **Include a setup checklist** — step-by-step for a new developer to get running
5. **Include a full reference block** — copy-paste ready `.env.local` template (no values)

---

## 7. Phased Roadmap Structure

Break the project into phases. Each phase has:

1. **A clear scope boundary** — what's in, what's explicitly out
2. **Success criteria** — checkboxes that define "done"
3. **A detailed plan** — architecture, data models, API routes, page flows
4. **A tracking doc** — day-by-day or week-by-week checkbox tracker
5. **Known gaps** — items that were deferred or partially completed, with enough context to pick them up later

**Why phases matter for AI-assisted development:**
- Prevents the AI from building Phase 3 features when you're in Phase 1
- Creates natural checkpoints for review
- Makes the `CLAUDE.md` "Current Phase Status" section meaningful

---

## 8. Changelog Discipline

Every work session gets an entry in `aiDocs/changelog.md`:

```markdown
## YYYY-MM-DD — Short Title

**What was built:**
- Technical description of changes (files modified, features added)

**Business impact:**
One or two sentences on why this matters to users or the product.

**Deferred:**
- Anything punted, with enough context to pick it up later
```

**Why this matters:**
- Creates an audit trail of what the AI built and why
- Prevents duplicate work across sessions
- Makes it easy to onboard a new collaborator (human or AI)

---

## 9. Decision Log Format

Every significant decision gets an entry in `aiDocs/decisions.md`:

```markdown
### [Decision Title]
**Decision:** One-sentence statement of what was decided.
**Why:** The reasoning — constraints, tradeoffs, evidence.
**When to revisit:** The specific trigger that would reopen this decision.
```

**The "When to revisit" field is critical.** It prevents both premature re-litigation ("but what about...") and permanent lock-in ("we decided this two years ago and never reconsidered"). Name the phase, milestone, or condition that would make this worth reopening.

---

## 10. Product Requirements Document (PRD) Structure

`aiDocs/prd.md` is the product's source of truth. A well-structured PRD has these sections:

```markdown
# [Product Name] — Product Requirements Document

## 1. Problem
What pain exists? Who has it? Why hasn't it been solved?
Include data: "X% of [target users] have never done [key action]."
List competitors and their specific gaps.

## 2. Solution
One-paragraph description. What does the product do, in concrete terms?
List the core features by name.
Name the hook — the thing that makes a user care before they commit.

## 3. Target User
Primary and secondary personas. Include age, income, motivation, and context.
Explicitly state who you are NOT targeting.

## 4. Competitive Positioning
Table: Competitor | Their moment | Their gap vs. you.
One-sentence positioning statement.

## 5. Core Product — MVP Scope
Detailed walkthrough of every screen/step. For each:
- What the user sees (copy, inputs, outputs)
- What logic runs (state lookups, calculations)
- What action the user takes (buttons, checkboxes, redirects)
End with: "What Is Explicitly Out of Scope for MVP" — a bulleted list.

## 6. Technical Decisions
Stack choices with rationale. "Web app only because..."
Framework, styling, database, auth, deployment — each with a one-sentence why.

## 7. Content & Tone
Voice description. Reading level target. Disclosure requirements.
Link to the full copy-guidelines.md for detail.

## 8. Legal / Regulatory Guardrails
What the product is and what it is NOT (e.g., "education tool, not investment adviser").
Hard lines that cannot be crossed. Conditions for revisiting.

## 9. Success Metrics
Table: Metric | Definition | MVP target.
State that these are directional, not absolute.

## 10. Build Plan
Day-by-day (or week-by-week) build schedule.
Each day: Focus area | Deliverable.

## 11. Future Phases
Bulleted list of what comes after MVP — enough to show the vision without overcommitting.
```

**Key principle:** The PRD should be specific enough that an AI (or a new developer) could build the MVP from it alone, without asking clarifying questions.

---

## 11. Hypothesis Document

`aiDocs/hypothesis.md` keeps the team honest about what they're testing. Structure:

```markdown
## The Hypothesis
One-paragraph statement of the core bet. Written as a falsifiable claim.

## Supporting Assumptions
Table with three columns:
| # | Assumption | How to test |

Each assumption must be independently testable. If any one is wrong,
it changes the product strategy.

## What Would Falsify This
Bulleted list of specific findings that would kill the hypothesis.
Use concrete thresholds: "< 20% conversion from landing page to signup"
— not vague statements like "if users don't like it."

## Falsification Tests
For each test:
- Question: What are you trying to disprove?
- Method: How did you test it? (competitor search, survey, product metrics)
- Finding: What did you find?
- Conclusion: Hypothesis falsified or not? Why?
```

**Why this matters:** Without a hypothesis doc, the AI optimizes for features instead of learning. The hypothesis doc forces every session to ask: "Does this help us validate or falsify?"

---

## 12. Competitive Differentiation Document

`aiDocs/differentiation.md` maps the competitive landscape. Structure:

```markdown
## 2x2 Positioning Grid
ASCII diagram with two axes that define your market.
Plot yourself and every competitor on it.
Your goal: occupy an empty quadrant.

## Competitor Breakdown
Table: Competitor | Their moment | Their product | Their gap vs. you.
One row per competitor. Be specific about what they do and don't cover.

## Your Differentiators
Numbered list. Each differentiator gets:
- A bold title
- 2–3 sentences explaining why it matters and how you exploit it

## Where You Are Weak
Honest assessment. Table: Weakness | Who does it better | Risk.
Link weaknesses to future phases that address them.
```

**Key principle:** Include the "Where You Are Weak" section. It builds credibility and prevents the AI from making claims the product can't back up.

---

## 13. System Architecture Document

`aiDocs/system-architecture.md` documents how the product fits into the larger system. This is often missing from projects and causes the AI to make narrow technical decisions without understanding the ecosystem.

### Sections:

**1. The Problem System**
- ASCII diagram showing the larger system your product operates in (e.g., "Customer Onboarding System," "Content Publishing Pipeline")
- Identify the primary failure point your product addresses
- State the goal of the larger system and where your product intervenes

**2. Where Your Product Sits in the Ecosystem**
- ASCII diagram showing your product as a layer between the user and external services
- Clarify what your product does and does NOT do (e.g., "aggregator only — does not process payments")
- Show the external entities your product connects to (providers, APIs, institutions)

**3. Technical Architecture (Per Phase)**
- ASCII diagram for the current phase's technical stack
- Show: browser → framework → API routes → database → external services
- Label every route, table, and client-side state source
- Create a separate diagram for future phases so the migration path is visible

**4. Data Flow — Core User Journey**
- Step-by-step flow from landing to completion
- Show what happens at each step: which function runs, what gets stored, what event fires
- Use arrows and indentation, not prose

**5. Leverage Points**
- Table: Leverage Point | Why It Matters | How the Product Exploits It
- These are the strategic insights that should inform every feature decision

**Why this matters for AI development:** Without architecture diagrams, the AI makes local decisions that don't account for the system context. The system architecture doc prevents the AI from, for example, adding a database call where client-side state is sufficient, or building a feature that crosses a regulatory boundary.

---

## 14. User Research / Survey Data Document

`aiDocs/user-survey-data.md` captures primary research. Structure:

```markdown
## Key Takeaways
Bulleted summary of the top 5–8 findings. Lead with the most actionable insights.
Include specific numbers: "X of Y respondents had never completed [key action]."

## Raw Responses
One section per respondent. Table format:
| Field | Response |
Each respondent gets their own heading (Respondent 1, 2, 3...).

## Summary Statistics
Tables aggregating responses by question:
- Distribution tables (Score | Count)
- Averages for numeric questions
- Frequency counts for multiple-choice questions
```

**Why include raw data:** The AI can reference specific respondent quotes when writing copy, designing flows, or prioritizing features. Summaries lose nuance; raw data preserves it.

**Why this matters for AI development:** Survey data directly informs:
- Which objections to address in UX copy (FAQ content)
- Which features to prioritize (barrier analysis)
- What trust signals to include (trust driver rankings)
- Pricing decisions (willingness-to-pay distribution)

---

## 15. Copy/Content Guidelines File

If your product has any user-facing text that matters (legal, brand, UX copy), create `aiDocs/copy-guidelines.md` with:

### Voice
- 3–5 adjectives that define the tone (e.g., "warm, direct, confident — not salesy, not preachy")
- A target reader description: "Write for a [persona] who has never heard of [your domain]."
- A one-sentence complexity test: "If a sentence needs a follow-up sentence to explain itself, rewrite the first sentence."

### Hard Rules
Two lists:
- **Never say:** exact phrases that are off-limits (e.g., domain-specific terms that carry legal or regulatory risk)
- **Always say:** required phrasing patterns (e.g., "here's what this is" before asking for action)

### Required Disclosures
Exact copy for disclosures that must appear on specific pages. Quote them verbatim so there's no ambiguity. Example format:
> "[Your required disclosure text here — exact wording, not paraphrased.]"

### Canonical Copy Blocks
Locked one-sentence descriptions for key concepts. These are the "source of truth" — do not paraphrase.
Include supporting context variants for when more space is available.
Include objection-handling variants (e.g., "What if [common user concern]?").

### Page-Specific Copy
For each key page/screen:
- Hero label / headline
- CTA text (primary and secondary)
- Summary labels
- Conditional copy variants (e.g., different text based on user input or context)

### Reading Level Check
A one-sentence test that defines your bar. Example: "Could a [your target user] in [their worst-case context] read this in one pass and know exactly what to do? If not, simplify."

---

## 16. Phase Plan Detail

Each phase plan (`ai/roadmaps/phase*.md`) should include:

```markdown
# Phase [N] — [Name]

**Timeline:** [duration]
**Tracking:** [link to roadmap tracker]
**Goal:** One sentence — what does this phase validate or deliver?

## Overview
One paragraph. What's being built, what's NOT being built.

## Success Criteria
Checkbox list. These define "done" for the phase.

## Prerequisites
What must be installed, configured, or completed before starting.

## Detailed Steps

### Day/Week 1 — [Focus]

**1. [Task name]**
- Specific instructions, including shell commands where applicable
- File paths to create or modify
- Data models / table schemas
- API route signatures

**2. [Task name]**
...
```

**Key details to include:**
- Exact shell commands for project setup (`npx create-next-app@latest ...`)
- Table schemas with column names, types, and constraints
- API route signatures (method, path, request/response shape)
- File paths for every new file
- What to test after each step

---

## 17. Summary Checklist for a New Project

```
[ ] CLAUDE.md — AI instruction file at project root
[ ] aiDocs/context.md — project overview and session anchor
[ ] aiDocs/decisions.md — locked decisions with rationale
[ ] aiDocs/prd.md — product requirements document (full scope + MVP scope)
[ ] aiDocs/changelog.md — append-only build log
[ ] aiDocs/env-vars.md — environment variable reference (no values)
[ ] aiDocs/copy-guidelines.md — tone, voice, legal copy rules, canonical blocks
[ ] aiDocs/hypothesis.md — founding hypothesis + falsification tests
[ ] aiDocs/differentiation.md — 2x2 grid, competitor breakdown, weaknesses
[ ] aiDocs/system-architecture.md — problem system, ecosystem, technical diagrams, data flow
[ ] aiDocs/user-survey-data.md — raw survey responses + key takeaways + summary stats
[ ] ai/roadmaps/ — phase plans + tracking docs (gitignored)
[ ] ai/guides/ — library references, API docs, research notes (gitignored)
[ ] .gitignore — secrets, build output, local files, AI workspace, database files
[ ] src/ organized into app/, components/, data/, lib/
[ ] .env.local — local env vars (gitignored, never committed)
```

---

## 18. Anti-Patterns to Avoid

- **No `CLAUDE.md`** — the AI starts every session from zero, makes inconsistent decisions
- **Decisions scattered across chat history** — impossible to enforce; gets re-debated every session
- **One giant phase with no boundaries** — the AI builds everything at once, poorly
- **No changelog** — duplicate work, lost context, no audit trail
- **Secrets in committed files** — security incident waiting to happen
- **AI workspace committed to git** — clutters the repo with research notes and drafts that have no review value
- **Env vars undocumented** — new developers (or AI sessions) can't get the project running
- **Copy written ad hoc** — inconsistent tone, missing disclosures, legal risk
- **No hypothesis doc** — the team builds features without knowing what they're testing; no way to know if the product is working
- **No system architecture doc** — the AI makes narrow technical decisions without understanding the ecosystem, regulatory boundaries, or data flow
- **No user research committed** — copy and feature decisions are based on assumptions instead of real user quotes and data
- **PRD without explicit out-of-scope section** — the AI adds features that seem useful but aren't part of the plan
- **No competitive differentiation doc** — the AI can't articulate why the product exists or what makes it different; copy and positioning drift
- **Phase plans without prerequisites or setup commands** — every new session wastes time figuring out how to get the environment running
- **Roadmap tracker combined with phase plan** — the "what to build" and "is it done" questions get tangled; progress becomes hard to assess
