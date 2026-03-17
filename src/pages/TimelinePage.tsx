import { useDebtStore } from '@/store/useDebtStore';
import { PageHeader } from '@/components/PageHeader';
import { ComputeBanner } from '@/components/ComputeBanner';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatDate, formatDateFull } from '@/utils/format';
import { CheckCircle2, Clock, Trophy } from 'lucide-react';

export default function TimelinePage() {
  const { planResult, debts } = useDebtStore();

  return (
    <div>
      <PageHeader title="Timeline" description="Payoff milestones and debt elimination sequence" />

      <ComputeBanner />

      {planResult && planResult.payoffOrder.length > 0 && (
        <div className="mt-4">
          {/* Summary bar */}
          <Card className="border bg-card mb-6">
            <CardContent className="p-4 flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {planResult.completionStatus === 'complete'
                    ? `All debts eliminated in ${planResult.payoffMonth} months`
                    : `${planResult.payoffOrder.length} of ${debts.length} debts paid off within horizon`}
                </span>
              </div>
              {planResult.payoffMonth && (
                <span className="text-sm font-medium text-primary ml-auto">
                  Debt-free by{' '}
                  {formatDateFull(
                    planResult.monthlySummaries[planResult.payoffMonth - 1]?.date ?? ''
                  )}
                </span>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <div className="relative ml-4">
            {/* Vertical line */}
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />

            <div className="space-y-0">
              {planResult.payoffOrder.map((milestone, i) => {
                const summary = planResult.monthlySummaries.find(
                  (s) => s.monthNumber === milestone.monthNumber
                );
                const debt = debts.find((d) => d.id === milestone.debtId);
                const prevMonth =
                  i > 0 ? planResult.payoffOrder[i - 1].monthNumber : 0;
                const gapMonths = milestone.monthNumber - prevMonth;

                return (
                  <div key={milestone.debtId} className="relative pl-10 pb-6">
                    {/* Dot */}
                    <div className="absolute left-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold border-2 border-background">
                      {i + 1}
                    </div>

                    <Card className="border bg-card">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                            <h3 className="font-heading font-semibold">
                              {milestone.creditorName}
                            </h3>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {summary ? formatDate(summary.date) : `Month ${milestone.monthNumber}`}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                          <span>Month {milestone.monthNumber}</span>
                          {gapMonths > 0 && i > 0 && (
                            <span>{gapMonths} months after previous payoff</span>
                          )}
                          {debt && (
                            <span>
                              Original balance: {formatCurrency(debt.balance)}
                            </span>
                          )}
                        </div>
                        {/* Remaining debt at this point */}
                        {summary && (
                          <div className="mt-2 text-xs">
                            <span className="text-muted-foreground">
                              Remaining total debt:{' '}
                            </span>
                            <span className="font-medium">
                              {formatCurrency(summary.totalEndingDebt)}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                );
              })}

              {/* Completion marker */}
              {planResult.completionStatus === 'complete' && (
                <div className="relative pl-10 pb-2">
                  <div className="absolute left-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-background">
                    <Trophy className="w-3.5 h-3.5" />
                  </div>
                  <Card className="border-2 border-primary bg-accent">
                    <CardContent className="p-4">
                      <h3 className="font-heading font-semibold text-primary">
                        Debt Free! 🎉
                      </h3>
                      <p className="text-sm text-accent-foreground mt-1">
                        All {debts.length} debts eliminated by month{' '}
                        {planResult.payoffMonth}.{' '}
                        Total interest paid:{' '}
                        {formatCurrency(planResult.totalInterestPaid)}.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {planResult.completionStatus === 'incomplete' && (
                <div className="relative pl-10 pb-2">
                  <div className="absolute left-0 w-7 h-7 rounded-full bg-muted text-muted-foreground flex items-center justify-center border-2 border-background">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <Card className="border border-dashed bg-card">
                    <CardContent className="p-4">
                      <h3 className="font-heading font-semibold text-muted-foreground">
                        Beyond Horizon
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatCurrency(planResult.remainingBalance)} remaining after{' '}
                        {planResult.monthlySummaries.length} months. Increase your horizon
                        or add extra payments.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
