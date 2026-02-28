import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMonthlySpending, getMonthlyCategorySpending, getHistorySummary } from "@/lib/history";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const now = new Date();
  const start = params.get("start") ?? `${now.getFullYear()}-01`;
  const end = params.get("end") ?? now.toISOString().slice(0, 7);

  const userId = session.user.email;

  return NextResponse.json({
    monthlySpending: getMonthlySpending(userId, start, end),
    categorySpending: getMonthlyCategorySpending(userId, start, end),
    summary: getHistorySummary(userId, start, end),
  });
}
