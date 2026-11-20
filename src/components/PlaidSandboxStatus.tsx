import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, FlaskConical } from 'lucide-react';

interface Config { env: string; clientIdSet: boolean; secretSet: boolean }
interface TestResult { ok: boolean; step: string; error_code?: string | null; debtsFound?: number }

const STEP_HELP: Record<string, string> = {
  env: 'Bank import is not in sandbox mode.',
  config: 'Plaid client ID or secret is missing.',
  credentials: 'Plaid rejected the keys. Make sure PLAID_SECRET is your Sandbox secret.',
  exchange: 'Test bank login worked, but the connection step failed.',
  liabilities: 'Connected, but debt details could not be fetched. Check Liabilities is enabled in Plaid.',
};

function Row({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {ok ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <XCircle className="h-4 w-4 text-destructive" />}
      <span className="text-foreground">{label}</span>
    </div>
  );
}

export function PlaidSandboxStatus() {
  const [config, setConfig] = useState<Config | null>(null);
  const [test, setTest] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const call = useCallback(async (action?: 'test') => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase.functions.invoke('plaid-sandbox-status', {
      body: action ? { action } : {},
    });
    setLoading(false);
    if (err || !data?.config) {
      setError('Could not reach the bank connection service. Try again in a minute.');
      return;
    }
    setConfig(data.config);
    if (action) setTest(data.test ?? null);
  }, []);

  useEffect(() => { void call(); }, [call]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <FlaskConical className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Bank import test mode</span>
      </div>
      {config && (
        <div className="space-y-1.5">
          <Row ok={config.env === 'sandbox'} label={`Mode: ${config.env}`} />
          <Row ok={config.clientIdSet} label="Plaid client ID saved" />
          <Row ok={config.secretSet} label="Plaid secret saved" />
        </div>
      )}
      <ol className="list-decimal pl-5 text-xs text-muted-foreground space-y-1">
        <li>In the Plaid dashboard, open Team Settings → Keys and copy the Sandbox secret.</li>
        <li>In Project Settings → Secrets, update PLAID_SECRET with that value.</li>
        <li>Tap "Run test import" below.</li>
      </ol>
      {test && (
        <div className={`rounded-md border p-3 text-sm ${test.ok ? 'border-primary/40' : 'border-destructive/40'}`}>
          {test.ok
            ? <p className="text-foreground">Test import succeeded — {test.debtsFound} sample debts found.</p>
            : <p className="text-foreground">{STEP_HELP[test.step] ?? 'Test import failed.'}{test.error_code ? ` (${test.error_code})` : ''}</p>}
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button variant="outline" className="w-full h-10" disabled={loading} onClick={() => call('test')}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Run test import
      </Button>
    </div>
  );
}
