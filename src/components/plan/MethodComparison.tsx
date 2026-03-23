import { useMemo } from 'react';
import { useDebtStore } from '@/store/useDebtStore';
import { computeDebtPlan } from '@/lib/computeDebtPlan';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { formatCurrency, formatDate } from '@/utils/format';
import { TrendingDown, Calendar, DollarSign, Trophy } from 'lucide-react';

export function MethodComparison() {
  const { debts, settings, extraPayments } = useDebtStore();

  const { snowball, avalanche, diff } = useMemo(() => {
    const snow = computeDebtPlan(debts, { ...settings, method: 'snowball' }, extraPayments);
    const aval = computeDebtPlan(debts, { ...settings, method: 'avalanche' }, extraPayments);

    const interestDiff = snow.totalInterestPaid - aval.totalInterestPaid;
    const monthDiff = (snow.payoffMonth ?? settings.monthsHorizon) - (aval.payoffMonth ?? settings.monthsHorizon);

    return {
      snowball: snow,
      avalanche: aval,
      diff: { interest: interestDiff, months: monthDiff },
    };
  }, [debts, settings, extraPayments]);

  const snowMonths = snowball.payoffMonth ?? settings.monthsHorizon;
  const avalMonths = avalanche.payoffMonth ?? settings.monthsHorizon;

  const interestWinner = diff.interest > 0 ? 'avalanche' : diff.interest < 0 ? 'snowball' : 'tie';
  const speedWinner = diff.months > 0 ? 'avalanche' : diff.months < 0 ? 'snowball' : 'tie';

  return (
    <div className="space-y-5">
      {/* Winner banner */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/40 border-primary/20">
        <CardContent className="p-5 flex items-center gap-3">
          <Trophy className="w-5 h-5 text-primary shrink-0" />
          <div className="text-sm">
            {interestWinner === 'tie' && speedWinner === 'tie' ? (
              <span className="font-semibold">Both methods produce identical results.</span>
            ) : (
              <>
                {interestWinner !== 'tie' && (
                  <span>
                    <span className="font-bold text-primary">
                      {interestWinner === 'avalanche' ? 'Avalanche' : 'Snowball'}
                    </span>
                    {' saves '}
                    <span className="font-bold text-primary">{formatCurrency(Math.abs(diff.interest))}</span>
                    {' in interest. '}
                  </span>
                )}
                {speedWinner !== 'tie' && speedWinner !== interestWinner && (
                  <span>
                    <span className="font-bold text-primary">
                      {speedWinner === 'avalanche' ? 'Avalanche' : 'Snowball'}
                    </span>
                    {' is faster by '}
                    <span className="font-bold text-primary">{Math.abs(diff.months)} month{Math.abs(diff.months) !== 1 ? 's' : ''}</span>.
                  </span>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs comparison */}
      <Tabs defaultValue="side-by-side">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="side-by-side">Side-by-Side</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="side-by-side">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div id="snowball-toggle">
            <MethodCard
              label="Snowball"
              description="Smallest balance first"
              result={snowball}
              months={snowMonths}
              isWinnerInterest={interestWinner === 'snowball'}
              isWinnerSpeed={speedWinner === 'snowball'}
              horizon={settings.monthsHorizon}
            />
            </div>
            <div data-tour="avalanche-option">
            <MethodCard
              label="Avalanche"
              description="Highest APR first"
              result={avalanche}
              months={avalMonths}
              isWinnerInterest={interestWinner === 'avalanche'}
              isWinnerSpeed={speedWinner === 'avalanche'}
              horizon={settings.monthsHorizon}
            />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="details">
          <div className="mt-4">
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-widest">Metric</th>
                      <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-widest">Snowball</th>
                      <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-widest">Avalanche</th>
                      <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-widest">Difference</th>
                    </tr>
                  </thead>
                  <tbody>
                    <CompRow
                      label="Total Interest"
                      snow={formatCurrency(snowball.totalInterestPaid)}
                      aval={formatCurrency(avalanche.totalInterestPaid)}
                      diffVal={diff.interest}
                      diffLabel={diff.interest !== 0 ? formatCurrency(Math.abs(diff.interest)) : '—'}
                      better={interestWinner}
                    />
                    <CompRow
                      label="Total Paid"
                      snow={formatCurrency(snowball.totalPaid)}
                      aval={formatCurrency(avalanche.totalPaid)}
                      diffVal={snowball.totalPaid - avalanche.totalPaid}
                      diffLabel={snowball.totalPaid !== avalanche.totalPaid ? formatCurrency(Math.abs(snowball.totalPaid - avalanche.totalPaid)) : '—'}
                      better={snowball.totalPaid > avalanche.totalPaid ? 'avalanche' : snowball.totalPaid < avalanche.totalPaid ? 'snowball' : 'tie'}
                    />
                    <CompRow
                      label="Months to Debt-Free"
                      snow={`${snowMonths} mo`}
                      aval={`${avalMonths} mo`}
                      diffVal={diff.months}
                      diffLabel={diff.months !== 0 ? `${Math.abs(diff.months)} mo` : '—'}
                      better={speedWinner}
                    />
                    <CompRow
                      label="Payoff Date"
                      snow={snowball.payoffMonth ? formatDate(snowball.monthlySummaries[snowball.payoffMonth - 1]?.date ?? '') : 'Incomplete'}
                      aval={avalanche.payoffMonth ? formatDate(avalanche.monthlySummaries[avalanche.payoffMonth - 1]?.date ?? '') : 'Incomplete'}
                      diffVal={0}
                      diffLabel="—"
                      better="tie"
                    />
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MethodCard({
  label,
  description,
  result,
  months,
  isWinnerInterest,
  isWinnerSpeed,
  horizon,
}: {
  label: string;
  description: string;
  result: import('@/types/debt').PlanResult;
  months: number;
  isWinnerInterest: boolean;
  isWinnerSpeed: boolean;
  horizon: number;
}) {
  const payoffDate = result.payoffMonth
    ? formatDate(result.monthlySummaries[result.payoffMonth - 1]?.date ?? '')
    : 'Incomplete';

  return (
    <Card className={`relative overflow-hidden ${isWinnerInterest || isWinnerSpeed ? 'border-primary/40 shadow-md' : ''}`}>
      {(isWinnerInterest || isWinnerSpeed) && (
        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-bl-lg uppercase tracking-wider">
          {isWinnerInterest && isWinnerSpeed ? 'Best Overall' : isWinnerInterest ? 'Saves More' : 'Faster'}
        </div>
      )}
      <CardContent className="p-5 space-y-4">
        <div>
          <p className="font-heading font-bold text-lg">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Metric icon={DollarSign} label="Interest" value={formatCurrency(result.totalInterestPaid)} highlight={isWinnerInterest} />
          <Metric icon={Calendar} label="Months" value={`${months}`} highlight={isWinnerSpeed} />
          <Metric icon={TrendingDown} label="Total Paid" value={formatCurrency(result.totalPaid)} />
          <Metric label="Payoff" value={payoffDate} />
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-0.5">
        {Icon && <Icon className="w-3 h-3 text-muted-foreground" />}
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">{label}</span>
      </div>
      <p className={`text-base font-bold font-tabular ${highlight ? 'text-primary' : 'text-foreground'}`}>{value}</p>
    </div>
  );
}

function CompRow({
  label,
  snow,
  aval,
  diffVal,
  diffLabel,
  better,
}: {
  label: string;
  snow: string;
  aval: string;
  diffVal: number;
  diffLabel: string;
  better: 'snowball' | 'avalanche' | 'tie';
}) {
  return (
    <tr className="border-b border-border/50">
      <td className="px-4 py-3 font-medium">{label}</td>
      <td className={`px-4 py-3 text-right font-tabular ${better === 'snowball' ? 'text-primary font-bold' : ''}`}>{snow}</td>
      <td className={`px-4 py-3 text-right font-tabular ${better === 'avalanche' ? 'text-primary font-bold' : ''}`}>{aval}</td>
      <td className={`px-4 py-3 text-right font-tabular ${better !== 'tie' ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>{diffLabel}</td>
    </tr>
  );
}
