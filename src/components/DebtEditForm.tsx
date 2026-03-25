import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Check } from 'lucide-react';
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
  return (
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
}
