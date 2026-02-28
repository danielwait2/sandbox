import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { clearRulesCache } from "@/lib/rulesEngine";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const itemId = parseInt(params.id, 10);
  if (isNaN(itemId)) {
    return NextResponse.json({ error: "Invalid item id" }, { status: 400 });
  }

  const body = (await req.json()) as { category: string; subcategory?: string };
  if (!body.category) {
    return NextResponse.json({ error: "category is required" }, { status: 400 });
  }

  // Verify item belongs to user
  const item = db
    .prepare(
      `SELECT li.id, li.name FROM line_items li
       JOIN receipts r ON r.id = li.receipt_id
       WHERE li.id = ? AND r.user_id = ?`
    )
    .get(itemId, session.user.email) as { id: number; name: string } | undefined;

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const subcategory = body.subcategory ?? null;

  db.transaction(() => {
    db.prepare(
      `UPDATE line_items SET category = ?, subcategory = ?, user_overridden = 1, confidence = 1.0 WHERE id = ?`
    ).run(body.category, subcategory, itemId);

    db.prepare(
      `INSERT INTO rules (match_pattern, category, subcategory, created_from) VALUES (?, ?, ?, 'manual')`
    ).run(item.name, body.category, subcategory);
  })();

  clearRulesCache();

  return NextResponse.json({ ok: true });
}
