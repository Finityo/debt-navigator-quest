// ==========================================================
//  R01 validation corrections: F-1 same-month cascade and
//  F-2 deterministic tie-breakers (added Nov 21, 2026).
//
//  F-1: when a minimum is clamped by the amount due, the unused
//  part of that minimum joins the SAME month's extra pool
//  (directive FINITYO-ENGINE-VALIDATION-2026-11-21-R01, Section 5).
//  Freed minimums proper still roll to the following month (R5).
//
//  F-2: priority is set from month-opening values with
//  deterministic tie-breakers (Section 1): snowball = balance
//  asc, APR desc, id asc; avalanche = APR desc, balance asc,
//  id asc. The same inputs in a different entry order must
//  produce the same plan.
// ==========================================================

import { describe, test, expect } from 'vitest';
import { computeDebtPlan } from '@/lib/computeDebtPlan';
import type { Debt, ExtraPayment, PlanSettings } from '@/types/debt';

const D = (id: string, balance: number, apr: number, minPayment: number): Debt => ({
  id, creditorName: id, balance, apr, minPayment,
  type: 'credit_card', startDate: '2026-11-30', notes: '',
});
const S = (method: 'snowball' | 'avalanche', monthsHorizon = 24): PlanSettings => ({
  method, startDate: '2026-11-30', monthsHorizon,
});
const X = (monthNumber: number, extraAmount: number): ExtraPayment => ({
  monthNumber, date: '2026-11-01', extraAmount,
});
const snap = (plan: ReturnType<typeof computeDebtPlan>, m: number, id: string) =>
  plan.debtSnapshots.find((s) => s.monthNumber === m && s.debtId === id);

describe('F-1: same-month cascade of capped-minimum surplus', () => {
  test('the unused part of a clamped minimum reaches the next debt in the same month', () => {
    // A owes $40 with a $100 minimum; B owes $1,000 with a $50 minimum.
    const plan = computeDebtPlan([D('a', 40, 0, 100), D('b', 1000, 0, 50)], S('snowball'), []);
    expect(snap(plan, 1, 'a')?.paymentApplied).toBe(40);
    // B: $50 minimum + $60 surplus cascaded in month 1 (was $50 before the fix)
    expect(snap(plan, 1, 'b')?.minPaid).toBe(50);
    expect(snap(plan, 1, 'b')?.extraApplied).toBe(60);
    expect(snap(plan, 1, 'b')?.paymentApplied).toBe(110);
    // Month 2: A's freed minimum ($100) joins per R5, B pays $150.
    expect(snap(plan, 2, 'b')?.paymentApplied).toBe(150);
    // Whole plan still reconciles: $1,040 principal, $0 interest.
    expect(plan.totalPaid).toBe(1040);
    expect(plan.totalInterestPaid).toBe(0);
    expect(plan.payoffMonth).toBe(7);
  });

  test('surplus is computed after interest accrues', () => {
    // A: $90 at 12% -> interest $0.90, amount due $90.90, minimum $100
    // clamps to $90.90, surplus $9.10 cascades to B in month 1.
    const plan = computeDebtPlan([D('a', 90, 0.12, 100), D('b', 500, 0, 50)], S('snowball'), []);
    expect(snap(plan, 1, 'a')?.paymentApplied).toBe(90.9);
    expect(snap(plan, 1, 'b')?.extraApplied).toBe(9.1);
    expect(snap(plan, 1, 'b')?.paymentApplied).toBe(59.1);
  });

  test('no surplus is invented when minimums are not clamped', () => {
    // Ordinary month: minimums below balances, no extras scheduled.
    const plan = computeDebtPlan([D('a', 500, 0, 50), D('b', 1000, 0, 50)], S('snowball'), []);
    expect(snap(plan, 1, 'a')?.extraApplied).toBe(0);
    expect(snap(plan, 1, 'b')?.extraApplied).toBe(0);
  });
});

describe('F-2: deterministic tie-breakers', () => {
  test('snowball tie on balance: higher APR receives the extra first', () => {
    const debts = [D('t-low', 1000, 0.10, 40), D('t-high', 1000, 0.20, 40)];
    const plan = computeDebtPlan(debts, S('snowball'), [X(1, 100)]);
    expect(snap(plan, 1, 't-high')?.extraApplied).toBe(100);
    expect(snap(plan, 1, 't-low')?.extraApplied).toBe(0);
  });

  test('snowball tie result does not depend on entry order', () => {
    const forward = computeDebtPlan([D('t-low', 1000, 0.10, 40), D('t-high', 1000, 0.20, 40)], S('snowball'), [X(1, 100)]);
    const reversed = computeDebtPlan([D('t-high', 1000, 0.20, 40), D('t-low', 1000, 0.10, 40)], S('snowball'), [X(1, 100)]);
    expect(reversed.totalInterestPaid).toBe(forward.totalInterestPaid);
    expect(reversed.totalPaid).toBe(forward.totalPaid);
    expect(snap(reversed, 1, 't-high')?.extraApplied).toBe(100);
  });

  test('avalanche tie on APR: smaller balance receives the extra first', () => {
    const debts = [D('b-big', 2000, 0.15, 50), D('b-small', 500, 0.15, 25)];
    const plan = computeDebtPlan(debts, S('avalanche'), [X(1, 100)]);
    expect(snap(plan, 1, 'b-small')?.extraApplied).toBe(100);
    expect(snap(plan, 1, 'b-big')?.extraApplied).toBe(0);
  });

  test('avalanche tie result does not depend on entry order', () => {
    const forward = computeDebtPlan([D('b-big', 2000, 0.15, 50), D('b-small', 500, 0.15, 25)], S('avalanche'), [X(1, 100)]);
    const reversed = computeDebtPlan([D('b-small', 500, 0.15, 25), D('b-big', 2000, 0.15, 50)], S('avalanche'), [X(1, 100)]);
    expect(reversed.totalInterestPaid).toBe(forward.totalInterestPaid);
    expect(snap(reversed, 1, 'b-small')?.extraApplied).toBe(100);
  });
});
