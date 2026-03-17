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
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Your debt freedom at a glance" />

      <ComputeBanner />

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard icon={DollarSign} label="Total Debt" value={formatCurrency(totalDebt)} accent="destructive" />
        <KpiCard icon={TrendingDown} label="Monthly Minimums" value={formatCurrency(totalMinPayments)} />
        <KpiCard
          icon={CalendarDays}
          label="Projected Payoff"
          value={payoffDate ? formatDate(payoffDate) : hasResult ? 'Beyond horizon' : '—'}
          accent="primary"
        />
        <KpiCard icon={Percent} label="Total Interest" value={hasResult ? formatCurrency(planResult.totalInterestPaid) : '—'} accent="destructive" />
        <KpiCard icon={Wallet} label="Total Paid" value={hasResult ? formatCurrency(planResult.totalPaid) : '—'} accent="primary" />
        <KpiCard icon={Target} label="Strategy" value={settings.method === 'avalanche' ? 'Avalanche' : 'Snowball'} />
        <KpiCard
          icon={AlertCircle}
          label="Status"
          value={hasResult ? (planResult.completionStatus === 'complete' ? 'Complete ✓' : `${formatCurrency(planResult.remainingBalance)} left`) : '—'}
          accent={planResult?.completionStatus === 'complete' ? 'primary' : 'destructive'}
        />
        <KpiCard icon={CalendarDays} label="Horizon" value={`${settings.monthsHorizon} mo`} />
      </div>

      {/* Charts */}
      {hasResult && planResult.monthlySummaries.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-5">
              <h3 className="font-heading font-semibold text-sm text-muted-foreground mb-4">Debt Balance Over Time</h3>
              <DebtBalanceChart summaries={planResult.monthlySummaries} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <h3 className="font-heading font-semibold text-sm text-muted-foreground mb-4">Interest vs Principal</h3>
              <InterestPrincipalChart summaries={planResult.monthlySummaries} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Strategy + Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Strategy</p>
            <p className="text-xl font-bold font-heading capitalize text-foreground">{settings.method}</p>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              {settings.method === 'avalanche'
                ? 'Targeting highest APR first to minimize total interest paid.'
                : 'Targeting smallest balance first for motivating quick wins.'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</p>
            <div className="flex flex-col gap-2">
              <Button variant="outline" onClick={() => navigate('/debts')} className="w-full justify-between h-9 text-sm">
                Manage Debts <ArrowRight className="w-3.5 h-3.5" />
              </Button>
              <Button variant="outline" onClick={() => navigate('/plan')} className="w-full justify-between h-9 text-sm">
                View Full Plan <ArrowRight className="w-3.5 h-3.5" />
              </Button>
              <Button variant="outline" onClick={() => navigate('/settings')} className="w-full justify-between h-9 text-sm">
                Settings <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payoff Order */}
      {hasResult && planResult.payoffOrder.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Payoff Order</p>
            <div className="space-y-3">
              {planResult.payoffOrder.map((po, i) => {
                const summary = planResult.monthlySummaries.find((s) => s.monthNumber === po.monthNumber);
                return (
                  <div key={po.debtId} className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                      {i + 1}
                    </span>
                    <span className="font-medium text-sm flex-1 truncate">{po.creditorName}</span>
                    <span className="text-xs text-muted-foreground font-tabular shrink-0">
                      {summary ? formatDate(summary.date) : `Month ${po.monthNumber}`}
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
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent?: 'primary' | 'destructive';
}) {
  const iconColor = accent === 'destructive' ? 'text-destructive' : accent === 'primary' ? 'text-primary' : 'text-muted-foreground';
  const valueColor = accent === 'destructive' ? 'text-destructive' : accent === 'primary' ? 'text-primary' : 'text-foreground';

  return (
    <Card className="transition-card hover-lift">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-md bg-muted/80">
            <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
          </div>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        </div>
        <p className={`text-xl font-bold font-heading font-tabular leading-none ${valueColor}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
