import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { resolveAccountContextForUser } from "@/lib/account";
import { createGmailClient } from "@/lib/gmail";
import { isInsufficientScopeError } from "@/lib/googleErrors";
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
      {
        error: "Google mailbox authorization is missing or expired. Reconnect Google to grant Gmail access.",
        code: "reauth_required",
      },
      { status: 400 }
    );
  }

  try {
    const { gmail } = await createGmailClient({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    });
    await gmail.users.getProfile({ userId: "me" });
  } catch (error) {
    if (isInsufficientScopeError(error)) {
      return NextResponse.json(
        {
          error: "Gmail permission is missing. Reconnect Google and grant Gmail access.",
          code: "reauth_required",
        },
        { status: 400 }
      );
    }
    throw error;
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
