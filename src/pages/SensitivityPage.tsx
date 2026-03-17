import { useState } from 'react';
import { useDebtStore } from '@/store/useDebtStore';
import { PageHeader } from '@/components/PageHeader';
import { ComputeBanner } from '@/components/ComputeBanner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { computeDebtPlan } from '@/lib/computeDebtPlan';
import { formatCurrency } from '@/utils/format';
import { BarChart3, Play, TrendingDown } from 'lucide-react';
import type { PlanResult } from '@/types/debt';

export default function SensitivityPage() {
  const { debts, settings, extraPayments } = useDebtStore();
  const [extraAmounts, setExtraAmounts] = useState('0,100,200,300,500');
  const [results, setResults] = useState<{ extra: number; result: PlanResult }[]>([]);

  const runSensitivity = () => {
    if (debts.length === 0) return;
    const amounts = extraAmounts
      .split(',')
      .map((s) => parseFloat(s.trim()))
      .filter((n) => !isNaN(n) && n >= 0);

    const newResults = amounts.map((extra) => {
      const augmented = extraPayments.map((e) => ({ ...e }));
      if (extra > 0) {
        for (let m = 1; m <= settings.monthsHorizon; m++) {
          const idx = augmented.findIndex((e) => e.monthNumber === m);
          if (idx >= 0) {
            augmented[idx] = { ...augmented[idx], extraAmount: augmented[idx].extraAmount + extra };
          } else {
            augmented.push({ monthNumber: m, date: '', extraAmount: extra });
          }
        }
      }
      return { extra, result: computeDebtPlan(debts, settings, extra > 0 ? augmented : extraPayments) };
    });

    setResults(newResults);
  };

  return (
    <div className="space-y-8">
      <PageHeader title="Sensitivity" description="How extra payments affect your payoff timeline" />

      <ComputeBanner />

      {debts.length > 0 && (
        <div className="space-y-8">
          <Card>
            <CardContent className="p-6">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-5 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Extra Payment Sensitivity
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Monthly Extra Amounts (comma-separated)</Label>
                  <Input
                    value={extraAmounts}
                    onChange={(e) => setExtraAmounts(e.target.value)}
                    placeholder="0,100,200,300,500"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Added on top of your existing extra payment schedule.
                  </p>
                </div>
                <div className="flex items-end">
                  <Button onClick={runSensitivity} className="w-full">
                    <Play className="w-4 h-4 mr-2" /> Run Analysis
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {results.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-12 px-6 text-center">
                <div className="w-12 h-12 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
                  <TrendingDown className="w-5 h-5 text-muted-foreground" />
                </div>
                <h3 className="font-heading font-bold mb-2">No analysis run yet</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                  Enter extra payment amounts and run analysis to see the impact on your payoff.
                </p>
              </CardContent>
            </Card>
          )}

          {results.length > 0 && (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-widest">Extra/mo</th>
                      <th className="text-right px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-widest">Total Interest</th>
                      <th className="text-right px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-widest">Total Paid</th>
                      <th className="text-right px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-widest">Payoff Mo</th>
                      <th className="text-right px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-widest">Interest Saved</th>
                      <th className="text-center px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((row, i) => {
                      const baseline = results[0]?.result;
                      const saved = baseline ? baseline.totalInterestPaid - row.result.totalInterestPaid : 0;
                      return (
                        <tr key={row.extra} className="border-b border-border/50 last:border-0">
                          <td className="px-4 py-3.5 font-semibold font-tabular">{formatCurrency(row.extra)}</td>
                          <td className="px-4 py-3.5 text-right font-tabular">{formatCurrency(row.result.totalInterestPaid)}</td>
                          <td className="px-4 py-3.5 text-right font-tabular">{formatCurrency(row.result.totalPaid)}</td>
                          <td className="px-4 py-3.5 text-right font-semibold font-tabular">
                            {row.result.payoffMonth ?? `>${settings.monthsHorizon}`}
                          </td>
                          <td className={`px-4 py-3.5 text-right font-tabular ${saved > 0 ? 'text-primary font-semibold' : ''}`}>
                            {i === 0 ? '—' : saved > 0 ? formatCurrency(saved) : '—'}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                              row.result.completionStatus === 'complete'
                                ? 'bg-primary/10 text-primary'
                                : 'bg-destructive/10 text-destructive'
                            }`}>
                              {row.result.completionStatus === 'complete' ? 'Complete' : 'Incomplete'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
