import { useEffect, useMemo, useState } from 'react';
import { useDebtStore } from '@/store/useDebtStore';
import { useBudgetStore } from '@/store/useBudgetStore';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { StableNumberInput } from '@/components/ui/stable-number-input';
import { formatCurrencyCents, formatPercent } from '@/utils/format';
import { Plus, Trash2 } from 'lucide-react';
import type { BudgetLine, MonthStatus } from '@/types/budget';
import {
  isPayoffExcluded,
  monthLabelOf,
  monthSurplus,
  sumLines,
} from '@/lib/monthChain';
import SectionExplain from '@/components/budget/SectionExplain';
import TransitionBanner from '@/components/budget/TransitionBanner';
import { SECTION_INFO } from '@/components/budget/sectionInfo';

const STATUS_LABEL: Record<MonthStatus, string> = {
  current: 'Current',
  forecast: 'Forecast',
  closed: 'Closed',
};

function statusBadgeVariant(status: MonthStatus) {
  if (status === 'current') return 'default' as const;
  if (status === 'forecast') return 'secondary' as const;
  return 'outline' as const;
}

export default function BudgetPage() {
  const debts = useDebtStore((s) => s.debts);
  const settings = useDebtStore((s) => s.settings);
  const debtsHydrated = useDebtStore((s) => s._hasHydrated);

  const chain = useBudgetStore((s) => s.chain);
  const selectedKey = useBudgetStore((s) => s.selectedKey);
  const pendingTransitionFrom = useBudgetStore((s) => s.pendingTransitionFrom);
  const budgetHydrated = useBudgetStore((s) => s._hasHydrated);
  const ensureChain = useBudgetStore((s) => s.ensureChain);
  const selectMonth = useBudgetStore((s) => s.selectMonth);
  const updateLineAmount = useBudgetStore((s) => s.updateLineAmount);
  const addLine = useBudgetStore((s) => s.addLine);
  const removeLine = useBudgetStore((s) => s.removeLine);
  const dismissTransition = useBudgetStore((s) => s.dismissTransition);
  const reviewTransition = useBudgetStore((s) => s.reviewTransition);

  const [newIncomeName, setNewIncomeName] = useState('');
  const [newExpenseName, setNewExpenseName] = useState('');

  // Seed / roll over / sync on open and whenever the live debts or
  // plan settings change underneath the chain.
  useEffect(() => {
    if (!debtsHydrated || !budgetHydrated) return;
    ensureChain(debts, settings);
  }, [debts, settings, debtsHydrated, budgetHydrated, ensureChain]);

  const monthKeys = useMemo(
    () => (chain ? Object.keys(chain.months).sort() : []),
    [chain]
  );
  const month = chain && selectedKey ? chain.months[selectedKey] : undefined;

  const showBanner =
    !!chain &&
    !!pendingTransitionFrom &&
    chain.transitionNoticeFor !== chain.currentKey;

  if (!chain || !month) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Monthly Budget"
          description="Rolling months: a Current month, a Forecast ahead of it, and Closed history."
        />
        <p className="text-sm text-muted-foreground">Loading your months…</p>
      </div>
    );
  }

  const readOnly = month.status === 'closed';
  const totalIncome = sumLines(month.incomeLines);
  const totalExpenses = sumLines(month.expenseLines);
  const available = Math.round((totalIncome - totalExpenses) * 100) / 100;
  const surplus = monthSurplus(month, debts);
  const monthDebts = debts.filter((d) => (month.debtOpenings[d.id] ?? 0) > 0);

  const lineRow = (section: 'income' | 'expense', line: BudgetLine) => (
    <div key={line.id} className="flex items-center gap-2">
      <span className="flex-1 text-sm truncate">{line.name}</span>
      {line.category && (
        <span className="hidden sm:block text-xs text-muted-foreground">{line.category}</span>
      )}
      <div className="w-32">
        <StableNumberInput
          value={line.amount}
          disabled={readOnly}
          aria-label={`${line.name} amount`}
          onCommit={(val) =>
            updateLineAmount(month.key, section, line.id, val, debts, settings)
          }
        />
      </div>
      {!readOnly && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          aria-label={`Remove ${line.name}`}
          onClick={() => removeLine(month.key, section, line.id, debts, settings)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );

  const addRow = (
    section: 'income' | 'expense',
    value: string,
    setValue: (v: string) => void,
    placeholder: string
  ) =>
    !readOnly && (
      <div className="flex items-center gap-2 pt-1">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            addLine(month.key, section, value, debts, settings);
            setValue('');
          }}
        >
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </div>
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Monthly Budget"
        description="One budget and one payoff plan, tied together: each month's surplus becomes the extra that attacks your debts, and the months roll forward on their own."
      />

      {showBanner && (
        <TransitionBanner
          chain={chain}
          fromKey={pendingTransitionFrom!}
          onDismiss={dismissTransition}
          onReview={reviewTransition}
        />
      )}

      {/* Rolling months nav */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rolling months</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Months roll forward on their own: when a new month begins, the current month
            closes and freezes, the forecast becomes current, and a new forecast is
            generated with balances and surplus carried over.
          </p>
          <SectionExplain info={SECTION_INFO.rollover} />
          <div className="flex flex-wrap gap-2" role="navigation" aria-label="All months in the chain">
            {monthKeys.map((key) => {
              const m = chain.months[key];
              const active = key === month.key;
              return (
                <Button
                  key={key}
                  type="button"
                  variant={active ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => selectMonth(key)}
                  className="gap-2"
                >
                  {monthLabelOf(key)}
                  <Badge variant={statusBadgeVariant(m.status)}>
                    {STATUS_LABEL[m.status]}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected month */}
      <div className="flex items-center gap-3">
        <h2 className="font-heading font-bold text-xl">{monthLabelOf(month.key)}</h2>
        <Badge variant={statusBadgeVariant(month.status)}>
          {STATUS_LABEL[month.status]}
        </Badge>
        {readOnly && (
          <span className="text-xs text-muted-foreground">
            Closed months are read-only history.
          </span>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total income', value: totalIncome },
          { label: 'Total expenses', value: totalExpenses },
          { label: 'Available for debt', value: available },
          { label: 'Surplus (starting extra next month)', value: surplus },
        ].map((t) => (
          <Card key={t.label}>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">{t.label}</p>
              <p className="font-heading font-bold text-lg">{formatCurrencyCents(t.value)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {month.startingExtra > 0 && (
        <p className="text-sm text-muted-foreground -mt-3">
          Starting extra for debt (prior month's surplus carried in):{' '}
          {formatCurrencyCents(month.startingExtra)}
        </p>
      )}

      {/* Income */}
      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="text-base">Income</CardTitle>
          <SectionExplain info={SECTION_INFO.income} />
        </CardHeader>
        <CardContent className="space-y-2">
          {month.incomeLines.map((l) => lineRow('income', l))}
          {addRow('income', newIncomeName, setNewIncomeName, 'New income source')}
          <p className="text-sm font-medium pt-1">
            Total income: {formatCurrencyCents(totalIncome)}
          </p>
        </CardContent>
      </Card>

      {/* Expenses */}
      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="text-base">Expenses</CardTitle>
          <SectionExplain info={SECTION_INFO.expenses} />
        </CardHeader>
        <CardContent className="space-y-2">
          {month.expenseLines.map((l) => lineRow('expense', l))}
          {addRow('expense', newExpenseName, setNewExpenseName, 'New expense')}
          <p className="text-sm font-medium pt-1">
            Total expenses: {formatCurrencyCents(totalExpenses)}
          </p>
        </CardContent>
      </Card>

      {/* Debts */}
      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="text-base">Debts</CardTitle>
          <SectionExplain info={SECTION_INFO.debts} />
        </CardHeader>
        <CardContent className="space-y-2">
          {monthDebts.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No debts with a balance this month.
            </p>
          )}
          {monthDebts.map((d) => (
            <div key={d.id} className="flex items-center gap-2 text-sm">
              <span className="flex-1 truncate">{d.creditorName}</span>
              {isPayoffExcluded(d) && (
                <Badge variant="outline" className="shrink-0">
                  Line item — never ranked
                </Badge>
              )}
              <span className="w-20 text-right text-muted-foreground">
                {formatPercent(d.apr)} APR
              </span>
              <span className="w-24 text-right text-muted-foreground">
                min {formatCurrencyCents(d.minPayment)}
              </span>
              <span className="w-28 text-right font-medium">
                {formatCurrencyCents(month.debtOpenings[d.id])}
              </span>
            </div>
          ))}
          <p className="text-sm text-muted-foreground pt-1">
            Balances shown are this month's opening balances. Edit debts themselves on
            the Debts page; the Current month and the Forecast update from there.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
