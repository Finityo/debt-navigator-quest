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
  CheckCircle2,
  BarChart3,
  Clock,
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
    <div className="space-y-8">
      <PageHeader title="Dashboard" description="Your debt freedom at a glance" />

      <ComputeBanner />

      {/* KPI Grid — only when plan is computed */}
      {hasResult && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div data-tour="dashboard-total-debt">
            <KpiCard icon={DollarSign} label="Total Debt" value={formatCurrency(totalDebt)} accent="destructive" />
            </div>
            <div data-tour="dashboard-monthly-minimums">
            <KpiCard icon={TrendingDown} label="Monthly Minimums" value={formatCurrency(totalMinPayments)} />
            </div>
            <div data-tour="dashboard-payoff-date">
            <KpiCard
              icon={CalendarDays}
              label="Projected Payoff"
              value={payoffDate ? formatDate(payoffDate) : 'Beyond horizon'}
              accent="primary"
            />
            </div>
            <KpiCard icon={Percent} label="Total Interest" value={formatCurrency(planResult.totalInterestPaid)} accent="destructive" />
            <KpiCard icon={Wallet} label="Total Paid" value={formatCurrency(planResult.totalPaid)} accent="primary" />
            <KpiCard icon={Target} label="Strategy" value={settings.method === 'avalanche' ? 'Avalanche' : 'Snowball'} />
            <div data-tour="dashboard-active-debts">
            <KpiCard
              icon={AlertCircle}
              label="Status"
              value={planResult.completionStatus === 'complete' ? 'Complete ✓' : `${formatCurrency(planResult.remainingBalance)} left`}
              accent={planResult.completionStatus === 'complete' ? 'primary' : 'destructive'}
            />
            </div>
            <KpiCard icon={Clock} label="Horizon" value={`${settings.monthsHorizon} mo`} />
          </div>

          {/* Charts */}
          {planResult.monthlySummaries.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-heading font-semibold text-sm text-muted-foreground mb-5">Debt Balance Over Time</h3>
                  <DebtBalanceChart summaries={planResult.monthlySummaries} />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-heading font-semibold text-sm text-muted-foreground mb-5">Interest vs Principal</h3>
                  <InterestPrincipalChart summaries={planResult.monthlySummaries} />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Strategy + Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card>
              <CardContent className="p-6">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Strategy</p>
                <p className="text-2xl font-bold font-heading capitalize text-foreground">{settings.method}</p>
                <p className="text-sm text-muted-foreground mt-2.5 leading-relaxed">
                  {settings.method === 'avalanche'
                    ? 'Targeting highest APR first to minimize total interest paid.'
                    : 'Targeting smallest balance first for motivating quick wins.'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-4">Quick Actions</p>
                <div className="flex flex-col gap-2.5">
                  <Button variant="outline" onClick={() => navigate('/debts')} className="w-full justify-between h-10 text-sm">
                    Manage Debts <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/plan')} className="w-full justify-between h-10 text-sm">
                    View Full Plan <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/settings')} className="w-full justify-between h-10 text-sm">
                    Settings <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payoff Order */}
          {planResult.payoffOrder.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-5">Payoff Order</p>
                <div className="space-y-3.5">
                  {planResult.payoffOrder.map((po, i) => {
                    const summary = planResult.monthlySummaries.find((s) => s.monthNumber === po.monthNumber);
                    return (
                      <div key={po.debtId} className="flex items-center gap-3.5">
                        <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
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
        </>
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
  const iconBg = accent === 'destructive' ? 'bg-destructive/10' : accent === 'primary' ? 'bg-primary/10' : 'bg-muted';
  const iconColor = accent === 'destructive' ? 'text-destructive' : accent === 'primary' ? 'text-primary' : 'text-muted-foreground';
  const valueColor = accent === 'destructive' ? 'text-destructive' : accent === 'primary' ? 'text-primary' : 'text-foreground';

  return (
    <div className="glass-card p-5 hover:scale-[1.01] hover:translate-y-[-2px] transition-all duration-200">
      <div className="flex items-center gap-2.5 mb-4">
        <div className={`p-2 rounded-lg ${iconBg}`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
      </div>
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">{label}</p>
      <p className={`text-2xl font-bold font-heading font-tabular leading-none tracking-tight ${valueColor}`}>{value}</p>
    </div>
  );
}
