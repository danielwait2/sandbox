# Finn Technical Architecture
*Derived from ai/docs/mvp.md and ai/docs/prd.md — 2026-02-21*

This document covers two distinct phases. The line between them is not arbitrary —
it is drawn at the point where manual operations stop being sufficient.

- **Phase 1 (MVP):** No custom backend. Proves the hypothesis. 0–200 users.
- **Phase 2 (v2):** Custom backend introduced. Enables AI personalization,
  automated scheduling, and employer channel. 200+ users.

Do not build Phase 2 infrastructure before Phase 1 proves the hypothesis.

---

## Phase 1: MVP Architecture

### What It Is

Five SaaS products stitched together with one Zapier automation. No servers. No
custom code. The founder is the AI layer.

### System Topology

```
┌─────────────────────────────────────────────────────────────┐
│                        PARENT                               │
│                                                             │
│   [Mobile Browser]               [SMS App]                 │
└──────────┬───────────────────────────┬──────────────────────┘
           │ fills form                │ SMS in/out
           ▼                           ▼
┌──────────────────┐         ┌─────────────────────┐
│  Landing Page    │         │       Twilio         │
│  (Carrd/Framer)  │         │                      │
│  + Stripe form   │         │  - 10DLC registered  │
└────────┬─────────┘         │  - STOP/HELP auto    │
         │ payment +         │  - Consent log       │
         │ phone/name/DOB    │  - Inbound webhook   │
         ▼                   └──────────┬────────────┘
┌─────────────────┐                     │
│     Stripe      │                     │ inbound SMS
│                 │                     │ → email alert
│  $8/mo sub      │                     │   to founder
│  Customer portal│                     ▼
└────────┬────────┘          ┌─────────────────────┐
         │ webhook           │       Founder        │
         │ (new subscriber)  │                      │
         ▼                   │  - Reads Airtable    │
┌─────────────────┐          │  - Sends messages    │
│     Zapier      │          │    via Twilio console│
│                 │          │  - Reads replies     │
│  Stripe event → │          │  - Responds manually │
│  create Airtable│          └─────────────────────┘
│  record +       │
│  trigger opt-in │
│  SMS via Twilio │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Airtable     │
│                 │
│  Single table   │
│  Queue view     │
│  Reply log      │
└─────────────────┘
```

### The Zapier Automation (The Only "Code" in MVP)

One multi-step Zap:

1. **Trigger:** New payment in Stripe (subscription created)
2. **Action 1:** Create record in Airtable (phone, name, child name, DOB, status: pending_consent)
3. **Action 2:** Send SMS via Twilio — the TCPA double opt-in confirmation message
4. **Trigger 2:** Inbound SMS in Twilio matching "YES" → update Airtable record (status: active, consent_timestamp: now)
5. **Action 3:** Email alert to founder: "New user confirmed: [name]. Send welcome message."

The founder then manually sends the welcome message from the Twilio console.
Manual from that point forward.

### Inbound SMS Handling (MVP)

Twilio handles STOP and HELP keywords automatically via built-in keyword responses —
no code required. These must be configured in the Twilio console before any
commercial message is sent.

All other inbound SMS (actual replies from parents) generate an email alert to the
founder. Founder reads the reply in the Twilio console, responds manually.

No webhook endpoint. No custom routing. No NLP.

### Why No Custom Backend in MVP

The hypothesis being tested is whether parents will reply to a proactive SMS. That
question does not require automated scheduling, AI personalization, or a database
beyond Airtable. Building a backend before the hypothesis is proven is infrastructure
for a product that may not work. The manual operations are not technical debt —
they are research. Every reply the founder reads personally is data that no automated
system produces at this stage.

---

## Phase 2: v2 Architecture

Introduced when manual operations become the bottleneck, or when AI reply handling
is needed. The trigger is typically 150–200 active users or a meaningful employer
pilot requiring automated enrollment.

### System Topology

```
┌─────────────────────────────────────────────────────────────┐
│                        PARENT                               │
└──────────┬───────────────────────────┬──────────────────────┘
           │                           │ SMS
           ▼                           ▼
┌──────────────────┐         ┌─────────────────────┐
│  Landing Page    │         │       Twilio         │
│  (static host)   │         │                      │
└────────┬─────────┘         └──────────┬────────────┘
         │ form POST                    │ webhook (POST)
         ▼                              ▼
┌────────────────────────────────────────────────────────┐
│                    Backend API                         │
│                 (Node.js / TypeScript)                 │
│                                                        │
│   /onboard       — process signup, create sub         │
│   /sms/inbound   — receive Twilio webhook              │
│   /sms/status    — delivery status callback            │
│   /stripe/webhook — subscription events               │
│   /scheduler     — cron: find users due for message   │
└──────┬──────────────────────┬─────────────────────────┘
       │                      │
       ▼                      ▼
┌────────────────┐   ┌─────────────────────────────┐
│   PostgreSQL   │   │       Anthropic API          │
│  (Supabase)    │   │                              │
│                │   │  - Personalize message       │
│  users         │   │    from template + context   │
│  children      │   │  - Classify reply intent     │
│  messages      │   │  - Draft reply suggestion    │
│  consent_log   │   │    (human-reviewed in v2)    │
└────────────────┘   └─────────────────────────────┘
```

### Tech Stack

| Layer | Choice | Reasoning |
|---|---|---|
| Backend language | TypeScript (Node.js) | Strong Twilio, Stripe, and Anthropic SDK support. Lightweight for this workload. Easy to hire for. |
| Backend hosting | Railway or Render | Simple deploys, no Kubernetes overhead at this stage. Managed Postgres available. |
| Database | PostgreSQL via Supabase | Relational model fits the data. Supabase adds connection pooling, backups, and a usable admin UI without running your own Postgres. |
| SMS | Twilio | Industry standard for 10DLC compliance. Best STOP/HELP keyword handling. Webhook reliability is high. No realistic alternative at this scale. |
| Payments | Stripe | Best subscription billing primitives. Customer portal handles cancellation without custom code. Dunning is built in. |
| AI (messages) | Anthropic Claude | Better warmth and tone control than GPT for this use case. System prompt + user context produces more natural, less clinical financial language. Also: reduces model provider concentration risk if already using OpenAI elsewhere. |
| AI (reply intent) | Same — Claude | Classifying "yes / no / can't afford / confused / question" from a parent's reply is a straightforward classification task. One model for both reduces complexity. |
| Landing page | Framer (upgrade from Carrd) | Sufficient for v2. Not worth a custom Next.js site until traffic warrants it. |
| Message queue | Postgres-backed cron job | A simple scheduled function that queries the DB for users due for a message. No Redis, no separate queue service. Overkill at this scale. |

### Why Anthropic Over OpenAI

The message quality difference for this specific use case. Finn's tone requirements —
calm, warm, specific, never urgent — are easier to enforce reliably with Claude's
instruction-following. The market drop message ("Emma's balance is lower on paper
right now. That's expected...") requires precise tone control. In testing, Claude
produces fewer "helpful but slightly alarming" variants than GPT-4 for financial
content. This is an empirical preference, not a tribal one. Revisit if evidence
changes.

---

## SMS Flow Detail

### Outbound (Finn → Parent)

**MVP:**
1. Founder opens Twilio console
2. Selects parent's number from Airtable queue
3. Pastes personalized template, sends manually
4. Logs sent date and message body in Airtable

**v2:**
1. Scheduler runs (daily cron)
2. Queries DB for users where next_message_date <= today
3. Fetches user + child context
4. Passes context to Claude with system prompt: "You are Finn. Write a message for
   [child name], age [X months]. Template: [template]. Context: [prior messages,
   reply history]. Tone requirements: [warm, specific, one action, explicit close]."
5. Generated message queued for human review (early v2) or sent directly (late v2)
6. Sent via Twilio API, delivery status logged via webhook callback
7. next_message_date updated in DB

### Inbound (Parent → Finn)

**MVP:**
1. Twilio receives SMS
2. STOP/HELP auto-handled by Twilio keyword rules
3. All other replies → email alert to founder
4. Founder reads, responds manually from Twilio console, logs in Airtable

**v2:**
1. Twilio receives SMS → POST to /sms/inbound
2. STOP/HELP keywords handled before reaching backend
3. Message logged in messages table (direction: inbound)
4. Claude classifies intent: reply_type (positive / negative / affordability / confused / question / other)
5. Claude drafts a suggested reply
6. In early v2: suggestion sent to operator Slack/email for approval before sending
7. In late v2: auto-send with sampling review (operator reviews 10% of replies)
8. Outbound reply logged

### TCPA Consent Flow

This does not change between MVP and v2. It is locked before any commercial message.

```
Parent submits form
        │
        ▼
Stripe subscription created
        │
        ▼
Twilio sends: "Hi, this is Finn. Reply YES to confirm you'd like to receive
monthly financial tips for [child name]. Msg frequency: ~1x/month.
Msg & data rates may apply. Reply STOP to cancel."
        │
        ▼
Parent replies YES
        │
        ▼
Consent logged: phone, timestamp, IP, message body, their reply body
        │
        ▼
Status set to active. Welcome message sent.

If no YES within 48 hours → subscription cancelled, Stripe refunded,
record flagged. No messages sent without confirmed consent.
```

---

## Data Model

Described as logical entities. In MVP these are Airtable fields. In v2 these are
PostgreSQL tables. The field names are the same to make migration straightforward.

### users
| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| phone | string | E.164 format. Encrypted at rest. |
| stripe_customer_id | string | |
| stripe_subscription_id | string | |
| subscription_status | enum | active / paused / cancelled / pending_consent |
| consent_timestamp | timestamp | Set when YES reply received. Required before any message. |
| consent_ip | string | IP at time of form submission |
| created_at | timestamp | |

### children
| Field | Type | Notes |
|---|---|---|
| id | uuid | |
| user_id | uuid | FK → users |
| name | string | Used in every message |
| date_of_birth | date | Drives message timing and template selection |
| created_at | timestamp | |

*MVP note: one child per user. Multi-child support is post-Series A.*

### messages
| Field | Type | Notes |
|---|---|---|
| id | uuid | |
| user_id | uuid | FK → users |
| child_id | uuid | FK → children |
| direction | enum | outbound / inbound |
| body | text | Full message text, retained for compliance (FINRA Rule 4511) |
| template_id | string | Nullable. References which of the 5 templates was used. |
| twilio_message_sid | string | For delivery status lookup |
| status | enum | queued / sent / delivered / failed / received |
| reply_type | enum | Nullable. Set by AI classifier on inbound: positive / negative / affordability / confused / question / other |
| sent_at | timestamp | |

### consent_log
| Field | Type | Notes |
|---|---|---|
| id | uuid | |
| user_id | uuid | FK → users |
| event_type | enum | opt_in_initiated / opt_in_confirmed / opt_out / resubscribe |
| timestamp | timestamp | |
| ip_address | string | |
| raw_sms_body | text | Exact text of their YES or STOP reply |

*This table is append-only and must never be modified or deleted. It is the legal
record for TCPA defense.*

---

## Third-Party Services

### Required (MVP and v2)

| Service | Purpose | Why This One |
|---|---|---|
| Twilio | SMS sending/receiving, 10DLC registration, STOP/HELP handling | The only realistic choice for compliant A2P SMS at this scale. 10DLC registration is carrier-level and must go through Twilio or equivalent. |
| Stripe | Subscription billing, cancellation portal, payment processing | Best subscription primitives. Customer portal handles cancellations without custom code. Trusted by users for payment. |

### Required (MVP only, replaced in v2)

| Service | Purpose | Replaced By |
|---|---|---|
| Airtable | Operational database and message queue | PostgreSQL / Supabase in v2 |
| Zapier or Make | Stripe → Airtable → Twilio automation | Custom backend in v2 |
| Carrd | Landing page | Framer or custom in v2 |

### Added in v2

| Service | Purpose | Notes |
|---|---|---|
| Supabase | PostgreSQL database, connection pooling, admin UI | Managed Postgres with good DX. Avoid self-managed Postgres until Series A. |
| Anthropic API | Message personalization, reply intent classification | See AI layer section above. |
| Railway or Render | Backend hosting | Simple managed hosting. No DevOps overhead at this stage. |

### Explicitly Not Needed

| Service | Why Not |
|---|---|
| Plaid | No financial account integration in MVP or v2. Only in v3+ post-Series A. |
| Segment or Mixpanel | Airtable reply log is sufficient analytics for 0–200 users. Add after hypothesis is proven. |
| SendGrid or Postmark | Product is SMS-only. The only emails sent are Stripe receipts (handled by Stripe). |
| Auth0 or Clerk | No user login. Ever. |
| Redis | No caching or queue requirements at this scale. Postgres-backed cron is sufficient. |
| S3 or any file storage | No files. No images. No attachments. |
| Any mobile SDK | No app. |
| Any CMS | No content to manage beyond 5 message templates, edited directly in code. |
| Datadog or similar | Too early. Add structured logging to the backend and query it directly until Series A. |

---

## What The AI Layer Does and Does Not Do

### Does

- **Personalize** a pre-approved template using child context (name, age, recent
  reply history, prior message history). The template defines the structure and tone.
  Claude fills in the specific, personal details.
- **Classify** inbound reply intent into one of six categories so the right
  follow-up response is routed or triggered.
- **Draft** a suggested reply for operator review. In early v2 every draft is
  reviewed. In late v2, auto-send is enabled with sampling.

### Does Not

- **Generate messages without a template.** Every outbound message starts from
  a pre-approved template. Claude is not freeform-generating financial content.
  This is the regulatory constraint (no hallucinated financial claims) and the
  product constraint (tone consistency).
- **Make financial recommendations.** The system prompt explicitly prohibits
  specific plan recommendations, personalized contribution advice, or any language
  that crosses from education into advice. This is enforced at the prompt level
  and reviewed by counsel before v2 launches.
- **Access any financial data.** There is no Plaid integration. Claude knows what
  is in the Finn database: child name, DOB, message history, and what the parent
  self-reported. Nothing else.

---

## Migration Path: Airtable → PostgreSQL

The MVP Airtable table maps directly to the v2 PostgreSQL schema above. Migration
when the time comes:

1. Export Airtable records to CSV
2. Map fields to PostgreSQL columns (field names are identical by design)
3. Import to Supabase via the admin UI or a one-time migration script
4. Point Zapier webhooks to the new backend endpoints
5. Decommission Zapier automation

This migration is a half-day of work. It does not require rearchitecting anything.

---

## Security and Compliance Notes

**Data at rest:** Phone numbers encrypted at rest in both Airtable (field-level
encryption) and PostgreSQL (column-level encryption via pgcrypto or Supabase Vault).
Phone numbers are PII and must be treated accordingly.

**Message retention:** All outbound and inbound SMS bodies retained indefinitely.
FINRA Rule 4511 requires retention of all business communications. Do not implement
any message deletion logic.

**Consent log:** Append-only. No updates, no deletes, ever. This is the TCPA defense.

**STOP compliance:** Opt-outs must be honored within 24 hours. In practice, Twilio
auto-handles STOP responses and blocks future messages to that number at the carrier
level. The backend must also update subscription_status to cancelled and trigger
Stripe cancellation.

---

*This architecture is designed to be right-sized — no infrastructure for problems
that don't exist yet, and a clear upgrade path when they do. Last updated: 2026-02-21*
