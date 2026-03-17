import { useDebtStore } from '@/store/useDebtStore';
import { PageHeader } from '@/components/PageHeader';
import { ComputeBanner } from '@/components/ComputeBanner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { DebtBalanceChart } from '@/components/charts/DebtBalanceChart';
import { InterestPrincipalChart } from '@/components/charts/InterestPrincipalChart';
import {
  TrendingDown,
  DollarSign,
  CalendarDays,
  Percent,
  ArrowRight,
  Target,
  Wallet,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/format';

export default function DashboardPage() {
  const { debts, settings, planResult, computeStatus } = useDebtStore();
  const navigate = useNavigate();

  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
  const totalMinPayments = debts.reduce((sum, d) => sum + d.minPayment, 0);
  const hasResult = !!planResult;

  const payoffDate = planResult?.payoffMonth
    ? planResult.monthlySummaries[planResult.payoffMonth - 1]?.date
    : null;

  return (
    <div>
      <PageHeader title="Dashboard" description="Your debt freedom at a glance" />

      <ComputeBanner />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        <KpiCard icon={DollarSign} iconColor="text-destructive" label="Total Debt" value={formatCurrency(totalDebt)} />
        <KpiCard icon={TrendingDown} iconColor="text-muted-foreground" label="Monthly Minimums" value={formatCurrency(totalMinPayments)} />
        <KpiCard
          icon={CalendarDays}
          iconColor="text-primary"
          label="Projected Payoff"
          value={payoffDate ? formatDate(payoffDate) : hasResult ? 'Beyond horizon' : '—'}
        />
        <KpiCard icon={Percent} iconColor="text-destructive" label="Total Interest" value={hasResult ? formatCurrency(planResult.totalInterestPaid) : '—'} />
        <KpiCard icon={Wallet} iconColor="text-primary" label="Total Paid" value={hasResult ? formatCurrency(planResult.totalPaid) : '—'} />
        <KpiCard icon={Target} iconColor="text-primary" label="Strategy" value={settings.method === 'avalanche' ? 'Avalanche' : 'Snowball'} />
        <KpiCard
          icon={AlertCircle}
          iconColor={planResult?.completionStatus === 'complete' ? 'text-primary' : 'text-destructive'}
          label="Status"
          value={hasResult ? (planResult.completionStatus === 'complete' ? 'Complete ✓' : `${formatCurrency(planResult.remainingBalance)} left`) : '—'}
        />
        <KpiCard icon={CalendarDays} iconColor="text-muted-foreground" label="Horizon" value={`${settings.monthsHorizon} months`} />
      </div>

      {/* Charts */}
      {hasResult && planResult.monthlySummaries.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <Card className="border bg-card">
            <CardContent className="p-4">
              <h3 className="font-heading font-semibold text-sm mb-3">Debt Balance Over Time</h3>
              <DebtBalanceChart summaries={planResult.monthlySummaries} />
            </CardContent>
          </Card>
          <Card className="border bg-card">
            <CardContent className="p-4">
              <h3 className="font-heading font-semibold text-sm mb-3">Interest vs Principal</h3>
              <InterestPrincipalChart summaries={planResult.monthlySummaries} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions + Strategy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
              <Button variant="outline" onClick={() => navigate('/debts')} className="w-full justify-between">
                Manage Debts <ArrowRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={() => navigate('/plan')} className="w-full justify-between">
                View Plan <ArrowRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={() => navigate('/settings')} className="w-full justify-between">
                Settings <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payoff Order */}
      {hasResult && planResult.payoffOrder.length > 0 && (
        <Card className="mt-4 border bg-card">
          <CardContent className="p-5">
            <h3 className="font-heading font-semibold mb-3">Payoff Order</h3>
            <div className="space-y-2">
              {planResult.payoffOrder.map((po, i) => {
                const summary = planResult.monthlySummaries.find((s) => s.monthNumber === po.monthNumber);
                return (
                  <div key={po.debtId} className="flex items-center gap-3 text-sm">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                      {i + 1}
                    </span>
                    <span className="font-medium flex-1 truncate">{po.creditorName}</span>
                    <span className="text-muted-foreground text-xs shrink-0">
                      {summary ? formatDate(summary.date) : `Mo. ${po.monthNumber}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function KpiCard({
  icon: Icon,
  iconColor,
  label,
  value,
}: {
  icon: React.ElementType;
  iconColor: string;
  label: string;
  value: string;
}) {
  return (
    <Card className="border bg-card">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-md bg-muted">
            <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
          </div>
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <p className="text-lg font-bold font-heading leading-tight">{value}</p>
      </CardContent>
    </Card>
  );
}
