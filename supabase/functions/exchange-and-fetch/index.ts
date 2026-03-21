import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PLAID_CLIENT_ID = Deno.env.get("PLAID_CLIENT_ID");
    const PLAID_SECRET = Deno.env.get("PLAID_SECRET");

    if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
      throw new Error("Plaid credentials not configured");
    }

    const PLAID_ENV = "sandbox";
    const PLAID_BASE_URL = `https://${PLAID_ENV}.plaid.com`;

    const { public_token } = await req.json();

    if (!public_token) {
      return new Response(
        JSON.stringify({ error: "public_token is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 1: Exchange public token for access token
    const exchangeRes = await fetch(`${PLAID_BASE_URL}/item/public_token/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: PLAID_CLIENT_ID,
        secret: PLAID_SECRET,
        public_token,
      }),
    });

    const exchangeData = await exchangeRes.json();

    if (!exchangeRes.ok) {
      console.error("Exchange error:", exchangeData);
      return new Response(
        JSON.stringify({ error: exchangeData.error_message || "Token exchange failed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const accessToken = exchangeData.access_token;

    // Step 2: Fetch liabilities
    const liabilitiesRes = await fetch(`${PLAID_BASE_URL}/liabilities/get`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: PLAID_CLIENT_ID,
        secret: PLAID_SECRET,
        access_token: accessToken,
      }),
    });

    const liabilitiesData = await liabilitiesRes.json();

    if (!liabilitiesRes.ok) {
      console.error("Liabilities error:", liabilitiesData);
      return new Response(
        JSON.stringify({ error: liabilitiesData.error_message || "Failed to fetch liabilities" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 3: Flatten all liability types into a single debts array
    const { liabilities, accounts } = liabilitiesData;
    const accountMap = new Map(
      (accounts || []).map((a: any) => [a.account_id, a])
    );

    const debts: any[] = [];

    // Credit cards
    for (const item of liabilities?.credit || []) {
      const account = accountMap.get(item.account_id) || {};
      debts.push({
        type: "credit",
        account_id: item.account_id,
        name: (account as any).name || (account as any).official_name || "Credit Card",
        balances: (account as any).balances,
        aprs: item.aprs,
        minimum_payment_amount: item.minimum_payment_amount,
        next_payment_due_date: item.next_payment_due_date,
        last_payment_amount: item.last_payment_amount,
        last_statement_balance: item.last_statement_balance,
      });
    }

    // Student loans
    for (const item of liabilities?.student || []) {
      const account = accountMap.get(item.account_id) || {};
      debts.push({
        type: "student",
        account_id: item.account_id,
        name: (account as any).name || (account as any).official_name || "Student Loan",
        balances: (account as any).balances,
        interest_rate_percentage: item.interest_rate_percentage,
        minimum_payment_amount: item.minimum_payment_amount,
        next_payment_due_date: item.next_payment_due_date,
        last_payment_amount: item.last_payment_amount,
        origination_date: item.origination_date,
        loan_name: item.loan_name,
      });
    }

    // Mortgages
    for (const item of liabilities?.mortgage || []) {
      const account = accountMap.get(item.account_id) || {};
      debts.push({
        type: "mortgage",
        account_id: item.account_id,
        name: (account as any).name || (account as any).official_name || "Mortgage",
        balances: (account as any).balances,
        interest_rate: item.interest_rate,
        minimum_payment_amount: item.next_monthly_payment,
        next_payment_due_date: item.next_payment_due_date,
        origination_date: item.origination_date,
        loan_term: item.loan_term,
        property_address: item.property_address,
      });
    }

    return new Response(
      JSON.stringify({ debts }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("exchange-and-fetch error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
