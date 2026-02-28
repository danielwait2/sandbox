type GoogleLikeError = Error & {
  response?: {
    status?: number;
    data?: {
      error?: {
        message?: string;
      };
    };
  };
};

const includesInsensitive = (value: string | undefined, target: string): boolean =>
  typeof value === "string" && value.toLowerCase().includes(target.toLowerCase());

export function isInsufficientScopeError(error: unknown): boolean {
  const err = error as GoogleLikeError | undefined;
  const message = err?.message;
  const apiMessage = err?.response?.data?.error?.message;

  return (
    includesInsensitive(message, "insufficient authentication scopes") ||
    includesInsensitive(apiMessage, "insufficient authentication scopes")
  );
}
