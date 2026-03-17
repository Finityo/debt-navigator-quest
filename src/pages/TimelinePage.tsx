import { useDebtStore } from '@/store/useDebtStore';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator } from 'lucide-react';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function TimelinePage() {
  const { planResult, computePlan, debts } = useDebtStore();

  if (debts.length === 0) {
    return (
      <div>
        <PageHeader title="Timeline" description="Payoff timeline and debt elimination milestones" />
        <p className="text-muted-foreground">Add debts first.</p>
      </div>
    );
  }

  if (!planResult) {
    return (
      <div>
        <PageHeader title="Timeline" description="Payoff timeline and debt elimination milestones" />
        <Button onClick={computePlan}><Calculator className="w-4 h-4 mr-2" /> Compute Plan</Button>
      </div>
    );
  }

  const milestones = planResult.payoffOrder;

  return (
    <div>
      <PageHeader title="Timeline" description="Payoff timeline and debt elimination milestones" />

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

        <div className="space-y-6 pl-12">
          {milestones.map((m, i) => {
            const summary = planResult.monthlySummaries.find((s) => s.monthNumber === m.monthNumber);
            return (
              <div key={m.debtId} className="relative">
                <div className="absolute -left-8 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </div>
                <Card className="border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading font-semibold">{m.creditorName}</h3>
                      <span className="text-sm text-muted-foreground">
                        {summary ? formatDate(summary.date) : `Month ${m.monthNumber}`}
                      </span>
                    </div>
                    <p className="text-sm text-primary mt-1">Paid off in month {m.monthNumber} 🎉</p>
                  </CardContent>
                </Card>
              </div>
            );
          })}

          {planResult.completionStatus === 'complete' && (
            <div className="relative">
              <div className="absolute -left-8 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                ✓
              </div>
              <Card className="border-2 border-primary bg-accent">
                <CardContent className="p-4">
                  <h3 className="font-heading font-semibold text-primary">Debt Free!</h3>
                  <p className="text-sm text-accent-foreground">
                    All debts eliminated by month {planResult.payoffMonth}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
