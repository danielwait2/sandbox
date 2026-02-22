# Claude Instructions — Finn

## On Every Session Start
1. Read ai/docs/context.md first
2. Check ai/roadmaps/ to see the current phase
3. Do not begin any work until you have done steps 1 and 2

## What Finn Is
Finn is a text-first AI fintech app for parents. The core loop is:
Finn sends an SMS → parent replies → Finn takes or suggests one action.
There is no dashboard, no app, no login for the end user.
Keep this in mind for every technical and design decision.

## Working With The AI Folder
- ai/docs/ → Core planning documents. Never modify prd.md or
  architecture.md unless explicitly asked.
- ai/guides/external/ → Market research from Perplexity or other
  external sources. Treat as read-only reference material.
- ai/guides/library-notes/ → API and library docs pulled from Context7.
  Always check here before guessing at a library's API.
- ai/roadmaps/ → Implementation plans broken into phases.
  Work through these one phase at a time.
  Never skip ahead without being asked.

## How To Do Work
- Read the current phase roadmap file before starting any coding task
- Stay strictly within the scope of the current task
- Do not refactor or change files outside the current task
- Do not add comments about what code used to do or legacy behavior
- Ask before adding any library not already listed in context.md tech stack
- Flag any placeholder or stub functions clearly rather than leaving
  them silently incomplete

## Product Guardrails
- Finn's tone is always calm, warm, and reassuring — never urgent or scary
- Every feature should be evaluated against: does this require the user
  to do more than reply to a text? If yes, push back and flag it.
- When in doubt, do less. Simplicity is the product.

## After Completing Any Phase
- Update ai/docs/changelog.md with a brief entry
- Update the Current Phase field in ai/docs/context.md
- Suggest what the next step should be

## Changelog Format
YYYY-MM-DD - Phase X complete: [one line summary of what changed]

## Code Style
[Leave blank for now — will be filled in as preferences become clear]
