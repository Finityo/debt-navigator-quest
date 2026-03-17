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
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: 'hsl(220 10% 46%)' }}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'hsl(220 10% 46%)' }}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          width={50}
        />
        <Tooltip
          formatter={(value: number) => [formatCurrency(value), 'Balance']}
          contentStyle={{
            borderRadius: '8px',
            border: '1px solid hsl(220 13% 91%)',
            fontSize: '12px',
          }}
        />
        <Line
          type="monotone"
          dataKey="balance"
          stroke="hsl(162 63% 41%)"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4, fill: 'hsl(162 63% 41%)' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
