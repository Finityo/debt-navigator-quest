import type { Debt, ExtraPayment, PlanSettings } from '@/types/debt';

export const sampleDebts: Debt[] = [
  {
    id: 'debt-1',
    creditorName: 'Chase Visa',
    balance: 4200,
    apr: 0.219,
    minPayment: 95,
    type: 'credit_card',
    startDate: '2025-01-01',
    notes: '',
  },
  {
    id: 'debt-2',
    creditorName: 'Discover Card',
    balance: 1800,
    apr: 0.179,
    minPayment: 45,
    type: 'credit_card',
    startDate: '2025-01-01',
    notes: '',
  },
  {
    id: 'debt-3',
    creditorName: 'Student Loan',
    balance: 12500,
    apr: 0.055,
    minPayment: 150,
    type: 'student_loan',
    startDate: '2025-01-01',
    notes: 'Federal loan',
  },
];

export const sampleSettings: PlanSettings = {
  method: 'avalanche',
  startDate: '2025-04-01',
  monthsHorizon: 60,
};

export const sampleExtraPayments: ExtraPayment[] = [
  { monthNumber: 1, date: '2025-04-01', extraAmount: 200 },
  { monthNumber: 2, date: '2025-05-01', extraAmount: 200 },
  { monthNumber: 3, date: '2025-06-01', extraAmount: 200 },
  { monthNumber: 6, date: '2025-09-01', extraAmount: 500 },
  { monthNumber: 12, date: '2026-03-01', extraAmount: 500 },
];
