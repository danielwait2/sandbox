import { db } from "@/lib/db";

export const DISPLAY_NAME_MAX_LENGTH = 60;

type ContributorProfileRow = {
  user_id: string;
  display_name: string | null;
  auth_provider_name: string | null;
};

const normalizeUserId = (userId: string): string => userId.trim().toLowerCase();

const normalizeText = (value: string | null | undefined): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export function resolveContributorDisplayName(
  userId: string,
  options?: {
    displayName?: string | null;
    authProviderName?: string | null;
    sessionAuthName?: string | null;
  }
): string {
  const displayName = normalizeText(options?.displayName);
  if (displayName) return displayName;

  const authProviderName = normalizeText(options?.authProviderName);
  if (authProviderName) return authProviderName;

  const sessionAuthName = normalizeText(options?.sessionAuthName);
  if (sessionAuthName) return sessionAuthName;

  return userId;
}

export function validateDisplayNameInput(value: unknown): {
  ok: boolean;
  value?: string;
  error?: string;
} {
  if (typeof value !== "string") {
    return { ok: false, error: "Display name is required" };
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return { ok: false, error: "Display name cannot be empty" };
  }

  if (trimmed.length > DISPLAY_NAME_MAX_LENGTH) {
    return {
      ok: false,
      error: `Display name must be ${DISPLAY_NAME_MAX_LENGTH} characters or fewer`,
    };
  }

  return { ok: true, value: trimmed };
}

export function upsertAuthProviderName(userId: string, authProviderName?: string | null): void {
  const normalizedUserId = normalizeUserId(userId);
  if (!normalizedUserId) return;

  const normalizedAuthName = normalizeText(authProviderName);
  const now = new Date().toISOString();

  db.prepare(
    `INSERT INTO user_profiles (user_id, display_name, auth_provider_name, created_at, updated_at)
     VALUES (?, NULL, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
       auth_provider_name = CASE
         WHEN excluded.auth_provider_name IS NOT NULL THEN excluded.auth_provider_name
         ELSE user_profiles.auth_provider_name
       END,
       updated_at = excluded.updated_at`
  ).run(normalizedUserId, normalizedAuthName, now, now);
}

export function saveDisplayName(
  userId: string,
  displayName: string,
  authProviderName?: string | null
): string {
  const validation = validateDisplayNameInput(displayName);
  if (!validation.ok || !validation.value) {
    throw new Error(validation.error ?? "Invalid display name");
  }

  const normalizedUserId = normalizeUserId(userId);
  const normalizedAuthName = normalizeText(authProviderName);
  const now = new Date().toISOString();

  db.prepare(
    `INSERT INTO user_profiles (user_id, display_name, auth_provider_name, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
       display_name = excluded.display_name,
       auth_provider_name = CASE
         WHEN excluded.auth_provider_name IS NOT NULL THEN excluded.auth_provider_name
         ELSE user_profiles.auth_provider_name
       END,
       updated_at = excluded.updated_at`
  ).run(normalizedUserId, validation.value, normalizedAuthName, now, now);

  return validation.value;
}

export function getContributorProfile(
  userId: string
): { displayName: string | null; authProviderName: string | null } | null {
  const normalizedUserId = normalizeUserId(userId);
  if (!normalizedUserId) return null;

  const row = db
    .prepare(
      `SELECT display_name, auth_provider_name
       FROM user_profiles
       WHERE user_id = ?`
    )
    .get(normalizedUserId) as { display_name: string | null; auth_provider_name: string | null } | undefined;

  if (!row) return null;

  return {
    displayName: row.display_name,
    authProviderName: row.auth_provider_name,
  };
}

export function getContributorDisplayNameMap(
  userIds: string[],
  viewer?: { userId: string; authProviderName?: string | null }
): Map<string, string> {
  const normalizedIds = [...new Set(userIds.map(normalizeUserId).filter(Boolean))];
  if (normalizedIds.length === 0) {
    return new Map();
  }

  const placeholders = normalizedIds.map(() => "?").join(", ");
  const rows = db
    .prepare(
      `SELECT user_id, display_name, auth_provider_name
       FROM user_profiles
       WHERE user_id IN (${placeholders})`
    )
    .all(...normalizedIds) as ContributorProfileRow[];

  const profileById = new Map<string, ContributorProfileRow>();
  for (const row of rows) {
    profileById.set(normalizeUserId(row.user_id), row);
  }

  const viewerId = viewer ? normalizeUserId(viewer.userId) : null;
  const displayNameMap = new Map<string, string>();
  for (const userId of normalizedIds) {
    const profile = profileById.get(userId);
    const sessionAuthName = viewerId && userId === viewerId ? viewer?.authProviderName : null;
    displayNameMap.set(
      userId,
      resolveContributorDisplayName(userId, {
        displayName: profile?.display_name ?? null,
        authProviderName: profile?.auth_provider_name ?? null,
        sessionAuthName,
      })
    );
  }

  return displayNameMap;
}
