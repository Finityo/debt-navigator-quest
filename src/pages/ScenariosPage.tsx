import { useState } from 'react';
import { useDebtStore } from '@/store/useDebtStore';
import { PageHeader } from '@/components/PageHeader';
import { ComputeBanner } from '@/components/ComputeBanner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { computeDebtPlan } from '@/lib/computeDebtPlan';
import { formatCurrency, formatDate } from '@/utils/format';
import type { PayoffMethod, PlanResult } from '@/types/debt';
import { GitCompare, Play } from 'lucide-react';

export default function ScenariosPage() {
  const { debts, settings, extraPayments, planResult } = useDebtStore();
  const [altMethod, setAltMethod] = useState<PayoffMethod>(
    settings.method === 'avalanche' ? 'snowball' : 'avalanche'
  );
  const [altExtraMonthly, setAltExtraMonthly] = useState<number>(0);
  const [altResult, setAltResult] = useState<PlanResult | null>(null);

  const runAltScenario = () => {
    if (debts.length === 0) return;
    const altExtras = extraPayments.map((e) => ({ ...e }));
    if (altExtraMonthly > 0) {
      for (let m = 1; m <= settings.monthsHorizon; m++) {
        const idx = altExtras.findIndex((e) => e.monthNumber === m);
        if (idx >= 0) {
          altExtras[idx] = { ...altExtras[idx], extraAmount: altExtras[idx].extraAmount + altExtraMonthly };
        } else {
          altExtras.push({ monthNumber: m, date: '', extraAmount: altExtraMonthly });
        }
      }
    }
    setAltResult(computeDebtPlan(debts, { ...settings, method: altMethod }, altExtras));
  };

  return (
    <div className="space-y-8">
      <PageHeader title="Scenarios" description="Compare different payoff strategies side by side" />

      <ComputeBanner />

      {debts.length > 0 && (
        <div className="space-y-8">
          <Card>
            <CardContent className="p-6">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-5 flex items-center gap-2">
                <GitCompare className="w-4 h-4" /> Alternate Scenario
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-5 gap-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Method</Label>
                  <Select value={altMethod} onValueChange={(v) => setAltMethod(v as PayoffMethod)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="avalanche">Avalanche</SelectItem>
                      <SelectItem value="snowball">Snowball</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Additional Monthly Extra ($)</Label>
                  <StableNumberInput
                    value={altExtraMonthly || ''}
                    onCommit={(v) => setAltExtraMonthly(v)}
                    placeholder="0"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={runAltScenario} className="w-full">
                    <Play className="w-4 h-4 mr-2" /> Run Scenario
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {planResult && altResult && (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-widest">Metric</th>
                      <th className="text-right px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-widest">Baseline</th>
                      <th className="text-right px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-widest">Alternate</th>
                      <th className="text-right px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-widest">Δ</th>
                    </tr>
                  </thead>
                  <tbody>
                    <CompareRow label="Total Interest" baseline={planResult.totalInterestPaid} alt={altResult.totalInterestPaid} lowerIsBetter />
                    <CompareRow label="Total Paid" baseline={planResult.totalPaid} alt={altResult.totalPaid} lowerIsBetter />
                    <CompareRow label="Payoff Month" baseline={planResult.payoffMonth ?? settings.monthsHorizon} alt={altResult.payoffMonth ?? settings.monthsHorizon} lowerIsBetter isMonth />
                    <CompareRow label="Remaining" baseline={planResult.remainingBalance} alt={altResult.remainingBalance} lowerIsBetter />
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {planResult && altResult && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <ScenarioSummary title="Baseline" result={planResult} method={settings.method} />
              <ScenarioSummary title="Alternate" result={altResult} method={altMethod} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CompareRow({
  label,
  baseline,
  alt,
  lowerIsBetter,
  isMonth,
}: {
  label: string;
  baseline: number;
  alt: number;
  lowerIsBetter: boolean;
  isMonth?: boolean;
}) {
  const diff = alt - baseline;
  const better = lowerIsBetter ? diff < 0 : diff > 0;
  const fmt = isMonth ? (v: number) => `${v}` : formatCurrency;
  const fmtDiff = isMonth ? (v: number) => `${v > 0 ? '+' : ''}${v}` : (v: number) => `${v > 0 ? '+' : ''}${formatCurrency(v)}`;

  return (
    <tr className="border-b border-border/50 last:border-0">
      <td className="px-4 py-3.5 font-medium">{label}</td>
      <td className="px-4 py-3.5 text-right font-tabular">{fmt(baseline)}</td>
      <td className="px-4 py-3.5 text-right font-tabular">{fmt(alt)}</td>
      <td className={`px-4 py-3.5 text-right font-semibold font-tabular ${better ? 'text-primary' : diff === 0 ? 'text-muted-foreground' : 'text-destructive'}`}>
        {diff === 0 ? '—' : fmtDiff(diff)}
      </td>
    </tr>
  );
}

function ScenarioSummary({ title, result, method }: { title: string; result: PlanResult; method: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-4">{title}</p>
        <div className="space-y-2.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Method</span>
            <span className="capitalize font-semibold">{method}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className={`font-semibold capitalize ${result.completionStatus === 'complete' ? 'text-primary' : 'text-destructive'}`}>
              {result.completionStatus}
            </span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-muted-foreground shrink-0">Order</span>
            <span className="text-xs text-right ml-2">{result.payoffOrder.map((p) => p.creditorName).join(' → ')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
