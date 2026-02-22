# Phase 1 — Pre-Build Blockers
*Duration: Day 1. 1–2 hours of work. 4–6 weeks of waiting.*

---

## Goal

Initiate the two long-lead-time blockers — 10DLC registration and legal counsel
engagement — so they run in parallel with the rest of the build rather than
delaying launch.

---

## Why This Phase Exists

10DLC registration takes 4–6 weeks after submission. No commercial SMS messages can
be sent to US numbers without it — carriers will filter or block them silently with
no error returned. This is not a warning, it is a hard block. Starting it on Day 1
means it clears around the same time the rest of the MVP is ready. Starting it on
Week 3 means a 4–6 week delay at the end when everything else is done.

Legal review has a similar dynamic. Counsel needs the consent flow, the ToS, and
the message templates to do a thorough review. Those are produced in Phases 2 and 3.
If counsel is engaged in Phase 1, they can begin structuring the review and return
feedback during Phase 4, on schedule. If counsel is engaged at the end of Phase 3,
the legal review adds 3–4 weeks to the timeline.

Neither task requires any other part of the product to be built first.

---

## Tasks

### 1. Start 10DLC Registration with Twilio

- Log into Twilio Console (create account if needed)
- Navigate to: Messaging → Regulatory Compliance → US A2P 10DLC
- Register the business (requires: legal business name, EIN or tax ID, business
  address, business type, website URL)
- Register the brand (same information, submitted to The Campaign Registry via Twilio)
- Register the campaign: use case = "Mixed" or "Education" — describe Finn as a
  financial education SMS service for parents. Be accurate. Carrier vetting scrutinizes
  campaign descriptions. Misleading descriptions cause rejections.
- Purchase a local long-code number in Twilio if not already done (costs ~$1/month)
- Associate the number with the campaign once campaign is approved
- Note the campaign registration SID and confirmation number

**Expected timeline:** Brand registration: 1–3 days. Campaign vetting: 2–5 weeks.
Number association: same day once campaign is approved.

**What can go wrong:** Campaign rejected for vague description or mismatched business
information. If rejected, revise the description and resubmit — do not create a new
account. Resubmission adds 1–2 weeks.

### 2. Engage Legal Counsel

- Identify a fintech-specialized attorney with SEC/FINRA background for the investment
  adviser registration analysis
- Identify a TCPA-specialist attorney for consent flow review (often a different person)
- Send an initial brief describing Finn: an SMS-based financial education service for
  parents, subscription-based, education-only language (no personalized investment
  advice), targeting parents with young children
- Communicate the two deliverables needed:
  1. Written opinion on whether the education-only MVP structure avoids investment
     adviser registration under the Investment Advisers Act of 1940, in the states
     where Finn will initially operate
  2. TCPA specialist review of the complete consent flow (to be provided in Phase 2)
     with sign-off before any commercial message is sent
- Agree on timing and budget ($15,000–$25,000 total, non-negotiable spend)
- Send consent flow documents as soon as they are produced in Phase 2

**Note:** Do not send any commercial SMS messages before written legal sign-off is
received. Not even to beta users. This is not a judgment call.

### 3. Acquire a Business Phone Number (if not done via Twilio above)

- The Twilio number registered for 10DLC is the number Finn messages will come from
- This number should be a local long-code (not a toll-free number, which has a
  separate registration process)
- Confirm the number format is E.164 (+1XXXXXXXXXX) — this is what Twilio uses

---

## What Done Looks Like

- Twilio account created, 10DLC brand registration submitted and confirmed as
  pending (not approved — approved takes weeks, but submitted and in queue)
- Campaign registration submitted (may be pending brand approval first)
- Legal counsel identified, engaged, briefed, and fee agreed
- Finn's Twilio phone number purchased and noted
- No messages have been sent to anyone

---

## What to Check Before Moving to Phase 2

- [ ] 10DLC brand registration confirmation email received from Twilio
- [ ] Campaign registration submitted (even if pending brand approval)
- [ ] Legal counsel has confirmed engagement and agreed to scope
- [ ] Twilio phone number purchased and available in console
- [ ] 10DLC estimated clearance date noted (to time Phase 4 and 5 correctly)

---

## Libraries and APIs Touched

| Service | What Happens in This Phase |
|---|---|
| Twilio Console | Account setup, number purchase, 10DLC brand and campaign registration |
| The Campaign Registry (via Twilio) | Brand and campaign vetting — no direct interaction, Twilio submits on your behalf |

No code. No integrations. No Airtable. No Stripe. Those are Phase 2.

---

*Next: Phase 2 — No-Code Foundation*
