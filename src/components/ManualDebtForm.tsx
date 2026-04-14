import { useState } from 'react';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Plus, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { StableNumberInput } from '@/components/ui/stable-number-input';
import { useDebtStore } from '@/store/useDebtStore';
import type { DebtType } from '@/types/debt';
import { toast } from 'sonner';

const debtTypes: { value: DebtType; label: string }[] = [
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'student_loan', label: 'Student Loan' },
  { value: 'auto_loan', label: 'Auto Loan' },
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'personal_loan', label: 'Personal Loan' },
  { value: 'medical', label: 'Medical' },
  { value: 'other', label: 'Other' },
];

const debtFormSchema = z.object({
  creditorName: z.string().trim().min(1, 'Creditor name is required').max(100, 'Name must be under 100 characters'),
  balance: z.number({ invalid_type_error: 'Balance is required' }).positive('Balance must be positive'),
  apr: z.number().min(0, 'APR must be positive').max(100, 'APR cannot exceed 100%').optional().default(0),
  minPayment: z.number().min(0, 'Min payment cannot be negative').optional().default(0),
  type: z.enum(['credit_card', 'student_loan', 'auto_loan', 'mortgage', 'personal_loan', 'medical', 'other']),
  dueDate: z.date().optional(),
  notes: z.string().max(500, 'Notes must be under 500 characters').optional().default(''),
});

type DebtFormData = z.infer<typeof debtFormSchema>;

interface ManualDebtFormProps {
  onClose: () => void;
}

export default function ManualDebtForm({ onClose }: ManualDebtFormProps) {
  const addDebt = useDebtStore((s) => s.addDebt);
  const computePlan = useDebtStore((s) => s.computePlan);

  const [creditorName, setCreditorName] = useState('');
  const [balance, setBalance] = useState('');
  const [apr, setApr] = useState('');
  const [minPayment, setMinPayment] = useState('');
  const [type, setType] = useState<DebtType>('credit_card');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const raw = {
      creditorName,
      balance: balance ? parseFloat(balance) : undefined,
      apr: apr ? parseFloat(apr) : 0,
      minPayment: minPayment ? parseFloat(minPayment) : 0,
      type,
      dueDate,
      notes,
    };

    const result = debtFormSchema.safeParse(raw);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((e) => {
        const field = e.path[0] as string;
        if (!fieldErrors[field]) fieldErrors[field] = e.message;
      });
      // Prompt APR if credit card and not provided
      if (type === 'credit_card' && !apr) {
        fieldErrors.apr = 'APR recommended for credit cards';
      }
      setErrors(fieldErrors);
      return;
    }

    const data = result.data;
    const dueDateNote = data.dueDate ? ` • Due: ${format(data.dueDate, 'yyyy-MM-dd')}` : '';

    addDebt({
      id: `manual-${Date.now()}`,
      creditorName: data.creditorName,
      balance: data.balance,
      apr: data.apr / 100,
      minPayment: data.minPayment,
      type: data.type,
      startDate: new Date().toISOString().slice(0, 10),
      notes: `${data.notes || ''}${dueDateNote}`.trim(),
    });

    computePlan();
    toast.success('Manual debt added – plan updated');
    onClose();
  };

  return (
    <Card className="glass-card border border-primary/15 shadow-xl">
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-base">Add Manual Debt</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
          {/* Creditor Name */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Creditor Name *</Label>
            <Input
              value={creditorName}
              onChange={(e) => { setCreditorName(e.target.value); setErrors((p) => ({ ...p, creditorName: '' })); }}
              placeholder="e.g. Chase Visa"
              className={cn(errors.creditorName && 'border-destructive')}
            />
            {errors.creditorName && <p className="text-[11px] text-destructive">{errors.creditorName}</p>}
          </div>

          {/* Debt Type */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Debt Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as DebtType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {debtTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Balance */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Balance ($) *</Label>
            <StableNumberInput
              value={balance}
              onCommit={(v) => { setBalance(String(v)); setErrors((p) => ({ ...p, balance: '' })); }}
              placeholder="4,200"
              max={10_000_000}
              className={cn(errors.balance && 'border-destructive')}
            />
            {errors.balance && <p className="text-[11px] text-destructive">{errors.balance}</p>}
          </div>

          {/* APR */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              APR (%) {type === 'credit_card' && <span className="text-primary">• recommended</span>}
            </Label>
            <StableNumberInput
              value={apr}
              onCommit={(v) => { setApr(String(v)); setErrors((p) => ({ ...p, apr: '' })); }}
              placeholder="21.9"
              max={100}
              className={cn(errors.apr && 'border-destructive')}
            />
            {errors.apr && <p className="text-[11px] text-destructive">{errors.apr}</p>}
          </div>

          {/* Min Payment */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Min Payment ($/mo)</Label>
            <StableNumberInput
              value={minPayment}
              onCommit={(v) => { setMinPayment(String(v)); setErrors((p) => ({ ...p, minPayment: '' })); }}
              placeholder="95"
              className={cn(errors.minPayment && 'border-destructive')}
            />
            {errors.minPayment && <p className="text-[11px] text-destructive">{errors.minPayment}</p>}
          </div>

          {/* Due Date */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !dueDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                  className={cn('p-3 pointer-events-auto')}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Notes */}
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs font-medium text-muted-foreground">Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional details..."
              rows={2}
              className="resize-none"
            />
            {errors.notes && <p className="text-[11px] text-destructive">{errors.notes}</p>}
          </div>
        </div>

        <div className="flex gap-2.5 justify-end pt-1">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} className="glass-strong glow bg-primary/90 hover:bg-primary text-primary-foreground font-semibold hover:scale-[1.03] active:scale-[0.98] transition-all duration-200">
            <Plus className="w-4 h-4 mr-1" /> Add Debt
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
