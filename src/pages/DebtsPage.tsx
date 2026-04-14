import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebtStore } from '@/store/useDebtStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/utils/format';
import { Plus, CreditCard, Landmark, ArrowRight, Upload, TrendingDown, Calendar, DollarSign } from 'lucide-react';
import PlaidConnect from '@/components/PlaidConnect';
import ManualDebtForm from '@/components/ManualDebtForm';
import DebtCard from '@/components/DebtCard';
import CsvImportExport from '@/components/CsvImportExport';
import { DebtEditForm } from '@/components/DebtEditForm';
import type { Debt, DebtType } from '@/types/debt';

export default function DebtsPage() {
  const { debts, addDebt, updateDebt, removeDebt, planResult, settings, _hasHydrated } = useDebtStore();


  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Debt>>({});
  const [showImport, setShowImport] = useState(false);
  const navigate = useNavigate();

  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);

  const startEdit = (debt: Debt) => {
    setEditingId(debt.id);
    setEditForm({
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

    const balance = Number(editForm.balance);
    const apr = Number(editForm.apr);
    const minPayment = Number(editForm.minPayment);
    const name = (editForm.creditorName || '').trim();

    // Final guard — DebtEditForm validates inline, but double-check here
    if (!name || isNaN(balance) || balance <= 0 || isNaN(apr) || apr < 0 || isNaN(minPayment) || minPayment < 0) {
      toast.error('Please fix invalid fields before saving');
      return;
    }

    updateDebt(editingId, {
      creditorName: name,
      balance: Math.round(balance * 100) / 100,
      apr: Math.round(apr * 100) / 10000, // UI % → decimal, rounded
      minPayment: Math.round(minPayment * 100) / 100,
      type: editForm.type as DebtType,
      notes: editForm.notes,
    });
    setEditingId(null);
    setEditForm({});
    toast.success('Debt updated');
  };

  const payoffDate = planResult?.payoffMonth
    ? planResult.monthlySummaries[planResult.payoffMonth - 1]?.date
    : null;

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
            Step 1 of 2
          </span>
        </div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Add Your Debts</h1>
        <p className="text-sm text-muted-foreground">Enter your balances to build your payoff plan</p>
      </div>

      {/* EMPTY STATE */}
      {debts.length === 0 && !isAdding && (
        <Card className="glass-card border-dashed border-primary/20">
          <CardContent className="py-14 px-6 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
              <CreditCard className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-xl mb-2">Add your first debt</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Add your first debt to see your payoff date instantly.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => setIsAdding(true)}
                className="glass-strong glow bg-primary/90 hover:bg-primary text-primary-foreground font-semibold hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
                data-tour="manual-add-debt" id="add-debt-btn"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Debt
              </Button>
              <Button variant="outline" onClick={() => setShowImport(!showImport)} id="connect-accounts-btn">
                <Landmark className="w-4 h-4 mr-2" /> Import from Bank
              </Button>
              <Button variant="outline" onClick={() => setShowImport(!showImport)} id="import-btn">
                <Upload className="w-4 h-4 mr-2" /> Upload CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bank Import (toggleable) */}
      {showImport && (
        <div className="space-y-4">
          <Card className="border border-primary/20 bg-accent/30">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Landmark className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-sm">Connect Bank</h2>
                  <p className="text-xs text-muted-foreground">Auto-import debts securely</p>
                </div>
              </div>
              <PlaidConnect />
            </CardContent>
          </Card>
          <CsvImportExport />
        </div>
      )}

      {/* Manual Add Form */}
      {isAdding && (
        <ManualDebtForm onClose={() => setIsAdding(false)} />
      )}

      {/* Debt Cards */}
      {debts.length > 0 && (
        <div className="space-y-3">
          {debts.map((debt) =>
            editingId === debt.id ? (
              <DebtEditForm
                key={debt.id}
                form={editForm}
                setForm={setEditForm}
                onSave={handleSaveEdit}
                onCancel={() => { setEditingId(null); setEditForm({}); }}
              />
            ) : (
              <DebtCard key={debt.id} debt={debt} onEdit={startEdit} onRemove={removeDebt} />
            )
          )}
        </div>
      )}

      {/* Add Another Button */}
      {debts.length > 0 && !isAdding && (
        <Button
          variant="outline"
          onClick={() => setIsAdding(true)}
          className="w-full border-dashed h-12"
          id="add-debt-btn"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Another Debt
        </Button>
      )}

      {/* Import tools (always accessible when debts exist) */}
      {debts.length > 0 && !showImport && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowImport(true)}
          className="text-xs text-muted-foreground"
          id="connect-accounts-btn"
        >
          <Landmark className="w-3.5 h-3.5 mr-1.5" /> Import from Bank or CSV
        </Button>
      )}

      {/* Live Plan Preview */}
      {debts.length > 0 && (
        <Card className="glass-card border-primary/20 bg-gradient-to-br from-primary/5 to-accent/10">
          <CardContent className="p-5 space-y-4">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
              Your Plan Preview
            </p>
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <div>
                <div className="flex items-center gap-1 sm:gap-1.5 mb-1">
                  <DollarSign className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Total Debt</span>
                </div>
                <p className="text-base sm:text-lg font-bold font-heading font-tabular text-foreground">{formatCurrency(totalDebt)}</p>
              </div>
              <div>
                <div className="flex items-center gap-1 sm:gap-1.5 mb-1">
                  <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Payoff</span>
                </div>
                <p className="text-base sm:text-lg font-bold font-heading font-tabular text-primary">
                  {payoffDate ? formatDate(payoffDate) : '—'}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-1 sm:gap-1.5 mb-1">
                  <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Interest</span>
                </div>
                <p className="text-base sm:text-lg font-bold font-heading font-tabular text-destructive">
                  {planResult ? formatCurrency(planResult.totalInterestPaid) : '—'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Continue CTA */}
      {debts.length > 0 && (
        <Button
          onClick={() => navigate('/plan')}
          className="w-full h-14 text-base font-bold glass-strong glow bg-primary/90 hover:bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          See Your Payoff Plan <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      )}
    </div>
  );
}
