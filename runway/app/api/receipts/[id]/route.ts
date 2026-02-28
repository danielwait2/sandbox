import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  buildReceiptContributorClause,
  getContributorUserIds,
  resolveAccountContextForUser,
} from "@/lib/account";

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
  contributor_user_id: string | null;
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
  const context = resolveAccountContextForUser(session.user.email);
  if (!context) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const contributorUserIds = getContributorUserIds(context, "all");
  const scope = buildReceiptContributorClause("receipts", contributorUserIds);

  const receipt = db
    .prepare(
      `SELECT receipts.*,
              COALESCE(receipts.contributor_user_id, receipts.user_id) AS contributor_user_id
       FROM receipts
       WHERE id = ? AND ${scope.whereSql}`
    )
    .get(id, ...scope.params) as Receipt | undefined;

  if (!receipt) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const items = db
    .prepare("SELECT * FROM line_items WHERE receipt_id = ?")
    .all(id) as LineItem[];

  return NextResponse.json({
    ...receipt,
    contributor_user_id: receipt.contributor_user_id ?? receipt.user_id,
    contributor_role:
      (receipt.contributor_user_id ?? receipt.user_id) === context.ownerUserId
        ? "owner"
        : "member",
    items,
  });
}
