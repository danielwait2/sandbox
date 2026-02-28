import { db } from "@/lib/db";

export function writeAuditEvent(input: {
  accountId?: string | null;
  actorUserId?: string | null;
  eventType: string;
  targetUserId?: string | null;
  metadata?: string | null;
}): void {
  db.prepare(
    `INSERT INTO audit_log (account_id, actor_user_id, event_type, target_user_id, metadata, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(
    input.accountId ?? null,
    input.actorUserId ?? null,
    input.eventType,
    input.targetUserId ?? null,
    input.metadata ?? null,
    new Date().toISOString()
  );
}

