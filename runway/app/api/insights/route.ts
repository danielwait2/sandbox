import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllInsights } from "@/lib/insights";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const month =
    request.nextUrl.searchParams.get("month") ??
    new Date().toISOString().slice(0, 7);

  const data = getAllInsights(session.user.email, month);
  return NextResponse.json(data);
}
