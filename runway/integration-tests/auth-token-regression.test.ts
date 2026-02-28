import assert from "node:assert/strict";
import test from "node:test";

import { authOptions } from "@/lib/auth";

test("jwt callback preserves existing refresh token when provider does not return a new one", async () => {
  const jwt = authOptions.callbacks?.jwt;
  assert.ok(jwt);

  const token = (await jwt({
    token: {
      accessToken: "old-access",
      refreshToken: "existing-refresh",
    },
    account: {
      access_token: "new-access",
    } as never,
    user: undefined as never,
    profile: undefined as never,
    trigger: "signIn",
    session: undefined,
    isNewUser: false,
  })) as { accessToken?: string; refreshToken?: string };

  assert.equal(token.accessToken, "new-access");
  assert.equal(token.refreshToken, "existing-refresh");
});
