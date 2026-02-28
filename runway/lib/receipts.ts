import {
  AccountContext,
  buildReceiptContributorClause,
  getContributorUserIds,
} from "@/lib/account";
import { getContributorDisplayNameMap } from "@/lib/contributorProfiles";
import { db } from "@/lib/db";

export type ReceiptSummary = {
  id: string;
  retailer: string;
  transaction_date: string;
  subtotal: number | null;
  tax: number | null;
  total: number;
  order_number: string | null;
  item_count: number;
  contributor_user_id: string;
  contributor_display_name: string;
  contributor_role: "owner" | "member";
};

export function getRecentReceipts(
  context: AccountContext,
  days = 90
): ReceiptSummary[] {
  const contributorUserIds = getContributorUserIds(context, "all");
  const scope = buildReceiptContributorClause("r", contributorUserIds);

  const receipts = db
    .prepare(
      `SELECT r.id, r.retailer, r.transaction_date, r.subtotal, r.tax, r.total, r.order_number,
              COALESCE(r.contributor_user_id, r.user_id) AS contributor_user_id,
              COUNT(li.id) AS item_count
       FROM receipts r
       LEFT JOIN line_items li ON li.receipt_id = r.id
       WHERE r.account_id = ?
         AND ${scope.whereSql}
         AND r.transaction_date >= date('now', ?)
       GROUP BY r.id
       HAVING COUNT(li.id) > 0
       ORDER BY r.transaction_date DESC`
    )
    .all(context.accountId, ...scope.params, `-${days} days`) as Omit<
    ReceiptSummary,
    "contributor_role"
  >[];

  const displayNames = getContributorDisplayNameMap(
    receipts.map((receipt) => receipt.contributor_user_id)
  );

  return receipts.map((receipt) => ({
    ...receipt,
    contributor_display_name:
      displayNames.get(receipt.contributor_user_id) ?? receipt.contributor_user_id,
    contributor_role:
      receipt.contributor_user_id === context.ownerUserId ? ("owner" as const) : ("member" as const),
  }));
}
