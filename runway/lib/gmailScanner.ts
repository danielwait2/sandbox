import { v4 as uuidv4 } from "uuid";

import { AccountContext } from "@/lib/account";
import { db } from "@/lib/db";
import { createGmailClient } from "@/lib/gmail";
import { isReceiptEmail } from "@/lib/receiptDetector";

export type ScanResult = {
  scanned: number;
  new: number;
  skipped: number;
};

const DAYS_90_IN_SECONDS = 90 * 24 * 60 * 60;

const getHeaderValue = (
  headers: { name?: string | null; value?: string | null }[] | undefined,
  targetHeader: string
): string => {
  if (!headers) {
    return "";
  }

  const match = headers.find(
    (header) => header.name?.toLowerCase() === targetHeader.toLowerCase()
  );

  return match?.value ?? "";
};

const toIsoDate = (rawDate: string): string => {
  const date = rawDate ? new Date(rawDate) : new Date();

  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
};

const getAfterEpoch = (userId: string): number => {
  const scanState = db
    .prepare(
      "SELECT last_scanned_at FROM scan_state WHERE user_id = ? AND provider = 'google'"
    )
    .get(userId) as { last_scanned_at: string } | undefined;

  if (!scanState?.last_scanned_at) {
    return Math.floor(Date.now() / 1000) - DAYS_90_IN_SECONDS;
  }

  const parsed = new Date(scanState.last_scanned_at);

  if (Number.isNaN(parsed.getTime())) {
    return Math.floor(Date.now() / 1000) - DAYS_90_IN_SECONDS;
  }

  return Math.floor(parsed.getTime() / 1000);
};

const persistScanState = (userId: string, mailboxConnectionId: number): void => {
  db.prepare(
    `INSERT INTO scan_state (user_id, provider, mailbox_connection_id, last_scanned_at)
     VALUES (?, 'google', ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
       provider = 'google',
       mailbox_connection_id = excluded.mailbox_connection_id,
       last_scanned_at = excluded.last_scanned_at`
  ).run(userId, mailboxConnectionId, new Date().toISOString());
};

export const scanGmail = async (
  context: AccountContext,
  accessToken: string,
  refreshToken: string,
  mailboxConnectionId: number
): Promise<ScanResult> => {
  const userId = context.viewerUserId;
  const { gmail } = await createGmailClient({ accessToken, refreshToken });

  const afterEpoch = getAfterEpoch(userId);
  const devEmail = process.env.NODE_ENV !== "production" ? process.env.DEV_TEST_EMAIL : undefined;
  const fromClause = devEmail
    ? `(walmart.com OR costco.com OR ${devEmail})`
    : "(walmart.com OR costco.com)";
  const query = `from:${fromClause} after:${afterEpoch}`;
  console.log(`[gmailScanner] query: ${query}`);

  const listResponse = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults: 200,
  });

  const messages = listResponse.data.messages ?? [];

  const findExistingReceipt = db.prepare(
    `SELECT id FROM receipts
     WHERE account_id = ? AND raw_email_id = ?
     LIMIT 1`
  );

  const insertReceipt = db.prepare(
    `INSERT INTO receipts (
      id,
      user_id,
      account_id,
      contributor_user_id,
      retailer,
      transaction_date,
      subtotal,
      tax,
      total,
      order_number,
      raw_email_id,
      parsed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  let scanned = 0;
  let newCount = 0;
  let skipped = 0;

  for (const message of messages) {
    if (!message.id) {
      continue;
    }

    scanned += 1;

    const existing = findExistingReceipt.get(context.accountId, message.id) as
      | { id: string }
      | undefined;

    if (existing) {
      skipped += 1;
      continue;
    }

    const messageResponse = await gmail.users.messages.get({
      userId: "me",
      id: message.id,
      format: "full",
    });

    const headers = messageResponse.data.payload?.headers;
    const from = getHeaderValue(headers, "From");
    const date = getHeaderValue(headers, "Date");

    const detection = isReceiptEmail(from);

    if (!detection.isReceipt || !detection.retailer) {
      skipped += 1;
      continue;
    }

    insertReceipt.run(
      uuidv4(),
      userId,
      context.accountId,
      userId,
      detection.retailer,
      toIsoDate(date),
      null,
      null,
      0,
      null,
      message.id,
      null
    );

    newCount += 1;
  }

  persistScanState(userId, mailboxConnectionId);

  return {
    scanned,
    new: newCount,
    skipped,
  };
};
