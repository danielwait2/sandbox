import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllInsights } from "@/lib/insights";
import { parseContributorFilter, resolveAccountContextForUser } from "@/lib/account";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const month =
    request.nextUrl.searchParams.get("month") ??
    new Date().toISOString().slice(0, 7);
  const contributor = parseContributorFilter(request.nextUrl.searchParams.get("contributor"));
  if (!contributor) {
    return NextResponse.json({ error: "Invalid contributor filter" }, { status: 400 });
  }

  const context = resolveAccountContextForUser(session.user.email);
  if (!context) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data = getAllInsights(context, contributor, month);
  return NextResponse.json(data);
}
