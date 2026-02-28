import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMonthlySpending, getMonthlyCategorySpending, getHistorySummary } from "@/lib/history";
import { parseContributorFilter, resolveAccountContextForUser } from "@/lib/account";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const now = new Date();
  const start = params.get("start") ?? `${now.getFullYear()}-01`;
  const end = params.get("end") ?? now.toISOString().slice(0, 7);
  const contributor = parseContributorFilter(params.get("contributor"));
  if (!contributor) {
    return NextResponse.json({ error: "Invalid contributor filter" }, { status: 400 });
  }

  const context = resolveAccountContextForUser(session.user.email);
  if (!context) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    contributor,
    monthlySpending: getMonthlySpending(context, contributor, start, end),
    categorySpending: getMonthlyCategorySpending(context, contributor, start, end),
    summary: getHistorySummary(context, contributor, start, end),
  });
}
