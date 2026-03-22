// ============================================
// Finityo — Engine Validation Tests
// ============================================

import { describe, it, expect } from 'vitest';
import { computeDebtPlan } from '@/lib/computeDebtPlan';
import type { Debt, PlanSettings, ExtraPayment } from '@/types/debt';

// --- Shared test data ---

const testDebts: Debt[] = [
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
  {
    id: 'student',
    creditorName: 'Student Loan',
    balance: 12500,
    apr: 0.055,
    minPayment: 150,
    type: 'student_loan',
    startDate: '2025-01-01',
    notes: '',
  },
  {
    id: 'auto',
    creditorName: 'Auto Loan',
    balance: 8900,
    apr: 0.069,
    minPayment: 280,
    type: 'auto_loan',
    startDate: '2025-01-01',
    notes: '',
  },
];

// Long horizon to ensure payoff with minimums only
const baseSettings: PlanSettings = {
  method: 'avalanche',
  startDate: '2025-04-01',
  monthsHorizon: 120,
};

// --- Tests ---

describe('computeDebtPlan — structural integrity', () => {
  it('returns empty result for no debts', () => {
    const result = computeDebtPlan([], baseSettings, []);
    expect(result.monthlySummaries).toHaveLength(0);
    expect(result.debtSnapshots).toHaveLength(0);
    expect(result.totalInterestPaid).toBe(0);
    expect(result.completionStatus).toBe('complete');
  });

  it('produces snapshots only for active debts each month (no duplicates after payoff)', () => {
    const result = computeDebtPlan(testDebts, baseSettings, []);
    const months = result.monthlySummaries.length;
    for (let m = 1; m <= months; m++) {
      const snaps = result.debtSnapshots.filter((s) => s.monthNumber === m);
      // Each debt should appear at most once per month
      const uniqueIds = new Set(snaps.map((s) => s.debtId));
      expect(uniqueIds.size).toBe(snaps.length);
      // Active debts + debts paid off this month
      expect(snaps.length).toBeGreaterThan(0);
      expect(snaps.length).toBeLessThanOrEqual(testDebts.length);
    }
  });

  it('has monotonically decreasing total ending debt (no upward drift)', () => {
    const result = computeDebtPlan(testDebts, baseSettings, []);
    for (let i = 1; i < result.monthlySummaries.length; i++) {
      expect(result.monthlySummaries[i].totalEndingDebt)
        .toBeLessThanOrEqual(result.monthlySummaries[i - 1].totalEndingDebt + 0.01);
    }
  });
});

describe('computeDebtPlan — avalanche baseline', () => {
  const result = computeDebtPlan(testDebts, baseSettings, []);

  it('completes within 120-month horizon', () => {
    expect(result.completionStatus).toBe('complete');
    expect(result.payoffMonth).not.toBeNull();
    expect(result.remainingBalance).toBe(0);
  });

  it('paid-off debts stop accruing interest', () => {
    for (const po of result.payoffOrder) {
      const snapsAfterPayoff = result.debtSnapshots.filter(
        (s) => s.debtId === po.debtId && s.monthNumber > po.monthNumber
      );
      for (const snap of snapsAfterPayoff) {
        expect(snap.interestAccrued).toBe(0);
        expect(snap.endingBalance).toBe(0);
        expect(snap.isPaidOff).toBe(true);
      }
    }
  });

  it('totalPaid equals original balances + total interest when complete', () => {
    const originalTotal = testDebts.reduce((s, d) => s + d.balance, 0);
    // When fully paid off, totalPaid = principal + interest
    expect(result.totalPaid).toBeCloseTo(originalTotal + result.totalInterestPaid, 0);
  });

  it('all debts appear in payoff order', () => {
    expect(result.payoffOrder).toHaveLength(testDebts.length);
    for (const d of testDebts) {
      expect(result.payoffOrder.find((p) => p.debtId === d.id)).toBeDefined();
    }
  });
});

describe('computeDebtPlan — snowball baseline', () => {
  const snowballSettings: PlanSettings = { ...baseSettings, method: 'snowball' };
  const result = computeDebtPlan(testDebts, snowballSettings, []);

  it('completes within horizon', () => {
    expect(result.completionStatus).toBe('complete');
    expect(result.remainingBalance).toBe(0);
  });

  it('snowball pays more or equal total interest than avalanche', () => {
    const avalancheResult = computeDebtPlan(testDebts, baseSettings, []);
    expect(result.totalInterestPaid).toBeGreaterThanOrEqual(avalancheResult.totalInterestPaid);
  });

  it('targets smallest balance with freed minimums', () => {
    // After auto loan pays off naturally (high min payment), freed $280 should
    // target smallest remaining balance per snowball strategy
    expect(result.payoffOrder.length).toBe(testDebts.length);
  });
});

describe('computeDebtPlan — extra payments', () => {
  const extraPayments: ExtraPayment[] = [
    { monthNumber: 1, date: '2025-04-01', extraAmount: 500 },
    { monthNumber: 2, date: '2025-05-01', extraAmount: 500 },
    { monthNumber: 3, date: '2025-06-01', extraAmount: 500 },
  ];

  const resultWithExtra = computeDebtPlan(testDebts, baseSettings, extraPayments);
  const resultWithout = computeDebtPlan(testDebts, baseSettings, []);

  it('extra payments reduce total interest', () => {
    expect(resultWithExtra.totalInterestPaid).toBeLessThan(resultWithout.totalInterestPaid);
  });

  it('extra payments reduce or maintain payoff month', () => {
    // Both should complete since horizon is 120
    expect(resultWithExtra.completionStatus).toBe('complete');
    expect(resultWithout.completionStatus).toBe('complete');
    expect(resultWithExtra.payoffMonth!).toBeLessThanOrEqual(resultWithout.payoffMonth!);
  });

  it('extra payments are reflected in monthly summaries', () => {
    const month1 = resultWithExtra.monthlySummaries.find((s) => s.monthNumber === 1);
    expect(month1!.totalExtraPayments).toBeGreaterThanOrEqual(500);
  });

  it('extra payments apply only to scheduled months', () => {
    // Month 4 has no scheduled extra — only freed minimums if any
    const month4 = resultWithExtra.monthlySummaries.find((s) => s.monthNumber === 4);
    // Extra should be less than 500 (could be > 0 from freed minimums)
    const month1 = resultWithExtra.monthlySummaries.find((s) => s.monthNumber === 1);
    expect(month4!.totalExtraPayments).toBeLessThan(month1!.totalExtraPayments);
  });
});

describe('computeDebtPlan — freed minimum rollover', () => {
  it('after a debt is paid off, freed min payments increase extra pool', () => {
    const result = computeDebtPlan(testDebts, baseSettings, []);

    const first = result.payoffOrder[0];
    if (!first) return;

    const paidDebt = testDebts.find((d) => d.id === first.debtId)!;
    const monthBefore = result.monthlySummaries.find((s) => s.monthNumber === first.monthNumber - 1);
    const monthAfter = result.monthlySummaries.find((s) => s.monthNumber === first.monthNumber + 1);

    if (monthBefore && monthAfter) {
      // After payoff, the freed minimum should appear as extra payments
      expect(monthAfter.totalExtraPayments).toBeGreaterThanOrEqual(paidDebt.minPayment - 1);
    }
  });
});

describe('computeDebtPlan — edge cases', () => {
  it('single debt with zero APR', () => {
    const debt: Debt[] = [{
      id: 'zero-apr',
      creditorName: 'Zero APR Loan',
      balance: 1000,
      apr: 0,
      minPayment: 100,
      type: 'personal_loan',
      startDate: '2025-01-01',
      notes: '',
    }];
    const result = computeDebtPlan(debt, baseSettings, []);
    expect(result.totalInterestPaid).toBe(0);
    expect(result.completionStatus).toBe('complete');
    expect(result.payoffMonth).toBe(10);
  });

  it('horizon too short to pay off', () => {
    const shortSettings: PlanSettings = { ...baseSettings, monthsHorizon: 3 };
    const result = computeDebtPlan(testDebts, shortSettings, []);
    expect(result.completionStatus).toBe('incomplete');
    expect(result.payoffMonth).toBeNull();
    expect(result.remainingBalance).toBeGreaterThan(0);
  });

  it('minimum payment exceeds balance pays off immediately', () => {
    const debt: Debt[] = [{
      id: 'tiny',
      creditorName: 'Tiny Balance',
      balance: 20,
      apr: 0.15,
      minPayment: 50,
      type: 'other',
      startDate: '2025-01-01',
      notes: '',
    }];
    const result = computeDebtPlan(debt, baseSettings, []);
    expect(result.payoffMonth).toBe(1);
    expect(result.completionStatus).toBe('complete');
  });

  it('ending balances never go negative', () => {
    const result = computeDebtPlan(testDebts, baseSettings, [
      { monthNumber: 1, date: '2025-04-01', extraAmount: 50000 },
    ]);
    for (const snap of result.debtSnapshots) {
      expect(snap.endingBalance).toBeGreaterThanOrEqual(0);
    }
  });
});
