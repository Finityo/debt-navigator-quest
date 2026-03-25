import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Edit2, Trash2 } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/utils/format';
import type { Debt } from '@/types/debt';

interface DebtCardProps {
  debt: Debt;
  onEdit: (debt: Debt) => void;
  onRemove: (id: string) => void;
}

export default function DebtCard({ debt, onEdit, onRemove }: DebtCardProps) {
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
        </div>
        <div className="flex gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(debt)}>
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onRemove(debt.id)}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
