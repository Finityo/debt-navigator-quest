import { useState, useMemo } from 'react';
import { useDebtStore } from '@/store/useDebtStore';
import { PageHeader } from '@/components/PageHeader';
import { ComputeBanner } from '@/components/ComputeBanner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { computeDebtPlan } from '@/lib/computeDebtPlan';
import { formatCurrency } from '@/utils/format';
import { BarChart3, Play } from 'lucide-react';
import type { PlanResult } from '@/types/debt';

export default function SensitivityPage() {
  const { debts, settings, extraPayments, planResult } = useDebtStore();

  // Sensitivity: test a range of flat monthly extra payments
  const [extraAmounts, setExtraAmounts] = useState('0,100,200,300,500');
  const [results, setResults] = useState<{ extra: number; result: PlanResult }[]>([]);

  const runSensitivity = () => {
    if (debts.length === 0) return;
    const amounts = extraAmounts
      .split(',')
      .map((s) => parseFloat(s.trim()))
      .filter((n) => !isNaN(n) && n >= 0);

    const newResults = amounts.map((extra) => {
      const augmented = [...extraPayments];
      if (extra > 0) {
        for (let m = 1; m <= settings.monthsHorizon; m++) {
          const existing = augmented.find((e) => e.monthNumber === m);
          if (existing) {
            // Clone to avoid mutation
            augmented[augmented.indexOf(existing)] = {
              ...existing,
              extraAmount: existing.extraAmount + extra,
            };
          } else {
            augmented.push({ monthNumber: m, date: '', extraAmount: extra });
          }
        }
      }
      return {
        extra,
        result: computeDebtPlan(debts, settings, extra > 0 ? augmented : extraPayments),
      };
    });

    setResults(newResults);
  };

  return (
    <div>
      <PageHeader title="Sensitivity" description="How extra payments affect your payoff timeline" />

      <ComputeBanner />

      {debts.length > 0 && (
        <div className="space-y-6 mt-4">
          {/* Input */}
          <Card className="border bg-card">
            <CardContent className="p-5">
              <h3 className="font-heading font-semibold mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Extra Payment Sensitivity
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Monthly Extra Amounts (comma-separated)</Label>
                  <Input
                    value={extraAmounts}
                    onChange={(e) => setExtraAmounts(e.target.value)}
                    className="mt-1"
                    placeholder="0,100,200,300,500"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    These amounts are added on top of your existing extra payment schedule.
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

          {/* Results table */}
          {results.length > 0 && (
            <Card className="border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-medium text-muted-foreground">Extra/mo</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Total Interest</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Total Paid</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Payoff Month</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Interest Saved</th>
                      <th className="text-center p-3 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((row, i) => {
                      const baseline = results[0]?.result;
                      const saved = baseline
                        ? baseline.totalInterestPaid - row.result.totalInterestPaid
                        : 0;
                      return (
                        <tr key={row.extra} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="p-3 font-medium">{formatCurrency(row.extra)}</td>
                          <td className="p-3 text-right">{formatCurrency(row.result.totalInterestPaid)}</td>
                          <td className="p-3 text-right">{formatCurrency(row.result.totalPaid)}</td>
                          <td className="p-3 text-right font-medium">
                            {row.result.payoffMonth ?? `>${settings.monthsHorizon}`}
                          </td>
                          <td className={`p-3 text-right ${saved > 0 ? 'text-primary font-medium' : ''}`}>
                            {i === 0 ? '—' : saved > 0 ? formatCurrency(saved) : '—'}
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                row.result.completionStatus === 'complete'
                                  ? 'bg-primary/10 text-primary'
                                  : 'bg-destructive/10 text-destructive'
                              }`}
                            >
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
