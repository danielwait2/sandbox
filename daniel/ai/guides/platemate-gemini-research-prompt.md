# PlateMate Pain Point Research — Gemini Deep Research Prompt

*Use this prompt verbatim in Gemini with Deep Research mode enabled.*
*This is intentionally different from the Perplexity prompt — it targets gaps not covered by Reddit/app review research.*

---

## Prompt

I am building an app at the intersection of personal budgeting and meal planning. I have already done research on Reddit community complaints and app store reviews. Now I want to go deeper on six specific areas that require different sources — academic research, business journalism, startup post-mortems, behavioral economics literature, and grocery/retail industry reporting. Please research all six sections below:

---

### 1. Startup Post-Mortems: What Has Already Failed in This Space?

I need to understand the graveyard of apps and companies that tried to solve the budgeting-meal planning intersection or adjacent problems. Please research:

- Any startups or apps that tried to combine **budgeting + grocery/meal planning** that have since shut down, pivoted, or been acquired — what happened to them and why?
- What happened to **Mint** after Intuit shut it down in 2024? What did Intuit learn from it, and what did users migrate to?
- Apps that tried to help users **reduce food delivery spending** (nudge apps, delivery trackers, "cook instead of order" tools) — did any gain traction? What failed?
- What happened to **meal kit services** (HelloFresh, Blue Apron, etc.) in terms of **user retention**? What was their reported churn rate and what were the main stated reasons for cancellation?
- Are there any **documented pivots** from "budgeting" to "food" or vice versa in the fintech or food-tech space?

For each failure or pivot, focus on: what the product promised, what actually happened to retention, and what the founders or press cited as the root cause.

---

### 2. Behavioral Economics of Food Decisions

I want to understand the academic and applied research on **why people make bad food spending decisions** even when they know better. Specifically:

- What does behavioral economics research say about **present bias and food purchasing** — how much do people overweight immediate convenience vs. future savings when ordering food?
- Is there research on the **"what the hell effect"** (one bad food decision leading to a cascade of bad decisions) applied to food budgets or delivery spending? How does this manifest?
- What does research say about the **most effective intervention timing** for food-related behavior change — before the meal decision, at the point of purchase, or after the fact?
- What do behavioral economists know about the difference between **intention-action gaps** in food vs. other spending categories? Is food harder to change than, say, subscription spending?
- What has been shown to work in **nudge-based food interventions** — cafeteria studies, app-based nudges, commitment devices? What effect sizes have been demonstrated?
- Is there research on **ADHD and food spending specifically** — impulsivity, executive dysfunction, and delivery app usage patterns?

Cite studies and authors where possible. I want to understand what interventions are evidence-based vs. just intuitive.

---

### 3. Grocery Retail Apps — Pain Points and Gaps

I want to understand the user experience failures in **grocery store apps and grocery delivery platforms** specifically, because these would be the integration partners for any food-budget app. Research:

- What are the **most common complaints** about grocery store apps (Walmart Grocery, Kroger/King Soopers, Instacart, Shipt, Amazon Fresh)?
- What is the reported user experience of **Instacart's budgeting/price tracking features** — do users find them useful? What falls short?
- Do grocery apps show users **price-per-unit comparisons** in ways that help them make budget-conscious decisions, or do users report those features as broken or hard to use?
- What do users say about **grocery delivery fees and the hidden cost problem** — are people aware of how much markup + fees + tips add to their grocery bill when ordering via delivery?
- Is there any reported data on the **gap between what users plan to buy and what they actually buy** (impulse purchases, substitutions) when ordering online vs. shopping in person?
- What are the **open APIs or developer integrations** available for major grocery chains — is there documented developer access to Walmart, Kroger, Instacart, or Whole Foods product/pricing data?

---

### 4. Willingness to Pay — What Monetization Has Actually Worked

I want to understand the **real-world pricing and monetization data** for apps adjacent to this space, not just theoretical models. Research:

- What **price points** have worked for YNAB, Copilot, and Monarch Money — what is their reported subscriber count, ARPU, and churn rate if publicly disclosed?
- For meal planning apps specifically, what price points have shown the highest **conversion from free to paid**? Is there published data from Mealime, PlateJoy, or eMeals?
- What does research say about **success-fee monetization** (charging a % of savings) in fintech — where has this worked (Rocket Money/Truebill), where has it failed, and what are the trust/UX tradeoffs?
- Are there examples of **health or food apps that have sold to employers or health insurers** as a B2B channel? What price points and outcomes were reported?
- What is the reported **average monthly food spend** for US households by income bracket and household size — I want to understand the scale of savings I could realistically offer users as a value proposition?
- What do users say they'd pay for an app that **provably saved them money on groceries and food delivery**? Is there survey data on willingness to pay for personal finance or food tools?

---

### 5. Underserved Demographics — Beyond Millennials and College Students

The most visible research on budgeting and food apps focuses on millennials, Gen Z, and college students. I want to understand **other demographics with acute pain** that are less visible in consumer tech research:

- **Single parents** — what does research or reporting say about their food budgeting challenges specifically? Do they have distinct pain points around meal planning (time, kid preferences, unpredictability)?
- **Shift workers and hourly employees** — how do irregular income schedules affect food budgeting and meal planning? Are there apps or tools designed for irregular income budgeting that have worked?
- **People managing medical dietary constraints** (Type 1 diabetes, celiac disease, food allergies, renal diet) — how do they currently manage the intersection of medical dietary needs, meal planning, and food cost? What tools do they use and what fails?
- **Seniors and retirees on fixed incomes** — how do they approach food budgeting? Is there any research on their app adoption patterns and unmet needs?
- **Immigrants and multicultural households** — is there research on how recipe/meal planning apps fail for households that cook cuisines not well represented in mainstream recipe databases?

For each demographic, if possible: segment size, specific failure of current tools, and any existing apps that partially serve them.

---

### 6. What Actually Drives Long-Term Retention in Habit Apps

I've found plenty of research on why people quit apps. I want to understand the flip side: **what makes people stick** with budgeting or health behavior apps for 6–12+ months. Research:

- What does research say about the **retention curve** for budgeting apps specifically — at what point do most users churn (day 1, week 1, month 1, month 3)?
- What features or UX patterns are **correlated with long-term retention** in personal finance apps? Are there published analyses from YNAB, Mint, or similar?
- In habit formation research, what is the **minimum effective "streak" or commitment** to create a durable habit — how long does a new financial or food behavior need to be practiced before it becomes self-sustaining?
- What does research say about **social features and accountability** in behavior change apps — do shared goals, accountability partners, or community features improve retention, and by how much?
- Are there examples of **apps that successfully converted a one-time "aha moment"** (e.g., "I spent $10k on DoorDash last year") into sustained engagement? What was the mechanism?
- What role does **perceived ROI** play in retention for paid apps — if a user can see a dollar value they've saved, does that reduce churn? Is there data on this?

---

### Research Parameters

- Prioritize **academic studies, industry reports, and business journalism** (not Reddit or app store reviews — I have those already)
- Use sources from **2020–2025** where possible
- Focus on **US market** but flag if international data is significantly different
- When citing behavioral economics research, include **author names and study context** so I can follow up
- When citing business outcomes (churn, ARPU, subscriber counts), note whether the data is **disclosed/verified or estimated**
- Flag any findings that **contradict intuitive assumptions** — I'm specifically interested in where the data surprises

