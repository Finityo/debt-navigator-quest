// ==========================================================
//  Extra-payments parity tests
//  Added Nov 20, 2026 with the repository-parity change set.
//
//  Pins the three rules the Muse Space shipped first:
//  - extra payments start blank (no seeded rows),
//  - legacy seeded rows are stripped from older persisted saves
//    while genuine user entries survive,
//  - an extra payment's date derives from the plan start date
//    (Month N = the 1st of start month + N - 1).
// ==========================================================

import { describe, test, expect } from 'vitest';
import {
  LEGACY_SEEDED_EXTRA_PAYMENTS,
  cleanPersistedExtraPayments,
  getExtraPaymentDate,
  reanchorExtraPayments,
  stripLegacySeededExtraPayments,
} from '@/lib/extraPayments';
import { useDebtStore } from '@/store/useDebtStore';
import type { ExtraPayment } from '@/types/debt';

describe('getExtraPaymentDate', () => {
  test('derives Month N from the start month, always on the 1st', () => {
    // Christian's reported case: start date Nov 30, 2026 in Settings.
    expect(getExtraPaymentDate('2026-11-30', 1)).toBe('2026-11-01');
    expect(getExtraPaymentDate('2026-11-30', 2)).toBe('2026-12-01');
    expect(getExtraPaymentDate('2026-11-30', 3)).toBe('2027-01-01');
    expect(getExtraPaymentDate('2026-11-30', 14)).toBe('2027-12-01');
  });
});

describe('legacy seed cleanup', () => {
  test('strips exactly the five seeded rows', () => {
    expect(stripLegacySeededExtraPayments(LEGACY_SEEDED_EXTRA_PAYMENTS)).toEqual([]);
  });

  test('keeps a genuine entry that merely resembles a seed', () => {
    const genuine: ExtraPayment[] = [
      { monthNumber: 1, date: '2025-04-01', extraAmount: 250 }, // seed month/date, user amount
      { monthNumber: 2, date: '2025-05-15', extraAmount: 200 }, // seed month/amount, user date
    ];
    expect(stripLegacySeededExtraPayments(genuine)).toEqual(genuine);
  });

  test('cleanPersistedExtraPayments strips seeds and re-anchors the rest', () => {
    const saved: ExtraPayment[] = [
      ...LEGACY_SEEDED_EXTRA_PAYMENTS,
      { monthNumber: 4, date: '2025-07-01', extraAmount: 300 },
    ];
    expect(cleanPersistedExtraPayments(saved, '2026-11-30')).toEqual([
      { monthNumber: 4, date: '2027-02-01', extraAmount: 300 },
    ]);
  });

  test('reanchorExtraPayments moves dates, never amounts or months', () => {
    const payments: ExtraPayment[] = [
      { monthNumber: 1, date: '2025-04-01', extraAmount: 175 },
      { monthNumber: 6, date: '2025-09-01', extraAmount: 400 },
    ];
    expect(reanchorExtraPayments(payments, '2026-11-30')).toEqual([
      { monthNumber: 1, date: '2026-11-01', extraAmount: 175 },
      { monthNumber: 6, date: '2027-04-01', extraAmount: 400 },
    ]);
  });
});

describe('store defaults', () => {
  test('a fresh store starts with no extra payments', () => {
    expect(useDebtStore.getState().extraPayments).toEqual([]);
  });
});
