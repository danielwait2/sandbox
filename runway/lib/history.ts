import { db } from "@/lib/db";
import {
  AccountContext,
  ContributorFilter,
  buildReceiptContributorClause,
  getContributorUserIds,
} from "@/lib/account";

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
  contributor_user_id: string;
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

export type ReceiptWithItems = ReceiptRow & {
  contributorRole: "owner" | "member";
  items: LineItemRow[];
};

export function getMonthlySpending(
  context: AccountContext,
  contributor: ContributorFilter,
  startDate: string,
  endDate: string
): MonthlySpending[] {
  const contributorUserIds = getContributorUserIds(context, contributor);
  const scope = buildReceiptContributorClause("receipts", contributorUserIds);

  return db
    .prepare(
      `SELECT strftime('%Y-%m', transaction_date) as month, SUM(total) as total
       FROM receipts
       WHERE ${scope.whereSql} AND transaction_date >= ? AND transaction_date < ?
       GROUP BY month
       ORDER BY month`
    )
    .all(...scope.params, `${startDate}-01`, `${endDate}-31`) as MonthlySpending[];
}

export function getMonthlyCategorySpending(
  context: AccountContext,
  contributor: ContributorFilter,
  startDate: string,
  endDate: string
): MonthlyCategorySpending[] {
  const contributorUserIds = getContributorUserIds(context, contributor);
  const scope = buildReceiptContributorClause("r", contributorUserIds);

  return db
    .prepare(
      `SELECT strftime('%Y-%m', r.transaction_date) as month, li.category, SUM(li.total_price) as total
       FROM line_items li JOIN receipts r ON li.receipt_id = r.id
       WHERE ${scope.whereSql} AND r.transaction_date >= ? AND r.transaction_date < ?
       GROUP BY month, li.category
       ORDER BY month, total DESC`
    )
    .all(...scope.params, `${startDate}-01`, `${endDate}-31`) as MonthlyCategorySpending[];
}

export function getHistorySummary(
  context: AccountContext,
  contributor: ContributorFilter,
  startDate: string,
  endDate: string
): HistorySummary {
  const contributorUserIds = getContributorUserIds(context, contributor);
  const receiptScope = buildReceiptContributorClause("receipts", contributorUserIds);
  const joinedScope = buildReceiptContributorClause("r", contributorUserIds);

  const row = db
    .prepare(
      `SELECT COALESCE(SUM(total), 0) as totalSpend, COUNT(*) as receiptCount
       FROM receipts
       WHERE ${receiptScope.whereSql} AND transaction_date >= ? AND transaction_date < ?`
    )
    .get(...receiptScope.params, `${startDate}-01`, `${endDate}-31`) as {
    totalSpend: number;
    receiptCount: number;
  };

  const monthCount = db
    .prepare(
      `SELECT COUNT(DISTINCT strftime('%Y-%m', transaction_date)) as months
       FROM receipts
       WHERE ${receiptScope.whereSql} AND transaction_date >= ? AND transaction_date < ?`
    )
    .get(...receiptScope.params, `${startDate}-01`, `${endDate}-31`) as { months: number };

  const topCat = db
    .prepare(
      `SELECT li.category
       FROM line_items li JOIN receipts r ON li.receipt_id = r.id
       WHERE ${joinedScope.whereSql} AND r.transaction_date >= ? AND r.transaction_date < ?
       GROUP BY li.category
       ORDER BY SUM(li.total_price) DESC
       LIMIT 1`
    )
    .get(...joinedScope.params, `${startDate}-01`, `${endDate}-31`) as
    | { category: string }
    | undefined;

  return {
    totalSpend: row.totalSpend,
    avgPerMonth: monthCount.months > 0 ? Math.round((row.totalSpend / monthCount.months) * 100) / 100 : 0,
    receiptCount: row.receiptCount,
    topCategory: topCat?.category ?? null,
  };
}

export function getReceiptsForMonth(
  context: AccountContext,
  contributor: ContributorFilter,
  month: string
): ReceiptWithItems[] {
  const contributorUserIds = getContributorUserIds(context, contributor);
  const scope = buildReceiptContributorClause("receipts", contributorUserIds);

  const receipts = db
    .prepare(
      `SELECT id, retailer, transaction_date, total, order_number,
              COALESCE(contributor_user_id, user_id) as contributor_user_id
       FROM receipts
       WHERE ${scope.whereSql} AND strftime('%Y-%m', transaction_date) = ?
       ORDER BY transaction_date DESC`
    )
    .all(...scope.params, month) as ReceiptRow[];

  const itemStmt = db.prepare(
    `SELECT id, receipt_id, name, quantity, unit_price, total_price, category, subcategory
     FROM line_items WHERE receipt_id = ?`
  );

  return receipts.map((r) => ({
    ...r,
    contributorRole: r.contributor_user_id === context.ownerUserId ? "owner" : "member",
    items: itemStmt.all(r.id) as LineItemRow[],
  }));
}
