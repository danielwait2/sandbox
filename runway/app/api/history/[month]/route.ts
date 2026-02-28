import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getReceiptsForMonth } from "@/lib/history";
import { parseContributorFilter, resolveAccountContextForUser } from "@/lib/account";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ month: string }> }
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contributor = parseContributorFilter(_request.nextUrl.searchParams.get("contributor"));
  if (!contributor) {
    return NextResponse.json({ error: "Invalid contributor filter" }, { status: 400 });
  }

  const context = resolveAccountContextForUser(session.user.email);
  if (!context) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { month } = await params;
  const receipts = getReceiptsForMonth(context, contributor, month);
  return NextResponse.json({ contributor, receipts });
}
