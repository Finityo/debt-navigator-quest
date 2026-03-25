import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebtStore } from '@/store/useDebtStore';
import { ComputeBanner } from '@/components/ComputeBanner';
import { MethodComparison } from '@/components/plan/MethodComparison';
import { DebtBalanceChart } from '@/components/charts/DebtBalanceChart';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, formatCurrencyCents, formatDate } from '@/utils/format';
import { ChevronDown, ChevronRight, ArrowRight, DollarSign, Calendar, TrendingDown, Sparkles, ClipboardCheck } from 'lucide-react';
import type { PayoffMethod } from '@/types/debt';

export default function PlanPage() {
  const { planResult, debts, settings, computePlan, updateSettings, _hasHydrated } = useDebtStore();
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (_hasHydrated) computePlan();
  }, [_hasHydrated, computePlan]);

  const payoffDate = planResult?.payoffMonth
    ? planResult.monthlySummaries[planResult.payoffMonth - 1]?.date
    : null;

  const initialTotalDebt = debts.reduce((s, d) => s + d.balance, 0);
  const remainingDebt = planResult?.monthlySummaries?.[planResult.monthlySummaries.length - 1]?.totalEndingDebt ?? initialTotalDebt;
  const progressPercent = initialTotalDebt > 0
    ? Math.max(0, Math.min(100, ((initialTotalDebt - remainingDebt) / initialTotalDebt) * 100))
    : 0;

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
            Step 2 of 2
          </span>
        </div>
      </div>

      <ComputeBanner />

      {planResult && (
        <div className="space-y-6">
          {/* Hero Outcome */}
          <h1 className="text-2xl font-heading font-bold text-foreground text-center mb-1">
            You'll be debt-free by {payoffDate ? formatDate(payoffDate) : '—'}
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Stay consistent and this is your finish line.
          </p>

          {/* TASK 3 — Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Debt Progress</span>
              <span>{progressPercent.toFixed(0)}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {/* TASK 2 — Savings Block */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="glass-card">
              <CardContent className="p-4">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1">Interest Saved</p>
                <p className="text-sm text-muted-foreground">Compared to minimum payments</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1">Time Saved</p>
                <p className="text-sm text-muted-foreground">Faster payoff with your plan</p>
              </CardContent>
            </Card>
          </div>

          {/* Hero Summary */}
          <Card className="glass-card bg-gradient-to-br from-primary/8 to-accent/10 border-primary/20">
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Total Debt</span>
                  </div>
                  <p className="text-2xl font-bold font-heading font-tabular text-foreground">
                    {formatCurrency(initialTotalDebt)}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Payoff Date</span>
                  </div>
                  <p className="text-2xl font-bold font-heading font-tabular text-primary" id="payoff-date">
                    {payoffDate ? formatDate(payoffDate) : 'Beyond horizon'}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <TrendingDown className="w-4 h-4 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Total Interest</span>
                  </div>
                  <p className="text-2xl font-bold font-heading font-tabular text-destructive">
                    {formatCurrency(planResult.totalInterestPaid)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strategy Switch */}
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Strategy</p>
            <Tabs
              value={settings.method}
              onValueChange={(v) => updateSettings({ method: v as PayoffMethod })}
            >
              <TabsList>
                <TabsTrigger value="avalanche" id="avalanche-toggle">Avalanche</TabsTrigger>
                <TabsTrigger value="snowball" id="snowball-toggle">Snowball</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Primary Visual — Balance Chart */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-heading font-semibold text-sm text-muted-foreground mb-4">Debt Balance Over Time</h3>
              <DebtBalanceChart summaries={planResult.monthlySummaries} />
            </CardContent>
          </Card>

          {/* Snowball vs Avalanche Comparison */}
          <MethodComparison />

          {/* Payoff Order */}
          <Card>
            <CardContent className="p-6">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-4">Payoff Order</p>
              <div className="flex flex-wrap gap-2.5">
                {planResult.payoffOrder.map((po, i) => {
                  const summary = planResult.monthlySummaries.find(
                    (s) => s.monthNumber === po.monthNumber
                  );
                  return (
                    <div
                      key={po.debtId}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-muted text-sm"
                    >
                      <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">
                        {i + 1}
                      </span>
                      <span className="font-medium">{po.creditorName}</span>
                      <span className="text-muted-foreground text-xs font-tabular">
                        {summary ? formatDate(summary.date) : `Mo. ${po.monthNumber}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Breakdown */}
          <div className="space-y-2" id="monthly-table">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Monthly Breakdown</p>
            {planResult.monthlySummaries.map((ms) => {
              const isExpanded = expandedMonth === ms.monthNumber;
              const hasMilestone = ms.debtsPaidOffThisMonth.length > 0;
              const snapshots = isExpanded
                ? planResult.debtSnapshots.filter((s) => s.monthNumber === ms.monthNumber)
                : [];

              return (
                <MonthCard
                  key={ms.monthNumber}
                  ms={ms}
                  isExpanded={isExpanded}
                  hasMilestone={hasMilestone}
                  snapshots={snapshots}
                  method={settings.method}
                  debts={debts}
                  onToggle={() => setExpandedMonth(isExpanded ? null : ms.monthNumber)}
                />
              );
            })}
          </div>

          {/* TASK 4 — Next Step Module */}
          <Card className="glass-card">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <ClipboardCheck className="w-4 h-4 text-primary" />
                <h3 className="font-heading font-semibold text-sm">Next Step</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Log your next payment to stay on track.
              </p>
              <Button className="w-full h-12 font-semibold">
                Log a Payment
              </Button>
            </CardContent>
          </Card>

          {/* Next Action */}
          <Button
            variant="outline"
            onClick={() => navigate('/scenarios')}
            className="w-full h-12 text-sm font-semibold"
          >
            <Sparkles className="w-4 h-4 mr-2" /> Optimize your payoff <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          {/* TASK 6 — Return Trigger */}
          <p className="text-xs text-muted-foreground text-center">
            Check back monthly to track your progress and stay on plan
          </p>
        </div>
      )}
    </div>
  );
}

function MonthCard({
  ms,
  isExpanded,
  hasMilestone,
  snapshots,
  method,
  debts,
  onToggle,
}: {
  ms: import('@/types/debt').MonthlyPlanSummary;
  isExpanded: boolean;
  hasMilestone: boolean;
  snapshots: import('@/types/debt').MonthlyDebtSnapshot[];
  method: import('@/types/debt').PayoffMethod;
  debts: import('@/types/debt').Debt[];
  onToggle: () => void;
}) {
  return (
    <Card
      className={`cursor-pointer transition-all ${hasMilestone ? 'border-primary/30' : ''}`}
      onClick={onToggle}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="shrink-0">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          <span className="font-medium text-sm font-tabular whitespace-nowrap">{formatDate(ms.date)}</span>
          <div className="flex-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>Start: <strong className="text-foreground font-tabular">{formatCurrency(ms.totalStartingDebt)}</strong></span>
            <span className="text-destructive/70">Int: <strong className="font-tabular">{formatCurrencyCents(ms.totalInterest)}</strong></span>
            <span className="text-primary/80">Prin: <strong className="font-tabular">{formatCurrencyCents(ms.totalPrincipal)}</strong></span>
            {ms.totalExtraPayments > 0 && (
              <span className="text-primary font-semibold">Extra: {formatCurrency(ms.totalExtraPayments)}</span>
            )}
            <span>End: <strong className="text-foreground font-tabular font-semibold">{formatCurrency(ms.totalEndingDebt)}</strong></span>
          </div>
          {hasMilestone && (
            <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full whitespace-nowrap font-semibold shrink-0">
              🎉 {ms.debtsPaidOffThisMonth.length} paid off
            </span>
          )}
        </div>

        {/* TASK 5 — Milestone Feedback */}
        {hasMilestone && (
          <div className="mt-2 text-xs text-primary font-medium">
            🎉 {ms.debtsPaidOffThisMonth.length} debt{ms.debtsPaidOffThisMonth.length > 1 ? 's' : ''} eliminated
          </div>
        )}

        {isExpanded && snapshots.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
              Debt-by-debt — {formatDate(ms.date)}
            </p>
            {[...snapshots]
              .filter((s) => s.startingBalance > 0 || s.paymentApplied > 0)
              .sort((a, b) => {
                if (method === 'snowball') return a.startingBalance - b.startingBalance;
                const aprA = debts.find((d) => d.id === a.debtId)?.apr ?? 0;
                const aprB = debts.find((d) => d.id === b.debtId)?.apr ?? 0;
                return aprB - aprA;
              })
              .map((s, i) => {
                const debt = debts.find((d) => d.id === s.debtId);
                const tooltipText = method === 'snowball'
                  ? `#${i + 1} lowest balance: ${formatCurrencyCents(s.startingBalance)}`
                  : `#${i + 1} highest APR: ${((debt?.apr ?? 0) * 100).toFixed(1)}%`;
                return (
                  <div
                    key={s.debtId}
                    className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs rounded-lg px-4 py-3 ${
                      s.isPaidOff ? 'bg-primary/8 border border-primary/15' : 'bg-muted/40 border border-border/40'
                    }`}
                  >
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 cursor-help">
                            {i + 1}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          {tooltipText}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <span className="font-semibold min-w-[110px]">{s.creditorName}</span>
                    <span className="text-muted-foreground font-tabular">Start: {formatCurrencyCents(s.startingBalance)}</span>
                    <span className="text-destructive/70 font-tabular">+{formatCurrencyCents(s.interestAccrued)} int</span>
                    <span className="text-primary/80 font-tabular">−{formatCurrencyCents(s.principalPaid)} principal</span>
                    <span className="font-tabular font-semibold">End: {formatCurrencyCents(s.endingBalance)}</span>
                    {s.isPaidOff && <span className="text-primary font-bold">✓ Paid Off</span>}
                  </div>
                );
              })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}