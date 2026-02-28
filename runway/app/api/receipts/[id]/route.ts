import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  buildReceiptContributorClause,
  getContributorUserIds,
  resolveAccountContextForUser,
} from "@/lib/account";
import {
  resolveContributorDisplayName,
  upsertAuthProviderName,
} from "@/lib/contributorProfiles";

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
  display_name: string | null;
  auth_provider_name: string | null;
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
  upsertAuthProviderName(session.user.email, session.user.name);
  const context = resolveAccountContextForUser(session.user.email);
  if (!context) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const contributorUserIds = getContributorUserIds(context, "all");
  const scope = buildReceiptContributorClause("receipts", contributorUserIds);

  const receipt = db
    .prepare(
      `SELECT receipts.id, receipts.user_id, receipts.retailer, receipts.transaction_date,
              receipts.subtotal, receipts.tax, receipts.total, receipts.order_number,
              receipts.raw_email_id, receipts.parsed_at,
              COALESCE(receipts.contributor_user_id, receipts.user_id) AS contributor_user_id,
              p.display_name,
              p.auth_provider_name
       FROM receipts
       LEFT JOIN user_profiles p ON p.user_id = COALESCE(receipts.contributor_user_id, receipts.user_id)
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
    contributor_display_name: resolveContributorDisplayName(
      receipt.contributor_user_id ?? receipt.user_id,
      {
        displayName: receipt.display_name,
        authProviderName: receipt.auth_provider_name,
        sessionAuthName:
          (receipt.contributor_user_id ?? receipt.user_id) === context.viewerUserId
            ? session.user.name
            : null,
      }
    ),
    contributor_role:
      (receipt.contributor_user_id ?? receipt.user_id) === context.ownerUserId
        ? "owner"
        : "member",
    items,
  });
}
