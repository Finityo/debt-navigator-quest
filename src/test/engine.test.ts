// ============================================
// Finityo — Engine Validation Tests (Milestone 1)
// ============================================
//
// 5 Golden Tests + structural integrity + legacy adapter tests

import { describe, it, expect } from 'vitest';
import { runEngine } from '@/lib/computeDebtPlan';
import { computeDebtPlan } from '@/lib/computeDebtPlan';
import type { EnginDebt } from '@/types/plan';
import type { Debt, PlanSettings, ExtraPayment } from '@/types/debt';

// ─── Shared Helpers ───────────────────────────────────

const baseSettings: PlanSettings = {
  method: 'avalanche',
  startDate: '2025-04-01',
  monthsHorizon: 120,
};

// ─── GOLDEN TEST 1: Single Debt Payoff ────────────────

describe('Golden 1 — Single Debt Payoff', () => {
  const debt: EnginDebt = {
    id: 'cc1',
    name: 'Credit Card',
    balance: 1000,
    apr: 18,        // 18%
    minimum: 100,
    dueDay: 15,
  };

  const result = runEngine([debt], 'snowball', '2025-01-01', 120);

  it('pays off the debt completely', () => {
    expect(result.payoffDate).not.toBe('');
    const lastSummary = result.monthlySummaries[result.monthlySummaries.length - 1];
    expect(lastSummary.remainingBalance).toBe(0);
  });

  it('charges correct total interest', () => {
    expect(result.totalInterestPaid).toBeGreaterThan(0);
    // Manual check: ~$1000 at 18% APR, $100/mo → ~11 months, ~$92 interest
    expect(result.totalInterestPaid).toBeGreaterThan(80);
    expect(result.totalInterestPaid).toBeLessThan(120);
  });

  it('payoff date is roughly 11 months out', () => {
    expect(result.monthlySummaries.length).toBeGreaterThanOrEqual(10);
    expect(result.monthlySummaries.length).toBeLessThanOrEqual(12);
  });

  it('ending balances never go negative', () => {
    for (const ms of result.monthlySummaries) {
      for (const snap of ms.debtSnapshots) {
        expect(snap.endingBalance).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

// ─── GOLDEN TEST 2: Multiple Debt Snowball ────────────

describe('Golden 2 — Multiple Debt Snowball', () => {
  const debts: EnginDebt[] = [
    { id: 'big', name: 'Big Card', balance: 5000, apr: 20, minimum: 100, dueDay: 1 },
    { id: 'small', name: 'Small Card', balance: 800, apr: 15, minimum: 50, dueDay: 1 },
    { id: 'mid', name: 'Mid Loan', balance: 2000, apr: 10, minimum: 75, dueDay: 1 },
  ];

  const result = runEngine(debts, 'snowball', '2025-01-01', 120);

  it('pays off smallest balance first', () => {
    // Find which debt's ending balance hits 0 first
    const paidOffOrder: string[] = [];
    const seen = new Set<string>();

    for (const ms of result.monthlySummaries) {
      for (const snap of ms.debtSnapshots) {
        if (snap.endingBalance === 0 && !seen.has(snap.debtId)) {
          seen.add(snap.debtId);
          paidOffOrder.push(snap.debtId);
        }
      }
    }

    expect(paidOffOrder[0]).toBe('small'); // smallest balance first
  });

  it('all debts eventually paid off', () => {
    expect(result.payoffDate).not.toBe('');
    const last = result.monthlySummaries[result.monthlySummaries.length - 1];
    expect(last.remainingBalance).toBe(0);
  });
});

// ─── GOLDEN TEST 3: Extra Payment Impact ──────────────

describe('Golden 3 — Extra Payment Impact', () => {
  const debts: EnginDebt[] = [
    { id: 'a', name: 'Card A', balance: 3000, apr: 22, minimum: 80, dueDay: 1 },
    { id: 'b', name: 'Card B', balance: 1500, apr: 16, minimum: 40, dueDay: 1 },
  ];

  const extraMap = new Map<number, number>();
  extraMap.set(1, 500);
  extraMap.set(2, 500);
  extraMap.set(3, 500);

  const resultWithExtra = runEngine(debts, 'snowball', '2025-01-01', 120, extraMap);
  const resultWithout = runEngine(debts, 'snowball', '2025-01-01', 120);

  it('extra payments reduce total interest', () => {
    expect(resultWithExtra.totalInterestPaid).toBeLessThan(resultWithout.totalInterestPaid);
  });

  it('extra payments result in earlier payoff', () => {
    expect(resultWithExtra.monthlySummaries.length).toBeLessThan(resultWithout.monthlySummaries.length);
  });
});

// ─── GOLDEN TEST 4: Edge Case — Small Balance ────────

describe('Golden 4 — Small Balance Edge Case', () => {
  const debt: EnginDebt = {
    id: 'tiny',
    name: 'Tiny Debt',
    balance: 25,
    apr: 24,
    minimum: 50,
    dueDay: 1,
  };

  const result = runEngine([debt], 'snowball', '2025-01-01', 120);

  it('pays off in 1 month (min > balance + interest)', () => {
    expect(result.monthlySummaries.length).toBe(1);
  });

  it('no negative balances', () => {
    for (const ms of result.monthlySummaries) {
      for (const snap of ms.debtSnapshots) {
        expect(snap.endingBalance).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('ending balance is exactly 0', () => {
    const last = result.monthlySummaries[0].debtSnapshots[0];
    expect(last.endingBalance).toBe(0);
  });
});

// ─── GOLDEN TEST 5: Zero APR ─────────────────────────

describe('Golden 5 — Zero APR', () => {
  const debt: EnginDebt = {
    id: 'zero',
    name: 'Zero APR Promo',
    balance: 1000,
    apr: 0,
    minimum: 100,
    dueDay: 1,
  };

  const result = runEngine([debt], 'snowball', '2025-01-01', 120);

  it('charges zero interest', () => {
    expect(result.totalInterestPaid).toBe(0);
  });

  it('every snapshot has zero interest', () => {
    for (const ms of result.monthlySummaries) {
      for (const snap of ms.debtSnapshots) {
        expect(snap.interestAccrued).toBe(0);
      }
    }
  });

  it('pays off in exactly 10 months', () => {
    expect(result.monthlySummaries.length).toBe(10);
    expect(result.payoffDate).not.toBe('');
  });
});

// ─── Legacy Adapter Tests ─────────────────────────────

describe('Legacy adapter — computeDebtPlan', () => {
  const legacyDebts: Debt[] = [
    {
      id: 'visa',
      creditorName: 'Chase Visa',
      balance: 4200,
      apr: 0.219,
      minPayment: 95,
      type: 'credit_card',
      startDate: '2025-01-01',
      notes: '',
    },
    {
      id: 'discover',
      creditorName: 'Discover Card',
      balance: 1800,
      apr: 0.179,
      minPayment: 45,
      type: 'credit_card',
      startDate: '2025-01-01',
      notes: '',
    },
  ];

  it('returns empty result for no debts', () => {
    const result = computeDebtPlan([], baseSettings, []);
    expect(result.monthlySummaries).toHaveLength(0);
    expect(result.completionStatus).toBe('complete');
  });

  it('completes within horizon', () => {
    const result = computeDebtPlan(legacyDebts, baseSettings, []);
    expect(result.completionStatus).toBe('complete');
    expect(result.payoffMonth).not.toBeNull();
    expect(result.remainingBalance).toBe(0);
  });

  it('has monotonically decreasing total ending debt', () => {
    const result = computeDebtPlan(legacyDebts, baseSettings, []);
    for (let i = 1; i < result.monthlySummaries.length; i++) {
      expect(result.monthlySummaries[i].totalEndingDebt)
        .toBeLessThanOrEqual(result.monthlySummaries[i - 1].totalEndingDebt + 0.01);
    }
  });

  it('ending balances never go negative', () => {
    const result = computeDebtPlan(legacyDebts, baseSettings, [
      { monthNumber: 1, date: '2025-04-01', extraAmount: 50000 },
    ]);
    for (const snap of result.debtSnapshots) {
      expect(snap.endingBalance).toBeGreaterThanOrEqual(0);
    }
  });

  it('snowball pays more or equal interest than avalanche', () => {
    const snowball = computeDebtPlan(legacyDebts, { ...baseSettings, method: 'snowball' }, []);
    const avalanche = computeDebtPlan(legacyDebts, baseSettings, []);
    expect(snowball.totalInterestPaid).toBeGreaterThanOrEqual(avalanche.totalInterestPaid);
  });

  it('extra payments reduce total interest', () => {
    const extras: ExtraPayment[] = [
      { monthNumber: 1, date: '2025-04-01', extraAmount: 500 },
      { monthNumber: 2, date: '2025-05-01', extraAmount: 500 },
    ];
    const withExtra = computeDebtPlan(legacyDebts, baseSettings, extras);
    const without = computeDebtPlan(legacyDebts, baseSettings, []);
    expect(withExtra.totalInterestPaid).toBeLessThan(without.totalInterestPaid);
  });

  it('all debts appear in payoff order when complete', () => {
    const result = computeDebtPlan(legacyDebts, baseSettings, []);
    expect(result.payoffOrder).toHaveLength(legacyDebts.length);
  });

  it('freed minimum rolls over to NEXT month, not same month', () => {
    const result = computeDebtPlan(legacyDebts, { ...baseSettings, method: 'snowball' }, []);
    const firstPayoff = result.payoffOrder[0];
    if (!firstPayoff) return;

    const paidDebt = legacyDebts.find((d) => d.id === firstPayoff.debtId)!;
    const monthAfter = result.monthlySummaries.find(
      (s) => s.monthNumber === firstPayoff.monthNumber + 1
    );

    if (monthAfter) {
      // Freed minimum should appear as extra in the NEXT month
      expect(monthAfter.totalExtraPayments).toBeGreaterThanOrEqual(paidDebt.minPayment - 1);
    }
  });
});
