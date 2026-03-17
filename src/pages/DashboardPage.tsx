import { useEffect } from 'react';
import { useDebtStore } from '@/store/useDebtStore';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { TrendingDown, DollarSign, CalendarDays, Percent, ArrowRight } from 'lucide-react';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function DashboardPage() {
  const { debts, settings, planResult, computePlan } = useDebtStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!planResult && debts.length > 0) computePlan();
  }, []);

  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
  const totalMinPayments = debts.reduce((sum, d) => sum + d.minPayment, 0);

  const kpis = [
    {
      label: 'Total Debt',
      value: formatCurrency(totalDebt),
      icon: DollarSign,
      color: 'text-destructive',
    },
    {
      label: 'Monthly Minimums',
      value: formatCurrency(totalMinPayments),
      icon: TrendingDown,
      color: 'text-warning',
    },
    {
      label: 'Projected Payoff',
      value: planResult?.payoffMonth
        ? formatDate(planResult.monthlySummaries[planResult.payoffMonth - 1]?.date ?? settings.startDate)
        : debts.length === 0 ? '—' : 'Compute plan',
      icon: CalendarDays,
      color: 'text-primary',
    },
    {
      label: 'Total Interest',
      value: planResult ? formatCurrency(planResult.totalInterestPaid) : '—',
      icon: Percent,
      color: 'text-muted-foreground',
    },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" description="Your debt freedom at a glance" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="border bg-card">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-muted">
                  <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
                <span className="text-sm text-muted-foreground">{kpi.label}</span>
              </div>
              <p className="text-xl md:text-2xl font-bold font-heading">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border bg-card">
          <CardContent className="p-5">
            <h3 className="font-heading font-semibold mb-2">Strategy</h3>
            <p className="text-lg font-medium capitalize text-primary">{settings.method}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {settings.method === 'avalanche'
                ? 'Targeting highest APR first to minimize interest'
                : 'Targeting smallest balance first for quick wins'}
            </p>
          </CardContent>
        </Card>

        <Card className="border bg-card">
          <CardContent className="p-5">
            <h3 className="font-heading font-semibold mb-2">Quick Actions</h3>
            <div className="flex flex-col gap-2">
              {!planResult && debts.length > 0 && (
                <Button onClick={computePlan} className="w-full">
                  Compute Plan
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate('/debts')} className="w-full justify-between">
                Manage Debts <ArrowRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={() => navigate('/plan')} className="w-full justify-between">
                View Plan <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {planResult && planResult.payoffOrder.length > 0 && (
        <Card className="mt-4 border bg-card">
          <CardContent className="p-5">
            <h3 className="font-heading font-semibold mb-3">Payoff Order</h3>
            <div className="space-y-2">
              {planResult.payoffOrder.map((po, i) => (
                <div key={po.debtId} className="flex items-center gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="font-medium">{po.creditorName}</span>
                  <span className="text-muted-foreground ml-auto">Month {po.monthNumber}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
