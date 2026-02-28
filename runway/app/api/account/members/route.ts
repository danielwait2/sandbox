import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  resolveContributorDisplayName,
  upsertAuthProviderName,
} from "@/lib/contributorProfiles";
import { resolveAccountContextForUser } from "@/lib/account";
import { writeAuditEvent } from "@/lib/audit";

type MembershipRow = {
  user_id: string;
  role: "owner" | "member";
  status: "pending" | "active" | "removed";
  created_at: string;
  updated_at: string;
  display_name: string | null;
  auth_provider_name: string | null;
};

const normalizeEmail = (value: string): string => value.trim().toLowerCase();

export async function GET(): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sessionUserName = session.user?.name ?? null;
  upsertAuthProviderName(session.user.email, session.user.name);

  const context = resolveAccountContextForUser(session.user.email);
  if (!context) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rows = db
    .prepare(
      `SELECT m.user_id, m.role, m.status, m.created_at, m.updated_at,
              p.display_name, p.auth_provider_name
       FROM account_memberships m
       LEFT JOIN user_profiles p ON p.user_id = m.user_id
       WHERE m.account_id = ?
       ORDER BY CASE m.role WHEN 'owner' THEN 0 ELSE 1 END, m.created_at ASC`
    )
    .all(context.accountId) as MembershipRow[];

  return NextResponse.json({
    accountId: context.accountId,
    viewerRole: context.viewerRole,
    members: rows.map((row) => ({
      userId: row.user_id,
        displayName: resolveContributorDisplayName(row.user_id, {
        displayName: row.display_name,
        authProviderName: row.auth_provider_name,
        sessionAuthName:
          row.user_id === context.viewerUserId ? sessionUserName : null,
      }),
      role: row.role,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const context = resolveAccountContextForUser(session.user.email);
  if (!context) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (context.viewerRole !== "owner") {
    return NextResponse.json({ error: "Only owners can add members" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const emailValue = typeof (body as { email?: unknown }).email === "string"
    ? (body as { email: string }).email
    : "";
  const memberEmail = normalizeEmail(emailValue);

  if (!memberEmail || !memberEmail.includes("@")) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }

  if (memberEmail === normalizeEmail(context.ownerUserId)) {
    return NextResponse.json({ error: "Owner cannot invite themselves" }, { status: 400 });
  }

  const existingActiveElsewhere = db
    .prepare(
      `SELECT account_id
       FROM account_memberships
       WHERE user_id = ? AND status = 'active' AND account_id <> ?
       LIMIT 1`
    )
    .get(memberEmail, context.accountId) as { account_id: string } | undefined;

  if (existingActiveElsewhere) {
    return NextResponse.json(
      { error: "User already belongs to another active account" },
      { status: 409 }
    );
  }

  const activeOrPendingOther = db
    .prepare(
      `SELECT user_id
       FROM account_memberships
       WHERE account_id = ?
         AND role = 'member'
         AND status IN ('pending', 'active')
         AND user_id <> ?
       LIMIT 1`
    )
    .get(context.accountId, memberEmail) as { user_id: string } | undefined;

  if (activeOrPendingOther) {
    return NextResponse.json(
      { error: "Account already has a member for v1" },
      { status: 409 }
    );
  }

  const existing = db
    .prepare(
      `SELECT status
       FROM account_memberships
       WHERE account_id = ? AND user_id = ? AND role = 'member'
       LIMIT 1`
    )
    .get(context.accountId, memberEmail) as { status: "pending" | "active" | "removed" } | undefined;

  const now = new Date().toISOString();

  if (existing?.status === "active") {
    return NextResponse.json({ error: "User is already an active member" }, { status: 409 });
  }

  if (existing?.status === "pending") {
    return NextResponse.json({ error: "Invite already pending" }, { status: 409 });
  }

  if (existing?.status === "removed") {
    db.prepare(
      `UPDATE account_memberships
       SET status = 'pending', updated_at = ?
       WHERE account_id = ? AND user_id = ? AND role = 'member'`
    ).run(now, context.accountId, memberEmail);
  } else {
    db.prepare(
      `INSERT INTO account_memberships (account_id, user_id, role, status, created_at, updated_at)
       VALUES (?, ?, 'member', 'pending', ?, ?)`
    ).run(context.accountId, memberEmail, now, now);
  }

  writeAuditEvent({
    accountId: context.accountId,
    actorUserId: context.viewerUserId,
    targetUserId: memberEmail,
    eventType: "member_invited",
    metadata: JSON.stringify({ status: "pending" }),
  });

  return NextResponse.json({ ok: true, invitedEmail: memberEmail, status: "pending" });
}
