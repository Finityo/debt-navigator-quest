import { useState } from 'react';
import { useDebtStore } from '@/store/useDebtStore';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/utils/format';
import type { ExtraPayment } from '@/types/debt';
import { Plus, Trash2, Edit2, X, Check, DollarSign, Banknote } from 'lucide-react';

export default function ExtraPaymentsPage() {
  const { extraPayments, addExtraPayment, updateExtraPayment, removeExtraPayment, settings } = useDebtStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingMonth, setEditingMonth] = useState<number | null>(null);
  const [formMonth, setFormMonth] = useState<number>(1);
  const [formAmount, setFormAmount] = useState<number>(0);

  const sorted = [...extraPayments].sort((a, b) => a.monthNumber - b.monthNumber);

  const getDateForMonth = (monthNum: number) => {
    const d = new Date(settings.startDate);
    d.setMonth(d.getMonth() + monthNum - 1);
    return d.toISOString().slice(0, 10);
  };

  const handleAdd = () => {
    if (formMonth < 1 || formAmount <= 0) return;
    const existing = extraPayments.find((p) => p.monthNumber === formMonth);
    if (existing) {
      updateExtraPayment(formMonth, { extraAmount: formAmount });
    } else {
      addExtraPayment({ monthNumber: formMonth, date: getDateForMonth(formMonth), extraAmount: formAmount });
    }
    resetForm();
  };

  const startEdit = (ep: ExtraPayment) => {
    setEditingMonth(ep.monthNumber);
    setFormMonth(ep.monthNumber);
    setFormAmount(ep.extraAmount);
  };

  const handleSaveEdit = () => {
    if (editingMonth === null || formAmount <= 0) return;
    if (editingMonth !== formMonth) {
      removeExtraPayment(editingMonth);
      addExtraPayment({ monthNumber: formMonth, date: getDateForMonth(formMonth), extraAmount: formAmount });
    } else {
      updateExtraPayment(editingMonth, { extraAmount: formAmount });
    }
    resetForm();
  };

  const resetForm = () => {
    setEditingMonth(null);
    setIsAdding(false);
    setFormMonth(1);
    setFormAmount(0);
  };

  const totalExtra = extraPayments.reduce((sum, p) => sum + p.extraAmount, 0);

  const PaymentForm = ({ onSave }: { onSave: () => void }) => (
    <Card className="border-2 border-primary/15">
      <CardContent className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Month Number</Label>
            <Input
              type="number"
              min={1}
              max={settings.monthsHorizon}
              value={formMonth || ''}
              onChange={(e) => setFormMonth(parseInt(e.target.value) || 1)}
              placeholder="1"
            />
            <p className="text-[11px] text-muted-foreground">
              {formMonth >= 1 ? `→ ${getDateForMonth(formMonth)}` : ''}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Extra Amount ($)</Label>
            <Input
              type="number"
              min={0}
              step={50}
              value={formAmount || ''}
              onChange={(e) => setFormAmount(parseFloat(e.target.value) || 0)}
              placeholder="200"
            />
          </div>
          <div className="flex items-end gap-2">
            <Button size="sm" onClick={onSave} disabled={formMonth < 1 || formAmount <= 0}>
              <Check className="w-4 h-4 mr-1" /> Save
            </Button>
            <Button variant="ghost" size="sm" onClick={resetForm}>
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Extra Payments" description="Schedule additional payments to accelerate your payoff" />

      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted/80">
            <DollarSign className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Total Scheduled Extra</p>
            <p className="text-xl font-bold font-heading font-tabular">{formatCurrency(totalExtra)}</p>
          </div>
          <span className="ml-auto text-sm text-muted-foreground">
            {extraPayments.length} payment{extraPayments.length !== 1 ? 's' : ''}
          </span>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {sorted.length === 0 && !isAdding && (
          <Card className="border-dashed">
            <CardContent className="py-10 px-6 text-center">
              <div className="w-12 h-12 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
                <Banknote className="w-5 h-5 text-muted-foreground" />
              </div>
              <h3 className="font-heading font-semibold mb-1.5">No extra payments scheduled</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                Schedule extra payments to pay off your debt faster and save on interest.
              </p>
            </CardContent>
          </Card>
        )}

        {sorted.map((ep) =>
          editingMonth === ep.monthNumber ? (
            <PaymentForm key={ep.monthNumber} onSave={handleSaveEdit} />
          ) : (
            <Card key={ep.monthNumber} className="transition-card hover-lift">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Month {ep.monthNumber}</span>
                    <span className="text-[11px] text-muted-foreground">
                      ({new Date(ep.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})
                    </span>
                  </div>
                  <p className="text-lg font-bold font-heading font-tabular text-primary mt-0.5">
                    +{formatCurrency(ep.extraAmount)}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(ep)}>
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => removeExtraPayment(ep.monthNumber)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        )}

        {isAdding ? (
          <PaymentForm onSave={handleAdd} />
        ) : (
          <Button variant="outline" onClick={() => setIsAdding(true)} className="w-full border-dashed h-11">
            <Plus className="w-4 h-4 mr-2" /> Add Extra Payment
          </Button>
        )}
      </div>
    </div>
  );
}
