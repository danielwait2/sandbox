import { db } from "@/lib/db";
import {
  AccountContext,
  ContributorFilter,
  buildReceiptContributorClause,
  getContributorUserIds,
} from "@/lib/account";

type FrequentItem = {
  name: string;
  count: number;
  totalSpent: number;
};

type ExpensiveItem = {
  name: string;
  totalPrice: number;
  retailer: string;
  date: string;
};

type CategoryTrend = {
  category: string;
  currentSpend: number;
  previousSpend: number;
  changePercent: number;
};

type DuplicatePurchase = {
  name: string;
  occurrences: number;
  dates: string[];
  totalSpent: number;
};

type AnnualizedCategory = {
  category: string;
  weeklyAvg: number;
  annualProjection: number;
};

type BulkBuySuggestion = {
  name: string;
  count: number;
  totalSpent: number;
  avgPrice: number;
};

export type InsightsData = {
  frequentItems: FrequentItem[];
  expensiveItems: ExpensiveItem[];
  categoryTrends: CategoryTrend[];
  duplicates: DuplicatePurchase[];
  annualized: AnnualizedCategory[];
  bulkBuySuggestions: BulkBuySuggestion[];
};

export function getTopFrequentItems(
  context: AccountContext,
  contributor: ContributorFilter,
  month: string
): FrequentItem[] {
  const contributorUserIds = getContributorUserIds(context, contributor);
  const scope = buildReceiptContributorClause("r", contributorUserIds);

  return db
    .prepare(
      `SELECT li.name, COUNT(*) as count, SUM(li.total_price) as totalSpent
       FROM line_items li JOIN receipts r ON li.receipt_id = r.id
       WHERE ${scope.whereSql} AND strftime('%Y-%m', r.transaction_date) = ?
       GROUP BY li.name
       ORDER BY count DESC
       LIMIT 5`
    )
    .all(...scope.params, month) as FrequentItem[];
}

export function getTopExpensiveItems(
  context: AccountContext,
  contributor: ContributorFilter,
  month: string
): ExpensiveItem[] {
  const contributorUserIds = getContributorUserIds(context, contributor);
  const scope = buildReceiptContributorClause("r", contributorUserIds);

  return db
    .prepare(
      `SELECT li.name, li.total_price as totalPrice, r.retailer, r.transaction_date as date
       FROM line_items li JOIN receipts r ON li.receipt_id = r.id
       WHERE ${scope.whereSql} AND strftime('%Y-%m', r.transaction_date) = ?
       ORDER BY li.total_price DESC
       LIMIT 5`
    )
    .all(...scope.params, month) as ExpensiveItem[];
}

export function getCategoryTrends(
  context: AccountContext,
  contributor: ContributorFilter,
  currentMonth: string
): CategoryTrend[] {
  const contributorUserIds = getContributorUserIds(context, contributor);
  const scope = buildReceiptContributorClause("r", contributorUserIds);

  const [year, monthNum] = currentMonth.split("-").map(Number);
  const prevDate = new Date(year, monthNum - 2, 1);
  const previousMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;

  const rows = db
    .prepare(
      `SELECT category,
              SUM(CASE WHEN strftime('%Y-%m', r.transaction_date) = ? THEN li.total_price ELSE 0 END) as currentSpend,
              SUM(CASE WHEN strftime('%Y-%m', r.transaction_date) = ? THEN li.total_price ELSE 0 END) as previousSpend
       FROM line_items li JOIN receipts r ON li.receipt_id = r.id
       WHERE ${scope.whereSql} AND strftime('%Y-%m', r.transaction_date) IN (?, ?)
       GROUP BY category
       HAVING currentSpend > 0 OR previousSpend > 0`
    )
    .all(currentMonth, previousMonth, ...scope.params, currentMonth, previousMonth) as {
    category: string;
    currentSpend: number;
    previousSpend: number;
  }[];

  return rows.map((row) => ({
    ...row,
    changePercent:
      row.previousSpend === 0
        ? row.currentSpend > 0
          ? 100
          : 0
        : Math.round(((row.currentSpend - row.previousSpend) / row.previousSpend) * 100),
  }));
}

export function getDuplicatePurchases(
  context: AccountContext,
  contributor: ContributorFilter,
  month: string
): DuplicatePurchase[] {
  const contributorUserIds = getContributorUserIds(context, contributor);
  const scope = buildReceiptContributorClause("r", contributorUserIds);

  const rows = db
    .prepare(
      `SELECT li.name, r.transaction_date as date, li.total_price
       FROM line_items li JOIN receipts r ON li.receipt_id = r.id
       WHERE ${scope.whereSql} AND strftime('%Y-%m', r.transaction_date) = ?
       ORDER BY li.name, r.transaction_date`
    )
    .all(...scope.params, month) as { name: string; date: string; total_price: number }[];

  const grouped = new Map<string, { dates: string[]; totalSpent: number }>();
  for (const row of rows) {
    const entry = grouped.get(row.name) ?? { dates: [], totalSpent: 0 };
    entry.dates.push(row.date);
    entry.totalSpent += row.total_price;
    grouped.set(row.name, entry);
  }

  const duplicates: DuplicatePurchase[] = [];
  for (const [name, entry] of grouped) {
    if (entry.dates.length < 2) continue;
    for (let i = 1; i < entry.dates.length; i++) {
      const daysDiff =
        (new Date(entry.dates[i]).getTime() - new Date(entry.dates[i - 1]).getTime()) /
        (1000 * 60 * 60 * 24);
      if (daysDiff <= 7) {
        duplicates.push({
          name,
          occurrences: entry.dates.length,
          dates: entry.dates,
          totalSpent: entry.totalSpent,
        });
        break;
      }
    }
  }

  return duplicates;
}

export function getAnnualizedSpending(
  context: AccountContext,
  contributor: ContributorFilter
): AnnualizedCategory[] {
  const contributorUserIds = getContributorUserIds(context, contributor);
  const scope = buildReceiptContributorClause("r", contributorUserIds);

  const rows = db
    .prepare(
      `SELECT li.category,
              SUM(li.total_price) as totalSpend,
              MIN(r.transaction_date) as firstDate,
              MAX(r.transaction_date) as lastDate
       FROM line_items li JOIN receipts r ON li.receipt_id = r.id
       WHERE ${scope.whereSql}
       GROUP BY li.category`
    )
    .all(...scope.params) as {
    category: string;
    totalSpend: number;
    firstDate: string;
    lastDate: string;
  }[];

  return rows
    .map((row) => {
      const weeks = Math.max(
        1,
        (new Date(row.lastDate).getTime() - new Date(row.firstDate).getTime()) /
          (1000 * 60 * 60 * 24 * 7)
      );
      const weeklyAvg = row.totalSpend / weeks;
      return {
        category: row.category,
        weeklyAvg: Math.round(weeklyAvg * 100) / 100,
        annualProjection: Math.round(weeklyAvg * 52 * 100) / 100,
      };
    })
    .sort((a, b) => b.annualProjection - a.annualProjection);
}

export function getBulkBuySuggestions(
  context: AccountContext,
  contributor: ContributorFilter
): BulkBuySuggestion[] {
  const contributorUserIds = getContributorUserIds(context, contributor);
  const scope = buildReceiptContributorClause("r", contributorUserIds);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoff = thirtyDaysAgo.toISOString().slice(0, 10);

  return db
    .prepare(
      `SELECT li.name, COUNT(*) as count, SUM(li.total_price) as totalSpent,
              AVG(li.unit_price) as avgPrice
       FROM line_items li JOIN receipts r ON li.receipt_id = r.id
       WHERE ${scope.whereSql} AND r.transaction_date >= ?
       GROUP BY li.name
       HAVING count >= 3
       ORDER BY count DESC`
    )
    .all(...scope.params, cutoff) as BulkBuySuggestion[];
}

export function getAllInsights(
  context: AccountContext,
  contributor: ContributorFilter,
  month: string
): InsightsData {
  return {
    frequentItems: getTopFrequentItems(context, contributor, month),
    expensiveItems: getTopExpensiveItems(context, contributor, month),
    categoryTrends: getCategoryTrends(context, contributor, month),
    duplicates: getDuplicatePurchases(context, contributor, month),
    annualized: getAnnualizedSpending(context, contributor),
    bulkBuySuggestions: getBulkBuySuggestions(context, contributor),
  };
}
