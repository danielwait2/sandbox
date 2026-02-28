import { db } from "@/lib/db";
import { model } from "@/lib/gemini";
import { upsertPriceHistory } from "@/lib/priceHistory";

export type ParsedItem = {
  raw_name: string;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  confidence: number;
};

export type ParsedReceipt = {
  retailer: { name: string };
  transaction: {
    date: string;
    subtotal: number | null;
    tax: number | null;
    total: number;
    order_number: string | null;
  };
  items: ParsedItem[];
};

const PROMPT_TEMPLATE = `You are a receipt parser. Your job is to extract purchased line items from retail purchase receipt emails.

FIRST, determine if this email is an actual purchase receipt — meaning it contains a list of products the customer bought with prices. Promotional emails, marketing emails, shipping notifications, order status updates, rewards summaries, and newsletters are NOT receipts.

If this email is NOT a purchase receipt, return exactly: {"not_a_receipt": true}

If it IS a purchase receipt, return ONLY a valid JSON object — no markdown, no explanation.

Required format:
{
  "retailer": { "name": "string" },
  "transaction": { "date": "YYYY-MM-DD", "subtotal": number | null, "tax": number | null, "total": number, "order_number": "string | null" },
  "items": [
    { "raw_name": "...", "name": "human-readable product name", "quantity": number, "unit_price": number, "total_price": number, "confidence": number }
  ]
}

Rules:
- "raw_name" is the exact abbreviated text from the receipt (e.g. "CHEERIOS-HN"); "name" is a human-readable normalized version (e.g. "Honey Nut Cheerios")
- "confidence" is 0.0–1.0 representing how certain you are about this line item's data
- Omit items that are clearly not products (e.g., subtotal lines, tax lines, loyalty rewards)
- If a field is missing from the email, use null
- Abbreviated item codes like "BSIFBREAST" should be decoded to "Boneless Skinless Chicken Breast", etc.

Email:
`;

const stripFences = (text: string): string => {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
};

const isValidParsed = (parsed: unknown): parsed is ParsedReceipt => {
  if (!parsed || typeof parsed !== "object") return false;
  const p = parsed as Record<string, unknown>;
  if (!p.transaction || typeof p.transaction !== "object") return false;
  const t = p.transaction as Record<string, unknown>;
  if (typeof t.date !== "string" || !t.date) return false;
  if (typeof t.total !== "number") return false;
  if (!Array.isArray(p.items) || p.items.length === 0) return false;
  return true;
};

export const parseReceipt = async (
  emailBody: string
): Promise<ParsedReceipt | null> => {
  try {
    const prompt = PROMPT_TEMPLATE + emailBody;
    const result = await model.generateContent(prompt);
    const raw = result.response.text();
    const cleaned = stripFences(raw);
    const parsed: unknown = JSON.parse(cleaned);
    if (!isValidParsed(parsed)) {
      console.error("[receiptParser] Invalid structure:", cleaned.slice(0, 200));
      return null;
    }
    return parsed;
  } catch (err) {
    console.error("[receiptParser] Parse failed:", err);
    return null;
  }
};

export const persistParsedReceipt = (
  receiptId: string,
  parsed: ParsedReceipt,
  userId: string
): void => {
  const now = new Date().toISOString();

  const updateReceipt = db.prepare(`
    UPDATE receipts
    SET transaction_date = ?,
        order_number = ?,
        subtotal = ?,
        tax = ?,
        total = ?,
        parsed_at = ?
    WHERE id = ?
  `);

  const insertItem = db.prepare(`
    INSERT INTO line_items
      (receipt_id, raw_name, name, quantity, unit_price, total_price, category, subcategory, confidence, user_overridden)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
  `);

  const transaction = db.transaction(() => {
    updateReceipt.run(
      parsed.transaction.date,
      parsed.transaction.order_number ?? null,
      parsed.transaction.subtotal ?? null,
      parsed.transaction.tax ?? null,
      parsed.transaction.total,
      now,
      receiptId
    );

    for (const item of parsed.items) {
      insertItem.run(
        receiptId,
        item.raw_name,
        item.name,
        item.quantity,
        item.unit_price,
        item.total_price,
        "",   // category filled in Phase 4
        null, // subcategory filled in Phase 4
        item.confidence
      );
    }
  });

  transaction();

  upsertPriceHistory(
    userId,
    parsed.items.map((item) => ({
      name: item.name,
      unit_price: item.unit_price,
      retailer: parsed.retailer.name,
      date: parsed.transaction.date,
    }))
  );
};
