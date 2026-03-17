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
import { Plus, Trash2, Edit2, X, Check, CreditCard } from 'lucide-react';

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
    <Card className="border-2 border-primary/20 bg-card">
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Creditor Name</Label>
            <Input
              value={form.creditorName || ''}
              onChange={(e) => setForm({ ...form, creditorName: e.target.value })}
              placeholder="e.g. Chase Visa"
            />
          </div>
          <div>
            <Label className="text-xs">Type</Label>
            <Select value={form.type || 'credit_card'} onValueChange={(v) => setForm({ ...form, type: v as DebtType })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {debtTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Balance ($)</Label>
            <Input
              type="number"
              value={form.balance || ''}
              onChange={(e) => setForm({ ...form, balance: parseFloat(e.target.value) || 0 })}
              placeholder="4200"
            />
          </div>
          <div>
            <Label className="text-xs">APR (%)</Label>
            <Input
              type="number"
              step="0.1"
              value={form.apr || ''}
              onChange={(e) => setForm({ ...form, apr: parseFloat(e.target.value) || 0 })}
              placeholder="21.9"
            />
          </div>
          <div>
            <Label className="text-xs">Min Payment ($)</Label>
            <Input
              type="number"
              value={form.minPayment || ''}
              onChange={(e) => setForm({ ...form, minPayment: parseFloat(e.target.value) || 0 })}
              placeholder="95"
            />
          </div>
          <div>
            <Label className="text-xs">Notes</Label>
            <Input
              value={form.notes || ''}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Optional"
            />
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={onCancel}><X className="w-4 h-4 mr-1" /> Cancel</Button>
          <Button size="sm" onClick={onSave}><Check className="w-4 h-4 mr-1" /> Save</Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div>
      <PageHeader title="Debts" description="Add and manage your debts" />

      {/* Summary */}
      <Card className="border bg-card mb-4">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <CreditCard className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Debt</p>
            <p className="text-lg font-bold font-heading">{formatCurrency(totalDebt)}</p>
          </div>
          <span className="ml-auto text-sm text-muted-foreground">
            {debts.length} debt{debts.length !== 1 ? 's' : ''}
          </span>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {debts.length === 0 && !isAdding && (
          <Card className="border border-dashed bg-card">
            <CardContent className="p-8 text-center">
              <CreditCard className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-heading font-semibold mb-1">No debts yet</h3>
              <p className="text-sm text-muted-foreground">Add your first debt to start building a payoff plan.</p>
            </CardContent>
          </Card>
        )}

        {debts.map((debt) =>
          editingId === debt.id ? (
            <DebtForm key={debt.id} onSave={handleSaveEdit} onCancel={() => { setEditingId(null); setForm(emptyDebt()); }} />
          ) : (
            <Card key={debt.id} className="border bg-card">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-semibold truncate">{debt.creditorName}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
                      {debt.type.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                    <span>Balance: <strong className="text-foreground">{formatCurrency(debt.balance)}</strong></span>
                    <span>APR: <strong className="text-foreground">{formatPercent(debt.apr)}</strong></span>
                    <span>Min: <strong className="text-foreground">{formatCurrency(debt.minPayment)}/mo</strong></span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(debt)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => removeDebt(debt.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        )}

        {isAdding ? (
          <DebtForm onSave={handleSaveNew} onCancel={() => { setIsAdding(false); setForm(emptyDebt()); }} />
        ) : (
          <Button variant="outline" onClick={() => setIsAdding(true)} className="w-full border-dashed">
            <Plus className="w-4 h-4 mr-2" /> Add Debt
          </Button>
        )}
      </div>
    </div>
  );
}
