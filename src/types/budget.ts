// ============================================
// Finityo — Rolling Month Budget Models
// ============================================
//
// Ported from the Finityo Budget Planner (Nov 27, 2026). The planner
// keeps a chain of months: one Current month being lived in, one
// Forecast month ahead of it, and every earlier month frozen as
// Closed read-only history.

export type MonthStatus = 'current' | 'forecast' | 'closed';

export interface BudgetLine {
  id: string;
  name: string;
  amount: number;
  category?: string;
}

export interface BudgetMonth {
  /** Month key, "YYYY-MM". */
  key: string;
  status: MonthStatus;
  incomeLines: BudgetLine[];
  expenseLines: BudgetLine[];
  /**
   * Opening balance per debt id for this month. For the Current month
   * these mirror the live debt list; for a generated Forecast they are
   * the prior month's projected ending balances from the payoff engine.
   */
  debtOpenings: Record<string, number>;
  /** Prior month's surplus carried in as this month's extra for debt. */
  startingExtra: number;
  /**
   * True once the user has edited this month's income/expense lines.
   * Corrections flowing forward never overwrite edited lines.
   */
  editedLines: boolean;
  /** Month key this forecast was generated from. */
  generatedFrom?: string;
}

export interface MonthChain {
  version: 1;
  currentKey: string;
  forecastKey: string;
  months: Record<string, BudgetMonth>;
  /** Current-month key the transition banner was last shown for. */
  transitionNoticeFor?: string;
}
