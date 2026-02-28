import { db } from "@/lib/db";
import type { PriceHistoryEntry } from "@/lib/types";
import { normalizeItemName } from "@/lib/normalizeItemName";
export { normalizeItemName } from "@/lib/normalizeItemName";

export function upsertPriceHistory(
  userId: string,
  items: Array<{ name: string; unit_price: number; retailer: string; date: string }>
): void {
  const insert = db.prepare(
    "INSERT INTO price_history (user_id, item_name_normalized, unit_price, retailer, date) VALUES (?, ?, ?, ?, ?)"
  );

  const insertMany = db.transaction(() => {
    for (const item of items) {
      const normalized = normalizeItemName(item.name);
      insert.run(userId, normalized, item.unit_price, item.retailer, item.date);
    }
  });

  insertMany();
}

export function getPriceHistory(
  userId: string,
  normalizedName: string
): PriceHistoryEntry[] {
  return db
    .prepare(
      "SELECT * FROM price_history WHERE user_id = ? AND item_name_normalized = ? ORDER BY date ASC"
    )
    .all(userId, normalizedName) as PriceHistoryEntry[];
}
