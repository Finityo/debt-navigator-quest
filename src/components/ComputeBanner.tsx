import { useDebtStore, type ComputeStatus } from '@/store/useDebtStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calculator, AlertTriangle, RefreshCw, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ComputeBanner() {
  const { debts, planResult, computeStatus, computePlan, validationErrors } = useDebtStore();
  const navigate = useNavigate();

  if (debts.length === 0) {
    return (
      <Card className="border border-dashed border-border/60">
        <CardContent className="py-12 px-6 flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Info className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base">No debts added yet</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto leading-relaxed">
              Add your debts to get started with a personalized payoff plan.
            </p>
          </div>
          <Button onClick={() => navigate('/debts')} size="default">
            Add Your First Debt
          </Button>
        </CardContent>
      </Card>
    );
  }

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
      <Card className="border border-destructive/20 bg-destructive/5">
        <CardContent className="p-5 flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4 text-destructive" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-bold text-sm">Please fix these issues</h3>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1.5">
              {allErrors.slice(0, 5).map((e, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-destructive/60 mt-0.5">•</span>
                  <span>{e}</span>
                </li>
              ))}
              {allErrors.length > 5 && (
                <li className="text-xs text-muted-foreground/70">and {allErrors.length - 5} more…</li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!planResult) {
    return (
      <Card className="border border-primary/15 bg-accent/40">
        <CardContent className="py-12 px-6 flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base">Ready to compute your plan</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed">
              {debts.length} debt{debts.length !== 1 ? 's' : ''} loaded. Run the engine to see your payoff timeline.
            </p>
          </div>
          <Button onClick={computePlan} size="default">
            <Calculator className="w-4 h-4 mr-2" /> Compute Plan
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (computeStatus === 'stale') {
    return (
      <Card className="border border-warning/25 bg-warning/5">
        <CardContent className="p-4 flex items-center gap-3.5">
          <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
            <RefreshCw className="w-4 h-4 text-warning" />
          </div>
          <p className="text-sm text-muted-foreground flex-1">
            Your inputs have changed. Recalculate to see updated results.
          </p>
          <Button size="sm" variant="outline" onClick={computePlan} className="shrink-0">
            <RefreshCw className="w-3 h-3 mr-1.5" /> Recalculate
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}
