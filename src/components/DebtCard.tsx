import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Edit2, Trash2 } from 'lucide-react';
import { formatCurrency, formatCurrencyCents, formatPercent } from '@/utils/format';
import type { Debt } from '@/types/debt';

interface DebtCardProps {
  debt: Debt;
  onEdit: (debt: Debt) => void;
  onRemove: (id: string) => void;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export default function DebtCard({ debt, onEdit, onRemove }: DebtCardProps) {
  // Warning parity with the plan engine: normalizeDebtInput reads an apr
  // above 1 as a percent and anything else as a decimal, and runEngine
  // Step 1 rounds the month's interest to cents. Use those exact rules so
  // this warning fires precisely when the engine's interest exceeds the
  // minimum. A minimum equal to the rounded interest covers it (no warning).
  const aprPercent = debt.apr > 1 ? round2(debt.apr) : round2(debt.apr * 100);
  const monthlyInterest = round2((round2(debt.balance) * (aprPercent / 100)) / 12);
  const minimumShortOfInterest = round2(debt.minPayment) < monthlyInterest;
  return (
    <Card className="transition-card hover:scale-[1.01]">
      <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="font-heading font-bold text-[15px] truncate">{debt.creditorName}</h3>
            <span className="text-[10px] px-2 py-0.5 glass-pill text-muted-foreground capitalize font-medium">
              {debt.type.replace('_', ' ')}
            </span>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
            <span>Balance: <strong className="text-foreground font-tabular">{formatCurrency(debt.balance)}</strong></span>
            <span>APR: <strong className="text-foreground font-tabular">{formatPercent(debt.apr)}</strong></span>
            <span>Min: <strong className="text-foreground font-tabular">{formatCurrency(debt.minPayment)}/mo</strong></span>
          </div>
          {minimumShortOfInterest && (
            <p className="mt-2 text-xs font-medium text-amber-600 dark:text-amber-400">
              Minimum does not cover monthly interest ({formatCurrencyCents(monthlyInterest)}/mo). Balance may increase.
            </p>
          )}
        </div>
        <div className="flex gap-1.5 shrink-0">
          <Button variant="ghost" size="icon" className="h-10 w-10 sm:h-8 sm:w-8" onClick={() => onEdit(debt)}>
            <Edit2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 sm:h-8 sm:w-8 text-destructive hover:text-destructive" onClick={() => onRemove(debt.id)}>
            <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
