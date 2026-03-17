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
    <Card className="border-2 border-primary/20 bg-card">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label className="text-xs">Month Number</Label>
            <Input
              type="number"
              min={1}
              max={settings.monthsHorizon}
              value={formMonth || ''}
              onChange={(e) => setFormMonth(parseInt(e.target.value) || 1)}
              placeholder="1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formMonth >= 1 ? `→ ${getDateForMonth(formMonth)}` : ''}
            </p>
          </div>
          <div>
            <Label className="text-xs">Extra Amount ($)</Label>
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
    <div>
      <PageHeader title="Extra Payments" description="Schedule additional payments to accelerate your payoff" />

      <Card className="border bg-card mb-4">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <DollarSign className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Scheduled Extra</p>
            <p className="text-lg font-bold font-heading">{formatCurrency(totalExtra)}</p>
          </div>
          <span className="ml-auto text-sm text-muted-foreground">
            {extraPayments.length} payment{extraPayments.length !== 1 ? 's' : ''}
          </span>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {sorted.length === 0 && !isAdding && (
          <Card className="border border-dashed bg-card">
            <CardContent className="p-8 text-center">
              <Banknote className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-heading font-semibold mb-1">No extra payments scheduled</h3>
              <p className="text-sm text-muted-foreground">Add extra payments to accelerate your debt payoff.</p>
            </CardContent>
          </Card>
        )}

        {sorted.map((ep) =>
          editingMonth === ep.monthNumber ? (
            <PaymentForm key={ep.monthNumber} onSave={handleSaveEdit} />
          ) : (
            <Card key={ep.monthNumber} className="border bg-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Month {ep.monthNumber}</span>
                    <span className="text-xs text-muted-foreground">
                      ({new Date(ep.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})
                    </span>
                  </div>
                  <p className="text-lg font-bold font-heading text-primary mt-0.5">
                    +{formatCurrency(ep.extraAmount)}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(ep)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => removeExtraPayment(ep.monthNumber)} className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        )}

        {isAdding ? (
          <PaymentForm onSave={handleAdd} />
        ) : (
          <Button variant="outline" onClick={() => setIsAdding(true)} className="w-full border-dashed">
            <Plus className="w-4 h-4 mr-2" /> Add Extra Payment
          </Button>
        )}
      </div>
    </div>
  );
}
