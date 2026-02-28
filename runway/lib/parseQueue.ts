import { AccountContext } from "@/lib/account";
import { db } from "@/lib/db";
import { createGmailClient } from "@/lib/gmail";
import { parseReceipt, persistParsedReceipt } from "@/lib/receiptParser";

type UnparsedReceipt = {
  id: string;
  raw_email_id: string;
};

const extractBody = (
  payload: {
    mimeType?: string | null;
    body?: { data?: string | null } | null;
    parts?: unknown[] | null;
  } | null | undefined
): string => {
  if (!payload) return "";

  if (
    payload.mimeType === "text/html" ||
    payload.mimeType === "text/plain"
  ) {
    const data = payload.body?.data;
    if (data) {
      return Buffer.from(data, "base64url").toString("utf-8");
    }
  }

  if (Array.isArray(payload.parts)) {
    for (const part of payload.parts) {
      const result = extractBody(
        part as Parameters<typeof extractBody>[0]
      );
      if (result) return result;
    }
  }

  return "";
};

export const processUnparsedReceipts = async (
  context: AccountContext,
  accessToken: string,
  refreshToken: string
): Promise<{ processed: number; failed: number }> => {
  const userId = context.viewerUserId;
  const rows = db
    .prepare(
      `SELECT id, raw_email_id FROM receipts
       WHERE parsed_at IS NULL
         AND account_id = ?
         AND (contributor_user_id = ? OR user_id = ?)`
    )
    .all(context.accountId, userId, userId) as UnparsedReceipt[];

  if (rows.length === 0) {
    return { processed: 0, failed: 0 };
  }

  const { gmail } = await createGmailClient({ accessToken, refreshToken });

  let processed = 0;
  let failed = 0;

  for (const row of rows) {
    try {
      const messageResponse = await gmail.users.messages.get({
        userId: "me",
        id: row.raw_email_id,
        format: "full",
      });

      const emailBody = extractBody(messageResponse.data.payload);

      if (!emailBody) {
        console.error("[parseQueue] Empty email body for", row.raw_email_id);
        failed += 1;
        continue;
      }

      const parsed = await parseReceipt(emailBody);

      if (!parsed) {
        failed += 1;
        continue;
      }

      persistParsedReceipt(row.id, parsed);
      processed += 1;
    } catch (err) {
      console.error("[parseQueue] Failed for receipt", row.id, err);
      failed += 1;
    }
  }

  return { processed, failed };
};
