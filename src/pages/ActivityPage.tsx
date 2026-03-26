import { useState } from 'react';
import { useDebtStore } from '@/store/useDebtStore';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { PaymentRecord } from '@/types/debt';
import { formatCurrency } from '@/utils/format';
import { Plus, ClipboardList, X, Check } from 'lucide-react';

export default function ActivityPage() {
  const { debts, paymentRecords, addPaymentRecord } = useDebtStore();
  const [isAdding, setIsAdding] = useState(false);
  const [formDebtId, setFormDebtId] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formAmount, setFormAmount] = useState<number>(0);
  const [formNote, setFormNote] = useState('');

  const handleAdd = () => {
    if (!formDebtId || formAmount <= 0) return;
    addPaymentRecord({
      id: `pay-${Date.now()}`,
      debtId: formDebtId,
      date: formDate,
      amount: formAmount,
      note: formNote,
    });
    resetForm();
  };

  const resetForm = () => {
    setIsAdding(false);
    setFormDebtId('');
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormAmount(0);
    setFormNote('');
  };

  const sorted = [...paymentRecords].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const totalLogged = paymentRecords.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-8">
      <PageHeader title="Activity" description="Track actual payments you've made" />

      {/* Total logged */}
      {paymentRecords.length > 0 && (
        <Card>
          <CardContent className="p-5 flex items-center gap-3.5">
            <div className="p-2.5 rounded-lg bg-primary/10">
              <ClipboardList className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Total Logged</p>
              <p className="text-2xl font-bold font-heading font-tabular mt-0.5">{formatCurrency(totalLogged)}</p>
            </div>
            <span className="ml-auto text-sm text-muted-foreground">
              {paymentRecords.length} payment{paymentRecords.length !== 1 ? 's' : ''}
            </span>
          </CardContent>
        </Card>
      )}

      {/* Add form */}
      {isAdding ? (
        <Card className="border-2 border-primary/15">
          <CardContent className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Debt</Label>
                <Select value={formDebtId} onValueChange={setFormDebtId}>
                  <SelectTrigger><SelectValue placeholder="Select debt" /></SelectTrigger>
                  <SelectContent>
                    {debts.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.creditorName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Date</Label>
                <Input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Amount ($)</Label>
                <StableNumberInput
                  value={formAmount || ''}
                  onCommit={(v) => setFormAmount(v)}
                  placeholder="100"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Note</Label>
                <Input
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder="Optional note"
                />
              </div>
            </div>
            <div className="flex gap-2.5 justify-end pt-1">
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="w-4 h-4 mr-1" /> Cancel
              </Button>
              <Button size="sm" onClick={handleAdd} disabled={!formDebtId || formAmount <= 0}>
                <Check className="w-4 h-4 mr-1" /> Log Payment
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" onClick={() => setIsAdding(true)} className="w-full border-dashed h-12">
          <Plus className="w-4 h-4 mr-2" /> Log Payment
        </Button>
      )}

      {/* Payment history */}
      {sorted.length === 0 && !isAdding ? (
        <Card className="border-dashed">
          <CardContent className="py-12 px-6 text-center">
            <div className="w-12 h-12 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
              <ClipboardList className="w-5 h-5 text-muted-foreground" />
            </div>
            <h3 className="font-heading font-bold mb-2">No payments logged yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
              Log actual payments as you make them to track your real progress against the plan.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sorted.map((record) => {
            const debt = debts.find((d) => d.id === record.debtId);
            return (
              <Card key={record.id} className="transition-card hover-lift">
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-[15px]">
                        {debt?.creditorName ?? 'Unknown'}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-tabular">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    {record.note && (
                      <p className="text-xs text-muted-foreground mt-1">{record.note}</p>
                    )}
                  </div>
                  <span className="text-xl font-bold font-heading font-tabular text-primary shrink-0">
                    {formatCurrency(record.amount)}
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
