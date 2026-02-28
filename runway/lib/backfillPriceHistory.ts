import { db } from "@/lib/db";
import { upsertPriceHistory } from "@/lib/priceHistory";

export function backfillPriceHistoryIfEmpty(userId: string): void {
  type CountRow = { count: number };
  const { count } = db
    .prepare("SELECT COUNT(*) as count FROM price_history WHERE user_id = ?")
    .get(userId) as CountRow;

  if (count > 0) return;

  type ItemRow = {
    name: string;
    unit_price: number;
    retailer: string;
    date: string;
  };

  const rows = db
    .prepare(
      `SELECT li.name, li.unit_price, r.retailer, r.transaction_date AS date
       FROM line_items li
       JOIN receipts r ON r.id = li.receipt_id
       WHERE r.user_id = ?`
    )
    .all(userId) as ItemRow[];

  if (rows.length === 0) return;

  upsertPriceHistory(userId, rows);
}
