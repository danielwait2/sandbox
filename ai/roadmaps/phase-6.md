# Phase 6 — Public Launch
*Duration: Ongoing. Target: 100 paying users in 30 days.*

---

## Goal

Open the signup page to the public, reach 100 paying users, and produce a definitive
result on the hypothesis — either proven or definitively not proven.

---

## Entry Condition

Phase 5 complete: closed beta reply rate above 30%, STOP rate below 10%, no
open compliance issues, message copy validated through real iteration.

---

## Tasks

### 1. Prepare the Landing Page for Public Traffic

The landing page exists from Phase 2, but it has been shared only selectively.
Before opening it to the public:

- Replace any internal or beta-specific language with public-facing copy
- Add one or two real quotes from beta users if any said something specific
  and positive ("I can't believe I finally did this" is the phrase to watch for)
  — only with their explicit permission
- Confirm the page loads correctly on mobile in under 3 seconds
- Confirm the price ($8/month, cancel anytime) is visible before any tap
- Confirm the "not a registered investment adviser" disclaimer is visible in
  the footer
- Confirm the Stripe Payment Link is active and in live mode

Do not add a referral program. Do not add social sharing. Do not add a "how it
works" explainer video. The page is already sufficient — adding to it before
knowing what converts introduces noise into the acquisition data.

### 2. Choose Acquisition Channels (One or Two Only)

The goal is 100 users, not scale. Over-investing in acquisition before the
hypothesis is proven at 100 users is premature. Pick one or two channels.

**Channel A — Organic / Community (recommended first)**
Post in parenting communities where the founder has genuine presence or credibility.
Reddit: r/Parenting, r/NewParents, r/beyondthebump, r/personalfinance.
Facebook parenting groups. Nextdoor for local parents.
Frame as a genuine product seeking early users, not as marketing.
This channel costs nothing and produces users with high intent.

**Channel B — One Paid Social Test (optional)**
A single small ($200–$300) Meta or Instagram ad targeting parents with children
0–3 years, new homeowners, or first-time parents. One ad. One creative. One copy
variant. The goal is not to optimize — it is to test whether paid acquisition
produces users with the same engagement metrics as organic. If paid users'
reply rate is materially lower than organic, the product depends on word-of-mouth
and community context that paid channels don't provide. That is important data.

**What not to do:**
Do not run Google Ads (wrong intent signal — parents Googling "529" are in research
mode, not action mode). Do not engage a PR firm. Do not pitch to newsletters.
These are all post-validation activities. Acquire 100 users first.

### 3. Manage the 100-User Operations

At 100 users, the manual operations are approximately 3–4 hours per week.

**Weekly rhythm (same as Phase 5, now larger):**
- Monday: Airtable queue review — who is due this week?
- Tuesday–Thursday: send messages (~10–20 per week at steady state)
- As replies arrive: respond personally within a few hours
- Friday: update metrics, review any cancellations, note any message that needs
  revision

**At what point does this become unsustainable?**
The threshold is roughly 200 active users. At 200 users, sending messages and
reading replies begins to consume more time than the product can justify without
automation. Phase 6 is complete and v2 scoping begins when:
- 100+ active users
- Hypothesis metrics are clear
- Manual operations are starting to consume the founder's primary working time

Do not scope v2 before reaching 100 users. Do not hire before reaching 100 users.
The manual operations are still producing irreplaceable data at this scale.

### 4. Measure the Hypothesis Metrics

The launch is not a success event — it is a measurement event. The metrics from
the closed beta must be reproduced at public scale.

**Primary metric:** Reply rate on Message 2 at 30 days.
Track this as a running average, not a single cohort number. As each new group
of users receives Message 2 for the first time, add their reply rate to the
running average.

**Secondary metric:** Self-reported 529 account opening within 60 days.
Track via Message 5 replies. Log Account Opened = true in Airtable for every
confirmed setup.

**Supporting metrics:**
- Monthly churn (active users this month / active users last month)
- STOP rate per message (STOPs on that message / total sent)
- Time from signup to first reply (leading indicator of activation rate)

**Weekly metrics review:**
Every Friday, update a simple running log:
- Total active users
- Users who received Message 2 this week
- Running reply rate (total positive replies to Message 2 / total Message 2 sent)
- New STOPs this week
- Net new users (new signups minus cancellations)
- Accounts opened (from Message 5 check-ins)

This does not require a dashboard. A tab in Airtable or a simple spreadsheet
is sufficient for 100 users.

### 5. Define the Hypothesis Result

The launch phase ends when the hypothesis has a result. Set this in advance.

**Hypothesis proven (proceed to v2 scoping):**
- 100+ active paying users
- Reply rate on Message 2: above 40% as a running average
- Self-reported 529 setup within 60 days: above 25%
- Monthly churn: below 8%
- No unresolved compliance issues

**Hypothesis partially supported (iterate before v2):**
- Reply rate between 25–40%: the channel works, the message copy needs refinement
- Setup rate below 25%: engagement is real but not converting to the core action —
  the action ask in Message 2 or Message 3 needs work
- Churn between 8–15%: users are signing up but not staying — the value after the
  first message isn't clear enough

**Hypothesis not proven (stop and diagnose):**
- Reply rate on Message 2 below 20% after 60+ users
- Monthly churn above 15% in the first 90 days
- STOP rate above 10% on any message

If the hypothesis is not proven, stop acquiring new users, read all the replies
and cancellation data, identify the specific assumption that broke, and fix it
before continuing. This is not failure — it is the correct outcome of a well-designed
experiment.

### 6. Capture Qualitative Signal

The 100-user milestone produces a quantitative result. The qualitative signal
is equally important for the investor story and the v2 design.

Actively watch for:
- Users who say "I can't believe I finally did this" or equivalent — these are
  the product working as designed. Note them. They are the testimonial and the
  retention anchor.
- Users who ask for something Finn doesn't do yet — log these as v2 candidates.
  Do not build them now. Note the exact language they used.
- Users who describe Finn to someone else — this is word-of-mouth evidence.
  Ask them how they described it.
- Users who reply to every message — these are the ideal cohort. Understand what
  they have in common.

---

## What Done Looks Like

- 100+ active paying users
- Running reply rate on Message 2 above 40% (or a clear decision to iterate
  based on a specific diagnosis)
- Self-reported 529 setup rate above 25% (or a specific hypothesis about why
  it isn't and what to change)
- Monthly churn below 8%
- At least 5 users who said something equivalent to "I can't believe I finally
  did this"
- A clear qualitative sense of which message resonated most and why
- No compliance or legal issues
- Founder has read every single reply sent during Phase 5 and 6

At this point: the pre-seed story is fundable, the v2 scope can be defined with
real data behind it, and the RIA partnership conversation can begin with evidence.

---

## What to Check Before Beginning v2 Scoping

- [ ] 100+ active paying users reached
- [ ] Running reply rate confirmed above 40% (or diagnosis complete if below)
- [ ] Self-reported 529 setup rate tracked and above 25%
- [ ] Monthly churn below 8% for at least 2 consecutive months
- [ ] Founder has personally read every reply and cancellation
- [ ] Qualitative signal logged: at least 5 "I can't believe I finally did this"
      equivalents noted
- [ ] No open legal or compliance issues
- [ ] Manual operations confirmed manageable but approaching their ceiling
      (~200 user threshold approaching or reached)
- [ ] Decision made: hypothesis proven, partially supported, or not proven —
      with a written one-paragraph summary of why

---

## Libraries and APIs Touched

| Service | What Happens in This Phase |
|---|---|
| Twilio Console | Manual message sends at increased scale, inbound reply management |
| Airtable | Full operational database — queue management, metric tracking, reply logging |
| Stripe | Live subscription management, cancellation handling |

No new services. No new configuration. No code.

v2 introduces the custom backend, PostgreSQL, and the Anthropic API. That work
begins after this phase produces a confirmed hypothesis result.

---

*This is the final MVP phase. v2 scope is defined in ai/roadmaps/phase-7.md
(not yet written) after the hypothesis has a result.*
