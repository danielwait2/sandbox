# Tayt PRD

## 1. Product Summary
Tayt helps frequent eat-out users reduce food spending by converting past restaurant and delivery behavior into a practical weekly home-cooking plan and a prefilled grocery cart.

Tayt is a report-plus-execution product:
- Analyze recent food spend behavior.
- Recommend realistic meal replacements.
- Generate a ready-to-buy cart (starting with Walmart).

## 2. Problem Statement
Users know they spend too much on takeout, but they do not have an easy system to translate that awareness into action.

Current tools are fragmented:
- Budget apps show spend, but do not provide what-to-cook execution.
- Recipe apps provide ideas, but are not tied to spending patterns.
- Grocery apps help checkout, but do not plan substitutions for takeout behavior.

## 3. Target User
Primary ICP:
- Urban/suburban professionals and DINK households, age 25-40.
- Orders takeout or delivery multiple times per week.
- Feels budget pressure and wants to cook more, but lacks planning consistency.

Secondary ICP:
- Young families.
- Students/recent grads.

Out of scope:
- High-income users who optimize for convenience over savings.
- Users unwilling to connect financial/spending data.

## 4. Jobs To Be Done
When I review my monthly food spending,
I want to see where I overspent and get a concrete grocery plan,
so I can replace some takeout meals next week without heavy planning effort.

## 5. Value Proposition
"Turn last month's takeout spending into this week's cook-at-home plan and one-click grocery cart."

## 6. Goals and Non-Goals
### Goals
- Help users replace a measurable portion of takeout meals with home-cooked meals.
- Reduce user monthly food-away-from-home spend.
- Maximize cart creation and cart conversion from recommendations.

### Non-Goals
- Full pantry automation with image recognition.
- Full nutrition coaching or calorie tracking.
- Multi-retailer optimization engine.
- Real-time delivery app interception.

## 7. Differentiators
- Spend-to-plan conversion: converts actual past spend patterns into replacement meal plans.
- Report-to-cart workflow: insights are directly connected to a prefilled purchase action.
- Practical substitution design: focuses on realistic replacements, not generic recipe browsing.

## 8. Product Scope
### In Scope
- Financial data connection (or CSV import fallback).
- Basic classification: groceries vs restaurants/delivery.
- Weekly report:
  - Food spend breakdown.
  - Suggested number of meals to replace this week.
  - Estimated savings range from replacement plan.
- Recipe recommendation engine (simple rules model):
  - Time-to-cook filters (e.g., <= 20 min, <= 35 min).
  - Preference filters (cuisine, protein, dietary constraints).
  - Difficulty level.
- One-click Walmart cart generation for missing ingredients.
- Weekly check-in: "Did you cook these meals?" and "How many takeout meals did you skip?"

### Out of Scope
- Deep AI pantry inference from transaction line items.
- Dynamic pricing comparisons across multiple grocery retailers.
- Household-level collaborative planning.
- Native meal prep video content.

## 9. Core User Flow
1. User connects account (or uploads recent transactions).
2. Tayt generates "Last 30 days food spend report".
3. Tayt recommends a "Replace X meals this week" plan.
4. User selects preferred meal options.
5. Tayt generates Walmart cart for missing ingredients.
6. User checks out on Walmart.
7. Weekly follow-up captures completion and replacement outcomes.

## 10. Functional Requirements
- FR1: User can connect at least one spending data source.
- FR2: System classifies transactions into core food categories (restaurant/delivery/grocery).
- FR3: System generates a weekly replacement recommendation (meal count + estimated savings).
- FR4: User can set preferences (diet, cuisine, time, disliked ingredients).
- FR5: System suggests recipes mapped to replacement meal count.
- FR6: System creates a cart payload for Walmart for missing ingredients.
- FR7: System logs key events for analytics (report view, plan accepted, cart created, cart click-through, weekly check-in).

## 11. Non-Functional Requirements
- NFR1: Report generation under 10 seconds for typical user transaction volume.
- NFR2: Classification accuracy target >= 85% on labeled sample.
- NFR3: Privacy-first handling of financial data with explicit consent and clear data-use messaging.
- NFR4: Mobile-first UX.

## 12. Success Metrics
- Activation: % users who complete onboarding + data connection.
- Engagement: % users who view weekly report; % users who build at least one cart per week.
- Behavior Change: % engaged users reducing restaurant/delivery spend vs baseline.
- Commerce: cart creation rate and cart conversion proxy.

## 13. Monetization
Primary:
- Grocery affiliate/partner commissions on converted carts.

Secondary:
- Future premium tier ($3-$7/month) for advanced planning and deeper personalization, after strong retention and savings proof.

## 14. Risks and Mitigations
- Risk: Users like reports but do not cook.
  - Mitigation: smaller weekly replacement targets and low-effort recipes.
- Risk: Data connection friction reduces activation.
  - Mitigation: CSV/manual fallback and lightweight onboarding.
- Risk: Classification errors reduce trust.
  - Mitigation: user correction controls and feedback loop.
- Risk: Low cart conversion.
  - Mitigation: reduce ingredient count and prioritize pantry-friendly meals.

## 15. Open Questions
- What is the initial financial data provider strategy vs CSV-first approach?
- Which Walmart cart integration path is feasible earliest?
- How will we verify true cart conversion and purchase completion?
- Should the product focus on weekly planning only, or include optional mid-week top-up plans?

## 16. Version
- Version: v0.2
- Date: 2026-02-24
- Owner: Founder
