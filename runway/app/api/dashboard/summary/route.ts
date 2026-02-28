import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  buildReceiptContributorClause,
  getContributorUserIds,
  parseContributorFilter,
  resolveAccountContextForUser,
} from "@/lib/account";

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

function getDateRange(period: string): { startDate: string; endDate: string } {
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

  // this_month (default)
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const context = resolveAccountContextForUser(session.user.email);
  if (!context) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const period = req.nextUrl.searchParams.get("period") ?? "this_month";
  const contributor = parseContributorFilter(req.nextUrl.searchParams.get("contributor"));
  if (!contributor) {
    return NextResponse.json({ error: "Invalid contributor filter" }, { status: 400 });
  }

  const { startDate, endDate } = getDateRange(period);
  const startMonth = startDate.slice(0, 7);
  const contributorUserIds = getContributorUserIds(context, contributor);
  const receiptScope = buildReceiptContributorClause("r", contributorUserIds);
  const plainReceiptScope = buildReceiptContributorClause("receipts", contributorUserIds);

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
      `SELECT COUNT(*) as count FROM receipts
       WHERE ${plainReceiptScope.whereSql} AND transaction_date >= ? AND transaction_date <= ?`
    )
    .get(...plainReceiptScope.params, startDate, endDate) as CountRow;

  type FreqRow = { name: string; c: number };
  const freqRow = db
    .prepare(
      `SELECT li.name, COUNT(*) as c
       FROM line_items li JOIN receipts r ON li.receipt_id = r.id
       WHERE ${receiptScope.whereSql} AND r.transaction_date >= ? AND r.transaction_date <= ?
       GROUP BY li.name ORDER BY c DESC LIMIT 1`
    )
    .get(...receiptScope.params, startDate, endDate) as FreqRow | undefined;

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

  return NextResponse.json({
    period,
    contributor,
    totalSpend,
    receiptCount,
    topCategory: receiptCount > 0 ? topCategory : "",
    mostFrequentItem: freqRow?.name ?? "",
    categories,
  });
}
