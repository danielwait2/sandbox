import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getReceiptsForMonth } from "@/lib/history";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ month: string }> }
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { month } = await params;
  const receipts = getReceiptsForMonth(session.user.email, month);
  return NextResponse.json({ receipts });
}
