import type { BudgetLine } from '@/types/budget';

// ============================================
// Finityo — Sample monthly budget lines
// ============================================
//
// Worked-sample figures only (the month a new user sees before
// entering their own). Generic round numbers, no real accounts.

export const sampleIncomeLines: BudgetLine[] = [
  { id: 'inc-paycheck', name: 'Paycheck (sample)', amount: 3850 },
  { id: 'inc-side', name: 'Side income (sample)', amount: 400 },
];

export const sampleExpenseLines: BudgetLine[] = [
  { id: 'exp-rent', name: 'Rent (sample)', amount: 1450, category: 'Housing' },
  { id: 'exp-electric', name: 'Electricity', amount: 120, category: 'Utilities' },
  { id: 'exp-internet', name: 'Home internet', amount: 70, category: 'Utilities' },
  { id: 'exp-phone', name: 'Mobile phone', amount: 65, category: 'Utilities' },
  { id: 'exp-groceries', name: 'Groceries', amount: 520, category: 'Food' },
  { id: 'exp-fuel', name: 'Gas / fuel', amount: 180, category: 'Transport' },
  { id: 'exp-insurance', name: 'Auto insurance', amount: 145, category: 'Insurance' },
  { id: 'exp-streaming', name: 'TV streaming', amount: 25, category: 'Subscriptions' },
  { id: 'exp-medical', name: 'Medical', amount: 150, category: 'Health' },
];
