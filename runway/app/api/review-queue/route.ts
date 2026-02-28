import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.email;

  const items = db
    .prepare(
      `SELECT li.id, li.name, li.raw_name, li.category, li.subcategory, li.confidence,
              li.total_price, li.unit_price, li.quantity, r.retailer, r.transaction_date
       FROM line_items li JOIN receipts r ON li.receipt_id = r.id
       WHERE r.user_id = ? AND li.confidence < 0.40 AND li.user_overridden = 0
       ORDER BY li.confidence ASC`
    )
    .all(userId);

  return NextResponse.json({ items, count: (items as unknown[]).length });
}
