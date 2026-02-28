import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { resolveAccountContextForUser } from "@/lib/account";
import { getConnectedMailboxConnection, upsertMailboxConnection } from "@/lib/mailbox";
import { writeAuditEvent } from "@/lib/audit";

export async function GET(): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mailbox = getConnectedMailboxConnection(session.user.email, "google");
  return NextResponse.json({ connected: Boolean(mailbox) });
}

export async function POST(): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!session.accessToken || !session.refreshToken) {
    return NextResponse.json(
      { error: "Missing Google OAuth tokens in session." },
      { status: 400 }
    );
  }

  const context = resolveAccountContextForUser(session.user.email);
  if (!context) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const mailboxConnectionId = upsertMailboxConnection(
    session.user.email,
    "google",
    session.accessToken,
    session.refreshToken
  );

  writeAuditEvent({
    accountId: context.accountId,
    actorUserId: session.user.email,
    eventType: "mailbox_connected",
    metadata: JSON.stringify({ provider: "google", mailboxConnectionId }),
  });

  return NextResponse.json({ ok: true, mailboxConnectionId });
}
