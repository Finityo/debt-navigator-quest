# Plaid + Security Diagnosis (read-only) and Remediation Plan

## 1. Deployed Plaid environment
- Code: both bank functions use `PLAID_ENV` if set, otherwise **production** (`https://production.plaid.com`).
- `PLAID_ENV` is **not configured**, so the deployed functions use production by code default.
- Configured Plaid secret names: `PLAID_CLIENT_ID`, `PLAID_SECRET`. No values were read.

## 2. Are the production credentials verified?
**No. The latest evidence shows Plaid rejected them.**
- Earlier "Production keys" was only the user's answer, not proof.
- Bank token-exchange log, 2026-11-20 23:20:44 UTC: environment production, HTTP 400, `INVALID_INPUT / UNAUTHORIZED_ENVIRONMENT` ("not authorized to create items in this api environment").
- Link-token logs show only boot/shutdown lines. There is no recorded success or error for link creation.
- Likely causes (not confirmed): the Plaid account is not yet approved for Production or for the Liabilities product, or the saved secret belongs to Sandbox. Only the Plaid Dashboard can confirm this (Team Settings → Keys, and the product/environment access page).

## 3. Lovable Cloud status
- Still **degraded** (status check returned `backend_degraded`) at the time of this review. Signed-in end-to-end testing is still blocked.

## 4. Security findings
- supply_chain: complete and up to date, 0 findings.
- app_mcp: complete but not up to date, 0 findings.
- lov_pgscan (database): **incomplete** because the backend is degraded, so nothing can be confirmed either way.
- No active titled findings exist, so there are no severities to report. One issue found during code review (not reported by a scanner):
  - **"Raw Plaid error payloads logged" (proposed: Low)**. `exchange-and-fetch` logs the full Plaid error objects with `console.error("Exchange error:", exchangeData)` and the same for liabilities. These include `request_id` and messages from Plaid. Fix: log only `{ endpoint, env, status, error_type, error_code }`.

## 5. Proposed remediation (after approval)
1. Owner action in the Plaid Dashboard: confirm Production access with Liabilities enabled, or get the production secret and update `PLAID_SECRET` in Project Settings → Secrets. No code change is needed for this step.
2. Optionally add an explicit `PLAID_ENV=production` secret so production is set on purpose instead of by a code default.
3. Patch `exchange-and-fetch` (and `create-link-token` the same way) to log sanitized fields only, and return a clear user-facing message for `UNAUTHORIZED_ENVIRONMENT` ("Bank import is temporarily unavailable. Please enter debts manually.").
4. Re-run the security scan once Cloud is healthy, then check every database finding against the schema and policies.

## Technical details / tests
- Unit test: the error sanitizer outputs only the allowed keys (no `request_id`, tokens or messages).
- Unit test: `UNAUTHORIZED_ENVIRONMENT` maps to the user-facing message with status 400.
- Keep the existing `plaid-auth` / `plaid-connect` tests passing (unsigned requests get 401).
- After the credentials are fixed: one signed-in sandbox-free check that link-token creation returns 200 (no live item creation without the owner's consent).
