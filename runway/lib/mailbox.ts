import { db } from "@/lib/db";

type MailboxRow = {
  id: number;
  user_id: string;
  provider: string;
  access_token: string;
  refresh_token: string;
  status: "connected" | "disconnected";
};
const normalizeUserId = (userId: string): string => userId.trim().toLowerCase();

export function upsertMailboxConnection(
  userId: string,
  provider: string,
  accessToken: string,
  refreshToken: string
): number {
  const normalizedUserId = normalizeUserId(userId);
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO mailbox_connections (
       user_id, provider, access_token, refresh_token, status, connected_at, updated_at
     ) VALUES (?, ?, ?, ?, 'connected', ?, ?)
     ON CONFLICT(user_id, provider) DO UPDATE SET
       access_token = excluded.access_token,
       refresh_token = excluded.refresh_token,
       status = 'connected',
       updated_at = excluded.updated_at`
  ).run(normalizedUserId, provider, accessToken, refreshToken, now, now);

  const row = db
    .prepare(
      `SELECT id
       FROM mailbox_connections
       WHERE user_id = ? AND provider = ?`
    )
    .get(normalizedUserId, provider) as { id: number };

  return row.id;
}

export function getConnectedMailboxConnection(
  userId: string,
  provider: string
): MailboxRow | null {
  const normalizedUserId = normalizeUserId(userId);
  const row = db
    .prepare(
      `SELECT id, user_id, provider, access_token, refresh_token, status
       FROM mailbox_connections
       WHERE user_id = ? AND provider = ? AND status = 'connected'
       LIMIT 1`
    )
    .get(normalizedUserId, provider) as MailboxRow | undefined;

  return row ?? null;
}

export function disconnectMailboxConnection(userId: string, provider: string): void {
  const normalizedUserId = normalizeUserId(userId);
  db.prepare(
    `UPDATE mailbox_connections
     SET status = 'disconnected', updated_at = ?
     WHERE user_id = ? AND provider = ?`
  ).run(new Date().toISOString(), normalizedUserId, provider);
}

