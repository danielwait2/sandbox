import { db } from "@/lib/db";
import {
  AccountContext,
  ContributorFilter,
  buildReceiptContributorClause,
  getContributorUserIds,
} from "@/lib/account";
import { getContributorDisplayNameMap } from "@/lib/contributorProfiles";

export type MonthlySpending = {
  month: string;
  total: number;
};

export type DailySpending = {
  date: string;
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

export type CurrentVsProjectedPoint = {
  date: string;
  current: number;
  projected: number;
};

export type ProjectionMethod = "budget" | "historical_average" | "mixed";

export type CurrentVsProjectedSeries = {
  contributor: ContributorFilter;
  selectedCategory: string | null;
  categories: string[];
  projectionMethod: ProjectionMethod;
  points: CurrentVsProjectedPoint[];
};

type ReceiptRow = {
  id: string;
  retailer: string;
  transaction_date: string;
  total: number;
  order_number: string | null;
  contributor_user_id: string;
  contributor_display_name?: string;
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

type MonthlyCategoryTotalRow = {
  month: string;
  category: string;
  total: number;
};

type BudgetRow = {
  category: string;
  month: string;
  amount: number;
};

type DailyCategoryTotalRow = {
  date: string;
  category: string;
  total: number;
};

const LOOKBACK_MONTHS = 3;

const roundCurrency = (value: number): number => Math.round(value * 100) / 100;

const parseMonthToUtcDate = (month: string): Date => {
  const [year, mon] = month.split("-").map(Number);
  return new Date(Date.UTC(year, mon - 1, 1));
};

const formatUtcMonth = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const addUtcMonths = (date: Date, months: number): Date => {
  const d = new Date(date);
  d.setUTCMonth(d.getUTCMonth() + months, 1);
  return d;
};

const getMonthStartDate = (month: string): string => `${month}-01`;

const getMonthEndExclusive = (month: string): string => {
  const monthStart = parseMonthToUtcDate(month);
  return `${formatUtcMonth(addUtcMonths(monthStart, 1))}-01`;
};

const parseIsoDateToUtcDate = (date: string): Date => {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

const formatUtcDate = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const addUtcDays = (date: Date, days: number): Date => {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
};

const getMonthDayCount = (month: string): number => {
  const monthDate = parseMonthToUtcDate(month);
  return new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth() + 1, 0)).getUTCDate();
};

const getDatesInRange = (startDate: string, endDate: string): string[] => {
  const start = parseIsoDateToUtcDate(startDate);
  const end = parseIsoDateToUtcDate(endDate);
  if (start > end) return [];

  const dates: string[] = [];
  for (let cursor = start; cursor <= end; cursor = addUtcDays(cursor, 1)) {
    dates.push(formatUtcDate(cursor));
  }
  return dates;
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

export function getDailySpending(
  context: AccountContext,
  contributor: ContributorFilter,
  startDate: string,
  endDate: string
): DailySpending[] {
  const contributorUserIds = getContributorUserIds(context, contributor);
  const scope = buildReceiptContributorClause("receipts", contributorUserIds);

  return db
    .prepare(
      `SELECT transaction_date as date, SUM(total) as total
       FROM receipts
       WHERE ${scope.whereSql} AND transaction_date >= ? AND transaction_date < ?
       GROUP BY transaction_date
       ORDER BY transaction_date`
    )
    .all(...scope.params, `${startDate}-01`, `${endDate}-31`) as DailySpending[];
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
  const displayNames = getContributorDisplayNameMap(
    receipts.map((receipt) => receipt.contributor_user_id)
  );

  return receipts.map((r) => ({
    ...r,
    contributor_display_name:
      displayNames.get(r.contributor_user_id) ?? r.contributor_user_id,
    contributorRole: r.contributor_user_id === context.ownerUserId ? "owner" : "member",
    items: itemStmt.all(r.id) as LineItemRow[],
  }));
}

export function getCurrentVsProjectedSeries(
  context: AccountContext,
  contributor: ContributorFilter,
  startDate: string,
  endDate: string,
  selectedCategory: string | null
): CurrentVsProjectedSeries {
  const startDateFull = getMonthStartDate(startDate);
  const endDateExclusive = getMonthEndExclusive(endDate);
  const endDateInclusive = formatUtcDate(addUtcDays(parseIsoDateToUtcDate(endDateExclusive), -1));
  const dates = getDatesInRange(startDateFull, endDateInclusive);
  if (dates.length === 0) {
    return {
      contributor,
      selectedCategory,
      categories: [],
      projectionMethod: "historical_average",
      points: [],
    };
  }

  const contributorUserIds = getContributorUserIds(context, contributor);
  const scope = buildReceiptContributorClause("r", contributorUserIds);

  const categoryFilterSql = selectedCategory ? "AND li.category = ?" : "";
  const categoryFilterParams = selectedCategory ? [selectedCategory] : [];

  const actualRows = db
    .prepare(
      `SELECT r.transaction_date as date, li.category, SUM(li.total_price) as total
       FROM line_items li JOIN receipts r ON li.receipt_id = r.id
       WHERE ${scope.whereSql}
         AND r.transaction_date >= ?
         AND r.transaction_date < ?
         ${categoryFilterSql}
       GROUP BY r.transaction_date, li.category`
    )
    .all(
      ...scope.params,
      startDateFull,
      endDateExclusive,
      ...categoryFilterParams
    ) as DailyCategoryTotalRow[];

  let categories: string[] = [];
  if (selectedCategory) {
    categories = [selectedCategory];
  } else {
    const seen = new Set<string>();
    for (const row of actualRows) {
      seen.add(row.category);
    }

    const budgetCategoryRows = db
      .prepare(
        `SELECT DISTINCT category
         FROM budgets
         WHERE user_id = ? AND month >= ? AND month <= ?`
      )
      .all(context.ownerUserId, startDate, endDate) as { category: string }[];

    for (const row of budgetCategoryRows) {
      seen.add(row.category);
    }

    categories = [...seen].sort((a, b) => a.localeCompare(b));
  }

  const actualByDateCategory = new Map<string, number>();
  for (const row of actualRows) {
    const key = `${row.date}|${row.category}`;
    actualByDateCategory.set(key, roundCurrency((actualByDateCategory.get(key) ?? 0) + row.total));
  }

  const budgetMap = new Map<string, number>();
  if (categories.length > 0) {
    const placeholders = categories.map(() => "?").join(", ");
    const budgetRows = db
      .prepare(
        `SELECT category, month, amount
         FROM budgets
         WHERE user_id = ?
           AND month >= ?
           AND month <= ?
           AND category IN (${placeholders})`
      )
      .all(context.ownerUserId, startDate, endDate, ...categories) as BudgetRow[];

    for (const row of budgetRows) {
      budgetMap.set(`${row.category}|${row.month}`, row.amount);
    }
  }

  const startMonthDate = parseMonthToUtcDate(startDate);
  const lookbackStartMonth = formatUtcMonth(addUtcMonths(startMonthDate, -LOOKBACK_MONTHS));
  const lookbackStartDate = getMonthStartDate(lookbackStartMonth);

  const historicalAverageByCategory = new Map<string, number>();
  if (categories.length > 0) {
    const placeholders = categories.map(() => "?").join(", ");
    const historicalRows = db
      .prepare(
        `SELECT li.category, strftime('%Y-%m', r.transaction_date) as month, SUM(li.total_price) as total
         FROM line_items li JOIN receipts r ON li.receipt_id = r.id
         WHERE ${scope.whereSql}
           AND r.transaction_date >= ?
           AND r.transaction_date < ?
           AND li.category IN (${placeholders})
         GROUP BY li.category, month`
      )
      .all(
        ...scope.params,
        lookbackStartDate,
        startDateFull,
        ...categories
      ) as MonthlyCategoryTotalRow[];

    const totalsByCategory = new Map<string, number>();
    for (const row of historicalRows) {
      totalsByCategory.set(row.category, (totalsByCategory.get(row.category) ?? 0) + row.total);
    }

    // Deterministic fallback: average over a fixed 3-month window with missing months treated as zero.
    for (const category of categories) {
      const average = (totalsByCategory.get(category) ?? 0) / LOOKBACK_MONTHS;
      historicalAverageByCategory.set(category, roundCurrency(average));
    }
  }

  let budgetSelections = 0;
  let fallbackSelections = 0;

  const points: CurrentVsProjectedPoint[] = [];
  let cumulativeCurrent = 0;
  let cumulativeProjected = 0;

  for (const date of dates) {
    let dailyCurrent = 0;
    let dailyProjected = 0;
    const month = date.slice(0, 7);
    const daysInMonth = getMonthDayCount(month);

    for (const category of categories) {
      dailyCurrent += actualByDateCategory.get(`${date}|${category}`) ?? 0;

      const budgetValue = budgetMap.get(`${category}|${month}`);
      if (typeof budgetValue === "number") {
        dailyProjected += budgetValue / daysInMonth;
        budgetSelections += 1;
      } else {
        dailyProjected += (historicalAverageByCategory.get(category) ?? 0) / daysInMonth;
        fallbackSelections += 1;
      }
    }

    cumulativeCurrent += dailyCurrent;
    cumulativeProjected += dailyProjected;

    points.push({
      date,
      current: roundCurrency(cumulativeCurrent),
      projected: roundCurrency(cumulativeProjected),
    });
  }

  const projectionMethod: ProjectionMethod =
    fallbackSelections === 0
      ? "budget"
      : budgetSelections === 0
      ? "historical_average"
      : "mixed";

  return {
    contributor,
    selectedCategory,
    categories,
    projectionMethod,
    points,
  };
}
