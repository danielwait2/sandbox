import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { resolveAccountContextForUser } from "@/lib/account";
import { authOptions } from "@/lib/auth";
import { upsertAuthProviderName } from "@/lib/contributorProfiles";
import { getRecentReceipts } from "@/lib/receipts";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  upsertAuthProviderName(session.user.email, session.user.name);

  const context = resolveAccountContextForUser(session.user.email);
  if (!context) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ receipts: getRecentReceipts(context, 90) });
}
