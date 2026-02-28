import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  buildReceiptContributorClause,
  getContributorUserIds,
  resolveAccountContextForUser,
} from "@/lib/account";

export async function GET(): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const context = resolveAccountContextForUser(session.user.email);
  if (!context) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const contributorUserIds = getContributorUserIds(context, "all");
  const scope = buildReceiptContributorClause("r", contributorUserIds);

  const items = db
    .prepare(
      `SELECT li.id, li.name, li.raw_name, li.category, li.subcategory, li.confidence,
              li.total_price, li.unit_price, li.quantity, r.retailer, r.transaction_date
       FROM line_items li JOIN receipts r ON li.receipt_id = r.id
       WHERE ${scope.whereSql} AND li.confidence < 0.40 AND li.user_overridden = 0
       ORDER BY li.confidence ASC`
    )
    .all(...scope.params);

  return NextResponse.json({ items, count: (items as unknown[]).length });
}
