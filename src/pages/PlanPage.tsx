import { useDebtStore } from '@/store/useDebtStore';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calculator } from 'lucide-react';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function PlanPage() {
  const { planResult, computePlan, debts } = useDebtStore();

  return (
    <div>
      <PageHeader title="Plan" description="Monthly payoff breakdown and debt elimination order" />

      {debts.length === 0 ? (
        <p className="text-muted-foreground">Add debts first to generate a plan.</p>
      ) : !planResult ? (
        <Button onClick={computePlan}>
          <Calculator className="w-4 h-4 mr-2" /> Compute Plan
        </Button>
      ) : (
        <div className="space-y-6">
          {/* Summary row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="bg-card border"><CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Total Paid</p>
              <p className="text-lg font-bold font-heading">{formatCurrency(planResult.totalPaid)}</p>
            </CardContent></Card>
            <Card className="bg-card border"><CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Interest Paid</p>
              <p className="text-lg font-bold font-heading">{formatCurrency(planResult.totalInterestPaid)}</p>
            </CardContent></Card>
            <Card className="bg-card border"><CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Payoff Month</p>
              <p className="text-lg font-bold font-heading">{planResult.payoffMonth ?? '—'}</p>
            </CardContent></Card>
            <Card className="bg-card border"><CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Status</p>
              <p className={`text-lg font-bold font-heading capitalize ${planResult.completionStatus === 'complete' ? 'text-primary' : 'text-destructive'}`}>
                {planResult.completionStatus}
              </p>
            </CardContent></Card>
          </div>

          {/* Monthly summaries table */}
          <Card className="bg-card border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium text-muted-foreground">Month</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Starting</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Interest</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Paid</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Ending</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Payoffs</th>
                  </tr>
                </thead>
                <tbody>
                  {planResult.monthlySummaries.map((ms) => (
                    <tr key={ms.monthNumber} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-medium">{formatDate(ms.date)}</td>
                      <td className="p-3 text-right">{formatCurrency(ms.totalStartingDebt)}</td>
                      <td className="p-3 text-right text-destructive">{formatCurrency(ms.totalInterest)}</td>
                      <td className="p-3 text-right text-primary font-medium">{formatCurrency(ms.totalPaid)}</td>
                      <td className="p-3 text-right">{formatCurrency(ms.totalEndingDebt)}</td>
                      <td className="p-3">
                        {ms.debtsPaidOffThisMonth.length > 0 && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            🎉 {ms.debtsPaidOffThisMonth.length} paid off
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
