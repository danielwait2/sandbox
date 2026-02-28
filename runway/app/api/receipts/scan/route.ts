import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { scanGmail } from "@/lib/gmailScanner";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!session.accessToken || !session.refreshToken) {
    return NextResponse.json(
      { error: "Missing Google OAuth tokens in session." },
      { status: 400 }
    );
  }

  const result = await scanGmail(
    session.user.email,
    session.accessToken,
    session.refreshToken
  );

  return NextResponse.json(result);
}
