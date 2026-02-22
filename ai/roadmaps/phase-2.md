# Phase 2 — No-Code Foundation
*Duration: Weeks 1–2. Runs in parallel with 10DLC registration wait.*

---

## Goal

Build the complete technical infrastructure so that a parent can sign up, pay,
receive a TCPA opt-in SMS, reply YES, and appear as an active record in Airtable —
with no code written and no messages sent to real users yet.

---

## Entry Condition

Phase 1 complete: 10DLC registration submitted and legal counsel engaged.

---

## Tasks

### 1. Configure Twilio for MVP Operations

**Basic setup:**
- Confirm Finn's Twilio phone number is active (purchased in Phase 1)
- Set the number's messaging configuration to point inbound SMS to a webhook URL
  (in MVP: an email notification via Twilio's built-in email alert, not a custom
  endpoint — this is configurable in the console under the number's settings)
- Alternatively: configure Twilio Studio with a simple flow that emails the founder
  when any non-keyword inbound SMS arrives

**Keyword auto-responses (required before any message is sent):**
Configure the following keyword responses in Twilio's Messaging Services settings:

- **STOP:** Default Twilio behavior handles unsubscribe automatically. Verify it is
  enabled. Twilio will block all future messages to that number.
- **HELP:** Configure a custom response: "Finn helps parents save for their kids'
  education. Msg freq: ~1x/month. Msg & data rates may apply. Reply STOP to
  unsubscribe. Questions: [support email]."
- **YES:** Configure to trigger the Zapier automation (Step 4 below). The YES reply
  is the TCPA consent confirmation.

**Test:** Send a STOP from a personal number to the Finn number. Confirm the
auto-response fires and that Twilio marks the number as opted out. Send a HELP.
Confirm the correct response is returned.

### 2. Set Up Airtable Base

Create one base called "Finn Operations" with one table called "Users."

**Fields to create:**

| Field Name | Field Type | Notes |
|---|---|---|
| Phone | Phone Number | Primary field. E.164 format (+1XXXXXXXXXX). |
| Parent Name | Single line text | |
| Child Name | Single line text | Used in every message |
| Child DOB | Date | Used to determine which message to send |
| Child Age (months) | Formula | Calculate from DOB. Used in queue view. |
| Budget Tier | Single select | Options: $0 / $25 / $50 / $100 / $100+ |
| Subscription Status | Single select | Options: pending_consent / active / cancelled |
| Stripe Customer ID | Single line text | For reference and manual Stripe lookups |
| Stripe Subscription ID | Single line text | |
| Consent Timestamp | Date/time | Set when YES reply is received |
| Last Message Sent | Date | Updated manually after each send |
| Last Message Type | Single line text | Which of the 5 templates was sent |
| Replied | Checkbox | Did they reply to the last message? |
| Reply Notes | Long text | Founder's summary of what the reply said |
| Account Opened | Checkbox | Self-reported at 30-day check-in |
| Notes | Long text | Anything the founder wants to track |

**Views to create:**

- **Message Queue:** Filter to Subscription Status = active. Sort by Last Message
  Sent (ascending). This shows who has gone longest without a message. The founder
  reviews this view weekly.
- **Pending Consent:** Filter to Subscription Status = pending_consent. Sorted by
  created date. Anyone here for more than 48 hours should have their subscription
  cancelled.
- **All Users:** Unfiltered. For reference.

**Test:** Manually create one test record. Confirm all fields accept the expected
input. Confirm the queue view filters correctly.

### 3. Set Up Stripe

**Product and pricing:**
- Create a product called "Finn" in Stripe
- Create one recurring price: $8.00 USD / month
- Enable the Stripe Customer Portal (Settings → Billing → Customer Portal)
  - Allow customers to cancel subscriptions
  - Allow customers to update payment method
  - Do not allow plan changes (there is only one plan)
- Copy the Customer Portal link — this is what the founder sends when a user asks
  to cancel

**Payment form:**
- Create a Stripe Payment Link for the $8/month product (Stripe dashboard →
  Payment Links → Create)
- Configure the success page to display: "You're signed up. Check your phone for
  a text from Finn in the next few minutes."
- Configure the form to collect: name, email (for Stripe receipt), phone number
  (custom field — needed to trigger the Twilio opt-in SMS)
- Set metadata fields on the Stripe session to capture child name and child DOB
  (also custom fields on the payment form)

**Note on the form approach:** A Stripe Payment Link with custom fields is the
simplest path. Alternative: embed a Stripe Checkout on the Carrd/Framer landing
page. Either works. The Zapier automation in Step 4 reads from Stripe's webhook
regardless of which approach is used.

**Webhook:**
- In Stripe Dashboard → Developers → Webhooks, add a webhook endpoint pointing
  to the Zapier webhook URL created in Step 4
- Events to listen for: `customer.subscription.created` and
  `customer.subscription.deleted`
- Note the webhook signing secret for Zapier

**Test:** Run a test payment using Stripe's test mode card (4242 4242 4242 4242).
Confirm subscription is created and the webhook fires.

### 4. Build the Zapier Automation

One Zap with the following steps:

**Trigger:** Stripe → New Event → `customer.subscription.created`

**Step 1 — Parse the event:**
Extract from the Stripe event payload: customer name, phone number, child name,
child DOB, Stripe customer ID, Stripe subscription ID.

Note: Custom fields on the Stripe Payment Link are accessible in the webhook
payload under `metadata`. Map them here.

**Step 2 — Create Airtable record:**
Airtable → Create Record in "Users" table.
Set fields: Phone, Parent Name, Child Name, Child DOB, Budget Tier (from form),
Stripe Customer ID, Stripe Subscription ID, Subscription Status = pending_consent.

**Step 3 — Send TCPA opt-in SMS via Twilio:**
Twilio → Send SMS.
To: the phone number from Step 1.
From: Finn's Twilio number.
Body:
"Hi, this is Finn — a financial co-parent for your family. Reply YES to get monthly
tips for [child name]. ~1 msg/month. Msg & data rates may apply. Reply STOP to
cancel, HELP for info."

**Step 4 — YES reply triggers consent confirmation:**
This requires a second Zap (or a Zapier multi-step flow with a filter).

Trigger: Twilio → New Incoming Message.
Filter: Message body contains "YES" (case-insensitive).
Action 1: Find the matching Airtable record by phone number.
Action 2: Update that record: Subscription Status = active, Consent Timestamp = now.
Action 3: Send email to founder: "New confirmed user: [Child Name]'s parent. Send welcome message."

**Stripe cancellation Zap (second automation):**
Trigger: Stripe → New Event → `customer.subscription.deleted`
Action: Find matching Airtable record by Stripe Subscription ID.
Update: Subscription Status = cancelled.

**Test:** Run through the full flow in Stripe test mode. Confirm: payment creates
Airtable record, opt-in SMS is sent (to a test number), YES reply updates the
record to active, founder receives email notification.

### 5. Build the Landing Page

**Platform:** Carrd ($19/year) or Framer (~$15/month). Either is sufficient.

**Page structure:**
- Headline: something like "A financial co-parent for overwhelmed parents." (TBD —
  copy is refined during Phase 3)
- Two-sentence pitch
- One screenshot or mockup of a Finn message (can be a mockup of the welcome
  message)
- The Stripe Payment Link button or embedded form
- Price clearly stated: $8/month, cancel anytime
- Footer: "Finn provides financial education, not personalized investment advice.
  We are not a registered investment adviser." + link to ToS + Privacy Policy

**What the page is not:**
Not a blog. Not a FAQ page. Not a feature list. Not a testimonials section.
The page exists to get a parent to enter their phone number and pay. Nothing else.

**ToS and Privacy Policy:**
- Draft both documents (templates from Stripe Atlas or Clerk are a reasonable start
  — have counsel review, do not publish templates without review)
- Host on the same domain as the landing page
- Send both to legal counsel in Phase 2 along with the Stripe consent flow

**Domain:**
- Register a domain (finn.com is taken — options: tryfinnn.com, meetfinn.com,
  finnsaves.com, or similar)
- Point the domain to the Carrd/Framer page

**Test:** Load the page on mobile. Tap the payment button. Confirm it goes to the
Stripe form. Confirm the form collects the right fields. Confirm the success page
appears after payment.

### 6. Send Legal Documents to Counsel

By the end of Phase 2, send to both legal contacts:
- The complete onboarding flow description (step by step, with exact message text)
- The Twilio opt-in SMS text
- The STOP, HELP, and YES keyword auto-response texts
- Draft ToS and Privacy Policy
- Finn's business description (from Phase 1 brief)
- The consent flow diagram (can be the Zapier flow description)

Ask them to confirm receipt and estimated return date. Target: feedback received
by end of Week 5 (Phase 4 start).

---

## What Done Looks Like

- A parent can find the landing page, tap the payment button, enter their details,
  pay $8, receive a TCPA opt-in SMS from Finn's number, reply YES, and appear as
  an active record in Airtable — in under 3 minutes
- The founder receives an email notification when a new user confirms
- STOP, HELP, and YES keyword auto-responses fire correctly
- Stripe test mode payment → Airtable record → Twilio SMS → YES reply → active
  status has been tested end-to-end at least 3 times with no failures
- Stripe cancellation → Airtable status update has been tested
- ToS, Privacy Policy, and consent flow documents sent to legal counsel
- No messages have been sent to any real users

---

## What to Check Before Moving to Phase 3

- [ ] Full onboarding flow tested end-to-end in Stripe test mode (not live mode)
- [ ] STOP auto-response tested: number is blocked after STOP
- [ ] HELP auto-response tested: correct text returned
- [ ] YES auto-response tested: Airtable record updated, founder notified
- [ ] Stripe cancellation tested: Airtable status updated correctly
- [ ] Landing page loads correctly on mobile
- [ ] Price is visible on the landing page before any tap
- [ ] ToS and Privacy Policy are live at accessible URLs
- [ ] Documents sent to legal counsel, receipt confirmed
- [ ] Stripe is still in test mode — no real charges yet

---

## Libraries and APIs Touched

| Service | What Happens in This Phase |
|---|---|
| Twilio Console | Number configuration, keyword auto-responses, inbound alert setup |
| Airtable | Base creation, table and field setup, view configuration |
| Stripe Dashboard | Product, price, Payment Link, Customer Portal, webhook setup |
| Zapier | Two automations: signup flow and cancellation flow |
| Carrd or Framer | Landing page build |

No custom code. All configuration happens in service dashboards and Zapier's
no-code interface.

---

*Next: Phase 3 — Message Library and Onboarding Test*
