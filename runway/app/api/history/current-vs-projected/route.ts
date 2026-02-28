import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { parseContributorFilter, resolveAccountContextForUser } from "@/lib/account";
import { getCurrentVsProjectedSeries } from "@/lib/history";

const MONTH_PATTERN = /^\d{4}-\d{2}$/;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const now = new Date();
  const defaultEnd = now.toISOString().slice(0, 7);
  const defaultStart = `${now.getFullYear()}-01`;
  const start = params.get("start") ?? defaultStart;
  const end = params.get("end") ?? defaultEnd;
  const categoryParam = params.get("category");
  const selectedCategory =
    !categoryParam || categoryParam === "all" ? null : categoryParam.trim();
  const contributor = parseContributorFilter(params.get("contributor"));

  if (!contributor) {
    return NextResponse.json({ error: "Invalid contributor filter" }, { status: 400 });
  }
  if (!MONTH_PATTERN.test(start) || !MONTH_PATTERN.test(end)) {
    return NextResponse.json({ error: "Invalid month format. Use YYYY-MM." }, { status: 400 });
  }
  if (start > end) {
    return NextResponse.json({ error: "Invalid range: start must be <= end" }, { status: 400 });
  }

  const context = resolveAccountContextForUser(session.user.email);
  if (!context) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const series = getCurrentVsProjectedSeries(context, contributor, start, end, selectedCategory);
  return NextResponse.json(series);
}
