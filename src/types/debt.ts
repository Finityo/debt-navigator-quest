// ============================================
// Finityo — Core Data Models
// ============================================

export type DebtType = 'credit_card' | 'student_loan' | 'auto_loan' | 'mortgage' | 'personal_loan' | 'medical' | 'other';

export type PayoffMethod = 'snowball' | 'avalanche';

export type CompletionStatus = 'complete' | 'incomplete' | 'in_progress';

// --- Input Models ---

export interface Debt {
  id: string;
  creditorName: string;
  balance: number;
  apr: number; // annual percentage rate as decimal (e.g., 0.199 for 19.9%)
  minPayment: number;
  type: DebtType;
  startDate: string; // ISO date string
  notes: string;
}

export interface ExtraPayment {
  monthNumber: number;
  date: string; // ISO date string
  extraAmount: number;
}

export interface PlanSettings {
  method: PayoffMethod;
  startDate: string; // ISO date string
  monthsHorizon: number;
}

// --- Output Models ---

export interface MonthlyDebtSnapshot {
  monthNumber: number;
  debtId: string;
  creditorName: string;
  startingBalance: number;
  interestAccrued: number;
  paymentApplied: number;
  endingBalance: number;
  isPaidOff: boolean;
}

export interface MonthlyPlanSummary {
  monthNumber: number;
  date: string; // ISO date string for this month
  totalStartingDebt: number;
  totalInterest: number;
  totalMinimumPayments: number;
  totalExtraPayments: number;
  totalPaid: number;
  totalEndingDebt: number;
  debtsPaidOffThisMonth: string[]; // debt IDs
}

export interface PlanResult {
  monthlySummaries: MonthlyPlanSummary[];
  debtSnapshots: MonthlyDebtSnapshot[];
  payoffOrder: { debtId: string; creditorName: string; monthNumber: number }[];
  totalInterestPaid: number;
  totalPaid: number;
  payoffMonth: number | null; // null if not fully paid within horizon
  remainingBalance: number;
  completionStatus: CompletionStatus;
}

// --- Activity Tracker ---

export interface PaymentRecord {
  id: string;
  debtId: string;
  date: string;
  amount: number;
  note: string;
}

// --- Scenario Modeling ---

export interface Scenario {
  id: string;
  name: string;
  description: string;
  settingsOverride: Partial<PlanSettings>;
  extraPaymentsOverride: ExtraPayment[];
  result: PlanResult | null;
}
