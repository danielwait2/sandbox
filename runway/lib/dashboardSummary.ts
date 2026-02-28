import {
  AccountContext,
  ContributorFilter,
  buildReceiptContributorClause,
  getContributorUserIds,
} from "@/lib/account";
import { backfillPriceHistoryIfEmpty } from "@/lib/backfillPriceHistory";
import { seedBudgetFromDefaults } from "@/lib/budgets";
import { db } from "@/lib/db";

const DEFAULT_CATEGORIES = [
  "Groceries",
  "Household",
  "Baby & Kids",
  "Health & Wellness",
  "Personal Care",
  "Electronics",
  "Clothing & Apparel",
  "Pet Supplies",
  "Other",
];

export function getDateRange(period: string): { startDate: string; endDate: string } {
  const now = new Date();

  if (period === "last_month") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return {
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
    };
  }

  if (period === "3_months") {
    const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
    };
  }

  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

export type DashboardSummary = {
  period: string;
  contributor: ContributorFilter;
  totalSpend: number;
  receiptCount: number;
  topCategory: string;
  categories: {
    name: string;
    spend: number;
    budget: number | null;
    itemCount: number;
  }[];
};

export function getDashboardSummary(
  context: AccountContext,
  period: string,
  contributor: ContributorFilter
): DashboardSummary {
  const { startDate, endDate } = getDateRange(period);
  const startMonth = startDate.slice(0, 7);
  const contributorUserIds = getContributorUserIds(context, contributor);
  const receiptScope = buildReceiptContributorClause("r", contributorUserIds);

  seedBudgetFromDefaults(context.ownerUserId, startMonth);
  backfillPriceHistoryIfEmpty(context.ownerUserId);

  type CategoryRow = { category: string; spend: number; item_count: number };
  const categoryRows = db
    .prepare(
      `SELECT li.category, SUM(li.total_price) as spend, COUNT(li.id) as item_count
       FROM line_items li JOIN receipts r ON li.receipt_id = r.id
       WHERE ${receiptScope.whereSql} AND r.transaction_date >= ? AND r.transaction_date <= ?
       GROUP BY li.category`
    )
    .all(...receiptScope.params, startDate, endDate) as CategoryRow[];

  type CountRow = { count: number };
  const { count: receiptCount } = db
    .prepare(
      `SELECT COUNT(DISTINCT r.id) as count
       FROM receipts r JOIN line_items li ON li.receipt_id = r.id
       WHERE ${receiptScope.whereSql} AND r.transaction_date >= ? AND r.transaction_date <= ?`
    )
    .get(...receiptScope.params, startDate, endDate) as CountRow;

  type BudgetRow = { category: string; amount: number };
  const budgetRows = db
    .prepare(
      `SELECT category, amount FROM budgets WHERE user_id = ? AND month = ?`
    )
    .all(context.ownerUserId, startMonth) as BudgetRow[];

  const budgetMap = new Map<string, number>();
  for (const b of budgetRows) {
    budgetMap.set(b.category, b.amount);
  }

  const spendMap = new Map<string, { spend: number; itemCount: number }>();
  for (const row of categoryRows) {
    spendMap.set(row.category, { spend: row.spend, itemCount: row.item_count });
  }

  let totalSpend = 0;
  let topCategory = "";
  let topSpend = -1;

  const categories = DEFAULT_CATEGORIES.map((name) => {
    const s = spendMap.get(name) ?? { spend: 0, itemCount: 0 };
    totalSpend += s.spend;
    if (s.spend > topSpend) {
      topSpend = s.spend;
      topCategory = name;
    }
    return {
      name,
      spend: s.spend,
      budget: budgetMap.get(name) ?? null,
      itemCount: s.itemCount,
    };
  });

  const sortedCategories = [
    ...categories.filter((category) => category.spend > 0),
    ...categories.filter((category) => category.spend <= 0),
  ];

  return {
    period,
    contributor,
    totalSpend,
    receiptCount,
    topCategory: receiptCount > 0 ? topCategory : "",
    categories: sortedCategories,
  };
}
