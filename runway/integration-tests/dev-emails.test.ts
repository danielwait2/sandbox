import assert from "node:assert/strict";
import test from "node:test";

import { getConfiguredDevEmails, isConfiguredDevEmailSender } from "@/lib/devEmails";

test("parses DEV_TEST_EMAIL and DEV_TEST_EMAILS as a combined unique list", () => {
  const previousSingle = process.env.DEV_TEST_EMAIL;
  const previousList = process.env.DEV_TEST_EMAILS;

  process.env.DEV_TEST_EMAIL = "tayt.gwin@gmail.com";
  process.env.DEV_TEST_EMAILS = "taterg99@gmail.com, Tayt.Gwin@gmail.com";

  try {
    const emails = getConfiguredDevEmails();
    assert.deepEqual(emails.sort(), ["taterg99@gmail.com", "tayt.gwin@gmail.com"]);
    assert.equal(isConfiguredDevEmailSender("Tayt.Gwin@gmail.com"), true);
    assert.equal(isConfiguredDevEmailSender("unknown@example.com"), false);
  } finally {
    process.env.DEV_TEST_EMAIL = previousSingle;
    process.env.DEV_TEST_EMAILS = previousList;
  }
});
