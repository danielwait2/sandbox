import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { seedBudgetFromDefaults } from "@/lib/budgets";

export async function GET(): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.email;
  const currentMonth = new Date().toISOString().slice(0, 7);
  seedBudgetFromDefaults(userId, currentMonth);

  const budgets = db
    .prepare("SELECT * FROM budgets WHERE user_id = ? ORDER BY category")
    .all(userId);

  return NextResponse.json({ budgets });
}

export async function PUT(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.email;
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
    .get(userId, category, month) as ExistingRow | undefined;

  if (existing) {
    db.prepare("UPDATE budgets SET amount = ? WHERE id = ?").run(
      amount,
      existing.id
    );
  } else {
    db.prepare(
      "INSERT INTO budgets (user_id, category, subcategory, month, amount) VALUES (?, ?, NULL, ?, ?)"
    ).run(userId, category, month, amount);
  }

  return NextResponse.json({ ok: true });
}
