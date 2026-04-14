import { useDebtStore } from '@/store/useDebtStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ComputeBanner() {
  const { debts, validationErrors } = useDebtStore();
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

  if (hasErrors) {
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

  return null;
}
