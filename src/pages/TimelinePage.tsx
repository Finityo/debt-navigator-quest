import { useDebtStore } from '@/store/useDebtStore';
import { PageHeader } from '@/components/PageHeader';
import { ComputeBanner } from '@/components/ComputeBanner';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatDate, formatDateFull } from '@/utils/format';
import { CheckCircle2, Clock, Trophy } from 'lucide-react';

export default function TimelinePage() {
  const { planResult, debts } = useDebtStore();

  return (
    <div className="space-y-8">
      <PageHeader title="Timeline" description="Payoff milestones and debt elimination sequence" />

      <ComputeBanner />

      {planResult && planResult.payoffOrder.length > 0 && (
        <div className="space-y-8">
          {/* Summary bar */}
          <Card>
            <CardContent className="p-5 flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="text-sm text-muted-foreground">
                  {planResult.completionStatus === 'complete'
                    ? `All debts eliminated in ${planResult.payoffMonth} months`
                    : `${planResult.payoffOrder.length} of ${debts.length} debts paid off within horizon`}
                </span>
              </div>
              {planResult.payoffMonth && (
                <span className="text-sm font-bold text-primary ml-auto font-heading">
                  Debt-free by{' '}
                  {formatDateFull(
                    planResult.monthlySummaries[planResult.payoffMonth - 1]?.date ?? ''
                  )}
                </span>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <div className="relative ml-5 sm:ml-7">
            {/* Vertical line */}
            <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-border rounded-full" />

            <div className="space-y-0">
              {planResult.payoffOrder.map((milestone, i) => {
                const summary = planResult.monthlySummaries.find(
                  (s) => s.monthNumber === milestone.monthNumber
                );
                const debt = debts.find((d) => d.id === milestone.debtId);
                const prevMonth =
                  i > 0 ? planResult.payoffOrder[i - 1].monthNumber : 0;
                const gapMonths = milestone.monthNumber - prevMonth;

                const isNext = i === 0;

                return (
                  <div key={milestone.debtId} className="relative pl-14 pb-10">
                    {/* Dot */}
                    <div className="absolute left-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold border-[3px] border-background shadow-md">
                      {i + 1}
                    </div>

                    <Card className={`transition-card hover-lift hover:scale-[1.01] hover:translate-y-[-2px] transition-all duration-200 ${isNext ? 'border-primary/20 shadow-[0_0_30px_hsl(var(--primary)/0.1)]' : ''}`}>
                      <CardContent className="p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                          <div className="flex items-center gap-2.5">
                            <CheckCircle2 className="w-[18px] h-[18px] text-primary shrink-0" />
                            <h3 className="font-heading font-bold text-[15px]">
                              {milestone.creditorName}
                            </h3>
                          </div>
                          <span className="text-xs text-muted-foreground font-tabular">
                            {summary ? formatDate(summary.date) : `Month ${milestone.monthNumber}`}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 text-xs text-muted-foreground">
                          <span className="font-tabular">Month {milestone.monthNumber}</span>
                          {gapMonths > 0 && i > 0 && (
                            <span>{gapMonths} month{gapMonths !== 1 ? 's' : ''} after previous</span>
                          )}
                          {debt && (
                            <span>
                              Original: <span className="font-semibold text-foreground font-tabular">{formatCurrency(debt.balance)}</span>
                            </span>
                          )}
                        </div>
                        {summary && (
                          <div className="mt-3 pt-3 border-t border-border/40 text-xs">
                            <span className="text-muted-foreground">Remaining total: </span>
                            <span className="font-semibold font-tabular">{formatCurrency(summary.totalEndingDebt)}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                );
              })}

              {/* Completion marker */}
              {planResult.completionStatus === 'complete' && (
                <div className="relative pl-14 pb-2">
                  <div className="absolute left-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-[3px] border-background shadow-md">
                    <Trophy className="w-3.5 h-3.5" />
                  </div>
                  <Card className="border-primary/30 bg-primary/5 shadow-[var(--shadow-elevated)]">
                    <CardContent className="p-5">
                      <h3 className="font-heading font-bold text-primary text-base">
                        🎉 Debt Free!
                      </h3>
                      <p className="text-sm text-foreground/80 mt-2 leading-relaxed">
                        All {debts.length} debts eliminated by month{' '}
                        {planResult.payoffMonth}. Total interest paid:{' '}
                        <span className="font-semibold font-tabular">{formatCurrency(planResult.totalInterestPaid)}</span>.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {planResult.completionStatus === 'incomplete' && (
                <div className="relative pl-14 pb-2">
                  <div className="absolute left-0 w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center border-[3px] border-background">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <Card className="border-dashed">
                    <CardContent className="p-5">
                      <h3 className="font-heading font-bold text-muted-foreground text-[15px]">
                        Beyond Horizon
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                        <span className="font-semibold font-tabular">{formatCurrency(planResult.remainingBalance)}</span> remaining after{' '}
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
