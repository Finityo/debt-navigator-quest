// Sanitizes Plaid error responses: only non-sensitive fields are logged or returned.
export const BANK_UNAVAILABLE_MESSAGE =
  "Bank import is temporarily unavailable. Please enter debts manually.";

export interface SanitizedPlaidError {
  endpoint: string;
  env: string;
  status: number;
  error_type: string | null;
  error_code: string | null;
}

export function sanitizePlaidError(
  endpoint: string,
  env: string,
  status: number,
  body: unknown,
): SanitizedPlaidError {
  const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  return {
    endpoint,
    env,
    status,
    error_type: typeof b.error_type === "string" ? b.error_type : null,
    error_code: typeof b.error_code === "string" ? b.error_code : null,
  };
}

export function userMessageForPlaidError(err: SanitizedPlaidError, fallback: string): string {
  if (err.error_code === "UNAUTHORIZED_ENVIRONMENT" || err.error_code === "INVALID_API_KEYS") {
    return BANK_UNAVAILABLE_MESSAGE;
  }
  return fallback;
}
