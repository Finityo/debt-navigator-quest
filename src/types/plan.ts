// ============================================
// Finityo — Engine Contract (Milestone 1)
// ============================================
//
// CANONICAL types for the debt payoff engine.
// The engine uses these internally. An adapter layer
// maps to/from the legacy types in debt.ts so the UI
// continues to work unchanged.

export type EnginDebt = {
  id: string;
  name: string;
  balance: number;
  apr: number;       // percentage, e.g. 21.9 for 21.9%
  minimum: number;
  dueDay: number;
};

export type DebtSnapshot = {
  debtId: string;
  startingBalance: number;
  interestAccrued: number;
  paymentApplied: number;
  principalPaid: number;
  minPaid: number;
  extraApplied: number;
  endingBalance: number;
};

export type MonthlySummary = {
  month: string;        // ISO date string
  debtSnapshots: DebtSnapshot[];
  totalInterest: number;
  totalPrincipal: number;
  totalPaid: number;
  remainingBalance: number;
};

export type EnginePlanResult = {
  monthlySummaries: MonthlySummary[];
  payoffDate: string;
  totalInterestPaid: number;
};
