// ============================================
// Finityo — Core Debt Payoff Engine
// ============================================
// 
// This is the SINGLE source of truth for all debt payoff calculations.
// No other file should contain debt math.
//
// Algorithm:
//   For each month in horizon:
//     1. Accrue interest on each active debt (APR / 12)
//     2. Apply minimum payments to each active debt
//     3. Calculate available extra payment (user extra + freed minimums from paid-off debts)
//     4. Apply extra payment to the target debt (per strategy)
//     5. Mark debts with balance <= 0 as paid off
//     6. Roll freed minimum payments into snowball pool
//     7. Record snapshots and summaries

import type {
  Debt,
  ExtraPayment,
  PlanSettings,
  PlanResult,
  MonthlyDebtSnapshot,
  MonthlyPlanSummary,
} from '@/types/debt';

interface ActiveDebt {
  id: string;
  creditorName: string;
  balance: number;
  apr: number;
  minPayment: number;
  isPaidOff: boolean;
  paidOffMonth: number | null;
}

function sortByStrategy(debts: ActiveDebt[], method: 'snowball' | 'avalanche'): ActiveDebt[] {
  return [...debts].sort((a, b) => {
    if (a.isPaidOff !== b.isPaidOff) return a.isPaidOff ? 1 : -1;
    if (method === 'snowball') return a.balance - b.balance;
    return b.apr - a.apr; // avalanche: highest APR first
  });
}

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

export function computeDebtPlan(
  debts: Debt[],
  settings: PlanSettings,
  extraPayments: ExtraPayment[] = []
): PlanResult {
  if (debts.length === 0) {
    return {
      monthlySummaries: [],
      debtSnapshots: [],
      payoffOrder: [],
      totalInterestPaid: 0,
      totalPaid: 0,
      payoffMonth: null,
      remainingBalance: 0,
      completionStatus: 'complete',
    };
  }

  // Build extra payment lookup: monthNumber -> total extra
  const extraByMonth = new Map<number, number>();
  for (const ep of extraPayments) {
    extraByMonth.set(ep.monthNumber, (extraByMonth.get(ep.monthNumber) ?? 0) + ep.extraAmount);
  }

  // Initialize active debts
  const activeDebts: ActiveDebt[] = debts.map((d) => ({
    id: d.id,
    creditorName: d.creditorName,
    balance: d.balance,
    apr: d.apr,
    minPayment: d.minPayment,
    isPaidOff: false,
    paidOffMonth: null,
  }));

  const allSnapshots: MonthlyDebtSnapshot[] = [];
  const allSummaries: MonthlyPlanSummary[] = [];
  const payoffOrder: { debtId: string; creditorName: string; monthNumber: number }[] = [];

  let totalInterestPaid = 0;
  let totalPaid = 0;
  let freedMinimums = 0; // accumulated minimum payments from paid-off debts

  for (let month = 1; month <= settings.monthsHorizon; month++) {
    const monthDate = addMonths(settings.startDate, month - 1);
    let monthTotalInterest = 0;
    let monthTotalMinPayments = 0;
    let monthTotalExtraPayments = 0;
    let monthTotalPaid = 0;
    const paidOffThisMonth: string[] = [];

    const totalStartingDebt = activeDebts
      .filter((d) => !d.isPaidOff)
      .reduce((sum, d) => sum + d.balance, 0);

    // If all debts are paid off, stop
    if (activeDebts.every((d) => d.isPaidOff)) break;

    // Step 1 & 2: Accrue interest and apply minimum payments
    for (const debt of activeDebts) {
      if (debt.isPaidOff) continue;

      const startingBalance = debt.balance;
      const monthlyRate = debt.apr / 12;
      const interest = Math.round(startingBalance * monthlyRate * 100) / 100;
      debt.balance += interest;
      monthTotalInterest += interest;
      totalInterestPaid += interest;

      // Apply minimum payment (don't overpay)
      const minPay = Math.min(debt.minPayment, debt.balance);
      debt.balance -= minPay;
      debt.balance = Math.round(debt.balance * 100) / 100;
      monthTotalMinPayments += minPay;
      monthTotalPaid += minPay;
      totalPaid += minPay;
    }

    // Step 3: Calculate total extra available this month
    const userExtra = extraByMonth.get(month) ?? 0;
    let extraPool = userExtra + freedMinimums;

    // Step 4: Apply extra payment to target debt(s) per strategy
    const sorted = sortByStrategy(activeDebts, settings.method);
    for (const debt of sorted) {
      if (debt.isPaidOff || extraPool <= 0) continue;

      const extraApplied = Math.min(extraPool, debt.balance);
      debt.balance -= extraApplied;
      debt.balance = Math.round(debt.balance * 100) / 100;
      extraPool -= extraApplied;
      monthTotalExtraPayments += extraApplied;
      monthTotalPaid += extraApplied;
      totalPaid += extraApplied;
    }

    // Step 5 & 6: Check for payoffs and free up minimums
    for (const debt of activeDebts) {
      if (debt.isPaidOff) continue;

      if (debt.balance <= 0.01) { // tolerance for rounding
        debt.balance = 0;
        debt.isPaidOff = true;
        debt.paidOffMonth = month;
        freedMinimums += debt.minPayment;
        paidOffThisMonth.push(debt.id);
        payoffOrder.push({
          debtId: debt.id,
          creditorName: debt.creditorName,
          monthNumber: month,
        });
      }
    }

    // Step 7: Record snapshots for each debt
    for (const debt of activeDebts) {
      // Find original starting balance for this month
      const originalDebt = debts.find((d) => d.id === debt.id)!;
      const prevSnapshot = allSnapshots
        .filter((s) => s.debtId === debt.id)
        .sort((a, b) => b.monthNumber - a.monthNumber)[0];

      const startBal = prevSnapshot ? prevSnapshot.endingBalance : originalDebt.balance;
      const monthlyRate = debt.apr / 12;
      const interest = Math.round(startBal * monthlyRate * 100) / 100;
      const payment = Math.round((startBal + interest - debt.balance) * 100) / 100;

      allSnapshots.push({
        monthNumber: month,
        debtId: debt.id,
        creditorName: debt.creditorName,
        startingBalance: Math.round(startBal * 100) / 100,
        interestAccrued: interest,
        paymentApplied: Math.max(0, payment),
        endingBalance: Math.max(0, debt.balance),
        isPaidOff: debt.isPaidOff,
      });
    }

    const totalEndingDebt = activeDebts
      .filter((d) => !d.isPaidOff)
      .reduce((sum, d) => sum + d.balance, 0);

    allSummaries.push({
      monthNumber: month,
      date: monthDate,
      totalStartingDebt: Math.round(totalStartingDebt * 100) / 100,
      totalInterest: Math.round(monthTotalInterest * 100) / 100,
      totalMinimumPayments: Math.round(monthTotalMinPayments * 100) / 100,
      totalExtraPayments: Math.round(monthTotalExtraPayments * 100) / 100,
      totalPaid: Math.round(monthTotalPaid * 100) / 100,
      totalEndingDebt: Math.round(totalEndingDebt * 100) / 100,
      debtsPaidOffThisMonth: paidOffThisMonth,
    });
  }

  const remainingBalance = activeDebts.reduce(
    (sum, d) => sum + (d.isPaidOff ? 0 : d.balance),
    0
  );

  const allPaidOff = activeDebts.every((d) => d.isPaidOff);
  const lastPayoff = payoffOrder.length > 0
    ? Math.max(...payoffOrder.map((p) => p.monthNumber))
    : null;

  return {
    monthlySummaries: allSummaries,
    debtSnapshots: allSnapshots,
    payoffOrder,
    totalInterestPaid: Math.round(totalInterestPaid * 100) / 100,
    totalPaid: Math.round(totalPaid * 100) / 100,
    payoffMonth: allPaidOff ? lastPayoff : null,
    remainingBalance: Math.round(remainingBalance * 100) / 100,
    completionStatus: allPaidOff ? 'complete' : 'incomplete',
  };
}
