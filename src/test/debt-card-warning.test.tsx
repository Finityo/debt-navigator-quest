// ==========================================================
//  DebtCard minimum-vs-interest warning tests
//  Added Nov 20, 2026 with the negative-amortization patch.
//
//  The warning must use the engine's own conventions:
//  normalizeDebtInput reads apr > 1 as a percent and anything
//  else as a decimal; runEngine Step 1 rounds monthly interest
//  to cents. A minimum exactly equal to the rounded interest
//  covers it and must NOT trigger the warning.
// ==========================================================

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import DebtCard from '@/components/DebtCard';
import type { Debt } from '@/types/debt';

afterEach(cleanup);

function makeDebt(overrides: Partial<Debt>): Debt {
  return {
    id: 'warn-1',
    creditorName: 'Warning Test Card',
    balance: 1000,
    apr: 0.3,
    minPayment: 10,
    type: 'credit_card',
    startDate: '2026-11-30',
    notes: '',
    ...overrides,
  };
}

function renderCard(debt: Debt) {
  return render(<DebtCard debt={debt} onEdit={() => {}} onRemove={() => {}} />);
}

const WARNING = /Minimum does not cover monthly interest/;

describe('DebtCard minimum-vs-interest warning', () => {
  it('warns when the minimum is below monthly interest, showing the engine figure', () => {
    renderCard(makeDebt({ balance: 1000, apr: 0.3, minPayment: 10 }));
    const el = screen.getByText(WARNING);
    expect(el.textContent).toContain('$25.00/mo');
  });

  it('does not warn when the minimum exactly equals the rounded monthly interest', () => {
    renderCard(makeDebt({ balance: 1000, apr: 0.3, minPayment: 25 }));
    expect(screen.queryByText(WARNING)).toBeNull();
  });

  it('warns when the minimum is one cent below the monthly interest', () => {
    renderCard(makeDebt({ balance: 1000, apr: 0.3, minPayment: 24.99 }));
    expect(screen.getByText(WARNING)).toBeTruthy();
  });

  it('uses cent-rounded interest: raw interest $25.004 rounds to $25.00, so a $25 minimum covers it', () => {
    // 1000.16 * 0.30 / 12 = 25.004 unrounded; the engine rounds to 25.00.
    renderCard(makeDebt({ balance: 1000.16, apr: 0.3, minPayment: 25 }));
    expect(screen.queryByText(WARNING)).toBeNull();
  });

  it('treats a percent-form apr (30) exactly like the engine normalizer does', () => {
    renderCard(makeDebt({ balance: 1000, apr: 30, minPayment: 10 }));
    const el = screen.getByText(WARNING);
    expect(el.textContent).toContain('$25.00/mo');
  });

  it('does not warn for a percent-form apr when the minimum covers the interest', () => {
    renderCard(makeDebt({ balance: 1000, apr: 30, minPayment: 25 }));
    expect(screen.queryByText(WARNING)).toBeNull();
  });

  it('does not warn on a zero-APR debt', () => {
    renderCard(makeDebt({ balance: 500, apr: 0, minPayment: 25 }));
    expect(screen.queryByText(WARNING)).toBeNull();
  });
});
