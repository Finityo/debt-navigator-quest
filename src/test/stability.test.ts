// ============================================
// Finityo — Stability Tests (Milestone 3)
// ============================================

import { describe, it, expect } from 'vitest';
import { runEngine } from '@/lib/computeDebtPlan';
import { computeDebtPlan } from '@/lib/computeDebtPlan';
import { normalizeDebtInput } from '@/lib/normalizeDebtInput';
import type { Debt, PlanSettings, ExtraPayment } from '@/types/debt';

// ─── Shared Fixtures ──────────────────────────────────

const fixedDebts: Debt[] = [
  { id: 'd1', creditorName: 'Visa', balance: 3000, apr: 0.219, minPayment: 80, type: 'credit_card', startDate: '2025-01-01', notes: '' },
  { id: 'd2', creditorName: 'MC', balance: 1500, apr: 0.179, minPayment: 40, type: 'credit_card', startDate: '2025-01-01', notes: '' },
  { id: 'd3', creditorName: 'Auto', balance: 8000, apr: 0.069, minPayment: 250, type: 'auto_loan', startDate: '2025-01-01', notes: '' },
];

const fixedSettings: PlanSettings = { method: 'avalanche', startDate: '2025-04-01', monthsHorizon: 60 };

const fixedExtras: ExtraPayment[] = [
  { monthNumber: 1, date: '2025-04-01', extraAmount: 150 },
  { monthNumber: 6, date: '2025-09-01', extraAmount: 300 },
];

// ─── TASK 1: Hydration Consistency ────────────────────

describe('Hydration consistency', () => {
  it('produces identical results on recompute with same inputs', () => {
    const result1 = computeDebtPlan(fixedDebts, fixedSettings, fixedExtras);
    const result2 = computeDebtPlan(fixedDebts, fixedSettings, fixedExtras);

    expect(result1.totalInterestPaid).toBe(result2.totalInterestPaid);
    expect(result1.totalPaid).toBe(result2.totalPaid);
    expect(result1.payoffMonth).toBe(result2.payoffMonth);
    expect(result1.monthlySummaries.length).toBe(result2.monthlySummaries.length);

    for (let i = 0; i < result1.monthlySummaries.length; i++) {
      expect(result1.monthlySummaries[i].totalPaid).toBe(result2.monthlySummaries[i].totalPaid);
      expect(result1.monthlySummaries[i].totalEndingDebt).toBe(result2.monthlySummaries[i].totalEndingDebt);
    }
  });
});

// ─── TASK 2: Store ↔ Engine Consistency ───────────────

describe('Store ↔ Engine consistency', () => {
  it('computeDebtPlan totals match runEngine totals', () => {
    const engineDebts = normalizeDebtInput(fixedDebts);
    const extraByMonth = new Map<number, number>();
    for (const ep of fixedExtras) {
      extraByMonth.set(ep.monthNumber, (extraByMonth.get(ep.monthNumber) ?? 0) + ep.extraAmount);
    }

    const engineResult = runEngine(engineDebts, fixedSettings.method, fixedSettings.startDate, fixedSettings.monthsHorizon, extraByMonth);
    const legacyResult = computeDebtPlan(fixedDebts, fixedSettings, fixedExtras);

    expect(legacyResult.totalInterestPaid).toBeCloseTo(engineResult.totalInterestPaid, 2);
    expect(legacyResult.monthlySummaries.length).toBe(engineResult.monthlySummaries.length);

    // Payoff month consistency
    const enginePayoffMonth = engineResult.monthlySummaries.length;
    if (legacyResult.payoffMonth !== null) {
      expect(legacyResult.payoffMonth).toBeLessThanOrEqual(enginePayoffMonth);
    }
  });
});

// ─── TASK 3: Scenario Switching ───────────────────────

describe('Scenario switching', () => {
  it('snowball and avalanche produce different payoff orders', () => {
    const snowball = computeDebtPlan(fixedDebts, { ...fixedSettings, method: 'snowball' }, fixedExtras);
    const avalanche = computeDebtPlan(fixedDebts, { ...fixedSettings, method: 'avalanche' }, fixedExtras);

    const snowOrder = snowball.payoffOrder.map(p => p.debtId);
    const avaOrder = avalanche.payoffOrder.map(p => p.debtId);

    // They should differ in ordering (MC has lower balance but Visa has higher APR)
    expect(snowOrder).not.toEqual(avaOrder);
    // Interest totals should differ
    expect(snowball.totalInterestPaid).not.toBe(avalanche.totalInterestPaid);
  });

  it('adding extra payments reduces interest and speeds payoff', () => {
    const noExtras = computeDebtPlan(fixedDebts, fixedSettings, []);
    const withExtras = computeDebtPlan(fixedDebts, fixedSettings, fixedExtras);

    expect(withExtras.totalInterestPaid).toBeLessThan(noExtras.totalInterestPaid);

    if (withExtras.payoffMonth !== null && noExtras.payoffMonth !== null) {
      expect(withExtras.payoffMonth).toBeLessThanOrEqual(noExtras.payoffMonth);
    }
  });
});

// ─── TASK 4: Persistence Integrity ────────────────────

describe('Persistence integrity', () => {
  it('recomputing with same debts and extras produces unchanged totals', () => {
    const debts = [...fixedDebts];
    const extras = [...fixedExtras];

    const result1 = computeDebtPlan(debts, fixedSettings, extras);

    // Simulate "reload" — fresh copies
    const debts2 = JSON.parse(JSON.stringify(fixedDebts)) as Debt[];
    const extras2 = JSON.parse(JSON.stringify(fixedExtras)) as ExtraPayment[];

    const result2 = computeDebtPlan(debts2, fixedSettings, extras2);

    expect(result2.totalInterestPaid).toBe(result1.totalInterestPaid);
    expect(result2.totalPaid).toBe(result1.totalPaid);
    expect(result2.payoffMonth).toBe(result1.payoffMonth);
    expect(result2.debtSnapshots.length).toBe(result1.debtSnapshots.length);
  });
});

// ─── TASK 5: Input Path Consistency ───────────────────

describe('Input path consistency', () => {
  it('manual, CSV-like, and Plaid-like inputs normalize identically', () => {
    // Manual format (legacy Debt shape)
    const manual = [{ id: 'x1', creditorName: 'TestCard', balance: 2000, apr: 0.199, minPayment: 50, type: 'credit_card', startDate: '2025-01-01', notes: '' }];

    // CSV-like (flat, different field names)
    const csv = [{ id: 'x1', name: 'TestCard', balance: 2000, apr: 0.199, minimum: 50 }];

    // Plaid-like (percentage APR, minPayment field)
    const plaid = [{ id: 'x1', name: 'TestCard', balance: 2000, apr: 19.9, minPayment: 50 }];

    const normManual = normalizeDebtInput(manual);
    const normCsv = normalizeDebtInput(csv);
    const normPlaid = normalizeDebtInput(plaid);

    // All should produce same engine debt
    expect(normManual[0].apr).toBe(normCsv[0].apr);
    expect(normCsv[0].apr).toBe(normPlaid[0].apr);
    expect(normManual[0].balance).toBe(normCsv[0].balance);
    expect(normManual[0].minimum).toBe(normCsv[0].minimum);

    // Engine results should be identical
    const settings: PlanSettings = { method: 'snowball', startDate: '2025-01-01', monthsHorizon: 60 };
    const r1 = runEngine(normManual, 'snowball', '2025-01-01', 60);
    const r2 = runEngine(normCsv, 'snowball', '2025-01-01', 60);
    const r3 = runEngine(normPlaid, 'snowball', '2025-01-01', 60);

    expect(r1.totalInterestPaid).toBe(r2.totalInterestPaid);
    expect(r2.totalInterestPaid).toBe(r3.totalInterestPaid);
    expect(r1.monthlySummaries.length).toBe(r2.monthlySummaries.length);
    expect(r2.monthlySummaries.length).toBe(r3.monthlySummaries.length);
  });
});

// ─── TASK 6: No Duplicate State ───────────────────────

describe('No duplicate state', () => {
  it('multiple computations do not create duplicate snapshots', () => {
    const result1 = computeDebtPlan(fixedDebts, fixedSettings, fixedExtras);
    const result2 = computeDebtPlan(fixedDebts, fixedSettings, fixedExtras);

    // Snapshot counts must be identical (no accumulation)
    expect(result1.debtSnapshots.length).toBe(result2.debtSnapshots.length);
    expect(result1.monthlySummaries.length).toBe(result2.monthlySummaries.length);

    // No duplicate debt IDs within any single month
    for (const ms of result1.monthlySummaries) {
      const snapsForMonth = result1.debtSnapshots.filter(s => s.monthNumber === ms.monthNumber);
      const ids = snapsForMonth.map(s => s.debtId);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    }
  });
});
