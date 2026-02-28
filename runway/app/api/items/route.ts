import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

type ItemRow = {
  id: number;
  receipt_id: string;
  raw_name: string;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category: string;
  subcategory: string | null;
  confidence: number | null;
  user_overridden: number;
  transaction_date: string;
  retailer: string;
};

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category");
  const month = searchParams.get("month"); // YYYY-MM

  let query = `
    SELECT li.id, li.receipt_id, li.raw_name, li.name, li.quantity,
           li.unit_price, li.total_price, li.category, li.subcategory,
           li.confidence, li.user_overridden,
           r.transaction_date, r.retailer
    FROM line_items li
    JOIN receipts r ON r.id = li.receipt_id
    WHERE r.user_id = ?
  `;
  const params: (string | number)[] = [session.user.email];

  if (category) {
    query += " AND li.category = ?";
    params.push(category);
  }

  if (month) {
    query += " AND substr(r.transaction_date, 1, 7) = ?";
    params.push(month);
  }

  query += " ORDER BY li.total_price DESC";

  const items = db.prepare(query).all(...params) as ItemRow[];
  return NextResponse.json({ items });
}
