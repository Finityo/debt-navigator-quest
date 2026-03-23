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
import { Plus, X, Check, CreditCard, Landmark } from 'lucide-react';
import PlaidConnect from '@/components/PlaidConnect';
import ManualDebtForm from '@/components/ManualDebtForm';
import DebtCard from '@/components/DebtCard';
import CsvImportExport from '@/components/CsvImportExport';

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

  const EditForm = ({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) => (
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

      {/* Bank Import Section */}
      <Card className="border border-primary/20 bg-accent/30" data-tour="connect-accounts">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10">
              <Landmark className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-base">Connect Bank to Auto-Import Debts</h2>
              <p className="text-xs text-muted-foreground">Securely pull your credit cards, student loans &amp; mortgages in seconds.</p>
            </div>
          </div>
          <PlaidConnect />
        </CardContent>
      </Card>

      {/* CSV Import/Export */}
      <CsvImportExport />

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

      {/* Manual Add Form */}
      {isAdding && (
        <ManualDebtForm onClose={() => setIsAdding(false)} />
      )}

      <div className="space-y-3.5">
        {debts.length === 0 && !isAdding && (
          <Card className="glass-card border-dashed border-primary/20 shadow-xl">
            <CardContent className="py-14 px-6 text-center space-y-5">
              <div className="w-14 h-14 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg mb-1.5">No debts yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  Add your first debt manually or connect your bank above to get started with a personalized payoff plan.
                </p>
              </div>
              <Button
                onClick={() => setIsAdding(true)}
                className="glass-strong glow bg-primary/90 hover:bg-primary text-primary-foreground font-semibold hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Your First Debt
              </Button>
            </CardContent>
          </Card>
        )}

        {debts.map((debt) =>
          editingId === debt.id ? (
            <EditForm key={debt.id} onSave={handleSaveEdit} onCancel={() => { setEditingId(null); setForm(emptyDebt()); }} />
          ) : (
            <DebtCard key={debt.id} debt={debt} onEdit={startEdit} onRemove={removeDebt} />
          )
        )}

        {debts.length > 0 && !isAdding && (
          <Button variant="outline" onClick={() => setIsAdding(true)} className="w-full border-dashed h-12" data-tour="manual-add-debt">
            <Plus className="w-4 h-4 mr-2" /> Add Manual Debt
          </Button>
        )}
      </div>
    </div>
  );
}
