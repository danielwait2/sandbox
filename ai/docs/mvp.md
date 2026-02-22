# Finn MVP
*Derived from ai/docs/prd.md — 2026-02-21*
*This is the build spec. The PRD is the full vision. When they conflict, this wins
until the hypothesis is proven.*

---

## The Hypothesis

**Parents will engage with proactive, infrequent SMS nudges about their child's
financial future, and a meaningful percentage will complete a specific financial
action as a direct result.**

Everything in this document exists to prove or disprove that. Nothing else.

---

## The One Metric

**40% reply rate on the first substantive message within 30 days.**

Not the welcome message. The first message that asks the parent to do something.
A 40% reply rate on a proactive financial SMS would be extraordinary (email: 6%).
It is the leading indicator of everything downstream.

**Stop threshold:** If reply rate is below 20% after 60 users — stop and diagnose.
Not a guideline. A pre-commitment. Low engagement is a signal that a core assumption
is wrong, not a reason to add features.

**Secondary check:** 30 days after the action nudge, ask: "Did you get a chance to
set up the account?" Self-reported. Above 25% confirms the product is changing behavior.

---

## What We Are Building

Four components. Nothing more.

### 1. Landing Page

One page. Headline, two-sentence pitch, sign-up form embedded.
No blog, no FAQ, no separate pricing page (price is on the form).
Carrd or Framer. One day of work.

### 2. Onboarding Form

Collects:
- Parent's mobile number
- Child's name
- Child's date of birth
- Payment information (Stripe, $8/month)

On submission:
- Stripe subscription created
- Twilio sends TCPA double opt-in confirmation SMS
- Parent replies YES
- Record created in Airtable
- Welcome message sent manually by founder

No account creation. No password. No app. Under three minutes total.

### 3. Airtable

One table. Fields: phone number, child name, DOB, subscription status, message log,
reply log, sent date, replied (yes/no).

One filtered view: users due for a message this week.

That is the entire operational system. Sufficient for 0–200 users.

### 4. TCPA-Compliant SMS Infrastructure (Twilio)

- 10DLC registered before any commercial message is sent
- Double opt-in: web form → confirmation SMS → YES reply → consent logged with timestamps
- STOP keyword: auto-unsubscribes in Twilio
- HELP keyword: auto-responds with short description and support contact
- "Reply STOP to cancel" in every message

---

## The Message Set (5 Templates)

Not 15–20. Not two tracks. Five messages to cover the first 8 weeks per user.

1. **Welcome** — sent immediately after YES opt-in confirmation. Sets cadence, gives an out.
2. **First nudge** — sent days 4–7. One thing to know or one thing to do. This is the message being tested.
3. **Positive reply follow-up** — sent when parent engages. Sends plan comparison link + one next step.
4. **No-reply follow-up** — sent at day 30 if no reply to first nudge. Lower pressure, same single action.
5. **30-day check-in** — "Did you get a chance to set up the account?" Logs the answer.

All five use education-only language (no specific plan recommendations). All five include
"Reply STOP to cancel." All five contain the child's name.

The founder writes these. Not AI-generated. Not templated beyond the five above.
Message validation with real parents before sending commercially is the work here,
not building more templates.

---

## What We Are Faking or Doing Manually

| What It Looks Like to the User | What Is Actually Happening |
|---|---|
| Personalized monthly message from Finn | Founder checks Airtable, writes the message, adds child's name, sends via Twilio console |
| Intelligent reply handling | Founder reads reply, responds personally within a few hours |
| Finn knows Emma's birthday | Airtable field, checked in a weekly 30-minute review |
| Finn tracks account setup | Founder asks directly at day 30, logs the answer |
| Finn is a product | A Twilio number, an Airtable table, a Stripe account, and a founder |

The rule: if a human can do it in under 5 minutes per user per month, do not
automate it until 200+ users. Every manual step is research.

---

## Regulatory Constraints (Non-Negotiable)

- No specific 529 plan recommendations
- No personalized contribution amounts framed as advice
- All external links go to established third-party resources only
  (savingforcollege.com, Morningstar 529 ratings)
- Every message or linked page carries: "Finn provides financial education, not
  personalized investment advice. We are not a registered investment adviser."
- No affiliate revenue. Subscription only.

**Legal review before the first commercial user:**
- Written opinion that education-only MVP structure avoids investment adviser registration
- TCPA specialist review of the complete consent flow
- Budget: $15,000–$25,000. Not optional.

---

## Build Timeline

**Day 1:**
Start 10DLC registration with Twilio. Costs ~$30. Takes 4–6 weeks. Blocks launch.
This is the only thing that cannot start later.

**Weeks 1–2:**
- Twilio: number setup, STOP/HELP auto-responses, webhook
- Airtable: one table, one queue view
- Stripe: $8/month subscription, customer portal link for cancellations
- Landing page live
- Draft Terms of Service and Privacy Policy → send to counsel immediately

**Weeks 3–4:**
- Write and finalize the 5 message templates
- Test the full onboarding flow end-to-end
- Internal test with 5–10 people
- Validate message copy with real parents outside your network before proceeding

**Weeks 5–6:**
- Legal review of consent flow returned and incorporated
- 10DLC registration clearing
- No new features. Fix any onboarding issues found in testing.

**Weeks 7–8: Closed Beta**
- 20–50 users from personal network or parenting communities
- Founder sends all messages manually, reads all replies personally
- Track: reply rate, STOP rate, confused replies ("who is this?")
- Rewrite any message that produces a confused or no reply before public launch

**Launch:**
- Open signup after 10DLC cleared and legal sign-off received
- Target: 100 paying users in 30 days

---

## Operating Costs

| Item | Cost |
|---|---|
| Twilio (SMS, 100 users, ~2 messages/month) | ~$20/month |
| Twilio 10DLC registration | ~$20 one-time + $10/month |
| Stripe | 2.9% + $0.30/transaction |
| Airtable | Free tier |
| Landing page | ~$19/month |
| **Total ongoing (excluding legal)** | **~$80/month** |
| Legal review (one-time) | $15,000–$25,000 |

At 100 paying users: $800/month revenue against $80/month cost.

---

## What Is Never Getting Built

- User dashboard, account portal, or user login of any kind
- iOS or Android app
- A product for parents who already have a financial advisor
- General personal finance features beyond college savings
- Affiliate or referral revenue before compliance infrastructure exists

---

*Build spec only. Full product vision: ai/docs/prd.md. Last updated: 2026-02-21*
