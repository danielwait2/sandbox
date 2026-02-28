import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.email;
  const { id } = await params;

  type ItemRow = { id: number };
  const item = db
    .prepare(
      `SELECT li.id FROM line_items li
       JOIN receipts r ON li.receipt_id = r.id
       WHERE li.id = ? AND r.user_id = ?`
    )
    .get(id, userId) as ItemRow | undefined;

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  db.prepare("UPDATE line_items SET user_overridden = 1 WHERE id = ?").run(id);

  return NextResponse.json({ ok: true });
}
