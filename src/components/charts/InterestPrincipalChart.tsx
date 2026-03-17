import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { MonthlyPlanSummary } from '@/types/debt';
import { formatCurrency } from '@/utils/format';

interface Props {
  summaries: MonthlyPlanSummary[];
}

export function InterestPrincipalChart({ summaries }: Props) {
  const data = useMemo(() => {
    // Show every Nth month to avoid overcrowding
    const step = Math.max(1, Math.floor(summaries.length / 12));
    return summaries
      .filter((_, i) => i % step === 0 || i === summaries.length - 1)
      .map((s) => ({
        month: `Mo ${s.monthNumber}`,
        interest: s.totalInterest,
        principal: Math.max(0, s.totalPaid - s.totalInterest),
      }));
  }, [summaries]);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: 'hsl(220 10% 46%)' }}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'hsl(220 10% 46%)' }}
          tickFormatter={(v) => `$${v}`}
          width={50}
        />
        <Tooltip
          formatter={(value: number, name: string) => [
            formatCurrency(value),
            name === 'interest' ? 'Interest' : 'Principal',
          ]}
          contentStyle={{
            borderRadius: '8px',
            border: '1px solid hsl(220 13% 91%)',
            fontSize: '12px',
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: '12px' }}
          formatter={(value) => (value === 'interest' ? 'Interest' : 'Principal')}
        />
        <Bar dataKey="principal" fill="hsl(162 63% 41%)" radius={[2, 2, 0, 0]} />
        <Bar dataKey="interest" fill="hsl(0 72% 51%)" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
