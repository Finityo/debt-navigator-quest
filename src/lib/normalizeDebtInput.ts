import type { EnginDebt } from '@/types/plan';

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function normalizeDebtInput(debts: any[]): EnginDebt[] {
  return debts.map((d) => {
    const apr =
      d.apr > 1
        ? round2(d.apr)
        : round2(d.apr * 100);

    const minimum =
      d.minimum ??
      d.minPayment ??
      0;

    const balance = round2(Number(d.balance ?? 0));

    if (balance < 0) {
      throw new Error(`INVALID BALANCE: ${d.id}`);
    }

    if (apr < 0) {
      throw new Error(`INVALID APR: ${d.id}`);
    }

    return {
      id: String(d.id),
      name: d.name ?? d.creditorName ?? "Unknown",
      balance,
      apr,
      minimum: round2(minimum),
      dueDay: d.dueDay ?? 1,
    };
  });
}
