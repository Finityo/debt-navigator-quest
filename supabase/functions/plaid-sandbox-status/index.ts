import { getPlaidConfig } from "../_shared/plaidConfig.ts";
// Sandbox-only diagnostics: reports configuration and runs a Plaid test-bank import.
// Never returns credentials, tokens, or account data — only booleans, codes and counts.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sanitizePlaidError } from "../_shared/plaidError.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claims, error: claimsError } = await supabase.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (claimsError || !claims?.claims?.sub) return json({ error: "Unauthorized" }, 401);

    const { clientId, secret, env } = getPlaidConfig();
    const config = { env, clientIdSet: !!clientId, secretSet: !!secret };

    let body: { action?: string } = {};
    try { body = await req.json(); } catch { /* empty body = status only */ }
    if (body.action !== "test") return json({ config });

    if (env !== "sandbox") return json({ config, test: { ok: false, step: "env", error_code: "NOT_SANDBOX" } });
    if (!clientId || !secret) return json({ config, test: { ok: false, step: "config", error_code: "MISSING_CREDENTIALS" } });

    const base = "https://sandbox.plaid.com";
    const post = (path: string, payload: Record<string, unknown>) =>
      fetch(`${base}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId, secret, ...payload }),
      });

    const r1 = await post("/sandbox/public_token/create", {
      institution_id: "ins_109508",
      initial_products: ["liabilities"],
    });
    const d1 = await r1.json();
    if (!r1.ok) {
      const err = sanitizePlaidError("/sandbox/public_token/create", env, r1.status, d1);
      console.error("Plaid error:", err);
      return json({ config, test: { ok: false, step: "credentials", error_code: err.error_code } });
    }
    const r2 = await post("/item/public_token/exchange", { public_token: d1.public_token });
    const d2 = await r2.json();
    if (!r2.ok) {
      const err = sanitizePlaidError("/item/public_token/exchange", env, r2.status, d2);
      console.error("Plaid error:", err);
      return json({ config, test: { ok: false, step: "exchange", error_code: err.error_code } });
    }
    const r3 = await post("/liabilities/get", { access_token: d2.access_token });
    const d3 = await r3.json();
    // Clean up the sandbox test item regardless of outcome.
    await post("/item/remove", { access_token: d2.access_token }).catch(() => undefined);
    if (!r3.ok) {
      const err = sanitizePlaidError("/liabilities/get", env, r3.status, d3);
      console.error("Plaid error:", err);
      return json({ config, test: { ok: false, step: "liabilities", error_code: err.error_code } });
    }
    const l = d3.liabilities || {};
    const count = (l.credit?.length || 0) + (l.student?.length || 0) + (l.mortgage?.length || 0);
    return json({ config, test: { ok: true, step: "done", debtsFound: count } });
  } catch (e) {
    console.error("plaid-sandbox-status error:", e instanceof Error ? e.message : "unknown");
    return json({ error: "Internal server error" }, 500);
  }
});
