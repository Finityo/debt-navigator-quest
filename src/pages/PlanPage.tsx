import { useState } from 'react';
import { useDebtStore } from '@/store/useDebtStore';
import { PageHeader } from '@/components/PageHeader';
import { ComputeBanner } from '@/components/ComputeBanner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatCurrencyCents, formatDate } from '@/utils/format';
import { ChevronDown, ChevronRight } from 'lucide-react';

export default function PlanPage() {
  const { planResult, debts } = useDebtStore();
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);

  return (
    <div>
      <PageHeader title="Plan" description="Monthly payoff breakdown and debt elimination order" />

      <ComputeBanner />

      {planResult && (
        <div className="space-y-6 mt-4">
          {/* Top summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard label="Total Paid" value={formatCurrency(planResult.totalPaid)} />
            <SummaryCard label="Interest Paid" value={formatCurrency(planResult.totalInterestPaid)} />
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
              highlight={planResult.completionStatus === 'complete'}
            />
          </div>

          {/* Payoff Order */}
          <Card className="border bg-card">
            <CardContent className="p-4">
              <h3 className="font-heading font-semibold text-sm mb-3">Payoff Order</h3>
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
                      <span className="text-muted-foreground text-xs">
                        {summary ? formatDate(summary.date) : `Mo. ${po.monthNumber}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Summaries Table */}
          <Card className="bg-card border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium text-muted-foreground w-8"></th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Month</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Starting</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Interest</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Min Paid</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Extra</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Ending</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Events</th>
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

// --- Sub-components ---

function SummaryCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <Card className="bg-card border">
      <CardContent className="p-4 text-center">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p
          className={`text-lg font-bold font-heading mt-1 ${
            highlight ? 'text-primary' : ''
          }`}
        >
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
        className={`border-b hover:bg-muted/30 transition-colors cursor-pointer ${
          hasMilestone ? 'bg-primary/5' : ''
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
        <td className="p-3 font-medium whitespace-nowrap">{formatDate(ms.date)}</td>
        <td className="p-3 text-right">{formatCurrency(ms.totalStartingDebt)}</td>
        <td className="p-3 text-right text-destructive">{formatCurrencyCents(ms.totalInterest)}</td>
        <td className="p-3 text-right">{formatCurrency(ms.totalMinimumPayments)}</td>
        <td className="p-3 text-right text-primary font-medium">
          {ms.totalExtraPayments > 0 ? formatCurrency(ms.totalExtraPayments) : '—'}
        </td>
        <td className="p-3 text-right">{formatCurrency(ms.totalEndingDebt)}</td>
        <td className="p-3">
          {hasMilestone && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full whitespace-nowrap">
              🎉 {ms.debtsPaidOffThisMonth.length} paid off
            </span>
          )}
        </td>
      </tr>
      {isExpanded && snapshots.length > 0 && (
        <tr>
          <td colSpan={8} className="p-0">
            <div className="bg-muted/20 px-6 py-3 border-b">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Debt-by-debt for {formatDate(ms.date)}
              </p>
              <div className="grid gap-2">
                {snapshots
                  .filter((s) => s.startingBalance > 0 || s.paymentApplied > 0)
                  .map((s) => (
                    <div
                      key={s.debtId}
                      className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs rounded-md px-3 py-2 ${
                        s.isPaidOff ? 'bg-primary/10' : 'bg-card'
                      }`}
                    >
                      <span className="font-medium min-w-[120px]">{s.creditorName}</span>
                      <span className="text-muted-foreground">
                        Start: {formatCurrencyCents(s.startingBalance)}
                      </span>
                      <span className="text-destructive">
                        +{formatCurrencyCents(s.interestAccrued)} int
                      </span>
                      <span className="text-primary">
                        −{formatCurrencyCents(s.paymentApplied)} paid
                      </span>
                      <span>
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
