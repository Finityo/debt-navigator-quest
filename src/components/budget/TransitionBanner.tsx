import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrencyCents } from '@/utils/format';
import { addMonthKey, monthLabelOf } from '@/lib/monthChain';
import type { MonthChain } from '@/types/budget';

interface Props {
  chain: MonthChain;
  /** The Current key before the rollover that triggered this banner. */
  fromKey: string;
  onDismiss: () => void;
  onReview: () => void;
}

/**
 * Month-transition guidance, shown once on the first open after a
 * rollover moved the chain to a new Current month. Wording follows
 * the Budget Planner's transition notice: it names what closed, what
 * became Current, and what Forecast was created, then walks the user
 * to their next step.
 */
export default function TransitionBanner({ chain, fromKey, onDismiss, onReview }: Props) {
  const newCurrentKey = chain.currentKey;
  const forecastKey = chain.forecastKey;
  const forecast = chain.months[forecastKey];

  const closedKeys: string[] = [];
  let k = fromKey;
  let guard = 0;
  while (k < newCurrentKey && guard++ < 240) {
    closedKeys.push(k);
    k = addMonthKey(k, 1);
  }

  return (
    <Card className="border-primary/50" role="region" aria-labelledby="transition-heading">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <h2 id="transition-heading" className="font-heading font-bold text-lg">
            Welcome to {monthLabelOf(newCurrentKey)}
          </h2>
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            Dismiss
          </Button>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-2">
            The planner rolled forward while you were away. Here is what just happened:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm">
            {closedKeys.map((ck) => (
              <li key={ck}>
                <strong>{monthLabelOf(ck)} is now Closed</strong> — saved as read-only
                history, frozen exactly as you left it. It will not change again.
              </li>
            ))}
            <li>
              <strong>{monthLabelOf(newCurrentKey)} is now your Current month</strong> —
              this is the month to work in now.
            </li>
            <li>
              <strong>A new Forecast, {monthLabelOf(forecastKey)}, was created</strong> —
              its income and expenses copied forward, each debt's opening balance is the
              prior month's projected ending balance, and the prior month's surplus
              carried over
              {forecast
                ? ` (${formatCurrencyCents(forecast.startingExtra)} as its starting extra for debt)`
                : ''}
              .
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-sm mb-2">Your next steps</h3>
          <ol className="list-decimal pl-5 space-y-1.5 text-sm">
            <li>
              <strong>Review {monthLabelOf(newCurrentKey)}'s income and expenses</strong> —
              check each line against what you actually expect this month.
            </li>
            <li>
              <strong>Adjust anything that changed</strong> — a new amount, a bill that
              ended, or a one-off cost. The forecast ahead updates from your corrections.
            </li>
            <li>
              <strong>Then check the {monthLabelOf(forecastKey)} forecast</strong> —
              confirm its starting balances and surplus look right, so next month's
              rollover starts from solid numbers.
            </li>
          </ol>
        </div>

        <div>
          <Button size="sm" onClick={onReview}>
            Review the new current month
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
