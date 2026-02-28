# PlateMate Gap Research Prompt — Third Research Pass
*Use in any deep research tool (Perplexity, Gemini, ChatGPT with search, Claude with search)*
*This prompt targets gaps NOT covered by the previous two research passes.*

## Context (give this to the AI before the prompt)

I am building an app at the intersection of personal budgeting and meal planning. I have already completed two rounds of deep research covering: Reddit/forum user complaints, app store reviews for 8 competitors, startup post-mortems, behavioral economics of food decisions, grocery retail app UX, willingness to pay, underserved demographics, and long-term retention mechanics.

The following prompt covers six areas that neither of those research passes addressed. Please treat each section as a separate research task and go deep on each.

---

## Section 1: Technical Infrastructure — What Is Actually Buildable and at What Cost?

I need to understand the real technical landscape for building an app that connects bank transactions to meal planning and grocery purchasing. This is about feasibility and cost, not theory.

**Financial data:**
- What are the **current pricing tiers for Plaid** — what does it cost per monthly active user for transaction data, and what are the terms that affect a consumer app with under 10,000 users?
- Are there **Plaid alternatives** (MX, Finicity, Yodlee, Akoya) that are cheaper or have better food/grocery merchant categorization out of the box?
- How accurate is **merchant categorization** from these APIs for food-specific merchants — specifically DoorDash, Uber Eats, Grubhub, Instacart, meal kit services, and restaurants vs. grocery stores? Is there published accuracy data?

**Grocery and recipe data:**
- What **grocery pricing APIs or data feeds** exist that provide real-time or near-real-time store pricing for US grocery chains (Walmart, Kroger, Whole Foods, Aldi, Target)? Are these public, licensed, or scraped?
- Does **Kroger have a developer API**? Does Walmart? What data is accessible and what are the terms?
- What **recipe and nutrition APIs** are available (Spoonacular, Edamam, Nutritionix) — what do they cost at scale, how large are their databases, and what are the known quality limitations?
- Has any company successfully **integrated grocery cart building** (pre-filling a Walmart or Instacart cart via API) — what are the technical and legal constraints of doing this?

**The stack reality:**
- If I combined Plaid + a recipe API + a grocery pricing data source, what would the **data infrastructure cost** at 1,000 MAU? At 10,000 MAU? Are there any reported cost structures from similar fintech or food-tech startups?

---

## Section 2: Go-to-Market — How Have Comparable Apps Actually Acquired Users?

I want to understand the real distribution playbook for consumer fintech and food apps — not marketing theory, but what has actually worked.

- How did **YNAB** grow its user base — what channels drove their early growth, and what does their marketing mix look like today (paid, organic, community, influencer)?
- How did **Mealime** acquire its reported 3M+ active users — what distribution tactics worked for them, and is there any reporting on their CAC or payback period?
- How did **Rocket Money** (Truebill) grow before its acquisition by Rocket Companies — what growth tactics were reported, and how much did they spend on acquisition?
- What role has **Reddit** played as a distribution channel for personal finance apps specifically — are there documented cases of apps that grew significantly through organic Reddit communities?
- For apps at the **budgeting + food intersection**, is there any documented influencer or creator channel that has worked (YouTube personal finance creators, TikTok food/budget creators, Instagram meal prep accounts)?
- What are the reported **App Store Optimization (ASO) dynamics** for budgeting and meal planning apps — which keywords drive the most installs, and how competitive is that space?
- Is there a **B2B2C distribution angle** that has worked for similar apps — e.g., selling through employers, health insurers, credit unions, or grocery loyalty programs? Any examples with reported outcomes?

---

## Section 3: Adjacent Products That Solved Behavior Change at Scale

I want to study apps in different categories that have successfully driven **sustained behavior change** — not just engagement — to understand what mechanics are transferable.

For each of the following, explain what specific UX, product, or business model mechanic drove retention and behavior change — not just that it "worked," but *how*:

- **Duolingo** — what made the streak mechanic effective, and what did their research show about which notifications and interventions worked vs. backfired?
- **Noom** — their psychology-first approach to food behavior change; what specifically drove their reported weight loss outcomes and what drove their extremely high reported churn?
- **Habitica** — gamification applied to habit formation; what worked, what didn't, and why did it stay niche?
- **Strava** — social accountability for fitness; what does research say about whether social features drove behavior change or just engagement?
- **Acorns / Digit** — "set it and forget it" micro-saving; what made automated, invisible action more effective than active budgeting? What are their reported retention rates?
- **Ibotta / Fetch Rewards** — cashback applied to grocery behavior; did rewards actually change purchasing behavior or just reward existing behavior? What does their data show?

The core question for each: **Is the mechanic that made it work transferable to a food-budgeting context, and what would break if you tried?**

---

## Section 4: The Food Industry Perspective — What DoorDash, Instacart, and Grocers Know

The budgeting and meal planning research focuses entirely on the consumer side. I want to understand what **the food delivery and grocery industries** know about consumer behavior that is not visible from the consumer side.

- What does **DoorDash's own reporting and investor communications** reveal about average order frequency, average order value, user retention, and what causes users to reduce or stop ordering?
- Has DoorDash or Uber Eats published or disclosed anything about **user cohort behavior** — do heavy users (5+ orders/month) tend to reduce usage over time, or does frequency increase?
- What do **grocery chains' loyalty program data** reveal about shopping behavior — is there any public research on how loyalty app users differ in spending patterns from non-app users?
- Is there any **industry research on food waste** at the household level — what percentage of groceries are thrown away, what is the estimated dollar value per household, and who has studied this?
- What is known about the **"grocery delivery markup problem"** — the gap between listed prices, service fees, and tips that makes grocery delivery significantly more expensive than in-store? Is there consumer awareness research on this?
- Have any **restaurant chains or food delivery platforms** experimented with budget-aware ordering features (e.g., "stay under $X," "cheaper alternatives") and reported results?

---

## Section 5: Regulatory and Data Privacy Landscape

An app that connects bank transactions to food purchasing and generates personalized recommendations operates in a complex regulatory environment. I need to understand the real constraints.

- What are the **current US regulations around consumer financial data sharing** — specifically, what does the CFPB's Section 1033 (open banking rule) mean for a startup that wants to use Plaid-connected bank data?
- What happened with **Plaid's legal history** — they settled a class action in 2022 over data collection practices. What were the specific allegations, what changed in their data practices, and what does this mean for apps built on Plaid?
- Under **CCPA (California) and state privacy laws**, what disclosures and consent requirements apply to an app that combines financial transaction data with food preferences and behavior tracking?
- Is there any **regulatory risk** in using a person's bank transaction data to infer health-related behavior (e.g., dietary patterns) — could this create HIPAA-adjacent obligations or FTC scrutiny?
- What are the **terms of service constraints** from Plaid, MX, and similar providers — specifically, what are you prohibited from doing with the data you access (selling it, sharing it, using it for ads)?
- Have any **fintech startups been penalized or forced to change practices** related to financial data + behavioral recommendation products? Any FTC enforcement actions relevant to this space?

---

## Section 6: The Sociology of Cooking in America — What the Data Actually Shows

Behavioral economics explains *why* people make irrational food decisions. Sociology and anthropology explain *what American food behavior actually looks like* at a structural level. I want the structural picture.

- What does **sociological research** say about how often Americans actually cook at home — not self-reported, but observed or measured? How has this changed from 2010 to 2024?
- What does research show about the **distribution of cooking skill and confidence** in the US adult population — what percentage feel competent to cook from scratch vs. using semi-prepared ingredients vs. unable to cook?
- Is there research on the **"cooking time" problem** — how much time do Americans actually have for meal preparation on weeknights, and how does this vary by household type (single, couple, family with kids, dual income)?
- What does research show about the relationship between **cooking and mental health** — is cooking experienced as stressful or restorative, and how does this differ by demographic?
- Is there data on the **"aspirational cook" gap** — people who buy cookbooks, watch cooking content, and aspire to cook more but don't follow through? How large is this group and what's known about what blocks them?
- What do **food sociologists say about the role of convenience food** in American life — is it purely economic, or are there social and identity dimensions that make it resistant to behavior change interventions?

---

## Research Parameters

- **Do not repeat** information from Reddit/forum posts, app store reviews, startup post-mortems, basic behavioral economics, or willingness-to-pay surveys — I have that research already
- Prioritize **primary sources**: investor filings, regulatory documents, academic papers, industry reports, official API documentation
- For Section 1 (technical), include **actual pricing or pricing tier structures** where available — not estimates
- For Section 3 (adjacent products), focus on **mechanisms**, not just outcomes — I want to understand *why* something worked
- For Section 5 (regulatory), be precise about **what is law vs. what is terms of service vs. what is best practice**
- Flag any findings that are **rapidly changing** (e.g., open banking regulation is evolving — note if a cited rule is pending or recently enacted)
- Cite **specific reports, papers, or documents** by name where possible so I can follow up

