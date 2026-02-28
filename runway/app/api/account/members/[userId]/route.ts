import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { resolveAccountContextForUser } from "@/lib/account";
import { writeAuditEvent } from "@/lib/audit";

type Params = { userId: string };

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<Params> }
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const context = resolveAccountContextForUser(session.user.email);
  if (!context) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (context.viewerRole !== "owner") {
    return NextResponse.json({ error: "Only owners can remove members" }, { status: 403 });
  }

  const routeParams = await params;
  const targetUserId = decodeURIComponent(routeParams.userId).trim().toLowerCase();

  if (!targetUserId) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  if (targetUserId === context.ownerUserId.toLowerCase()) {
    return NextResponse.json({ error: "Owner cannot be removed" }, { status: 400 });
  }

  const target = db
    .prepare(
      `SELECT status
       FROM account_memberships
       WHERE account_id = ? AND user_id = ? AND role = 'member'
       LIMIT 1`
    )
    .get(context.accountId, targetUserId) as { status: "pending" | "active" | "removed" } | undefined;

  if (!target || target.status === "removed") {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  db.prepare(
    `UPDATE account_memberships
     SET status = 'removed', updated_at = ?
     WHERE account_id = ? AND user_id = ? AND role = 'member'`
  ).run(new Date().toISOString(), context.accountId, targetUserId);

  writeAuditEvent({
    accountId: context.accountId,
    actorUserId: context.viewerUserId,
    targetUserId,
    eventType: "member_removed",
  });

  return NextResponse.json({ ok: true });
}
