import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { categorizeItems } from "@/lib/categorizer";
import { scanGmail } from "@/lib/gmailScanner";
import { processUnparsedReceipts } from "@/lib/parseQueue";

export async function POST() {
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

  console.log(`[scan] user=${session.user.email} DEV_TEST_EMAIL=${process.env.DEV_TEST_EMAIL ?? 'not set'}`);

  const scanResult = await scanGmail(
    session.user.email,
    session.accessToken,
    session.refreshToken
  );
  console.log(`[scan] gmail result: scanned=${scanResult.scanned} new=${scanResult.new} skipped=${scanResult.skipped}`);

  const parseResult = await processUnparsedReceipts(
    session.user.email,
    session.accessToken,
    session.refreshToken
  );
  console.log(`[scan] parse result: processed=${parseResult.processed} failed=${parseResult.failed}`);

  const categorizeResult = await categorizeItems(session.user.email);
  console.log(`[scan] categorize result: categorized=${categorizeResult.categorized} reviewQueue=${categorizeResult.reviewQueue}`);

  return NextResponse.json({
    scanned: scanResult.scanned,
    new: scanResult.new,
    skipped: scanResult.skipped,
    parsed: parseResult.processed,
    parseFailed: parseResult.failed,
    categorized: categorizeResult.categorized,
    reviewQueue: categorizeResult.reviewQueue,
  });
}
