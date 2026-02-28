import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { resolveAccountContextForUser } from "@/lib/account";
import { disconnectMailboxConnection } from "@/lib/mailbox";
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

  disconnectMailboxConnection(session.user.email, "google");
  writeAuditEvent({
    accountId: context.accountId,
    actorUserId: context.viewerUserId,
    eventType: "mailbox_disconnected",
    metadata: JSON.stringify({ provider: "google", source: "auth_disconnect" }),
  });

  return NextResponse.json({ ok: true });
}
