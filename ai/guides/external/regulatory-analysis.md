# Finn Regulatory Analysis
*Compiled 2026-02-21. This is a structured legal risk framework, not legal advice.
Nothing here substitutes for counsel from a licensed attorney before launch.*

---

## Executive Summary

Finn's regulatory surface area is real but navigable. The three genuine kill risks
are: (1) operating as an unregistered investment adviser, (2) a TCPA class action
from a consent documentation failure, and (3) undisclosed or inadequately structured
affiliate compensation. All three are avoidable with deliberate structural choices
made before the first commercial message is sent. The section "Talk to a Lawyer
Before Launch" at the bottom is not optional reading.

---

## 1. Does Finn Constitute Financial Advice Under SEC/FINRA Rules?

### The Three-Part Test

The Investment Advisers Act of 1940 defines an "investment adviser" as any person
who, for compensation, is in the business of advising others on securities.
The SEC applies a three-part test:

1. **Advice about securities** — is Finn advising on securities?
2. **In the business of providing such advice** — is this Finn's primary activity?
3. **For compensation** — does Finn receive payment?

All three prongs apply to Finn as designed. Here is why each is dangerous:

**Prong 1 — 529 plans are securities.**
529 college savings plans are municipal fund securities, regulated under the
Securities Act of 1933 and overseen by the Municipal Securities Rulemaking Board
(MSRB). Recommending a specific 529 plan ("Utah's plan is best for your situation")
is a recommendation about a specific security. This is not a gray area.

**Prong 2 — Finn is in the business of this.**
Finn sends financial guidance as its primary product. The "publisher's exclusion"
(which exempts newspapers and general publications from investment adviser status)
requires advice to be genuinely generic and non-personalized. A message that includes
a child's name, age, and specific plan recommendation is not generic. The SEC looks
at substance, not labels. Calling Finn a "financial wellness coach" does not change
the regulatory analysis if the substance is personalized securities recommendations.

**Prong 3 — Finn receives compensation.**
The $8/month subscription fee is compensation. The affiliate referral fees, if
any, compound this.

**Conclusion:** As originally conceived, Finn likely meets all three prongs and
would be required to register as an investment adviser — either with the SEC
(if AUM exceeds $110M or it qualifies for another federal basis) or with each
state where it operates. Operating without registration is a federal violation
with serious consequences including disgorgement, fines, and industry bars.

### The MSRB Layer

529 plans specifically are regulated by the MSRB, not just the SEC. Firms that
recommend 529 plans to retail customers must be registered with FINRA and follow
MSRB Rule G-19 (suitability) and MSRB Rule G-21 (advertising). Registered reps
recommending 529s must hold a Series 51 or Series 52 license.

This is a separate layer on top of the investment adviser analysis. Even if Finn
structures around RIA registration, 529-specific MSRB requirements need explicit
attention.

---

## 2. How to Restructure to Reduce Regulatory Exposure

Finn does not have to register as an RIA to operate. These are the viable paths:

### Path A: Pure Education Model (Lightest, Most Limiting)

Finn provides only general financial education — never personalized to an individual's
specific situation. Messages discuss 529 plans generically: what they are, how they
work, what factors to consider. Finn never recommends a specific plan, a specific
contribution amount tied to the user's situation, or a specific action for a specific
person.

**What Finn can say:**
- "529 plans let your contributions grow tax-free for qualified education expenses.
  Most states offer a deduction for contributions to their own state's plan."
- "Parents typically start with $25–$100/month. Any amount compounds meaningfully
  over 18 years."
- "Here's a comparison of the top-rated plans by fee structure: [link to third-party
  resource like Morningstar or savingforcollege.com]"

**What Finn cannot say:**
- "Utah's plan is best for your situation"
- "Based on your $75/month budget, here's what I recommend"
- "You should increase your contributions now"

**Trade-off:** This model is compliant but weakens the core product. "One thing to
do" becomes "one thing to consider." That's a softer value proposition. However,
the Cleo/Albert data suggests conversational engagement around education still works.
This is the MVP-safe path.

### Path B: RIA Partnership / White-Label Supervision (Recommended for Scale)

Finn partners with an existing SEC-registered RIA. The RIA supervises all Finn
communications that cross into advice territory. Finn's messages are reviewed and
approved under the RIA's compliance framework. The RIA's registration covers Finn's
activities.

**How this works operationally:**
- The RIA partner becomes the regulated entity providing advice
- Finn is the technology and delivery layer
- All personalized recommendations technically come from the RIA, delivered via Finn
- Users have a disclosed relationship with the RIA, not just Finn
- The RIA handles FINRA/SEC examination exposure; Finn handles product

**Companies that do this:** Many neobanks and fintech apps use this structure.
SoFi Invest operates under SoFi Securities (FINRA-registered). Betterment is a
registered RIA. Smaller fintechs white-label through firms like Apex Clearing,
DriveWealth, or boutique RIA partners.

**Cost:** RIA partnerships typically cost $5,000–$20,000/month at early stage plus
a per-user fee. This is real cost but manageable if employer channel economics hold.

**Trade-off:** Adds cost and some product constraints (the RIA will have opinions
about message content). But it enables the full Finn product vision — genuine
personalized guidance — without operating as an unregistered adviser.

### Path C: Series 65 + State Registration (Founder-Led, Early Stage Only)

A founder (or designated employee) obtains a Series 65 license (Uniform Investment
Adviser Law Examination) and registers as an Investment Adviser Representative (IAR).
Finn registers as a state-registered investment adviser in its home state, then
expands state-by-state.

**When this makes sense:** Early-stage, single-state pilot. Validates the product
before the cost of a full RIA partnership.

**Limitation:** State registration requires filing in every state where clients
are located. National scale requires either federal SEC registration (triggered at
$110M AUM or by qualifying another way) or 50-state compliance. Not viable
long-term as a national product without escalating to federal registration.

### Path D: Hybrid (Recommended for MVP)

Use Path A (education-only language) for the MVP to avoid registration requirements
during product validation. Simultaneously pursue a Path B RIA partnership to enable
full personalization post-Series A. This gives you a compliant MVP and a clear
upgrade path.

---

## 3. 529 Plan Recommendations — Required Disclosures

Regardless of which path Finn takes, certain disclosures are required any time
a specific 529 plan is discussed or linked:

**If unregistered (education model):**
- Clear disclaimer that Finn is not a registered investment adviser
- Clear statement that content is educational, not personalized advice
- Disclosure of any material relationship with the plan administrator
  (affiliation, referral fees, data sharing)
- Recommendation to consult a qualified financial adviser

**If registered or operating under an RIA:**
- Form ADV Part 2 (brochure) provided to clients
- Disclosure of all conflicts of interest including compensation arrangements
- MSRB-required disclosures for 529 plan communications
- Suitability documentation

**The plain-English version of what every Finn message touching a specific plan needs:**
At minimum, a clear disclosure — either in the message itself or via a persistent,
accessible link — that states: (1) what Finn is and isn't, (2) that Finn may
receive compensation for referrals, (3) that this is not personalized investment advice.

This does not have to be verbose. "Finn is not a financial adviser. We may earn a
fee if you open an account through our link. [Learn more]" linked to a clean
disclosure page is likely sufficient for the education model.

---

## 4. Affiliate and Referral Disclosure

### The FTC Standard

The FTC's Endorsement Guides (16 CFR Part 255) require that material connections
between an endorser and the seller of a product be clearly and conspicuously
disclosed when they might affect the weight or credibility of the endorsement.
Receiving a referral fee for recommending a specific 529 plan is a material
connection. It must be disclosed.

"Clearly and conspicuously" means:
- In the message itself, not buried in Terms of Service
- In plain language, not legalese
- Before or adjacent to the recommendation, not after

### The SEC Standard (If Registered)

Investment Advisers Act Section 206 prohibits fraud and requires disclosure of
all conflicts of interest. An RIA receiving referral fees from the products it
recommends must disclose this in Form ADV and in writing to clients before or
at the time of the recommendation.

### What a Clean Affiliate Structure Looks Like

**Option 1 — Disclose in the message:**
> "Utah's plan has the lowest fees and works in any state. [Open account →]
> Note: Finn earns a referral fee if you open through this link."

This is compliant under FTC standards. Clean. Plain English. No buried footnotes.

**Option 2 — Pass the fee to the user (cleanest):**
> "Open through this link and $25 goes into Emma's account — that's a referral
> bonus Utah's plan provides to new accounts opened via Finn."

No Finn revenue from the referral. User gets the benefit. Finn earns goodwill and
reduced churn. This structure eliminates the conflict entirely.

**Option 3 — No affiliate revenue in MVP:**
Charge the subscription only. Add affiliate revenue post-Series A when compliance
infrastructure is in place. Simplest regulatory posture for early stage.

**What to avoid:** Receiving referral fees and disclosing them only in Terms of
Service or a privacy policy. The FTC has taken action against companies for
precisely this. The SEC has issued warnings about AI systems that optimize
recommendations toward higher-fee products. If Finn's AI is trained on data
that includes referral fee amounts, and its recommendations happen to favor
higher-fee-paying administrators, that is a potential violation regardless
of disclosure.

---

## 5. TCPA and SMS Compliance

### What TCPA Requires

The Telephone Consumer Protection Act (47 U.S.C. § 227) governs automated
or prerecorded messages sent to mobile phones. For Finn:

**Prior Express Written Consent is required before the first message.**

For marketing messages (which Finn's proactive outreach almost certainly constitutes
— they are not purely transactional), TCPA requires:
- Written consent (a text reply counts if properly structured)
- Clear disclosure that consent is for autodialed/automated messages
- Clear disclosure of message frequency
- Clear disclosure that consent is not a condition of purchase
- Opt-out instructions in every message ("Reply STOP to cancel")

**The "double opt-in" standard:**
While not explicitly required by TCPA itself, carrier guidelines (CTIA Messaging
Principles) and litigation risk make double opt-in effectively mandatory:
1. User provides initial consent (signs up via web form or replies to first message)
2. User receives a confirmation message and must reply YES to confirm
3. Finn logs both steps with timestamps

**10DLC Registration (now required):**
All A2P (application-to-person) SMS traffic in the US must be registered under
10DLC (10-Digit Long Code) with The Campaign Registry. This requires:
- Business registration with TCR
- Campaign registration describing the use case
- Carrier vetting (2–4 weeks, sometimes longer)
- Monthly fees (~$10/month per campaign)

Without 10DLC registration, carriers will filter or block Finn's messages.
This is not optional and must be in place before any messages are sent commercially.

**Frequency and opt-out:**
- Every single Finn message must include opt-out language: "Reply STOP to unsubscribe"
- Opt-out requests must be honored within 24 hours (best practice: immediately)
- Finn must maintain a suppression list of opted-out numbers and never re-contact them

### The Liability Exposure

TCPA violations carry statutory damages of **$500–$1,500 per message**, with no
cap on aggregate damages. Class action plaintiffs' attorneys actively monitor
fintech SMS programs for consent documentation failures.

A single error in the opt-in flow — ambiguous consent language, missing a required
disclosure, failing to honor a STOP request — can expose Finn to a class action
covering every message sent to every user.

This is the most operationally dangerous regulation Finn faces because:
- The violations are easy to make accidentally
- The damages are automatic (no proof of harm required)
- Class certification is relatively straightforward
- The plaintiffs' bar is organized and active in this space

The defense is equally straightforward: meticulous consent documentation, proper
10DLC registration, clean opt-out infrastructure, and a compliance review of every
message template before it goes live.

### TCPA and the Employer Channel

Employer-mediated enrollment (employee opts in during benefits enrollment) creates
cleaner TCPA consent documentation than consumer opt-in, because:
- The enrollment process is documented by the HR system
- Employees are affirmatively selecting a benefit (not responding to cold outreach)
- The employer's benefits platform can collect written consent as part of enrollment

This is another advantage of the employer-first go-to-market strategy. Build the
consent documentation infrastructure around the employer enrollment flow, then
adapt it for consumer opt-in.

---

## 6. The Lightest Legal Structure to Operate Before Launch

For an MVP that validates the core SMS loop before Series A, the following
structure minimizes regulatory exposure while allowing the product to function:

**The MVP-Safe Stack:**

1. **Education-only message language** (Path A above)
   - No specific plan recommendations
   - No personalized contribution amounts framed as advice
   - All links go to third-party comparison resources (Morningstar, savingforcollege.com)
   - Clear disclaimer in every message or accessible via persistent link

2. **TCPA-compliant consent flow**
   - Double opt-in before any message is sent
   - 10DLC registration completed before launch
   - STOP/HELP keywords handled automatically
   - Consent records retained indefinitely

3. **Affiliate revenue off the table for MVP**
   - No referral fees until compliance infrastructure exists
   - Subscription revenue only
   - Simplifies every other disclosure requirement

4. **Clear "not financial advice" disclosure**
   - In onboarding confirmation message
   - In Terms of Service
   - Accessible from every message that touches a financial product
   - Plain English: "Finn provides financial education, not personalized
     investment advice. We are not a registered investment adviser."

5. **RIA partnership in parallel with MVP**
   - Begin the RIA partner search and negotiation during MVP phase
   - Target: partnership agreement signed before Series A closes
   - This enables full personalization in v2 without a product relaunch

This structure lets Finn send messages, acquire users, and validate the core loop
legally, while building toward the full product.

---

## 7. Other Regulatory Areas (Shorter, But Real)

### State Investment Adviser Laws
Each state has its own investment adviser registration requirements. Even under
the education model, if Finn's content is aggressive enough to be construed as
advice, individual state securities regulators can issue cease-and-desist orders.
States where early employer deals are closed should get specific legal review.

### CFPB and UDAAP
The Consumer Financial Protection Bureau has authority over unfair, deceptive,
or abusive acts or practices (UDAAP) by financial service providers. Finn is
likely a "covered person" under CFPB jurisdiction once it's commercially
operating. UDAAP exposure comes from:
- Misleading claims about financial outcomes ("Emma will have $34,000 by 18"
  presented as a guarantee)
- Subscription billing practices (unclear cancellation, unauthorized charges)
- Data practices that users didn't understand they consented to

The CFPB has been active in AI financial services guidance. Their 2024 circular
on "digital comparison shopping tools" (which includes recommendation engines)
is directly relevant and worth legal review.

### State Money Transmission
Finn does not hold or transmit money, so state money transmission licensing
(a significant burden for many fintechs) likely does not apply. However,
if Finn ever facilitates direct contributions (money flows through Finn to a
529 administrator), this analysis changes immediately. Keep money flows
outside Finn's infrastructure in MVP.

### CAN-SPAM
If Finn sends any email (receipts, account confirmations, newsletters), CAN-SPAM
applies. Lower-stakes than TCPA but requires: accurate sender identification,
clear subject lines, physical address in every email, and a working unsubscribe
mechanism. Straightforward compliance.

### Data and Privacy
- COPPA (Children's Online Privacy Protection Act): Finn collects data about
  children (name, age, birthdate). COPPA applies to collection of information
  about children under 13. Finn collects child data from parents, which is
  treated differently than collecting data directly from children — but the
  legal boundary is not fully settled for this model. Legal review required.
- State privacy laws (CCPA, CPRA in California; similar laws in other states):
  Finn must have a privacy policy that accurately describes data collection,
  use, and sharing. If employer deals span multiple states, multi-state
  compliance required.

---

## 8. Talk to a Lawyer Before Launch — Non-Negotiables

These are not areas where structured analysis substitutes for counsel.
Each of these, if wrong, can prevent or end the business.

**Priority 1 — Existential risks:**

| Issue | Why It Cannot Wait |
|---|---|
| Investment adviser registration analysis | Operating as unregistered IA = federal violation. Get a written opinion on whether MVP structure avoids registration before first commercial user |
| TCPA consent documentation | One class action = potentially existential. Have a TCPA-specialist attorney review every element of the opt-in flow before launch |
| MSRB/529 plan communication rules | If any message recommends or links to a specific 529 plan, MSRB rules may require specific disclosures or registration |

**Priority 2 — Pre-launch but can run in parallel:**

| Issue | Why It Matters |
|---|---|
| Affiliate/referral structure | Even in MVP without affiliate revenue, the structure for future affiliate revenue should be designed correctly from the start. Retooling later is expensive |
| COPPA analysis | Child data collection model needs explicit legal sign-off |
| 10DLC registration | 4–6 week process; must be done before any A2P messages are sent commercially |
| Terms of Service and Privacy Policy | Standard, but must be reviewed by fintech-aware counsel, not generic templates |

**Priority 3 — Before Series A:**

| Issue | Why It Matters for Fundraising |
|---|---|
| RIA partnership agreement | Investors will ask. Not having a plan for personalized advice is a diligence red flag |
| State securities registration | If operating in multiple states, state-level IA registration or federal registration path must be clear |
| CFPB posture | Institutional investors will ask about CFPB exposure. Have an answer |

**The type of lawyer Finn needs:**
Not a general corporate attorney. Specifically:
- Fintech regulatory counsel with SEC/FINRA background
- Attorney with TCPA class action defense or compliance experience
- These are often different people; budget for both

**Estimated cost for initial regulatory review:** $15,000–$40,000 for a thorough
opinion letter covering investment adviser status, TCPA consent flow review, and
529-specific disclosure requirements. This is not optional spend. It is cheaper
than the first hour of a TCPA class action defense.

---

## 9. The Regulatory Risk Summary

| Risk | Severity | Probability Without Mitigation | Mitigation |
|---|---|---|---|
| Operating as unregistered IA | Existential | High | Education-only language in MVP; RIA partnership for v2 |
| TCPA class action | Existential | Medium | Meticulous consent documentation; 10DLC registration |
| Undisclosed affiliate conflict | High | Medium | No affiliate in MVP; pass value to user when added |
| MSRB 529 recommendation rules | High | High | No specific plan recommendations in MVP; legal review |
| State cease-and-desist | Medium | Low-Medium | State-by-state analysis as employer deals are signed |
| COPPA child data | Medium | Low | Legal sign-off on data model before launch |
| CFPB UDAAP | Medium | Low | Accurate claims, clean billing, clear data practices |

---

*This document should be reviewed with fintech regulatory counsel before use
in product design or investor materials. Last updated: 2026-02-21*
