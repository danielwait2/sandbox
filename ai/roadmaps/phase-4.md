# Phase 4 — Legal Review and Compliance Hardening
*Duration: Weeks 5–6. Gate phase — nothing proceeds without sign-off.*

---

## Goal

Receive and incorporate legal feedback on the consent flow and message templates,
confirm 10DLC registration is active, and ensure every required compliance element
is in place before any real user receives a commercial message.

---

## Entry Condition

Phase 3 complete: five message templates written and sent to legal counsel. Full
onboarding flow tested and working in test mode. 10DLC registration submitted
approximately 4–6 weeks ago (Phase 1) and expected to clear during this phase.

---

## Why This Phase Is a Hard Gate

Operating as an unregistered investment adviser is a federal violation. A TCPA
class action from a poorly documented consent flow can be existential. Neither risk
is theoretical for a fintech SMS product. Legal review is the only thing that stands
between Finn and these outcomes during early operations. It costs $15,000–$25,000.
That is not optional spend — it is cheaper than one hour of class action defense.

No real user receives a commercial message before all three of the following are
confirmed:
1. Written legal opinion that the education-only MVP structure does not require
   investment adviser registration
2. TCPA specialist sign-off on the complete consent flow (every message, every
   keyword response, the opt-in SMS text, the double-opt-in process)
3. 10DLC registration confirmed active in Twilio

All three. Not two of three.

---

## Tasks

### 1. Receive and Review Legal Feedback

By this phase, legal counsel has had 3–4 weeks with the consent flow documents,
ToS, Privacy Policy, and message templates sent in Phases 2 and 3.

**What to expect from the TCPA review:**
- Redlines on the opt-in SMS text (specific wording requirements)
- Confirmation or required changes to the YES reply consent confirmation flow
- Review of the STOP/HELP keyword responses
- Opinion on whether the Zapier automation's consent logging is sufficient
  documentation for TCPA defense
- Any required additions to the ToS regarding SMS consent

**What to expect from the investment adviser review:**
- Written opinion (a memo, not verbal) on whether education-only language avoids
  the three-part investment adviser test under the Advisers Act
- List of specific language in the message templates that should be changed,
  if any
- Guidance on the "not a registered investment adviser" disclaimer placement and
  wording
- An opinion on whether any of the five message templates cross from education
  into advice

**If counsel requests changes:**
Make every requested change before proceeding. Do not negotiate regulatory
requirements. Do not proceed with "we'll fix it later." Any message template
that is changed after counsel review must be sent back to counsel for sign-off
on the revised version before use.

### 2. Harden the Consent Flow

Incorporate all TCPA counsel feedback into the live systems:

- Update the opt-in SMS text in Twilio if required (edit the Zapier step that
  sends the opt-in SMS, and the Twilio Studio flow if used)
- Update STOP, HELP, and YES auto-response texts in Twilio console if required
- Update ToS and Privacy Policy on the landing page with any required additions
- Confirm consent logging: the Airtable consent timestamp field captures the
  exact time the YES reply is received. Confirm this is working in test mode.
  Counsel may require additional fields (IP address, exact SMS body of both the
  opt-in message sent and the YES reply received).

**Consent log fields that may be required:**
If counsel recommends capturing additional consent evidence, add these to Airtable:
- Opt-in SMS body (the exact text Finn sent)
- YES reply body (the exact text the parent sent back)
- Twilio Message SID of the opt-in SMS (for carrier-level audit trail)
- Twilio Message SID of the YES reply

These can be added as Airtable fields and captured in the Zapier automation.

### 3. Confirm 10DLC Status

- Log into Twilio Console → Messaging → Regulatory Compliance → US A2P 10DLC
- Confirm brand registration status is "Approved"
- Confirm campaign registration status is "Approved" (or "VERIFIED")
- Confirm the Finn phone number is associated with the approved campaign
- Send a test message from the Finn number to a personal number and confirm
  it arrives without filtering or delay

**If campaign is still pending:**
Do not proceed to beta. Wait. The 10DLC clearance is not optional. Continue
working on any outstanding Phase 3 or Phase 4 items while waiting. If the
campaign has been pending for more than 6 weeks, contact Twilio support for
a status update — delays sometimes require resubmission.

**If campaign was rejected:**
Read the rejection reason carefully. Common rejection reasons:
- Opt-in description too vague → rewrite and resubmit
- Business information doesn't match public records → correct and resubmit
- "High-risk" content category flagged → contact Twilio support before resubmitting

### 4. Switch Stripe to Live Mode

Once legal sign-off is received and 10DLC is confirmed active:
- In Stripe dashboard, switch from test mode to live mode
- Create the live $8/month product and price (copy from test mode)
- Generate a new live-mode Payment Link
- Update the landing page to point to the live Payment Link
- Update the Zapier automation to use live-mode Stripe webhook credentials
  (test mode and live mode have separate API keys and webhook endpoints)
- Test a real $8 charge on a personal card. Confirm the full flow works in
  live mode. Refund the test charge immediately via Stripe dashboard.

### 5. Final Pre-Beta Checklist

Walk through the complete consent flow one final time as a real user would
experience it:

1. Visit the landing page on a mobile device
2. Read the page as a skeptical new parent, not as the founder
3. Tap the payment button
4. Complete checkout with a real card
5. Receive the TCPA opt-in SMS — does it read correctly? Is the consent
   language clear and legally sufficient?
6. Reply YES
7. Receive the welcome message (sent manually) — does it sound like Finn?
8. Note the time from payment to welcome message — it should be under 5 minutes
   for a good first impression
9. Confirm the Airtable record was created correctly with all fields populated
10. Confirm the consent timestamp was captured
11. Cancel the subscription via the Stripe customer portal — confirm cancellation
    works and the Airtable status updates

If any step fails or feels wrong, fix it before the beta.

---

## What Done Looks Like

- Written legal opinion received confirming education-only MVP avoids investment
  adviser registration
- TCPA specialist has signed off on the complete consent flow in writing
  (email confirmation is sufficient — a formal memo is better)
- All requested legal changes incorporated into Twilio, Airtable, and the
  landing page
- 10DLC campaign confirmed active and verified in Twilio
- Stripe switched to live mode, live Payment Link on the landing page
- Full pre-beta walkthrough completed with no unresolved issues
- No real users yet — this phase is still internal

---

## What to Check Before Moving to Phase 5

- [ ] Written legal opinion on investment adviser registration in hand
- [ ] TCPA counsel sign-off on consent flow received (in writing)
- [ ] All legal-required changes incorporated into live systems
- [ ] 10DLC campaign status: Approved / Verified in Twilio console
- [ ] Finn number is associated with the approved 10DLC campaign
- [ ] Test message from Finn number to a real phone arrived without filtering
- [ ] Stripe is in live mode
- [ ] Landing page points to live Stripe Payment Link
- [ ] Zapier automations tested in live mode (not test mode) with a real charge
      and real opt-in reply
- [ ] Cancellation flow tested in live mode

Do not move to Phase 5 if any item above is unchecked.

---

## Libraries and APIs Touched

| Service | What Happens in This Phase |
|---|---|
| Twilio Console | Keyword response updates, 10DLC status confirmation, campaign association |
| Airtable | Field additions for consent logging if required by counsel |
| Stripe | Switch from test to live mode, live product and Payment Link creation |
| Zapier | Update webhook credentials from test to live mode; add consent logging fields if required |

No new services added. No code written.

---

*Next: Phase 5 — Closed Beta*
