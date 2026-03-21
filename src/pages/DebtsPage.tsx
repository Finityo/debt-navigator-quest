import { useState } from 'react';
import { useDebtStore } from '@/store/useDebtStore';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Debt, DebtType } from '@/types/debt';
import { formatCurrency, formatPercent } from '@/utils/format';
import { Plus, Trash2, Edit2, X, Check, CreditCard, Landmark } from 'lucide-react';
import PlaidConnect from '@/components/PlaidConnect';

const debtTypes: { value: DebtType; label: string }[] = [
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'student_loan', label: 'Student Loan' },
  { value: 'auto_loan', label: 'Auto Loan' },
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'personal_loan', label: 'Personal Loan' },
  { value: 'medical', label: 'Medical' },
  { value: 'other', label: 'Other' },
];

const emptyDebt = (): Partial<Debt> => ({
  creditorName: '',
  balance: 0,
  apr: 0,
  minPayment: 0,
  type: 'credit_card',
  notes: '',
});

export default function DebtsPage() {
  const { debts, addDebt, updateDebt, removeDebt } = useDebtStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Debt>>(emptyDebt());

  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);

  const handleSaveNew = () => {
    if (!form.creditorName || !form.balance) return;
    addDebt({
      id: `debt-${Date.now()}`,
      creditorName: form.creditorName!,
      balance: Number(form.balance),
      apr: Number(form.apr) / 100,
      minPayment: Number(form.minPayment),
      type: (form.type as DebtType) || 'other',
      startDate: new Date().toISOString().slice(0, 10),
      notes: form.notes || '',
    });
    setForm(emptyDebt());
    setIsAdding(false);
  };

  const startEdit = (debt: Debt) => {
    setEditingId(debt.id);
    setForm({
      creditorName: debt.creditorName,
      balance: debt.balance,
      apr: debt.apr * 100,
      minPayment: debt.minPayment,
      type: debt.type,
      notes: debt.notes,
    });
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    updateDebt(editingId, {
      creditorName: form.creditorName,
      balance: Number(form.balance),
      apr: Number(form.apr) / 100,
      minPayment: Number(form.minPayment),
      type: form.type as DebtType,
      notes: form.notes,
    });
    setEditingId(null);
    setForm(emptyDebt());
  };

  const DebtForm = ({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) => (
    <Card className="border-2 border-primary/15">
      <CardContent className="p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Creditor Name</Label>
            <Input
              value={form.creditorName || ''}
              onChange={(e) => setForm({ ...form, creditorName: e.target.value })}
              placeholder="e.g. Chase Visa"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Type</Label>
            <Select value={form.type || 'credit_card'} onValueChange={(v) => setForm({ ...form, type: v as DebtType })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {debtTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Balance ($)</Label>
            <Input
              type="number"
              value={form.balance || ''}
              onChange={(e) => setForm({ ...form, balance: parseFloat(e.target.value) || 0 })}
              placeholder="4,200"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">APR (%)</Label>
            <Input
              type="number"
              step="0.1"
              value={form.apr || ''}
              onChange={(e) => setForm({ ...form, apr: parseFloat(e.target.value) || 0 })}
              placeholder="21.9"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Min Payment ($)</Label>
            <Input
              type="number"
              value={form.minPayment || ''}
              onChange={(e) => setForm({ ...form, minPayment: parseFloat(e.target.value) || 0 })}
              placeholder="95"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Notes</Label>
            <Input
              value={form.notes || ''}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Optional"
            />
          </div>
        </div>
        <div className="flex gap-2.5 justify-end pt-1">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4 mr-1" /> Cancel
          </Button>
          <Button size="sm" onClick={onSave}>
            <Check className="w-4 h-4 mr-1" /> Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <PageHeader title="Debts" description="Add and manage your debts" />

      {/* Summary */}
      <Card>
        <CardContent className="p-5 flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-primary/10">
            <CreditCard className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Total Debt</p>
            <p className="text-2xl font-bold font-heading font-tabular mt-0.5">{formatCurrency(totalDebt)}</p>
          </div>
          <span className="ml-auto text-sm text-muted-foreground">
            {debts.length} debt{debts.length !== 1 ? 's' : ''}
          </span>
        </CardContent>
      </Card>

      <div className="space-y-3.5">
        {debts.length === 0 && !isAdding && (
          <Card className="border-dashed">
            <CardContent className="py-12 px-6 text-center">
              <div className="w-12 h-12 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
              </div>
              <h3 className="font-heading font-bold mb-2">No debts yet</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                Add your first debt to start building a personalized payoff plan.
              </p>
            </CardContent>
          </Card>
        )}

        {debts.map((debt) =>
          editingId === debt.id ? (
            <DebtForm key={debt.id} onSave={handleSaveEdit} onCancel={() => { setEditingId(null); setForm(emptyDebt()); }} />
          ) : (
            <Card key={debt.id} className="transition-card hover-lift">
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-heading font-bold text-[15px] truncate">{debt.creditorName}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize font-medium">
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
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(debt)}>
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => removeDebt(debt.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        )}

        {isAdding ? (
          <DebtForm onSave={handleSaveNew} onCancel={() => { setIsAdding(false); setForm(emptyDebt()); }} />
        ) : (
          <Button variant="outline" onClick={() => setIsAdding(true)} className="w-full border-dashed h-12">
            <Plus className="w-4 h-4 mr-2" /> Add Debt
          </Button>
        )}
      </div>
    </div>
  );
}
