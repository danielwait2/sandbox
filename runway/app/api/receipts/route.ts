import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

type ReceiptSummary = {
  id: string;
  retailer: string;
  transaction_date: string;
  subtotal: number | null;
  tax: number | null;
  total: number;
  order_number: string | null;
  item_count: number;
};

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const receipts = db
    .prepare(
      `SELECT r.id, r.retailer, r.transaction_date, r.subtotal, r.tax, r.total, r.order_number,
              COUNT(li.id) AS item_count
       FROM receipts r
       LEFT JOIN line_items li ON li.receipt_id = r.id
       WHERE r.user_id = ? AND r.transaction_date >= date('now', '-90 days')
       GROUP BY r.id
       HAVING COUNT(li.id) > 0
       ORDER BY r.transaction_date DESC`
    )
    .all(session.user.email) as ReceiptSummary[];

  return NextResponse.json({ receipts });
}
