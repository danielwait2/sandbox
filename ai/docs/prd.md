# Finn — Product Requirements Document
*Version 1.0 — 2026-02-21*
*This document is the canonical product specification. Do not modify without explicit
instruction. See ai/docs/changelog.md for revision history.*

---

## 1. Problem Statement

Most parents in the United States have not saved anything for their child's education.
Only 35% of families use a dedicated college savings fund, and roughly 77% of children
under 18 have no 529 plan (approximately 17 million accounts against an estimated
75 million children under 18). The problem is not a single failure — it is two
distinct, compounding failures:

**Awareness gap:** 54% of parents are simply unaware that 529 plans exist
(EducationData.org, 2025). They are not procrastinating on something they know they
should do. They do not know the option exists.

**Execution gap:** The remaining parents who are aware face a different problem.
They know what a 529 is. They intend to open one. They haven't. The blocker is
not ignorance — it is cognitive overload layered over low-grade guilt. New parents
are making consequential financial decisions from a compromised cognitive state
(clinically comparable to mild impairment from sleep deprivation), while managing
an identity shift and triaging a perpetual urgency queue where a screaming infant
always outranks a financial task. The longer the task sits undone, the larger it
grows emotionally. By the time the child is two or three, opening a 529 carries a
weight it did not have at birth.

Every existing solution puts the work on the parent: dashboards to log into, apps
to open, emails to read and act on, forms to fill out. They wait for the parent
to come to them. The parent never comes. Finn doesn't wait.

The core product insight: **a financial product that reaches out, asks for one small
thing, and then goes away is structurally different from every other financial product
that exists.** That structural difference is not a feature list advantage — it is an
alignment between product design and user reality that no incumbent has matched.

---

## 2. Target User and Personas

### Primary Target

Parents of children aged 0–5, with household incomes of $50,000–$200,000 per year,
who do not yet have a 529 plan open and are not already working with a dedicated
financial advisor. This cohort represents the intersection of maximum financial impact
(the earlier a 529 opens, the more compounding time the money has) and maximum
product-market fit (overwhelmed, aware of the gap, not served by existing tools).

The population refreshes constantly: approximately 3.6 million new US parents enter
the market every year with the same problem.

### Persona 1 — Maya, 34 (The Ideal User)

UX designer in Austin. Daughter Priya, 14 months. Household income ~$130k. Back
at work, paying $1,800/month in childcare. Has a 401k on autopay. Knows exactly
what a 529 is. Has not opened one. Thinks about it monthly. Feels bad. Moves on.

Maya is execution-blocked, not ignorant. When Finn sends a message at Priya's first
birthday — with Priya's name in it, low-pressure, single clear action — Maya completes
onboarding in six minutes and experiences immediate relief. She tells two friends at
work. Both sign up. She stays for seven or more years. She refers her sister when
she becomes a parent. Maya is the canonical Finn user. Design for her.

**What she needs from Finn:** Permission to do one small thing instead of the whole
overwhelming thing. Calm confirmation that she's not behind. No login required.

### Persona 2 — Derek, 29 (The At-Risk User)

Logistics manager in Atlanta. Son Marcus, 8 months. Combined household income ~$72k.
Stretched: car payment, student loans, rent increase, daycare. No 401k. No emergency
fund. Signed up after seeing a Finn ad in a new parent community.

If Finn's first nudge is "open a 529," Derek doesn't reply. He can't put $50/month
anywhere right now. Finn feels like a reminder of something he failed to do. He
churns within 60 days.

If Finn reads his budget signal ($0/month selected at signup) and sends instead:
"You've got time. Marcus doesn't need a 529 today — the most important thing right
now is one month of expenses in reserve. I'll check back in 6 months" — Derek stays.
Trust is built. When his situation improves, he acts.

Derek is a user Finn can serve, but only with budget-signal sensitivity in the product
logic. He is also a significant portion of the parents without a 529.

**What he needs from Finn:** No shame. No pressure. Acknowledgment of his actual
situation. A reason to stay even if he can't act yet.

### Persona 3 — Claire, 41 (The Non-User)

Physician in Chicago. Husband is a lawyer. Twin boys, 3 years old. Household income
~$380k. Has a human financial advisor. Has 529s for both boys, funded aggressively.
Has a will, a trust, life insurance, and an umbrella policy.

Finn has nothing to offer Claire. If Finn texted her she would unsubscribe after one
message — not with hostility, just with no need.

**Design implication:** Claire represents roughly the top 10–15% of new parents by
income and financial engagement. The temptation as Finn scales is to creep upmarket
toward Claire because she has more money. That is the wrong direction. The moment
Finn tries to serve Claire, it becomes a worse version of a financial advisor. When it
serves Maya, it is the only product designed for her.

---

## 3. Core Features

### Must Have (MVP)

**Proactive SMS nudges, monthly cadence**
Finn initiates contact on a schedule driven by the child's age and the parent's
budget tier. The parent does not have to log in, open an app, or remember to check
anything. Finn comes to them. One message per month, sometimes less. Each message
contains one thing to know or one thing to do. Never both.

**Child-specific personalization**
Every message includes the child's name and a timing anchor (birthday, milestone,
market event). This signals a specific relationship, not a blast. The child's name
in the message is the primary differentiator from spam. Timing is always explained:
"Emma turns 2 next month" is a reason for the message to exist. Spam never explains
itself.

**Single-action design**
Each message asks for one action, or offers explicit permission to do nothing.
"Worth doing?" followed by silence if they don't respond. "Nothing to do this month.
I'll check in in 3 months" is a product feature, not a closing pleasantry. Finn
gives parents explicit permission to stop thinking about it. Financial products
almost never do this.

**Awareness-aware messaging (two tracks)**
Parents who selected $0/month at signup (likely unaware or cash-constrained) receive
a message track that includes one sentence of 529 education before any action ask.
Parents who selected $25/month or more receive an action-ready track that skips the
education and goes straight to the nudge. The user experience is the same. The
regulatory exposure is the same. The conversion rates will differ.

**Web onboarding (simple form)**
A single-page web form collects: mobile number, child name, child date of birth,
rough monthly budget (dropdown), and payment information. No account creation. No
password. No app. On submission: Stripe subscription created, TCPA double opt-in
SMS sent, parent record created in operational database, welcome message sent.
Total user time: under three minutes.

**TCPA-compliant double opt-in**
Parent provides phone number via web form, receives a confirmation SMS, replies YES,
and consent is logged with timestamps. "Reply STOP to cancel" appears in every single
message. Opt-out requests honored immediately. Suppression list maintained. No
10DLC-unregistered commercial message sent under any circumstances.

**Stripe subscription billing ($8/month, consumer)**
Automated payment, automated dunning on failed payments, cancellation via Stripe
customer portal link on request. No hidden fees. No annual commitment required.
Price is shown on the signup form, not buried.

**Education-only message language (MVP regulatory constraint)**
No personalized investment recommendations. No specific plan named as best for a
specific person. All links go to third-party comparison resources (savingforcollege.com,
Morningstar). Every message or linked landing page carries a clear disclaimer:
"Finn provides financial education, not personalized investment advice. We are not
a registered investment adviser."

**Opt-out and reply handling**
STOP keyword automatically unsubscribes. HELP keyword sends a short description and
support link. Parent replies routed to operator for manual response in MVP. Reply
library covers common response types: interest, completion, inability to afford,
confusion, questions.

### Nice to Have (Post-MVP, Pre-Series A)

**Automated message scheduling**
Replace manual weekly queue review with automated scheduling based on child age
and user tier. Triggered after 200+ users where manual operations become the
bottleneck. Automation is built on top of the message templates and patterns
established during the manual MVP phase.

**AI reply handling**
Replace manual reply responses with AI-generated responses supervised by the operator.
The manual MVP phase generates the training data (real parent replies, effective
responses) that makes this safe to automate. Not before. AI-generated replies that
contain financial claims create regulatory exposure — do not activate until message
content review is in the RIA partnership scope.

**Employer benefits channel (pilot)**
An employer pilot looks like: founder emails the HR director of a friendly company,
manually adds employees to the operational database, sends messages manually. No
employer portal. No HR system integration. No custom billing. Validates the channel
before building the channel.

**RIA partnership (investment adviser layer)**
An agreement with a licensed RIA who supervises Finn communications that cross into
advice territory. Required before v2 personalization (specific plan recommendations,
personalized contribution amounts). Begin negotiations during MVP phase so the
partnership is in place at Series A.

**Employer-subsidized pricing ($4/month per user, employer pays)**
Employer contract covers the per-seat cost for eligible employees. Employees access
Finn at no additional charge as a benefit. Billing via annual employer contract.
Standard employer deal at 500 employees: ~$300/month = $3,600/year, covering ~30
active users at 40% opt-in.

### Future (Post-Series A)

**Full employer channel with HR integrations**
Enrollment through standard HR/benefits platforms (Workday, BambooHR, ADP).
Automated employee onboarding tied to benefits enrollment. Employer-facing reporting
on program participation (anonymized, aggregate). Signed contracts with recognizable
employers.

**Personalized 529 recommendations (RIA-supervised)**
"Based on your state and fee sensitivity, here are the two plans most parents choose
in your situation" — education framed, comparison-driven, with no single prescriptive
recommendation, supervised by RIA partner. Enables higher activation rates and
deeper trust.

**Contribution tracking via financial data integration**
With parent consent, pull contribution history from a linked 529 account to
personalize check-in messages without asking the parent to self-report. "Emma's
account has $1,240 in it — about $400 more than this time last year" becomes
possible without the parent doing anything. Requires 529 plan administrator
partnership or open finance integration.

**Multi-child support**
Explicit support for families with more than one child: separate message tracks
per child, contribution split guidance, milestone management for multiple ages
simultaneously.

**Life event extensions**
Product naturally extends to adjacent parent financial moments earned by the
relationship: second child arrives → life insurance nudge. Child turns 5 →
kindergarten cost planning. Market event → calm reassurance. These are extensions
of the Finn relationship, not separate features. They are not built speculatively —
they are built when the retention and trust data supports the expansion.

**Referral program and gifting**
Integration with a platform like CollegeBacker to let family and friends contribute
to the child's 529 via a shareable link, driven by a Finn message. Requires legal
sign-off on referral structure (pass value to user, not Finn — cleanest legally
and highest conversion).

---

## 4. What We Are Explicitly NOT Building

This list is as important as the feature list. Every item below has been considered
and rejected for a specific reason.

**A dashboard, app, or user login**
The Finn value proposition is that the parent does not have to go anywhere. A
dashboard is a more elaborate version of the problem. Every time a user is asked
to log in, Finn is asking for the same thing that every other financial product
already asked for and didn't get. No dashboard. No app. No account portal.

**A financial advisor or advice service (at MVP)**
Finn does not give personalized investment advice in MVP. It provides financial
education. This is not a limitation on the product vision — it is the correct
regulatory structure for a product that has not yet established the compliance
infrastructure to supervise advice. The RIA partnership closes this gap in v2.

**A 529 account itself**
Finn does not open, hold, or administer 529 accounts. It helps parents get to the
decision point and then directs them to an established plan administrator. Money
never flows through Finn's infrastructure. This keeps Finn out of money transmission
regulation and out of the securities custody business.

**An app for users, of any kind**
No iOS app. No Android app. No progressive web app. No user-facing web interface
beyond the initial signup form. If a user asks to see their account, the answer is:
"Your 529 is managed directly by [the plan you chose]. I'll text you a summary next
month."

**A product for parents with financial advisors already**
Finn is not designed for the Claire persona. Upmarket creep — adding features to
serve higher-income, already-engaged parents — makes Finn a worse version of a
financial advisor. The Maya market is large enough, underserved enough, and structurally
better suited to Finn's product design. Serve Maya until the relationship data
justifies any expansion.

**A general personal finance tool**
Finn is a parent-specific, college-savings-specific product. Not a budget tracker.
Not a debt payoff tool. Not a net worth calculator. The specificity is the product.
Every expansion beyond this core must be earned by the existing relationship, not
added as a feature to increase retention.

**Affiliate or referral revenue (at MVP)**
No referral fees from 529 plan administrators until compliance infrastructure and
RIA supervision are in place. Subscription revenue only. When affiliate revenue is
added post-Series A, the value passes to the user ("open through this link, $25
goes into Emma's account"), not to Finn, as this eliminates the conflict of interest
cleanly.

**Anything that requires the parent to do more than reply to a text**
This is the product guardrail for every feature decision. If a proposed feature
requires the user to navigate to an external site beyond what a single-link-tap
enables, log into anything, fill out a form, or remember to do something later —
push back and flag it.

---

## 5. Success Metrics

### Primary Metric (MVP)

**30-day reply rate on the first substantive message: target 40%+**

Not the welcome message. Not the opt-in confirmation. The first message that asks
the parent to do something or respond to something. A 40% reply rate on a proactive
financial SMS would be extraordinary (email financial services benchmarks: 27% open,
6% response). This metric is fully within Finn's control and is a leading indicator
of downstream 529 account opening behavior.

Below 20% after 60 users: stop and diagnose before spending more. This is a
pre-commitment, not a guideline.

### Secondary Metric (MVP)

**Self-reported 529 account opening rate within 60 days: target 25%+**

Asked directly in a follow-up message: "Did you get a chance to set up the account?"
Even self-reported, a rate above 25% is strong signal the product is changing
behavior. Above 30% is exceptional. Below 10%: the product is appreciated but not
acting as a behavioral nudge — the core hypothesis fails.

### Operational Metrics (MVP + 6 Months)

| Metric | Target | Why It Matters |
|---|---|---|
| Monthly churn | Below 8% | Above 15% in first 3 months = product not working |
| STOP rate on any single message | Below 5% | Above 10% = message tone, frequency, or content wrong |
| "Who is this?" confused replies | Below 10% | Above 20% = onboarding clarity problem |
| Paying users at 6 months | 100–150 | Minimum for pre-seed narrative |
| Employer pilot (even informal) | At least 1 | Validates channel before building it |

### Series A Metrics (18 Months)

| Metric | Target |
|---|---|
| Active paying users | 2,000–3,000 |
| Consumer ARR | $192k–$288k |
| Employer ARR | $50k–$100k |
| Total ARR | ~$300k–$400k |
| 12-month retention | 68–75% |
| NPS | Above 50 |
| Blended CAC | Below $50 |
| Activation rate (529 opened in 90 days) | Above 60% |
| LTV:CAC demonstrated | Above 3:1 |

The most important single document for the Series A: the cohort retention chart
showing that users who survive month 3 stay. That chart, with 18 months of data,
is the foundation of the investment thesis.

### Long-Term Success Indicators (5 Years)

- 50,000+ active subscribers
- $5–8M ARR
- 30+ employer contracts
- Brand recognized in parental fintech category
- Product extended into adjacent parent financial moments earned by the relationship
  (not added speculatively)
- Either standalone Series B company or the most attractive acquisition target
  in the space for a Fidelity, a neobank, or a benefits platform

---

## 6. Business Model

### Consumer Subscription — $8/Month

Direct subscription charged monthly via Stripe. No annual commitment. Cancel any
time via Stripe customer portal link. No trial period in MVP (trial incentivizes
signups from non-buyers and contaminates early engagement metrics).

Price rationale: $8/month is below the threshold of "subscription I think about"
($10+) but above "round it up" ($5). It signals value without requiring deliberate
budget justification. It is a hypothesis — it will be tested and may change.

**Unit economics at $8/month:**
- SMS cost: ~$0.02/user/month
- AI inference (v2): ~$0.05/user/month
- Infrastructure, support, compliance overhead: ~$0.50/user/month
- Total COGS: ~$0.57/user/month
- Net revenue per user: **$7.43/month (93% gross margin)**
- CAC payback period at $40 blended CAC: **5.4 months**
- Realistic LTV at 30% annual churn, 10% discount rate: **~$211**
- LTV:CAC at realistic LTV: **5.3:1** (model survives punishing assumptions)

### Employer Benefits Channel — $4/Month Per Eligible User (Employer-Paid)

Employer pays a per-seat monthly fee covering all employees with young children
(typically 10–20% of workforce). Employees access Finn at no cost. Annual contracts.

This channel has lower ARPU ($4 vs $8) but near-zero per-user CAC and generates
word-of-mouth that seeds B2C growth in the employer's geography. It also creates
cleaner TCPA consent documentation than consumer opt-in.

**Employer channel economics (500-employee company example):**
- Eligible employees (~15% with young children): ~75
- Monthly employer payment: $4 × 75 = $300/month = $3,600/year
- Expected opt-in at 40%: ~30 active users

The employer channel loses money in year 1 (sales cost exceeds revenue), breaks
even in year 2–3, and generates approximately $60,000 net profit per sales rep
by year 3 as contracts renew. Patient capital required for this channel.

**Blended ARPU caution:** If the employer channel grows faster than consumer
(likely at scale), effective ARPU trends toward $4, not $8. Revenue per user
matters; gross margin structure holds either way.

### Future Revenue Opportunities (Post-Series A Only)

**Affiliate revenue, user-beneficial structure:** When affiliate revenue is added,
the value passes to the user ("open through this link, $25 goes into Emma's account")
rather than Finn receiving a referral fee. This eliminates the conflict of interest,
aligns incentives with the user, and likely produces higher conversion than a
disclosed-but-self-serving affiliate structure.

**Premium tier (speculative):** A higher-priced tier with enhanced personalization
post-RIA partnership. Not in scope until the base product is validated.

---

## 7. Regulatory Considerations

### Investment Adviser Registration Risk

529 college savings plans are municipal fund securities under the Securities Act of
1933 and MSRB rules. A product that recommends specific plans to specific people for
compensation likely meets the SEC's three-part investment adviser test: (1) advice
about securities, (2) in the business of providing such advice, (3) for compensation.
Operating as an unregistered investment adviser is a federal violation.

**MVP mitigation:** Education-only language throughout. No specific plan recommendations.
No personalized contribution amounts framed as advice. All links go to third-party
resources. Clear disclaimer in every message or linked landing page.

**Post-MVP path:** RIA partnership with a licensed registered investment adviser who
supervises Finn communications. Finn is the delivery and relationship layer. The RIA
is the regulated entity. This is the standard model used by Acorns, Stash, and
comparable fintech products. Begin this search during MVP phase. Target: agreement
in place before Series A closes.

### TCPA — Highest-Probability Operational Risk

The Telephone Consumer Protection Act carries statutory damages of $500–$1,500 per
message, no cap, no proof of harm required. Class action exposure. The plaintiffs'
bar is organized and active in financial services SMS.

**Non-negotiable compliance requirements before any commercial message is sent:**
- Double opt-in: initial consent + YES reply confirmation, both logged with timestamps
- 10DLC registration with Twilio (4–6 week process — must begin Day 1 of build)
- "Reply STOP to unsubscribe" in every single message
- Immediate opt-out processing and suppression list maintenance
- STOP and HELP keyword auto-responses configured
- TCPA-specialist attorney review of the complete consent flow — every screen,
  every word — before launch

One ambiguity in the opt-in flow can trigger a class action covering every message
ever sent. The defense is complete if done before launch.

### MSRB Disclosure Requirements

If any Finn message names or links to a specific 529 plan, MSRB communication rules
may apply. Legal review of the disclosure requirements specific to 529 plan references
is required before any message that names a plan is sent commercially.

### COPPA — Child Data

Finn collects data about children (name, age, birthdate) from parents. COPPA applies
to collection of information about children under 13. The parent-mediated model
(parent provides child data, not child) is treated differently, but the legal boundary
is not fully settled. Explicit legal sign-off on the data model required before launch.

### CFPB and UDAAP

The Consumer Financial Protection Bureau has authority over unfair, deceptive, or
abusive acts or practices by financial service providers. Exposure areas: any
misleading claims about financial outcomes, billing practices, and data practices.
The CFPB's 2024 circular on digital comparison shopping tools (which includes
recommendation engines) is directly relevant. Have an answer before Series A
investor diligence.

### Legal Budget

Budget $15,000–$40,000 for a thorough initial legal opinion covering investment
adviser status, TCPA consent flow review, and 529-specific disclosure requirements.
This is not optional spend. It is cheaper than the first hour of a TCPA class action
defense. It is a precondition for the first commercial message, not a post-launch
to-do.

**Required legal counsel types:** Fintech regulatory counsel with SEC/FINRA background
(investment adviser registration analysis). Separate TCPA class action defense or
compliance attorney (consent flow review). These are often different people.

---

## 8. Competitive Positioning

### The White Space

The parental fintech landscape can be mapped on two axes: proactive vs. reactive,
and simple vs. complex. The resulting 2x2 shows a clear pattern:

- **Proactive + Complex:** Nothing strong here. Products that reach out tend to add
  features to justify the outreach, becoming complex.
- **Reactive + Complex:** Fidelity 529, Greenlight, Origin/Northstar, Albert, Cleo.
  The dominant quadrant — dashboards, apps, account portals.
- **Reactive + Simple:** CollegeBacker (529 gifting tool). Simple but waits for the
  parent.
- **Proactive + Simple:** Finn's target position. **Empty.** No confirmed competitor.

The proactive + simple quadrant is genuinely unoccupied. Every product that is
proactive tends toward complexity because it needs a rich model of the user to know
when and how to reach out. Every product that is simple tends to be reactive because
simple products don't do much on their own. Holding both simultaneously is harder
than it looks and nobody has done it for this user.

### Adjacent Competitors (Not Direct)

**Acorns Early:** Custodial accounts for children (not 529). App-required, reactive,
gift-mechanic focused. Low overlap on product, different tax vehicle.

**CollegeBacker/Backer:** 529 gifting platform. 529-specific (meaningful overlap)
but a gifting tool, not a coaching product. No proactive outreach. Potential
partnership candidate.

**Greenlight:** Debit card and financial literacy platform for kids 6–18. Solves
a different problem (teach kids about money vs. parent college savings). Parent
base overlaps with Finn's target. Partnership or eventual competitive risk.

**Gradvisor (acquired by Vestwell):** B2B 529 plan comparison infrastructure.
The most credible incumbent threat that is not Fidelity. Vestwell has existing
employer 401k relationships and now owns 529 comparison infrastructure. Adding a
proactive SMS coaching layer is a plausible near-term product extension. Watch closely.

**Origin/Northstar/LearnLux:** Financial wellness platforms for employees via
employer benefits. Same distribution channel, different product philosophy
(dashboards, advisor access, comprehensive planning). Compete for the same HR
budget line. Not doing what Finn does.

**Albert/Cleo/Bright:** AI-powered personal finance assistants. Conversational
interface proven to work for the demographic. All reactive (user opens app), none
parent-specific or 529-focused. Cleo's engagement data is proof that conversational
financial coaching works for this age group. Not a direct threat.

### The Fidelity Question

Fidelity has the capabilities (40M+ customer accounts, NH 529 administration, SMS
infrastructure, compliance teams, brand trust) but lacks the product culture and
internal priority. A proactive SMS coaching product for new parents is too small a
TAM to matter to Fidelity until Finn proves it publicly. Below 50,000 users or a
Series A announcement, Finn is invisible to them. After that, Fidelity's internal
compliance and product review process takes 12–18 months minimum.

The realistic incumbent threat is Vestwell + Gradvisor, not Fidelity.

### The Defensible Moat

**Temporal context depth.** Every competitor, including a well-funded entrant tomorrow,
starts at zero relationship context. Finn in year 3 knows which nudges this family
responded to, which were ignored, what life events occurred, how contributions changed,
what framing resonated. This is not data — it is the texture of a relationship built
over years. It cannot be purchased, replicated, or reconstructed without starting
the relationship over. The 529 account is portable. The Finn relationship is not.

**The SMS channel.** SMS open rates of 90–98% (multiple 2025 sources) versus 27%
for financial services email. The absence of an app is the product for this specific
user. Finn's messages sit in the same inbox as texts from the parent's partner and
family. That adjacency creates warmth that no push notification achieves.

**The employer channel compound effect.** Each employer deal seeds word-of-mouth
growth in the employer's geography at near-zero per-user CAC. By year 3, each B2B
sales rep generates approximately $60,000 net profit annually as contracts renew.
The channel compounds. Replicating it requires the same patient capital investment
and sales motion.

**Simplicity as a culture commitment.** The proactive + simple position is not
defended by technology — it is defended by leadership discipline. Every investor,
enterprise HR buyer, and enthusiastic user will suggest adding something. The moat
is the commitment to not add it. The moment Finn tries to be more, it becomes a
worse version of something that already exists.

### Positioning Statement

Finn is the only proactive financial product built around the reality that new parents
have no attention to spare. Where every other financial product asks parents to do
something — log in, open an app, respond to an alert, fill out a form — Finn asks
almost nothing. One text. One action. Then silence until the next one. For the
parent who intends to save but never starts, Finn is the only product designed for
how they actually live.

---

## 9. Critical Assumptions and Risks

These are tracked here because they are live risks, not resolved ones.

**Assumption 1 (highest consequence if wrong): Parents who receive a proactive SMS
from Finn will complete a specific financial action, not just appreciate the nudge.**
The entire business model depends on this. It is well-supported by behavioral
economics research on single-action nudges, timing effects, and SMS engagement rates.
It has not been tested for Finn specifically. The MVP exists to prove or disprove it.
The 30-day reply rate is the leading indicator.

**Assumption 2: The proactive + simple position can be held under business pressure
to add features.** This is a culture and leadership risk, not a product risk. Every
investor and every user will suggest adding something. Defending simplicity under
pressure is a founder discipline. The MVP threshold (20% reply rate gate) must be
set and honored before starting. Low engagement is a signal that a core assumption
is wrong, not a reason to add features.

**Assumption 3: Monthly churn will stay below 25% annually.** Below 25%, Finn is
an exceptional business. Above 37%, LTV:CAC degrades below viability. The year 3–7
retention cliff — when the 529 is open, autopay is running, and Finn's message
increasingly says "you're on track, nothing to do" — is real and is not solved by
features. It is solved by the quality and personalization of the ongoing relationship
being worth $8 every month. That requires exceptional copy discipline over years.

**Assumption 4: Education-only language in MVP is sufficient to avoid investment
adviser registration.** The regulatory analysis strongly supports this. It has not
been tested with counsel specific to Finn's operating states. A written legal opinion
is required before the first commercial user. This assumption cannot remain unvalidated
past the start of the build.

**Assumption 5: The employer channel will convert during HR open enrollment at
meaningful rates (~40% opt-in).** Reasonable given product-market fit and high-intent
enrollment context. Not tested. One employer pilot — even informal — generates real
data on this before the B2B sales motion is built around it.

---

*This PRD is the canonical product specification as of 2026-02-21. Do not modify
without explicit instruction. The tech stack and architecture are defined separately
in ai/docs/architecture.md (not yet written). Implementation phases are defined
in ai/roadmaps/ (not yet written). Last updated: 2026-02-21*
