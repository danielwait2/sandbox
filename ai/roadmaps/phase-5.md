# Phase 5 — Closed Beta
*Duration: Weeks 7–8. First real users. The hypothesis test begins.*

---

## Goal

Send Finn's messages to 20–50 real paying users, read every reply personally,
and arrive at a directionally clear signal on the hypothesis before opening to
the public.

---

## Entry Condition

Phase 4 complete: legal sign-off received, 10DLC active and verified, Stripe in
live mode, pre-beta walkthrough passed with no open issues.

---

## What the Beta Is and Is Not

**It is:** The first data collection phase of the hypothesis test. Research. Every
message sent is an experiment. Every reply is a data point. The goal is not to
acquire users — it is to understand whether the channel and message design work
before exposing them to a wider audience.

**It is not:** A soft launch. Not a marketing event. Not a signal that the product
is ready. The beta is explicitly a test environment for the founder's benefit, not
the users' benefit. That said, beta users are real paying customers and must be
treated accordingly.

---

## Tasks

### 1. Recruit Beta Users (20–50)

**Where to find them:**
- Personal network: parents of children 0–3 years old who will be honest
- Parenting communities: Reddit (r/Parenting, r/NewParents, r/beyondthebump),
  local Facebook parent groups, Nextdoor
- One informal employer contact: if there is a friendly company where the founder
  knows the HR director or an employee, a small cohort of 10–15 employees enrolled
  informally generates early employer channel data. No employer portal. No formal
  contract. The founder emails the HR contact, the employees sign up individually
  via the landing page.

**What to tell them:**
Be honest that Finn is in early beta. Do not over-promise. "I'm testing a new
product and would love to have you try it. It's $8/month and you can cancel anytime.
I'll personally send you messages and read your replies." The personal commitment
is a feature, not a warning — it's why early users who find this appealing will
try it.

**What not to do:**
Do not recruit users who you know will not cancel even if the product is bad.
You need honest churn data. Friends and family who stay out of loyalty pollute
the metrics.

**Target cohort composition:**
- At least 60% parents of children 0–12 months (the highest-receptivity window
  from the research)
- At least 20% parents of toddlers 12–36 months (tests whether the product
  works outside the newborn window)
- At least 20% parents who appear budget-constrained (to test whether Finn
  can serve the Derek persona without that user immediately churning)

### 2. Send Messages and Run the Week-by-Week Process

**Weekly operating rhythm:**
- Monday: review Airtable Message Queue view. Identify every active user who
  is due for a message this week (based on their signup date and last message date).
- Tuesday–Thursday: send messages. For each user, open the Twilio console,
  find their number, select the appropriate template from the message library,
  replace [Child Name] with the child's actual name, confirm the timing anchor
  is accurate (child age, upcoming milestone), and send.
- As replies arrive: read every reply within a few hours. Respond personally
  using the reply handling guide from Phase 3. Log the reply in Airtable
  (Replied = true, Reply Notes = short summary of what they said).
- Friday: review the week's metrics. Update the tracking log.

**Message sequencing per user:**
Day 0: signup + opt-in → Welcome message (manual, same day)
Day 4–7: First Nudge (Message 2)
If reply received: Positive Follow-Up (Message 3) — sent within a few hours of reply
If no reply by Day 30: No-Reply Follow-Up (Message 4)
Day 30–37: 30-Day Check-In (Message 5)

Do not send more than one message per week to any user. Do not follow up more
than once if they do not reply. Silence is data, not a reason to push harder.

### 3. Track Metrics Daily

Create a simple tracking document (can be a tab in Airtable or a separate
spreadsheet) with the following:

**Per-message tracking:**
| Metric | How to Measure |
|---|---|
| Messages sent | Count of outbound messages in Airtable |
| Reply rate | Replied = true / total sent for Message 2 |
| STOP rate | Twilio opt-out count / total active users |
| "Who is this?" rate | Manually tally confused replies |
| Positive reply rate | "Yes / want to know more" / total sent |
| Account opened rate | Account Opened = true / total sent Message 5 |

**Running totals to watch every week:**
- Total active users
- Reply rate on Message 2 (the hypothesis metric) — running average
- Total STOP / total active users (STOP rate above 10% on any single message
  is a warning signal)
- Number of personal replies read and responded to

**The stop threshold:** If reply rate on Message 2 drops below 20% after 40 users
have received it — pause sending to new users and diagnose. Do not recruit more
users until the failure mode is identified. See "If the Beta Fails" below.

### 4. Iterate on Message Copy

The beta is explicitly a copy iteration phase. The messages written in Phase 3
are first drafts. Real parent replies will reveal where they fall short.

**Signs a message needs revision:**
- Multiple confused replies ("What is this?" "Who sent this?") → message is not
  clear about who Finn is and why it's reaching out
- Multiple "not interested / STOP" replies in the first week → message created
  anxiety or felt like a sales pitch
- Very few replies of any kind → message may be arriving at the wrong time,
  or the action ask is too large
- Replies that answer a different question than the one asked → message was ambiguous

**How to revise:**
Rewrite the failing message. Show the new version to 2–3 beta users directly
(text them a revised version and ask if it reads better). If the revised version
consistently performs better, adopt it as the new standard.

Send any revised message that touches financial content or consent language back
to legal counsel for confirmation before adopting. This does not require a full
review — a brief email confirming the changes don't alter the legal analysis is
sufficient.

### 5. Log and Review Cancellations

Every STOP and every Stripe cancellation is data. For each one:
- Note when they cancelled relative to when they signed up
- Note what the last message they received was
- If they replied before cancelling, note what they said
- If reachable (they cancelled via Stripe portal, not STOP), consider sending
  one personal message: "I noticed you cancelled — totally fine. If you have a
  moment, I'd love to know what didn't work. No obligation." Not every cancellation
  will respond. Some will. Those responses are extremely valuable.

Pattern the cancellations. If 3 of 5 cancellations happen within 48 hours of
receiving the same message, that message has a problem.

---

## If the Beta Metrics Are Positive

Reply rate on Message 2 above 30% after 30+ users, STOP rate below 5%, no
pattern of confused replies → proceed to Phase 6 (public launch) with confidence.

A passing beta does not mean the product is finished. It means the channel works
and the message design is not catastrophically wrong. That is enough to justify
expanding to 100 users.

---

## If the Beta Metrics Are Negative

Reply rate on Message 2 below 20% after 40+ users → pause. Do not open to the
public. Do not add features. Diagnose.

**Diagnostic questions:**
- Are users replying STOP or are they just not replying? (Silence and STOP are
  different failure modes. STOP = the product is creating a negative reaction.
  Silence = the message isn't compelling or arriving at the right moment.)
- Are there any patterns in who did reply? (Age of child? Time of day the message
  arrived? Budget tier selected at signup?)
- What do the non-STOP non-replies have in common?
- Read every reply that was received. Is there a tone or content issue the data
  can't see?

After diagnosis, form a specific hypothesis about what broke, make one change,
and test it with the next batch. Do not change multiple things at once — the
signal becomes unreadable.

---

## What Done Looks Like

- 20–50 real paying users have received at least Message 2
- Reply rate on Message 2 is directionally clear (above 30% or below 20%)
- Founder has personally read and responded to every reply received
- Every cancellation has been logged with a reason if known
- Message copy has been iterated at least once based on real reply data
- No regulatory or TCPA issue has arisen (no unexpected opt-out spike, no
  confused complaints suggesting consent was unclear)

---

## What to Check Before Moving to Phase 6

- [ ] At least 30 users have received Message 2
- [ ] Reply rate on Message 2 is above 30% (below 20% = diagnose, don't proceed)
- [ ] STOP rate has not exceeded 10% on any single message
- [ ] "Who is this?" replies are below 10% of total inbound
- [ ] Every reply has been personally read and responded to within 24 hours
- [ ] No open legal or compliance issues identified during beta
- [ ] Message copy has been revised where needed and revised versions re-validated
- [ ] Cancellations have been reviewed for patterns — no single message is causing
      a disproportionate STOP rate

---

## Libraries and APIs Touched

| Service | What Happens in This Phase |
|---|---|
| Twilio Console | Manual message sends, inbound reply reading, opt-out monitoring |
| Airtable | Daily queue management, reply logging, metric tracking |
| Stripe | Live subscription management, cancellation monitoring |

No new services. No new configuration. This phase is operations, not building.

---

*Next: Phase 6 — Public Launch*
