// Picks Plaid credentials for the active environment.
// Sandbox uses PLAID_CLIENT_ID_S / PLAID_SECRET_S; other environments use PLAID_CLIENT_ID / PLAID_SECRET.
export function getPlaidConfig() {
  const env = Deno.env.get("PLAID_ENV") || "production";
  const isSandbox = env === "sandbox";
  const clientId = isSandbox
    ? Deno.env.get("PLAID_CLIENT_ID_S") || Deno.env.get("PLAID_CLIENT_ID")
    : Deno.env.get("PLAID_CLIENT_ID");
  const secret = isSandbox
    ? Deno.env.get("PLAID_SECRET_S") || Deno.env.get("PLAID_SECRET")
    : Deno.env.get("PLAID_SECRET");
  return { env, clientId, secret };
}
