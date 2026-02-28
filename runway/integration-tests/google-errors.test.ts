import assert from "node:assert/strict";
import test from "node:test";

import { isInsufficientScopeError } from "@/lib/googleErrors";

test("detects insufficient scope errors from message and API payload", () => {
  assert.equal(
    isInsufficientScopeError(new Error("Request had insufficient authentication scopes.")),
    true
  );

  assert.equal(
    isInsufficientScopeError({
      response: {
        data: {
          error: {
            message: "Insufficient Authentication Scopes.",
          },
        },
      },
    }),
    true
  );

  assert.equal(isInsufficientScopeError(new Error("Something else")), false);
});
