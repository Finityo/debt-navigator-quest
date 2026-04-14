import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StableNumberInput } from '@/components/ui/stable-number-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Debt, DebtType } from '@/types/debt';

const debtTypes: { value: DebtType; label: string }[] = [
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'student_loan', label: 'Student Loan' },
  { value: 'auto_loan', label: 'Auto Loan' },
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'personal_loan', label: 'Personal Loan' },
  { value: 'medical', label: 'Medical' },
  { value: 'other', label: 'Other' },
];

interface DebtEditFormProps {
  form: Partial<Debt>;
  setForm: (form: Partial<Debt>) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function DebtEditForm({ form, setForm, onSave, onCancel }: DebtEditFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const fieldErrors: Record<string, string> = {};

    const name = (form.creditorName || '').trim();
    if (!name) fieldErrors.creditorName = 'Name is required';
    else if (name.length > 100) fieldErrors.creditorName = 'Name must be under 100 characters';

    const balance = Number(form.balance);
    if (isNaN(balance) || balance <= 0) fieldErrors.balance = 'Balance must be greater than 0';

    const apr = Number(form.apr);
    if (isNaN(apr) || apr < 0) fieldErrors.apr = 'APR cannot be negative';
    else if (apr > 100) fieldErrors.apr = 'APR cannot exceed 100%';

    const minPayment = Number(form.minPayment);
    if (isNaN(minPayment) || minPayment < 0) fieldErrors.minPayment = 'Min payment cannot be negative';

    setErrors(fieldErrors);
    return Object.keys(fieldErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave();
    }
  };

  return (
    <Card className="border-2 border-primary/15">
      <CardContent className="p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Creditor Name *</Label>
            <Input
              value={form.creditorName || ''}
              onChange={(e) => { setForm({ ...form, creditorName: e.target.value }); setErrors((p) => ({ ...p, creditorName: '' })); }}
              placeholder="e.g. Chase Visa"
              maxLength={100}
              className={cn(errors.creditorName && 'border-destructive')}
            />
            {errors.creditorName && <p className="text-[11px] text-destructive">{errors.creditorName}</p>}
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
            <Label className="text-xs font-medium text-muted-foreground">Balance ($) *</Label>
            <StableNumberInput
              value={form.balance ?? ''}
              onCommit={(v) => { setForm({ ...form, balance: v }); setErrors((p) => ({ ...p, balance: '' })); }}
              placeholder="4,200"
              max={10_000_000}
              className={cn(errors.balance && 'border-destructive')}
            />
            {errors.balance && <p className="text-[11px] text-destructive">{errors.balance}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">APR (%)</Label>
            <StableNumberInput
              value={form.apr ?? ''}
              onCommit={(v) => { setForm({ ...form, apr: v }); setErrors((p) => ({ ...p, apr: '' })); }}
              placeholder="21.9"
              max={100}
              className={cn(errors.apr && 'border-destructive')}
            />
            {errors.apr && <p className="text-[11px] text-destructive">{errors.apr}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Min Payment ($)</Label>
            <StableNumberInput
              value={form.minPayment ?? ''}
              onCommit={(v) => { setForm({ ...form, minPayment: v }); setErrors((p) => ({ ...p, minPayment: '' })); }}
              placeholder="95"
              max={1_000_000}
              className={cn(errors.minPayment && 'border-destructive')}
            />
            {errors.minPayment && <p className="text-[11px] text-destructive">{errors.minPayment}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Notes</Label>
            <Input
              value={form.notes || ''}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Optional"
              maxLength={500}
            />
          </div>
        </div>
        <div className="flex gap-2.5 justify-end pt-1">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4 mr-1" /> Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Check className="w-4 h-4 mr-1" /> Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
