import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { MonthlyPlanSummary } from '@/types/debt';
import { formatCurrency } from '@/utils/format';

interface Props {
  summaries: MonthlyPlanSummary[];
}

export function InterestPrincipalChart({ summaries }: Props) {
  const data = useMemo(() => {
    const step = Math.max(1, Math.floor(summaries.length / 12));
    return summaries
      .filter((_, i) => i % step === 0 || i === summaries.length - 1)
      .map((s) => ({
        month: `Month ${s.monthNumber}`,
        interest: s.totalInterest,
        principal: s.totalPrincipal,
      }));
  }, [summaries]);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.7} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={{ stroke: 'hsl(var(--border))' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          tickFormatter={(v) => `$${v}`}
          width={48}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value: number, name: string) => [
            formatCurrency(value),
            name === 'interest' ? 'Interest' : 'Principal',
          ]}
          contentStyle={{
            borderRadius: '8px',
            border: '1px solid hsl(var(--border))',
            fontSize: '12px',
            backgroundColor: 'hsl(var(--card))',
            boxShadow: '0 4px 12px -2px hsl(var(--foreground) / 0.08)',
          }}
          labelStyle={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}
        />
        <Legend
          wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
          formatter={(value) => (value === 'interest' ? 'Interest' : 'Principal')}
        />
        <Bar dataKey="principal" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
        <Bar dataKey="interest" fill="hsl(var(--destructive))" radius={[3, 3, 0, 0]} opacity={0.7} />
      </BarChart>
    </ResponsiveContainer>
  );
}