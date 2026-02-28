import { db } from "@/lib/db";

export type MonthlySpending = {
  month: string;
  total: number;
};

export type MonthlyCategorySpending = {
  month: string;
  category: string;
  total: number;
};

export type HistorySummary = {
  totalSpend: number;
  avgPerMonth: number;
  receiptCount: number;
  topCategory: string | null;
};

type ReceiptRow = {
  id: string;
  retailer: string;
  transaction_date: string;
  total: number;
  order_number: string | null;
};

type LineItemRow = {
  id: number;
  receipt_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category: string;
  subcategory: string | null;
};

export type ReceiptWithItems = ReceiptRow & { items: LineItemRow[] };

export function getMonthlySpending(
  userId: string,
  startDate: string,
  endDate: string
): MonthlySpending[] {
  return db
    .prepare(
      `SELECT strftime('%Y-%m', transaction_date) as month, SUM(total) as total
       FROM receipts
       WHERE user_id = ? AND transaction_date >= ? AND transaction_date < ?
       GROUP BY month
       ORDER BY month`
    )
    .all(userId, `${startDate}-01`, `${endDate}-31`) as MonthlySpending[];
}

export function getMonthlyCategorySpending(
  userId: string,
  startDate: string,
  endDate: string
): MonthlyCategorySpending[] {
  return db
    .prepare(
      `SELECT strftime('%Y-%m', r.transaction_date) as month, li.category, SUM(li.total_price) as total
       FROM line_items li JOIN receipts r ON li.receipt_id = r.id
       WHERE r.user_id = ? AND r.transaction_date >= ? AND r.transaction_date < ?
       GROUP BY month, li.category
       ORDER BY month, total DESC`
    )
    .all(userId, `${startDate}-01`, `${endDate}-31`) as MonthlyCategorySpending[];
}

export function getHistorySummary(
  userId: string,
  startDate: string,
  endDate: string
): HistorySummary {
  const row = db
    .prepare(
      `SELECT COALESCE(SUM(total), 0) as totalSpend, COUNT(*) as receiptCount
       FROM receipts
       WHERE user_id = ? AND transaction_date >= ? AND transaction_date < ?`
    )
    .get(userId, `${startDate}-01`, `${endDate}-31`) as {
    totalSpend: number;
    receiptCount: number;
  };

  const monthCount = db
    .prepare(
      `SELECT COUNT(DISTINCT strftime('%Y-%m', transaction_date)) as months
       FROM receipts
       WHERE user_id = ? AND transaction_date >= ? AND transaction_date < ?`
    )
    .get(userId, `${startDate}-01`, `${endDate}-31`) as { months: number };

  const topCat = db
    .prepare(
      `SELECT li.category
       FROM line_items li JOIN receipts r ON li.receipt_id = r.id
       WHERE r.user_id = ? AND r.transaction_date >= ? AND r.transaction_date < ?
       GROUP BY li.category
       ORDER BY SUM(li.total_price) DESC
       LIMIT 1`
    )
    .get(userId, `${startDate}-01`, `${endDate}-31`) as { category: string } | undefined;

  return {
    totalSpend: row.totalSpend,
    avgPerMonth: monthCount.months > 0 ? Math.round((row.totalSpend / monthCount.months) * 100) / 100 : 0,
    receiptCount: row.receiptCount,
    topCategory: topCat?.category ?? null,
  };
}

export function getReceiptsForMonth(userId: string, month: string): ReceiptWithItems[] {
  const receipts = db
    .prepare(
      `SELECT id, retailer, transaction_date, total, order_number
       FROM receipts
       WHERE user_id = ? AND strftime('%Y-%m', transaction_date) = ?
       ORDER BY transaction_date DESC`
    )
    .all(userId, month) as ReceiptRow[];

  const itemStmt = db.prepare(
    `SELECT id, receipt_id, name, quantity, unit_price, total_price, category, subcategory
     FROM line_items WHERE receipt_id = ?`
  );

  return receipts.map((r) => ({
    ...r,
    items: itemStmt.all(r.id) as LineItemRow[],
  }));
}
