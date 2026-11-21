// ==========================================================
//  Negative-amortization regression tests
//  Added Nov 20, 2026 with the signed-principal engine fix.
//
//  A debt whose minimum payment is below its monthly interest
//  must not crash the plan. Principal is signed (payment minus
//  interest accrued), the shortfall accrues to the balance, and
//  the plan reports an incomplete payoff at the horizon. Extra
//  payments can still rescue the debt.
// ==========================================================

import { describe, test, expect } from 'vitest';
import { computeDebtPlan } from '@/lib/computeDebtPlan';
import type { Debt, ExtraPayment, PlanSettings } from '@/types/debt';

const negAmDebt: Debt[] = [
  {
    id: 'negam-1',
    creditorName: 'Negative Amortization Card',
    balance: 1000,
    apr: 0.30, // 30% APR, stored as a decimal like every other entry path
    minPayment: 10, // monthly interest is $25.00, so the minimum underpays it
    type: 'credit_card',
    startDate: '2026-11-30',
    notes: '',
  },
];

const settings24: PlanSettings = {
  method: 'snowball',
  startDate: '2026-11-30',
  monthsHorizon: 24,
};

describe('Negative amortization (signed principal)', () => {
  test('month one ends at $1,015: interest accrues, shortfall capitalizes', () => {
    const plan = computeDebtPlan(negAmDebt, settings24, []);
    expect(plan.monthlySummaries[0].totalEndingDebt).toBe(1015);
  });

  test('month one principal is signed at -$15 (payment $10 - interest $25)', () => {
    const plan = computeDebtPlan(negAmDebt, settings24, []);
    const snap = plan.debtSnapshots.find((s) => s.monthNumber === 1);
    expect(snap?.interestAccrued).toBe(25);
    expect(snap?.paymentApplied).toBe(10);
    expect(snap?.principalPaid).toBe(-15);
    expect(snap?.endingBalance).toBe(1015);
  });

  test('24-month horizon completes calculation and reports an incomplete payoff', () => {
    const plan = computeDebtPlan(negAmDebt, settings24, []);
    expect(plan.monthlySummaries).toHaveLength(24);
    expect(plan.completionStatus).toBe('incomplete');
    expect(plan.payoffMonth).toBeNull();
    // Balance grows the whole horizon on minimums alone
    const last = plan.monthlySummaries[plan.monthlySummaries.length - 1];
    expect(last.totalEndingDebt).toBeGreaterThan(1000);
  });

  test('a $1,200 extra payment in month one pays the debt off immediately', () => {
    const extras: ExtraPayment[] = [
      { monthNumber: 1, date: '2026-11-30', extraAmount: 1200 },
    ];
    const plan = computeDebtPlan(negAmDebt, settings24, extras);
    expect(plan.completionStatus).toBe('complete');
    expect(plan.payoffMonth).toBe(1);
    expect(plan.remainingBalance).toBe(0);
  });
});
