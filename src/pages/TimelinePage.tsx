import { useDebtStore } from '@/store/useDebtStore';
import { PageHeader } from '@/components/PageHeader';
import { ComputeBanner } from '@/components/ComputeBanner';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatDate, formatDateFull } from '@/utils/format';
import { CheckCircle2, Clock, Trophy } from 'lucide-react';

export default function TimelinePage() {
  const { planResult, debts } = useDebtStore();

  return (
    <div className="space-y-6">
      <PageHeader title="Timeline" description="Payoff milestones and debt elimination sequence" />

      <ComputeBanner />

      {planResult && planResult.payoffOrder.length > 0 && (
        <div className="space-y-6">
          {/* Summary bar */}
          <Card>
            <CardContent className="p-4 flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <span className="text-sm text-muted-foreground">
                  {planResult.completionStatus === 'complete'
                    ? `All debts eliminated in ${planResult.payoffMonth} months`
                    : `${planResult.payoffOrder.length} of ${debts.length} debts paid off within horizon`}
                </span>
              </div>
              {planResult.payoffMonth && (
                <span className="text-sm font-semibold text-primary ml-auto">
                  Debt-free by{' '}
                  {formatDateFull(
                    planResult.monthlySummaries[planResult.payoffMonth - 1]?.date ?? ''
                  )}
                </span>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <div className="relative ml-4 sm:ml-6">
            {/* Vertical line */}
            <div className="absolute left-3.5 top-2 bottom-2 w-px bg-border" />

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
                  <div key={milestone.debtId} className="relative pl-12 pb-8">
                    {/* Dot */}
                    <div className="absolute left-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold border-[3px] border-background shadow-sm">
                      {i + 1}
                    </div>

                    <Card className="transition-card hover-lift">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                            <h3 className="font-heading font-semibold text-sm">
                              {milestone.creditorName}
                            </h3>
                          </div>
                          <span className="text-xs text-muted-foreground font-tabular">
                            {summary ? formatDate(summary.date) : `Month ${milestone.monthNumber}`}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5 text-xs text-muted-foreground">
                          <span className="font-tabular">Month {milestone.monthNumber}</span>
                          {gapMonths > 0 && i > 0 && (
                            <span>{gapMonths} month{gapMonths !== 1 ? 's' : ''} after previous</span>
                          )}
                          {debt && (
                            <span>
                              Original: <span className="font-medium text-foreground font-tabular">{formatCurrency(debt.balance)}</span>
                            </span>
                          )}
                        </div>
                        {summary && (
                          <div className="mt-2.5 pt-2.5 border-t border-border/50 text-xs">
                            <span className="text-muted-foreground">Remaining total: </span>
                            <span className="font-medium font-tabular">{formatCurrency(summary.totalEndingDebt)}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                );
              })}

              {/* Completion marker */}
              {planResult.completionStatus === 'complete' && (
                <div className="relative pl-12 pb-2">
                  <div className="absolute left-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-[3px] border-background shadow-sm">
                    <Trophy className="w-3 h-3" />
                  </div>
                  <Card className="border-primary/20 bg-accent">
                    <CardContent className="p-4">
                      <h3 className="font-heading font-semibold text-primary text-sm">
                        🎉 Debt Free!
                      </h3>
                      <p className="text-sm text-accent-foreground mt-1.5 leading-relaxed">
                        All {debts.length} debts eliminated by month{' '}
                        {planResult.payoffMonth}. Total interest paid:{' '}
                        <span className="font-medium font-tabular">{formatCurrency(planResult.totalInterestPaid)}</span>.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {planResult.completionStatus === 'incomplete' && (
                <div className="relative pl-12 pb-2">
                  <div className="absolute left-0 w-7 h-7 rounded-full bg-muted text-muted-foreground flex items-center justify-center border-[3px] border-background">
                    <Clock className="w-3 h-3" />
                  </div>
                  <Card className="border-dashed">
                    <CardContent className="p-4">
                      <h3 className="font-heading font-semibold text-muted-foreground text-sm">
                        Beyond Horizon
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                        <span className="font-medium font-tabular">{formatCurrency(planResult.remainingBalance)}</span> remaining after{' '}
                        {planResult.monthlySummaries.length} months. Consider increasing your horizon or adding extra payments.
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
