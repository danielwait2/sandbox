import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { resolveAccountContextForUser } from "@/lib/account";
import { writeAuditEvent } from "@/lib/audit";

export async function DELETE(): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const context = resolveAccountContextForUser(session.user.email);
  if (!context) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (context.viewerRole !== "owner") {
    return NextResponse.json(
      { error: "Only account owner can delete account" },
      { status: 403 }
    );
  }

  const contributorRows = db
    .prepare(
      `SELECT user_id
       FROM account_memberships
       WHERE account_id = ?`
    )
    .all(context.accountId) as { user_id: string }[];

  const contributorIds = contributorRows.map((row) => row.user_id);
  writeAuditEvent({
    accountId: context.accountId,
    actorUserId: context.viewerUserId,
    eventType: "account_deleted",
    metadata: JSON.stringify({ contributors: contributorIds.length }),
  });
  if (contributorIds.length > 0) {
    const placeholders = contributorIds.map(() => "?").join(", ");
    db.prepare(
      `DELETE FROM line_items
       WHERE receipt_id IN (
         SELECT id FROM receipts WHERE user_id IN (${placeholders})
       )`
    ).run(...contributorIds);

    db.prepare(`DELETE FROM receipts WHERE user_id IN (${placeholders})`).run(...contributorIds);
    db.prepare(`DELETE FROM budgets WHERE user_id IN (${placeholders})`).run(...contributorIds);
    db.prepare(`DELETE FROM rules WHERE user_id IN (${placeholders})`).run(...contributorIds);
    db.prepare(`DELETE FROM scan_state WHERE user_id IN (${placeholders})`).run(...contributorIds);
    db.prepare(`DELETE FROM mailbox_connections WHERE user_id IN (${placeholders})`).run(...contributorIds);
  }

  db.prepare("DELETE FROM account_memberships WHERE account_id = ?").run(context.accountId);
  db.prepare("DELETE FROM accounts WHERE id = ?").run(context.accountId);

  return NextResponse.json({ ok: true });
}
