import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import {
  DISPLAY_NAME_MAX_LENGTH,
  getContributorProfile,
  resolveContributorDisplayName,
  saveDisplayName,
  upsertAuthProviderName,
  validateDisplayNameInput,
} from "@/lib/contributorProfiles";

export async function GET(): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  upsertAuthProviderName(session.user.email, session.user.name);

  const profile = getContributorProfile(session.user.email);
  const displayName = profile?.displayName ?? "";
  const resolvedDisplayName = resolveContributorDisplayName(session.user.email, {
    displayName: profile?.displayName,
    authProviderName: profile?.authProviderName,
    sessionAuthName: session.user.name,
  });

  return NextResponse.json({
    displayName,
    resolvedDisplayName,
    maxLength: DISPLAY_NAME_MAX_LENGTH,
  });
}

export async function PUT(request: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({} as { displayName?: unknown }));
  const validation = validateDisplayNameInput((body as { displayName?: unknown }).displayName);
  if (!validation.ok || !validation.value) {
    return NextResponse.json({ error: validation.error ?? "Invalid display name" }, { status: 400 });
  }

  const saved = saveDisplayName(session.user.email, validation.value, session.user.name);
  return NextResponse.json({ displayName: saved, message: "Display name saved" });
}
