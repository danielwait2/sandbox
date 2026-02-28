import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { clearRulesCache } from "@/lib/rulesEngine";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.email;
  const { id } = await params;

  type RuleRow = { id: number };
  const rule = db
    .prepare("SELECT id FROM rules WHERE id = ? AND user_id = ?")
    .get(id, userId) as RuleRow | undefined;

  if (!rule) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  db.prepare("DELETE FROM rules WHERE id = ?").run(id);
  clearRulesCache();

  return NextResponse.json({ ok: true });
}
