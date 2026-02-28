import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { resolveAccountContextForUser } from "@/lib/account";
import { authOptions } from "@/lib/auth";
import { categorizeItems } from "@/lib/categorizer";
import { getConnectedMailboxConnection, upsertMailboxConnection } from "@/lib/mailbox";
import { scanGmail } from "@/lib/gmailScanner";
import { processUnparsedReceipts } from "@/lib/parseQueue";
import { isInsufficientScopeError } from "@/lib/googleErrors";
import { writeAuditEvent } from "@/lib/audit";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const context = resolveAccountContextForUser(session.user.email);
  if (!context) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let mailbox = getConnectedMailboxConnection(session.user.email, "google");
  if (!mailbox && session.accessToken && session.refreshToken) {
    const mailboxConnectionId = upsertMailboxConnection(
      session.user.email,
      "google",
      session.accessToken,
      session.refreshToken
    );
    mailbox = getConnectedMailboxConnection(session.user.email, "google");
    writeAuditEvent({
      accountId: context.accountId,
      actorUserId: context.viewerUserId,
      eventType: "mailbox_connected",
      metadata: JSON.stringify({ provider: "google", mailboxConnectionId }),
    });
  }
  if (!mailbox) {
    return NextResponse.json(
      { error: "Mailbox not connected. Connect your Gmail mailbox in Settings." },
      { status: 400 }
    );
  }

  try {
    writeAuditEvent({
      accountId: context.accountId,
      actorUserId: context.viewerUserId,
      eventType: "scan_started",
      metadata: JSON.stringify({ provider: "google" }),
    });

    console.log(`[scan] user=${session.user.email} DEV_TEST_EMAIL=${process.env.DEV_TEST_EMAIL ?? 'not set'}`);

    const scanResult = await scanGmail(
      context,
      mailbox.access_token,
      mailbox.refresh_token,
      mailbox.id
    );
    console.log(`[scan] gmail result: scanned=${scanResult.scanned} new=${scanResult.new} skipped=${scanResult.skipped}`);

    const parseResult = await processUnparsedReceipts(
      context,
      mailbox.access_token,
      mailbox.refresh_token
    );
    console.log(`[scan] parse result: processed=${parseResult.processed} failed=${parseResult.failed}`);

    const categorizeResult = await categorizeItems(context);
    console.log(`[scan] categorize result: categorized=${categorizeResult.categorized} reviewQueue=${categorizeResult.reviewQueue}`);

    writeAuditEvent({
      accountId: context.accountId,
      actorUserId: context.viewerUserId,
      eventType: "scan_completed",
      metadata: JSON.stringify({
        scanned: scanResult.scanned,
        new: scanResult.new,
        parsed: parseResult.processed,
        parseFailed: parseResult.failed,
      }),
    });

    return NextResponse.json({
      scanned: scanResult.scanned,
      new: scanResult.new,
      skipped: scanResult.skipped,
      parsed: parseResult.processed,
      parseFailed: parseResult.failed,
      categorized: categorizeResult.categorized,
      reviewQueue: categorizeResult.reviewQueue,
    });
  } catch (error) {
    if (isInsufficientScopeError(error)) {
      writeAuditEvent({
        accountId: context.accountId,
        actorUserId: context.viewerUserId,
        eventType: "scan_failed",
        metadata: JSON.stringify({ message: "insufficient_authentication_scopes" }),
      });

      return NextResponse.json(
        {
          error: "Gmail permission missing. Reconnect Google and grant Gmail access, then scan again.",
          code: "reauth_required",
        },
        { status: 400 }
      );
    }

    writeAuditEvent({
      accountId: context.accountId,
      actorUserId: context.viewerUserId,
      eventType: "scan_failed",
      metadata: JSON.stringify({ message: error instanceof Error ? error.message : "unknown" }),
    });
    return NextResponse.json({ error: "Scan failed" }, { status: 500 });
  }
}
