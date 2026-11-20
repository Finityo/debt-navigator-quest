import { describe, it, expect } from "vitest";
import { sanitizePlaidError, userMessageForPlaidError, BANK_UNAVAILABLE_MESSAGE } from "../../supabase/functions/_shared/plaidError";

describe("Plaid error sanitizer", () => {
  it("keeps only allowed keys", () => {
    const e = sanitizePlaidError("/item/public_token/exchange", "production", 400, {
      error_type: "INVALID_INPUT", error_code: "UNAUTHORIZED_ENVIRONMENT",
      request_id: "abc", error_message: "secret-ish", access_token: "tok",
    });
    expect(Object.keys(e).sort()).toEqual(["endpoint", "env", "error_code", "error_type", "status"]);
    expect(JSON.stringify(e)).not.toContain("abc");
  });
  it("maps UNAUTHORIZED_ENVIRONMENT to the user message", () => {
    const e = sanitizePlaidError("/x", "production", 400, { error_code: "UNAUTHORIZED_ENVIRONMENT" });
    expect(userMessageForPlaidError(e, "Token exchange failed")).toBe(BANK_UNAVAILABLE_MESSAGE);
  });
  it("uses fallback for other codes", () => {
    const e = sanitizePlaidError("/x", "production", 400, { error_code: "ITEM_LOGIN_REQUIRED" });
    expect(userMessageForPlaidError(e, "Token exchange failed")).toBe("Token exchange failed");
  });
});
