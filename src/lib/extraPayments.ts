// ==========================================================
//  Extra-payment date and cleanup helpers
//  Added Nov 20, 2026 (repository parity with the Muse Space).
//
//  Rules:
//  - An extra payment's date is DERIVED from the plan start date:
//    Month N falls on the 1st of (start month + N - 1). It is never
//    an independent fact, so changing the start date re-anchors
//    every scheduled extra payment.
//  - New users start with NO extra payments. Extra amounts vary
//    month to month and are entered by the user, never seeded.
//  - Saves persisted before the seed removal are cleaned on load:
//    rows that exactly match a legacy seed are stripped, and the
//    genuine entries that remain are re-anchored to the start date.
// ==========================================================

import type { ExtraPayment } from '@/types/debt';

// The rows the app used to seed for every new user. Retained only so
// the persisted-state migration can recognize and remove them; an
// exact match on all three fields is required, so a genuine user
// entry that merely resembles a seed is kept.
export const LEGACY_SEEDED_EXTRA_PAYMENTS: ExtraPayment[] = [
  { monthNumber: 1, date: '2025-04-01', extraAmount: 200 },
  { monthNumber: 2, date: '2025-05-01', extraAmount: 200 },
  { monthNumber: 3, date: '2025-06-01', extraAmount: 200 },
  { monthNumber: 6, date: '2025-09-01', extraAmount: 500 },
  { monthNumber: 12, date: '2026-03-01', extraAmount: 500 },
];

export function isLegacySeededExtraPayment(p: ExtraPayment): boolean {
  return LEGACY_SEEDED_EXTRA_PAYMENTS.some(
    (s) =>
      s.monthNumber === p.monthNumber &&
      s.date === p.date &&
      s.extraAmount === p.extraAmount
  );
}

export function stripLegacySeededExtraPayments(
  payments: ExtraPayment[]
): ExtraPayment[] {
  return payments.filter((p) => !isLegacySeededExtraPayment(p));
}

// Month N of a plan beginning in the month of startDateISO, returned
// as an ISO date on the 1st of that month. UTC math throughout, so
// the result never drifts with the local timezone.
export function getExtraPaymentDate(
  startDateISO: string,
  monthNumber: number
): string {
  const [y, m] = startDateISO.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + (monthNumber - 1), 1));
  return d.toISOString().slice(0, 10);
}

export function reanchorExtraPayments(
  payments: ExtraPayment[],
  startDateISO: string
): ExtraPayment[] {
  return payments.map((p) => ({
    ...p,
    date: getExtraPaymentDate(startDateISO, p.monthNumber),
  }));
}

// The full cleanup applied to persisted saves written before the
// seed removal: strip legacy seeds, re-anchor what remains.
export function cleanPersistedExtraPayments(
  payments: ExtraPayment[],
  startDateISO: string
): ExtraPayment[] {
  return reanchorExtraPayments(
    stripLegacySeededExtraPayments(payments),
    startDateISO
  );
}
