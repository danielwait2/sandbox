import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

type LineItem = {
  id: number;
  raw_name: string;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category: string;
  subcategory: string | null;
  confidence: number | null;
  user_overridden: number;
};

type Receipt = {
  id: string;
  user_id: string;
  retailer: string;
  transaction_date: string;
  subtotal: number | null;
  tax: number | null;
  total: number;
  order_number: string | null;
  raw_email_id: string | null;
  parsed_at: string | null;
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const receipt = db
    .prepare("SELECT * FROM receipts WHERE id = ? AND user_id = ?")
    .get(id, session.user.email) as Receipt | undefined;

  if (!receipt) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const items = db
    .prepare("SELECT * FROM line_items WHERE receipt_id = ?")
    .all(id) as LineItem[];

  return NextResponse.json({ ...receipt, items });
}
