// ============================================
// Finityo — Engine Validation Tests (Milestone 1)
// ============================================
//
// 5 Golden Tests + structural integrity + legacy adapter tests

import { describe, it, expect } from 'vitest';
import { runEngine } from '@/lib/computeDebtPlan';
import { computeDebtPlan } from '@/lib/computeDebtPlan';
import { normalizeDebtInput } from '@/lib/normalizeDebtInput';
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

// ─── PATCH 3 — Payment Identity Test ─────────────────

describe('Payment Identity — paymentApplied === interest + principal', () => {
  it('payment equals interest + principal for every snapshot', () => {
    const debts: EnginDebt[] = [
      { id: 't1', name: 'Test', balance: 1000, apr: 20, minimum: 100, dueDay: 1 },
    ];
    const result = runEngine(debts, 'snowball', '2025-01-01', 24);
    for (const ms of result.monthlySummaries) {
      for (const snap of ms.debtSnapshots) {
        expect(snap.paymentApplied).toBeCloseTo(
          snap.interestAccrued + snap.principalPaid,
          2
        );
      }
    }
  });
});

// ─── PATCH 5 — Rollover Validation Test ──────────────

describe('Rollover Validation — freed minimum deferred', () => {
  it('freed minimum is NOT applied in same month as payoff', () => {
    const debts: EnginDebt[] = [
      { id: 'd1', name: 'Small', balance: 100, apr: 10, minimum: 100, dueDay: 1 },
      { id: 'd2', name: 'Big', balance: 2000, apr: 10, minimum: 50, dueDay: 1 },
    ];
    const result = runEngine(debts, 'snowball', '2025-01-01', 12);
    let payoffMonth = -1;
    result.monthlySummaries.forEach((ms, i) => {
      const paidOff = ms.debtSnapshots.find(
        (s) => s.debtId === 'd1' && s.endingBalance === 0
      );
      if (paidOff && payoffMonth === -1) payoffMonth = i;
    });

    if (payoffMonth >= 0 && payoffMonth + 1 < result.monthlySummaries.length) {
      const sameMonth = result.monthlySummaries[payoffMonth];
      const nextMonth = result.monthlySummaries[payoffMonth + 1];
      const sameExtra = sameMonth.debtSnapshots.reduce((s, d) => s + d.extraApplied, 0);
      const nextExtra = nextMonth.debtSnapshots.reduce((s, d) => s + d.extraApplied, 0);
      expect(nextExtra).toBeGreaterThanOrEqual(sameExtra);
    }
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

// ─── Milestone 2 — Input Normalization Tests ──────────

describe('Input normalization', () => {
  it('converts decimal APR to percentage', () => {
    const input = [{ id: '1', balance: 1000, apr: 0.2, minimum: 50 }];
    const result = normalizeDebtInput(input);
    expect(result[0].apr).toBe(20);
  });

  it('keeps percentage APR unchanged', () => {
    const input = [{ id: '1', balance: 1000, apr: 20, minimum: 50 }];
    const result = normalizeDebtInput(input);
    expect(result[0].apr).toBe(20);
  });

  it('defaults missing minimum to 0', () => {
    const input = [{ id: '1', balance: 1000, apr: 20 }];
    const result = normalizeDebtInput(input);
    expect(result[0].minimum).toBe(0);
  });

  it('throws on negative balance', () => {
    expect(() =>
      normalizeDebtInput([{ id: '1', balance: -100, apr: 20 }])
    ).toThrow();
  });

  it('rounds all numeric inputs', () => {
    const input = [{ id: '1', balance: 1000.555, apr: 20.123, minimum: 50.789 }];
    const result = normalizeDebtInput(input);
    expect(result[0].balance).toBe(1000.56);
    expect(result[0].apr).toBe(20.12);
    expect(result[0].minimum).toBe(50.79);
  });

  it('reads creditorName when name is missing', () => {
    const input = [{ id: '1', creditorName: 'Chase', balance: 500, apr: 15, minimum: 25 }];
    const result = normalizeDebtInput(input);
    expect(result[0].name).toBe('Chase');
  });

  it('reads minPayment when minimum is missing', () => {
    const input = [{ id: '1', balance: 500, apr: 15, minPayment: 30 }];
    const result = normalizeDebtInput(input);
    expect(result[0].minimum).toBe(30);
  });
});
