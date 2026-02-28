import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getBudgetDefaults,
  upsertBudgetDefault,
  deleteBudgetDefault,
} from "@/lib/budgetDefaults";

export async function GET(): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const defaults = getBudgetDefaults(session.user.email);
  return NextResponse.json({ defaults });
}

export async function PUT(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.email;
  const body = (await req.json()) as { category: string; amount: number | null };
  const { category, amount } = body;

  if (amount === null) {
    deleteBudgetDefault(userId, category);
  } else {
    upsertBudgetDefault(userId, category, amount);
  }

  return NextResponse.json({ ok: true });
}
