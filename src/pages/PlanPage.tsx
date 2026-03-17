import { useState } from 'react';
import { useDebtStore } from '@/store/useDebtStore';
import { PageHeader } from '@/components/PageHeader';
import { ComputeBanner } from '@/components/ComputeBanner';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatCurrencyCents, formatDate } from '@/utils/format';
import { ChevronDown, ChevronRight } from 'lucide-react';

export default function PlanPage() {
  const { planResult, debts } = useDebtStore();
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader title="Plan" description="Monthly payoff breakdown and debt elimination order" />

      <ComputeBanner />

      {planResult && (
        <div className="space-y-6">
          {/* Top summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard label="Total Paid" value={formatCurrency(planResult.totalPaid)} />
            <SummaryCard label="Interest Paid" value={formatCurrency(planResult.totalInterestPaid)} accent="destructive" />
            <SummaryCard
              label="Payoff"
              value={
                planResult.payoffMonth
                  ? formatDate(planResult.monthlySummaries[planResult.payoffMonth - 1]?.date ?? '')
                  : 'Incomplete'
              }
            />
            <SummaryCard
              label="Status"
              value={planResult.completionStatus === 'complete' ? 'Complete ✓' : `${formatCurrency(planResult.remainingBalance)} left`}
              accent={planResult.completionStatus === 'complete' ? 'primary' : 'destructive'}
            />
          </div>

          {/* Payoff Order */}
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Payoff Order</p>
              <div className="flex flex-wrap gap-2">
                {planResult.payoffOrder.map((po, i) => {
                  const summary = planResult.monthlySummaries.find(
                    (s) => s.monthNumber === po.monthNumber
                  );
                  return (
                    <div
                      key={po.debtId}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-sm"
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
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/60">
                    <th className="text-left p-3 font-medium text-muted-foreground w-8"></th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Month</th>
                    <th className="text-right p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Starting</th>
                    <th className="text-right p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Interest</th>
                    <th className="text-right p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Min Paid</th>
                    <th className="text-right p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Extra</th>
                    <th className="text-right p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Ending</th>
                    <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Events</th>
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
      <CardContent className="p-4 text-center">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className={`text-lg font-bold font-heading font-tabular mt-1.5 ${valueColor}`}>
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
  debts,
  onToggle,
}: {
  ms: import('@/types/debt').MonthlyPlanSummary;
  isExpanded: boolean;
  snapshots: import('@/types/debt').MonthlyDebtSnapshot[];
  debts: import('@/types/debt').Debt[];
  onToggle: () => void;
}) {
  const hasMilestone = ms.debtsPaidOffThisMonth.length > 0;

  return (
    <>
      <tr
        className={`border-b transition-colors cursor-pointer table-row-stripe ${
          hasMilestone ? 'bg-primary/[0.03]' : 'hover:bg-muted/40'
        }`}
        onClick={onToggle}
      >
        <td className="p-3">
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </td>
        <td className="p-3 font-medium whitespace-nowrap font-tabular">{formatDate(ms.date)}</td>
        <td className="p-3 text-right font-tabular">{formatCurrency(ms.totalStartingDebt)}</td>
        <td className="p-3 text-right font-tabular text-destructive/80">{formatCurrencyCents(ms.totalInterest)}</td>
        <td className="p-3 text-right font-tabular">{formatCurrency(ms.totalMinimumPayments)}</td>
        <td className="p-3 text-right font-tabular text-primary font-medium">
          {ms.totalExtraPayments > 0 ? formatCurrency(ms.totalExtraPayments) : '—'}
        </td>
        <td className="p-3 text-right font-tabular font-medium">{formatCurrency(ms.totalEndingDebt)}</td>
        <td className="p-3">
          {hasMilestone && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full whitespace-nowrap font-medium">
              🎉 {ms.debtsPaidOffThisMonth.length} paid off
            </span>
          )}
        </td>
      </tr>
      {isExpanded && snapshots.length > 0 && (
        <tr>
          <td colSpan={8} className="p-0">
            <div className="bg-muted/30 px-4 sm:px-6 py-4 border-b animate-expand">
              <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                Debt-by-debt breakdown — {formatDate(ms.date)}
              </p>
              <div className="grid gap-2">
                {snapshots
                  .filter((s) => s.startingBalance > 0 || s.paymentApplied > 0)
                  .map((s) => (
                    <div
                      key={s.debtId}
                      className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs rounded-lg px-3 py-2.5 ${
                        s.isPaidOff ? 'bg-primary/8 border border-primary/15' : 'bg-card border border-border/50'
                      }`}
                    >
                      <span className="font-medium min-w-[110px]">{s.creditorName}</span>
                      <span className="text-muted-foreground font-tabular">
                        Start: {formatCurrencyCents(s.startingBalance)}
                      </span>
                      <span className="text-destructive/70 font-tabular">
                        +{formatCurrencyCents(s.interestAccrued)} int
                      </span>
                      <span className="text-primary font-tabular">
                        −{formatCurrencyCents(s.paymentApplied)} paid
                      </span>
                      <span className="font-tabular font-medium">
                        End: {formatCurrencyCents(s.endingBalance)}
                      </span>
                      {s.isPaidOff && (
                        <span className="text-primary font-semibold">✓ Paid Off</span>
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
