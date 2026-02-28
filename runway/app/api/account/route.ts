import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.email;

  db.prepare(
    `DELETE FROM line_items WHERE receipt_id IN (SELECT id FROM receipts WHERE user_id = ?)`
  ).run(userId);
  db.prepare("DELETE FROM receipts WHERE user_id = ?").run(userId);
  db.prepare("DELETE FROM budgets WHERE user_id = ?").run(userId);
  db.prepare("DELETE FROM rules WHERE user_id = ?").run(userId);
  db.prepare("DELETE FROM scan_state WHERE user_id = ?").run(userId);

  return NextResponse.json({ ok: true });
}
