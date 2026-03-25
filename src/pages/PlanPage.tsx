import { useEffect, useState } from 'react';
import { useDebtStore } from '@/store/useDebtStore';
import { PageHeader } from '@/components/PageHeader';
import { ComputeBanner } from '@/components/ComputeBanner';
import { MethodComparison } from '@/components/plan/MethodComparison';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatCurrencyCents, formatDate } from '@/utils/format';
import { ChevronDown, ChevronRight } from 'lucide-react';

export default function PlanPage() {
  const { planResult, debts, settings, computePlan, _hasHydrated } = useDebtStore();
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);
  const methodLabel = settings.method === 'avalanche' ? 'Avalanche' : 'Snowball';

  useEffect(() => {
    if (_hasHydrated) computePlan();
  }, [_hasHydrated, computePlan]);

  return (
    <div className="space-y-8">
      <PageHeader title={`Plan — ${methodLabel}`} description={`Monthly payoff breakdown using ${methodLabel} method`} />

      <ComputeBanner />

      {planResult && (
        <div className="space-y-8">
          {/* Top summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <SummaryCard label="Total Paid" value={formatCurrency(planResult.totalPaid)} />
            <SummaryCard label="Interest Paid" value={formatCurrency(planResult.totalInterestPaid)} accent="destructive" />
            <div id="payoff-date">
            <SummaryCard
              label="Payoff"
              value={
                planResult.payoffMonth
                  ? formatDate(planResult.monthlySummaries[planResult.payoffMonth - 1]?.date ?? '')
                  : 'Incomplete'
              }
            />
            </div>
            <SummaryCard
              label="Status"
              value={planResult.completionStatus === 'complete' ? 'Complete ✓' : `${formatCurrency(planResult.remainingBalance)} left`}
              accent={planResult.completionStatus === 'complete' ? 'primary' : 'destructive'}
            />
          </div>

          {/* Snowball vs Avalanche Comparison */}
          <MethodComparison />

          {/* Payoff Order */}
          <Card>
            <CardContent className="p-6">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-4">Payoff Order</p>
              <div className="flex flex-wrap gap-2.5">
                {planResult.payoffOrder.map((po, i) => {
                  const summary = planResult.monthlySummaries.find(
                    (s) => s.monthNumber === po.monthNumber
                  );
                  return (
                    <div
                      key={po.debtId}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-muted text-sm"
                    >
                      <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">
                        {i + 1}
                      </span>
                      <span className="font-medium">{po.creditorName}</span>
                      <span className="text-muted-foreground text-xs font-tabular">
                        {summary ? formatDate(summary.date) : `Mo. ${po.monthNumber}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Summaries Table */}
          <Card className="overflow-hidden" id="monthly-table">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3.5 font-semibold text-muted-foreground w-8"></th>
                    <th className="text-left px-4 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-widest">Month</th>
                    <th className="text-right px-4 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-widest">Starting</th>
                    <th className="text-right px-4 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-widest">Interest</th>
                    <th className="text-right px-4 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-widest">Principal</th>
                    <th className="text-right px-4 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-widest">Min Paid</th>
                    <th className="text-right px-4 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-widest">Extra</th>
                    <th className="text-right px-4 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-widest">Ending</th>
                    <th className="text-left px-4 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-widest">Events</th>
                  </tr>
                </thead>
                <tbody>
                  {planResult.monthlySummaries.map((ms) => {
                    const isExpanded = expandedMonth === ms.monthNumber;
                    const snapshots = isExpanded
                      ? planResult.debtSnapshots.filter((s) => s.monthNumber === ms.monthNumber)
                      : [];

                    return (
                      <MonthRow
                        key={ms.monthNumber}
                        ms={ms}
                        isExpanded={isExpanded}
                        snapshots={snapshots}
                        method={settings.method}
                        debts={debts}
                        onToggle={() =>
                          setExpandedMonth(isExpanded ? null : ms.monthNumber)
                        }
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: 'primary' | 'destructive';
}) {
  const valueColor = accent === 'primary' ? 'text-primary' : accent === 'destructive' ? 'text-destructive' : 'text-foreground';
  return (
    <Card>
      <CardContent className="p-5 text-center">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">{label}</p>
        <p className={`text-2xl font-bold font-heading font-tabular mt-2 ${valueColor}`}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function MonthRow({
  ms,
  isExpanded,
  snapshots,
  method,
  debts,
  onToggle,
}: {
  ms: import('@/types/debt').MonthlyPlanSummary;
  isExpanded: boolean;
  snapshots: import('@/types/debt').MonthlyDebtSnapshot[];
  method: import('@/types/debt').PayoffMethod;
  debts: import('@/types/debt').Debt[];
  onToggle: () => void;
}) {
  const hasMilestone = ms.debtsPaidOffThisMonth.length > 0;

  return (
    <>
      <tr
        className={`border-b border-border/50 transition-colors cursor-pointer ${
          hasMilestone ? 'bg-primary/[0.04]' : 'hover:bg-muted/40'
        }`}
        onClick={onToggle}
      >
        <td className="px-4 py-3.5">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </td>
        <td className="px-4 py-3.5 font-medium whitespace-nowrap font-tabular">{formatDate(ms.date)}</td>
        <td className="px-4 py-3.5 text-right font-tabular">{formatCurrency(ms.totalStartingDebt)}</td>
        <td className="px-4 py-3.5 text-right font-tabular text-destructive/70">{formatCurrencyCents(ms.totalInterest)}</td>
        <td className="px-4 py-3.5 text-right font-tabular text-primary/80">{formatCurrencyCents(ms.totalPrincipal)}</td>
        <td className="px-4 py-3.5 text-right font-tabular">{formatCurrency(ms.totalMinimumPayments)}</td>
        <td className="px-4 py-3.5 text-right font-tabular text-primary font-semibold">
          {ms.totalExtraPayments > 0 ? formatCurrency(ms.totalExtraPayments) : '—'}
        </td>
        <td className="px-4 py-3.5 text-right font-tabular font-semibold">{formatCurrency(ms.totalEndingDebt)}</td>
        <td className="px-4 py-3.5">
          {hasMilestone && (
            <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full whitespace-nowrap font-semibold">
              🎉 {ms.debtsPaidOffThisMonth.length} paid off
            </span>
          )}
        </td>
      </tr>
      {isExpanded && snapshots.length > 0 && (
        <tr>
          <td colSpan={9} className="p-0">
            <div className="bg-muted/25 px-5 sm:px-7 py-5 border-b animate-expand">
              <p className="text-xs font-semibold text-muted-foreground mb-3.5 uppercase tracking-widest">
                Debt-by-debt breakdown — {formatDate(ms.date)}
              </p>
              <div className="grid gap-2.5">
                {snapshots
                  .filter((s) => s.startingBalance > 0 || s.paymentApplied > 0)
                  .map((s) => (
                    <div
                      key={s.debtId}
                      className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs rounded-lg px-4 py-3 ${
                        s.isPaidOff ? 'bg-primary/8 border border-primary/15' : 'bg-card border border-border/40'
                      }`}
                    >
                      <span className="font-semibold min-w-[110px]">{s.creditorName}</span>
                      <span className="text-muted-foreground font-tabular">
                        Start: {formatCurrencyCents(s.startingBalance)}
                      </span>
                      <span className="text-destructive/70 font-tabular">
                        +{formatCurrencyCents(s.interestAccrued)} int
                      </span>
                      <span className="text-primary/80 font-tabular">
                        −{formatCurrencyCents(s.principalPaid)} principal
                      </span>
                      <span className="text-muted-foreground font-tabular">
                        Min: {formatCurrencyCents(s.minPaid)}
                      </span>
                      <span className="text-primary font-tabular">
                        Extra: {formatCurrencyCents(s.extraApplied)}
                      </span>
                      <span className="font-tabular font-semibold">
                        End: {formatCurrencyCents(s.endingBalance)}
                      </span>
                      {s.isPaidOff && (
                        <span className="text-primary font-bold">✓ Paid Off</span>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
