const splitEmails = (value: string | undefined): string[] => {
  if (!value) return [];
  return value
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry.length > 0);
};

export const getConfiguredDevEmails = (): string[] => {
  const single = splitEmails(process.env.DEV_TEST_EMAIL);
  const list = splitEmails(process.env.DEV_TEST_EMAILS);
  return Array.from(new Set([...single, ...list]));
};

export const isConfiguredDevEmailSender = (from: string): boolean => {
  const normalizedFrom = from.toLowerCase();
  return getConfiguredDevEmails().some((email) => normalizedFrom.includes(email));
};
