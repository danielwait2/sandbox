import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { resolveAccountContextForUser } from "@/lib/account";

export async function GET(): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const context = resolveAccountContextForUser(session.user.email);
  if (!context) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const rules = db
    .prepare("SELECT * FROM rules WHERE user_id = ? ORDER BY id DESC")
    .all(context.ownerUserId);

  return NextResponse.json({ rules });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const context = resolveAccountContextForUser(session.user.email);
  if (!context) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (context.viewerRole !== "owner") {
    return NextResponse.json({ error: "Only owner can create rules" }, { status: 403 });
  }
  const body = (await req.json()) as {
    match_pattern: string;
    category: string;
    subcategory?: string | null;
  };

  const result = db
    .prepare(
      "INSERT INTO rules (user_id, match_pattern, category, subcategory, created_from) VALUES (?, ?, ?, ?, 'manual')"
    )
    .run(context.ownerUserId, body.match_pattern, body.category, body.subcategory ?? null);

  type RuleRow = { id: number; user_id: string; match_pattern: string; category: string; subcategory: string | null; created_from: string };
  const created = db
    .prepare("SELECT * FROM rules WHERE id = ?")
    .get(result.lastInsertRowid) as RuleRow;

  return NextResponse.json({ rule: created });
}
