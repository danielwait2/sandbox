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
  const budgets = db
    .prepare("SELECT * FROM budgets WHERE user_id = ? ORDER BY category")
    .all(context.ownerUserId);

  return NextResponse.json({ budgets });
}

export async function PUT(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const context = resolveAccountContextForUser(session.user.email);
  if (!context) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (context.viewerRole !== "owner") {
    return NextResponse.json({ error: "Only owner can update budgets" }, { status: 403 });
  }
  const body = (await req.json()) as {
    category: string;
    month: string;
    amount: number;
  };
  const { category, month, amount } = body;

  type ExistingRow = { id: number };
  const existing = db
    .prepare(
      "SELECT id FROM budgets WHERE user_id = ? AND category = ? AND month = ?"
    )
    .get(context.ownerUserId, category, month) as ExistingRow | undefined;

  if (existing) {
    db.prepare("UPDATE budgets SET amount = ? WHERE id = ?").run(
      amount,
      existing.id
    );
  } else {
    db.prepare(
      "INSERT INTO budgets (user_id, category, subcategory, month, amount) VALUES (?, ?, NULL, ?, ?)"
    ).run(context.ownerUserId, category, month, amount);
  }

  return NextResponse.json({ ok: true });
}
