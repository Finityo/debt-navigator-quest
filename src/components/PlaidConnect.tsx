import React, { useState, useEffect, useCallback } from 'react';
import { usePlaidLink, PlaidLinkOptionsWithLinkToken } from 'react-plaid-link';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useDebtStore } from '@/store/useDebtStore';
import type { DebtType } from '@/types/debt';
import { toast } from 'sonner';

function mapPlaidType(type: string): DebtType {
  switch (type) {
    case 'credit': return 'credit_card';
    case 'student': return 'student_loan';
    case 'mortgage': return 'mortgage';
    default: return 'other';
  }
}

function normalizePlaidDebts(debts: any[]): Debt[] {
  return debts.map((d, i) => {
    let apr = 0;
    if (d.aprs?.[0]?.apr_percentage) {
      apr = d.aprs[0].apr_percentage / 100; // Convert percentage to decimal
    } else if (d.interest_rate_percentage) {
      apr = d.interest_rate_percentage / 100;
    } else if (d.interest_rate?.percentage) {
      apr = d.interest_rate.percentage / 100;
    }

    return {
      id: `plaid-${d.account_id || i}-${Date.now()}`,
      creditorName: d.name || 'Unknown',
      balance: d.balances?.current || 0,
      apr,
      minPayment: d.minimum_payment_amount || 0,
      type: mapPlaidType(d.type),
      startDate: d.origination_date || new Date().toISOString().slice(0, 10),
      notes: `Imported from Plaid${d.next_payment_due_date ? ` • Due: ${d.next_payment_due_date}` : ''}`,
    };
  });
}

export default function PlaidConnect() {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const addDebt = useDebtStore((s) => s.addDebt);
  const computePlan = useDebtStore((s) => s.computePlan);

  const fetchLinkToken = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-link-token');
      if (error) throw error;
      setLinkToken(data.link_token);
    } catch (err) {
      console.error(err);
      setErrorMsg('Unable to initialize secure bank connection.');
    }
  }, []);

  useEffect(() => {
    fetchLinkToken();
  }, [fetchLinkToken]);

  const config: PlaidLinkOptionsWithLinkToken = {
    token: linkToken!,
    onSuccess: async (public_token, metadata) => {
      try {
        setLoading(true);
        const { data, error } = await supabase.functions.invoke('exchange-and-fetch', {
          body: { public_token },
        });
        if (error) throw error;

        const normalized = normalizePlaidDebts(data.debts || []);

        if (normalized.length > 0) {
          normalized.forEach((debt) => addDebt(debt));
          computePlan();
          setSuccess(true);
          setErrorMsg(null);
          toast.success(`${normalized.length} debt(s) imported successfully`);
        } else {
          toast.info('No eligible debt accounts found at this institution.');
        }
      } catch (err) {
        console.error(err);
        setErrorMsg('Failed to import debts. Please try again.');
        toast.error('Failed to import debts');
      } finally {
        setLoading(false);
      }
    },
    onExit: (err) => {
      if (err) {
        setErrorMsg(err.error_message || 'Connection cancelled.');
      }
    },
  };

  const { open, ready, error } = usePlaidLink(linkToken ? config : ({} as any));

  if (!linkToken) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Preparing secure connection...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive p-4 text-center">
        Plaid setup error: {error.message}
      </div>
    );
  }

  return (
    <div className="glass-card p-6 space-y-4">
      <Button
        size="lg"
        onClick={() => open()}
        disabled={!ready || loading}
        className="w-full glass-strong glow bg-primary/90 hover:bg-primary text-primary-foreground font-semibold hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
      >
        {loading
          ? 'Securely connecting...'
          : ready
          ? 'Connect Your Bank Securely'
          : 'Preparing secure connection...'}
      </Button>

      {errorMsg && (
        <p className="text-destructive text-center text-sm">{errorMsg}</p>
      )}

      {success && (
        <p className="text-primary text-center text-sm font-medium">
          Bank connected successfully. Debts imported.
        </p>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Powered by Plaid • Bank-level security • We never see your login
      </p>
    </div>
  );
}
