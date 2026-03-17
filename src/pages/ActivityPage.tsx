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

  return (
    <div>
      <PageHeader title="Activity" description="Track actual payments you've made" />

      {/* Add form */}
      {isAdding ? (
        <Card className="border-2 border-primary/20 bg-card mb-4">
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Debt</Label>
                <Select value={formDebtId} onValueChange={setFormDebtId}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select debt" /></SelectTrigger>
                  <SelectContent>
                    {debts.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.creditorName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Date</Label>
                <Input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Amount ($)</Label>
                <Input
                  type="number"
                  min={0}
                  step={10}
                  value={formAmount || ''}
                  onChange={(e) => setFormAmount(parseFloat(e.target.value) || 0)}
                  className="mt-1"
                  placeholder="100"
                />
              </div>
              <div>
                <Label className="text-xs">Note</Label>
                <Input
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  className="mt-1"
                  placeholder="Optional note"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
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
        <Button variant="outline" onClick={() => setIsAdding(true)} className="w-full border-dashed mb-4">
          <Plus className="w-4 h-4 mr-2" /> Log Payment
        </Button>
      )}

      {/* Payment history */}
      {sorted.length === 0 ? (
        <Card className="border bg-card">
          <CardContent className="p-8 text-center">
            <ClipboardList className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-heading font-semibold mb-1">No payments logged</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Log actual payments as you make them to track your real progress against the plan.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {sorted.map((record) => {
            const debt = debts.find((d) => d.id === record.debtId);
            return (
              <Card key={record.id} className="border bg-card">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-semibold text-sm">
                        {debt?.creditorName ?? 'Unknown'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    {record.note && (
                      <p className="text-xs text-muted-foreground mt-0.5">{record.note}</p>
                    )}
                  </div>
                  <span className="text-lg font-bold font-heading text-primary shrink-0">
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
