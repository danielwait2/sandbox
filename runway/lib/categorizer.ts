import { AccountContext } from "@/lib/account";
import { db } from "@/lib/db";
import { model } from "@/lib/gemini";
import { applyRules } from "@/lib/rulesEngine";

type CategorizeResult = {
  category: string;
  subcategory: string | null;
  confidence: number;
};

type LineItemRow = {
  id: number;
  name: string;
};

const PROMPT_PREFIX = `Categorize this grocery/retail item into exactly one of the following categories.
Return ONLY valid JSON — no markdown, no explanation.

Categories: Groceries, Household, Baby & Kids, Health & Wellness, Personal Care,
Electronics, Clothing & Apparel, Pet Supplies, Other

Subcategories (use only if applicable):
Groceries: Produce, Dairy & Eggs, Meat & Seafood, Pantry, Snacks, Beverages, Frozen, Bakery
Household: Cleaning, Paper Goods, Storage & Organization
Baby & Kids: Diapers, Formula, Clothing, Toys
Health & Wellness: OTC Medicine, First Aid, Supplements
Personal Care: Beauty, Hygiene
Electronics: Devices, Accessories
Pet Supplies: Food, Accessories

Item name: "`;

const PROMPT_SUFFIX = `"

Required format:
{ "category": "...", "subcategory": "..." | null, "confidence": 0.0-1.0 }`;

const stripFences = (text: string): string =>
  text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

export const categorizeWithGemini = async (
  itemName: string
): Promise<CategorizeResult> => {
  try {
    const prompt = PROMPT_PREFIX + itemName + PROMPT_SUFFIX;
    const result = await model.generateContent(prompt);
    const raw = result.response.text();
    const parsed: unknown = JSON.parse(stripFences(raw));
    if (
      parsed &&
      typeof parsed === "object" &&
      "category" in parsed &&
      typeof (parsed as Record<string, unknown>).category === "string"
    ) {
      const p = parsed as Record<string, unknown>;
      return {
        category: p.category as string,
        subcategory: typeof p.subcategory === "string" ? p.subcategory : null,
        confidence: typeof p.confidence === "number" ? p.confidence : 0.5,
      };
    }
  } catch {
    // fall through to default
  }
  return { category: "Other", subcategory: null, confidence: 0.5 };
};

export const categorizeItems = async (
  context: AccountContext
): Promise<{ categorized: number; rulesHit: number; llmUsed: number; reviewQueue: number }> => {
  const userId = context.viewerUserId;
  const items = db
    .prepare(
      `SELECT li.id, li.name
       FROM line_items li
       JOIN receipts r ON r.id = li.receipt_id
       WHERE r.account_id = ?
         AND (r.contributor_user_id = ? OR r.user_id = ?)
         AND (li.category IS NULL OR li.category = '')`
    )
    .all(context.accountId, userId, userId) as LineItemRow[];

  const updateStmt = db.prepare(
    `UPDATE line_items SET category = ?, subcategory = ?, confidence = ? WHERE id = ?`
  );

  let rulesHit = 0;
  let llmUsed = 0;
  let reviewQueue = 0;

  type Resolved = { id: number; category: string; subcategory: string | null; confidence: number };

  const BATCH = 10;
  for (let i = 0; i < items.length; i += BATCH) {
    const batch = items.slice(i, i + BATCH);

    // Resolve categories in parallel (async Gemini calls)
    const resolved: Resolved[] = await Promise.all(
      batch.map(async (item) => {
        const ruleMatch = applyRules(item.name);
        if (ruleMatch) {
          rulesHit++;
          return { id: item.id, category: ruleMatch.category, subcategory: ruleMatch.subcategory, confidence: 1.0 };
        }
        const r = await categorizeWithGemini(item.name);
        llmUsed++;
        if (r.confidence < 0.4) reviewQueue++;
        return { id: item.id, ...r };
      })
    );

    // Persist in a synchronous transaction
    db.transaction(() => {
      for (const r of resolved) {
        updateStmt.run(r.category, r.subcategory, r.confidence, r.id);
      }
    })();
  }

  return { categorized: items.length, rulesHit, llmUsed, reviewQueue };
};
