import { useDebtStore, type ComputeStatus } from '@/store/useDebtStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calculator, AlertTriangle, RefreshCw, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * ComputeBanner — Displays appropriate action/status for plan computation.
 * Used on output pages (Dashboard, Plan, Timeline, etc.)
 * No business logic — just reads state and dispatches computePlan.
 */
export function ComputeBanner() {
  const { debts, planResult, computeStatus, computePlan, validationErrors } = useDebtStore();
  const navigate = useNavigate();

  // No debts at all
  if (debts.length === 0) {
    return (
      <Card className="border-2 border-dashed bg-card">
        <CardContent className="p-6 flex flex-col items-center text-center gap-3">
          <Info className="w-8 h-8 text-muted-foreground" />
          <div>
            <h3 className="font-heading font-semibold">No debts added</h3>
            <p className="text-sm text-muted-foreground mt-1">Add your debts to start building a payoff plan.</p>
          </div>
          <Button onClick={() => navigate('/debts')} className="mt-2">
            Add Debts
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Validation errors present
  const hasErrors =
    Object.keys(validationErrors.debts).length > 0 ||
    validationErrors.settings.length > 0 ||
    validationErrors.extraPayments.length > 0;

  if (hasErrors && computeStatus !== 'computed') {
    const allErrors = [
      ...Object.values(validationErrors.debts).flat(),
      ...validationErrors.settings,
      ...validationErrors.extraPayments,
    ];
    return (
      <Card className="border border-destructive/30 bg-destructive/5">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-semibold text-sm">Fix validation issues</h3>
            <ul className="text-sm text-muted-foreground mt-1 space-y-0.5">
              {allErrors.slice(0, 5).map((e, i) => (
                <li key={i}>• {e}</li>
              ))}
              {allErrors.length > 5 && <li>• and {allErrors.length - 5} more…</li>}
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No plan computed yet
  if (!planResult) {
    return (
      <Card className="border-2 border-primary/20 bg-accent/30">
        <CardContent className="p-6 flex flex-col items-center text-center gap-3">
          <Calculator className="w-8 h-8 text-primary" />
          <div>
            <h3 className="font-heading font-semibold">Ready to compute</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {debts.length} debt{debts.length !== 1 ? 's' : ''} loaded. Run the engine to generate your payoff plan.
            </p>
          </div>
          <Button onClick={computePlan} className="mt-2">
            <Calculator className="w-4 h-4 mr-2" /> Compute Plan
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Plan is stale
  if (computeStatus === 'stale') {
    return (
      <Card className="border border-warning/30 bg-warning/5">
        <CardContent className="p-3 flex items-center gap-3">
          <RefreshCw className="w-4 h-4 text-warning shrink-0" />
          <p className="text-sm text-muted-foreground flex-1">
            Inputs changed since last computation.
          </p>
          <Button size="sm" variant="outline" onClick={computePlan}>
            <RefreshCw className="w-3 h-3 mr-1" /> Recalculate
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}
