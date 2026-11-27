import { describe, it, expect } from 'vitest';
import type { Debt, PlanSettings } from '@/types/debt';
import type { BudgetMonth } from '@/types/budget';
import {
  addMonthKey,
  generateForecastMonth,
  monthLabelOf,
  monthSurplus,
  runRollover,
  seedChain,
  stepDebtOpenings,
  syncForecastDerived,
} from '@/lib/monthChain';

// ============================================
// Rolling month chain — forecast generation, rollover,
// corrections flow (ported from the Budget Planner, Nov 27, 2026)
// ============================================

const debts: Debt[] = [
  {
    id: 'card-a',
    creditorName: 'Card A',
    balance: 1000,
    apr: 0.24,
    minPayment: 50,
    type: 'credit_card',
    startDate: '2026-11-01',
    notes: '',
  },
  {
    id: 'card-b',
    creditorName: 'Card B',
    balance: 500,
    apr: 0.12,
    minPayment: 25,
    type: 'credit_card',
    startDate: '2026-11-01',
    notes: '',
  },
  {
    id: 'truck',
    creditorName: 'Truck Loan',
    balance: 10000,
    apr: 0.06,
    minPayment: 300,
    type: 'auto_loan',
    startDate: '2026-11-01',
    notes: '',
  },
];

const snowball: PlanSettings = { method: 'snowball', startDate: '2026-11-01', monthsHorizon: 60 };
const avalanche: PlanSettings = { method: 'avalanche', startDate: '2026-11-01', monthsHorizon: 60 };

function baseMonth(overrides: Partial<BudgetMonth> = {}): BudgetMonth {
  return {
    key: '2026-11',
    status: 'current',
    incomeLines: [{ id: 'inc-1', name: 'Paycheck (sample)', amount: 3000 }],
    expenseLines: [{ id: 'exp-1', name: 'Rent (sample)', amount: 2400 }],
    debtOpenings: { 'card-a': 1000, 'card-b': 500, truck: 10000 },
    startingExtra: 0,
    editedLines: false,
    ...overrides,
  };
}

describe('month keys', () => {
  it('adds months across year boundaries and labels them', () => {
    expect(addMonthKey('2026-12', 1)).toBe('2027-01');
    expect(addMonthKey('2027-01', -1)).toBe('2026-12');
    expect(monthLabelOf('2027-01')).toBe('January 2027');
  });
});

describe('surplus', () => {
  it('is income minus expenses minus every open minimum', () => {
    // 3000 − 2400 − (50 + 25 + 300) = 225
    expect(monthSurplus(baseMonth(), debts)).toBe(225);
  });

  it('ignores minimums for debts with no opening balance', () => {
    const m = baseMonth({ debtOpenings: { 'card-a': 1000 } });
    expect(monthSurplus(m, debts)).toBe(550);
  });
});

describe('stepDebtOpenings', () => {
  it('snowball: surplus cascades to the smallest ranked balance first', () => {
    const next = stepDebtOpenings(baseMonth(), debts, snowball);
    // Card B: 500 + 5 interest − 25 min − 225 extra = 255
    expect(next['card-b']).toBe(255);
    // Card A: 1000 + 20 interest − 50 min = 970 (no extra left)
    expect(next['card-a']).toBe(970);
  });

  it('avalanche: surplus cascades to the highest APR first', () => {
    const next = stepDebtOpenings(baseMonth(), debts, avalanche);
    // Card A: 1000 + 20 − 50 − 225 = 745
    expect(next['card-a']).toBe(745);
    // Card B: 500 + 5 − 25 = 480
    expect(next['card-b']).toBe(480);
  });

  it('vehicle debt is a line item: interest and minimum only, never extra', () => {
    const next = stepDebtOpenings(baseMonth(), debts, snowball);
    // Truck: 10000 + 50 interest − 300 min = 9750, even with surplus around
    expect(next.truck).toBe(9750);
  });

  it('paid-off debts drop out of the next month', () => {
    const rich = baseMonth({
      incomeLines: [{ id: 'inc-1', name: 'Paycheck (sample)', amount: 9000 }],
    });
    const next = stepDebtOpenings(rich, debts, snowball);
    expect(next['card-a']).toBeUndefined();
    expect(next['card-b']).toBeUndefined();
    expect(next.truck).toBe(9750);
  });
});

describe('generateForecastMonth', () => {
  it('copies lines forward, steps debts, carries the surplus in', () => {
    const prev = baseMonth();
    const fc = generateForecastMonth(prev, debts, snowball);
    expect(fc.key).toBe('2026-12');
    expect(fc.status).toBe('forecast');
    expect(fc.generatedFrom).toBe('2026-11');
    expect(fc.startingExtra).toBe(225);
    expect(fc.debtOpenings).toEqual({ 'card-a': 970, 'card-b': 255, truck: 9750 });
    expect(fc.incomeLines).toEqual(prev.incomeLines);
    expect(fc.expenseLines).toEqual(prev.expenseLines);
    // Lines are copies, not references
    fc.incomeLines[0].amount = 1;
    expect(prev.incomeLines[0].amount).toBe(3000);
  });
});

describe('seedChain', () => {
  it('seeds Current at today with live balances and a generated Forecast', () => {
    const chain = seedChain(
      [{ id: 'i', name: 'Paycheck (sample)', amount: 3000 }],
      [{ id: 'e', name: 'Rent (sample)', amount: 2400 }],
      debts,
      snowball,
      '2026-11'
    );
    expect(chain.currentKey).toBe('2026-11');
    expect(chain.forecastKey).toBe('2026-12');
    expect(chain.months['2026-11'].status).toBe('current');
    expect(chain.months['2026-11'].debtOpenings).toEqual({
      'card-a': 1000,
      'card-b': 500,
      truck: 10000,
    });
    expect(chain.months['2026-12'].status).toBe('forecast');
    expect(chain.months['2026-12'].startingExtra).toBe(225);
  });
});

describe('runRollover', () => {
  it('does nothing when today is the current month', () => {
    const chain = seedChain(
      [{ id: 'i', name: 'Paycheck (sample)', amount: 3000 }],
      [{ id: 'e', name: 'Rent (sample)', amount: 2400 }],
      debts,
      snowball,
      '2026-11'
    );
    const { chain: next, rolledFrom, closedKeys } = runRollover(chain, debts, snowball, '2026-11');
    expect(rolledFrom).toBeNull();
    expect(closedKeys).toEqual([]);
    expect(next.currentKey).toBe('2026-11');
  });

  it('closes, promotes, and generates — catching up multiple months', () => {
    const chain = seedChain(
      [{ id: 'i', name: 'Paycheck (sample)', amount: 3000 }],
      [{ id: 'e', name: 'Rent (sample)', amount: 2400 }],
      debts,
      snowball,
      '2026-11'
    );
    const { chain: next, rolledFrom, closedKeys } = runRollover(chain, debts, snowball, '2027-02');
    expect(rolledFrom).toBe('2026-11');
    expect(closedKeys).toEqual(['2026-11', '2026-12', '2027-01']);
    expect(next.currentKey).toBe('2027-02');
    expect(next.forecastKey).toBe('2027-03');
    expect(next.months['2026-11'].status).toBe('closed');
    expect(next.months['2026-12'].status).toBe('closed');
    expect(next.months['2027-02'].status).toBe('current');
    expect(next.months['2027-03'].status).toBe('forecast');
    // The input chain is not mutated
    expect(chain.months['2026-11'].status).toBe('current');
  });
});

describe('syncForecastDerived (corrections flow forward)', () => {
  function chainWithForecast(forecastOverrides: Partial<BudgetMonth>) {
    const current = baseMonth();
    const forecast: BudgetMonth = {
      key: '2026-12',
      status: 'forecast',
      incomeLines: [{ id: 'inc-1', name: 'Paycheck (sample)', amount: 3000 }],
      expenseLines: [{ id: 'exp-1', name: 'Rent (sample)', amount: 2400 }],
      debtOpenings: { 'card-a': 1, 'card-b': 1, truck: 1 },
      startingExtra: 0,
      editedLines: false,
      generatedFrom: '2026-11',
      ...forecastOverrides,
    };
    return {
      version: 1 as const,
      currentKey: '2026-11',
      forecastKey: '2026-12',
      months: { '2026-11': current, '2026-12': forecast },
    };
  }

  it('recomputes forecast openings and starting extra from the corrected month', () => {
    const chain = chainWithForecast({});
    const next = syncForecastDerived(chain, debts, snowball);
    expect(next.months['2026-12'].debtOpenings).toEqual({
      'card-a': 970,
      'card-b': 255,
      truck: 9750,
    });
    expect(next.months['2026-12'].startingExtra).toBe(225);
  });

  it('preserves forecast lines the user edited, refreshes untouched ones', () => {
    const edited = chainWithForecast({
      editedLines: true,
      incomeLines: [{ id: 'inc-x', name: 'Bonus (sample)', amount: 777 }],
    });
    const nextEdited = syncForecastDerived(edited, debts, snowball);
    expect(nextEdited.months['2026-12'].incomeLines).toEqual([
      { id: 'inc-x', name: 'Bonus (sample)', amount: 777 },
    ]);
    // Derived figures still update even when lines are preserved
    expect(nextEdited.months['2026-12'].startingExtra).toBe(225);

    const untouched = chainWithForecast({
      incomeLines: [{ id: 'inc-1', name: 'Paycheck (sample)', amount: 1 }],
    });
    const nextUntouched = syncForecastDerived(untouched, debts, snowball);
    expect(nextUntouched.months['2026-12'].incomeLines[0].amount).toBe(3000);
  });
});
