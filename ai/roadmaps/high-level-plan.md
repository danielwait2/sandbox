# Finn Implementation Roadmap — High-Level Plan
*2026-02-21*

This roadmap covers the MVP build only. The goal is to prove or disprove one
hypothesis: parents will engage with proactive SMS nudges about their child's
financial future. Everything here is in service of that test. Nothing here is in
service of what comes after.

Six phases. The phases are sequential — each has a hard exit condition that must
be met before the next begins. Phase 1 starts on Day 1. The remaining phases are
gated on completion of the prior phase, with one exception: legal review in Phase 4
runs in parallel with Phase 3 content work. Everything else is a hard sequence.

Reference documents:
- Build spec: ai/docs/mvp.md
- Architecture: ai/docs/architecture.md
- Full product vision: ai/docs/prd.md

---

## Phase 1 — Pre-Build Blockers
*Day 1. Takes 1–2 days of work, 4–6 weeks of waiting.*

Start the two things that cannot wait: 10DLC registration with Twilio and engaging
legal counsel. Neither requires any product decisions to be final. Both have multi-week
lead times that block everything downstream. 10DLC registration must be initiated on
Day 1 because it takes 4–6 weeks and no commercial SMS messages can be sent without
it. Legal counsel must be engaged immediately so the review can run in parallel with
the build and return before the beta begins. The rest of the build proceeds while
waiting for both. This phase is complete when both are initiated and on track —
not when they finish.

---

## Phase 2 — No-Code Foundation
*Weeks 1–2. Builds the complete technical infrastructure.*

Assemble the four services that constitute the MVP: Twilio (SMS), Airtable
(database), Stripe (billing), and a Zapier automation connecting them. Add a landing
page with the signup form. By the end of this phase, a parent can find the page,
enter their information, pay, receive a TCPA opt-in confirmation SMS, reply YES, and
appear as an active record in Airtable. No messages are sent to real users yet —
this phase is about infrastructure, not content. The ToS and Privacy Policy are
drafted and sent to counsel for review during this phase.

---

## Phase 3 — Message Library and Onboarding Test
*Weeks 3–4. Builds the content layer and tests the full flow.*

Write the five message templates that constitute the entire MVP content layer.
Test the complete onboarding flow end-to-end with 5–10 internal users (people
who will give honest feedback, not people who will be polite). Validate message
copy with real parents outside the immediate network before proceeding — not to
prove the hypothesis, but to catch obvious tone or clarity failures before they
appear in the beta. This phase runs in parallel with the legal review initiated in
Phase 1 and assigned the consent flow documents produced in Phase 2. The phase
is complete when the full flow works, the messages are written and validated,
and internal testing has found and resolved any onboarding issues.

---

## Phase 4 — Legal Review and Compliance Hardening
*Weeks 5–6. Incorporates legal feedback and confirms 10DLC clearance.*

By this phase, legal counsel has received the consent flow and ToS from Phase 2
and the message templates from Phase 3. This phase incorporates their feedback,
hardens the consent documentation, and confirms 10DLC registration has cleared.
No new features are added. The only work is making changes required by legal review
and confirming the infrastructure is compliant before any real user receives a
commercial message. This phase is complete when: (1) legal has signed off on the
consent flow, (2) a written opinion on investment adviser registration exposure is
in hand, (3) 10DLC registration is confirmed active with Twilio. All three must be
true before the beta begins. There are no exceptions.

---

## Phase 5 — Closed Beta
*Weeks 7–8. The first real users. The hypothesis test begins.*

Recruit 20–50 users from personal networks and parenting communities. The founder
manually manages all messages and replies. Track reply rates, STOP rates, and
confused replies on every message sent. Rewrite any message that produces consistent
non-engagement or confusion before expanding. This phase is explicitly research, not
operations. The founder reads every reply personally. Every cancellation is logged
and, where possible, understood. The closed beta is not a soft launch — it is the
first data collection phase of the hypothesis test. This phase is complete when the
reply rate signal is directionally clear: either above 30% (proceed to launch with
confidence) or below 20% after 40+ users (stop and diagnose before proceeding).

---

## Phase 6 — Public Launch
*Post-beta. Target: 100 paying users in 30 days.*

Open the signup page to the public. The goal is 100 paying users in the first 30
days. Manual operations continue — the founder still manages all messages and replies
at this scale. Track the primary hypothesis metric (40% reply rate on first
substantive message) and the secondary metric (25%+ self-reported 529 setup within
60 days). At 100 users with positive metrics, the pre-seed story is fundable and
the v2 scope can be defined. At 100 users with negative metrics, the data is
diagnostic — stop, analyze, identify which assumption broke, fix it. Phase 6 is
complete when the hypothesis is either proven (metrics above threshold) or
definitively not proven (metrics below threshold after 60+ users). Both are valid
outcomes. The build does not continue until the test has a result.

---

## Phase Summary

| Phase | Duration | Hard Gate |
|---|---|---|
| 1 — Pre-Build Blockers | Day 1 | 10DLC initiated + counsel engaged |
| 2 — No-Code Foundation | Weeks 1–2 | Full signup flow works end-to-end |
| 3 — Message Library and Onboarding Test | Weeks 3–4 | 5 templates written and internally validated |
| 4 — Legal Review and Compliance | Weeks 5–6 | Legal sign-off + 10DLC confirmed active |
| 5 — Closed Beta | Weeks 7–8 | Reply rate signal clear (proceed or diagnose) |
| 6 — Public Launch | Post-beta | Hypothesis proven or definitively not proven |

---

*For detailed tasks, entry conditions, exit conditions, and APIs touched in each
phase, see ai/roadmaps/phase-1.md through phase-6.md.*
*Last updated: 2026-02-21*
