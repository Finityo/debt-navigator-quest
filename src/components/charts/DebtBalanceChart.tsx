import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { MonthlyPlanSummary } from '@/types/debt';
import { formatCurrency } from '@/utils/format';

interface Props {
  summaries: MonthlyPlanSummary[];
}

export function DebtBalanceChart({ summaries }: Props) {
  const data = useMemo(
    () =>
      summaries.map((s) => ({
        month: `Mo ${s.monthNumber}`,
        balance: s.totalEndingDebt,
      })),
    [summaries]
  );

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.7} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          interval="preserveStartEnd"
          axisLine={{ stroke: 'hsl(var(--border))' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          width={48}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value: number) => [formatCurrency(value), 'Balance']}
          contentStyle={{
            borderRadius: '8px',
            border: '1px solid hsl(var(--border))',
            fontSize: '12px',
            backgroundColor: 'hsl(var(--card))',
            boxShadow: '0 4px 12px -2px hsl(var(--foreground) / 0.08)',
          }}
          labelStyle={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}
        />
        <Line
          type="monotone"
          dataKey="balance"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--card))', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}