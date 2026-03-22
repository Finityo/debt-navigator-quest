// ============================================
// Finityo — Core Debt Payoff Engine
// ============================================
//
// SINGLE SOURCE OF TRUTH for all debt payoff calculations.
//
// Algorithm (per month):
//   1. For each active debt: accrue interest (APR / 12)
//   2. For each active debt: apply minimum payment (clamped to balance)
//   3. Calculate extra pool = user scheduled extra + freed minimums from prior payoffs
//   4. Sort active debts by strategy, apply extra pool top-down
//   5. Mark debts at zero as paid off, add their min payment to freed pool
//   6. Record per-debt snapshots and monthly summary
//   7. Stop early if all debts are paid off

import type {
  Debt,
  ExtraPayment,
  PlanSettings,
  PlanResult,
  MonthlyDebtSnapshot,
  MonthlyPlanSummary,
} from '@/types/debt';

// --- Internal working state per debt ---
interface ActiveDebt {
  id: string;
  creditorName: string;
  balance: number;
  apr: number;
  minPayment: number;
  isPaidOff: boolean;
  paidOffMonth: number | null;
  // Per-month tracking (reset each iteration)
  monthStartBalance: number;
  monthInterest: number;
  monthMinPaid: number;
  monthExtraApplied: number;
}

// --- Helpers ---

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function sortByStrategy(debts: ActiveDebt[], method: 'snowball' | 'avalanche'): ActiveDebt[] {
  return [...debts].sort((a, b) => {
    if (a.isPaidOff !== b.isPaidOff) return a.isPaidOff ? 1 : -1;
    if (method === 'snowball') return a.balance - b.balance;
    return b.apr - a.apr;
  });
}

function parseStartDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDateISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const MAX_MONTHS = 600;

// --- Main Engine ---

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

  const horizon = Math.min(settings.monthsHorizon, MAX_MONTHS);

  // Build extra payment lookup
  const extraByMonth = new Map<number, number>();
  for (const ep of extraPayments) {
    extraByMonth.set(ep.monthNumber, (extraByMonth.get(ep.monthNumber) ?? 0) + ep.extraAmount);
  }

  // Initialize working copies
  const activeDebts: ActiveDebt[] = debts.map((d) => ({
    id: d.id,
    creditorName: d.creditorName,
    balance: d.balance,
    apr: d.apr,
    minPayment: d.minPayment,
    isPaidOff: false,
    paidOffMonth: null,
    monthStartBalance: 0,
    monthInterest: 0,
    monthMinPaid: 0,
    monthExtraApplied: 0,
  }));

  const allSnapshots: MonthlyDebtSnapshot[] = [];
  const allSummaries: MonthlyPlanSummary[] = [];
  const payoffOrder: { debtId: string; creditorName: string; monthNumber: number }[] = [];

  let cumulativeInterest = 0;
  let cumulativePaid = 0;
  // Sequential date: starts at startDate, increments by 1 month each iteration
  const currentDate = parseStartDate(settings.startDate);

  for (let month = 1; month <= horizon; month++) {
    if (activeDebts.every((d) => d.isPaidOff)) break;

    const monthDate = formatDateISO(currentDate);
    currentDate.setMonth(currentDate.getMonth() + 1);
    let monthTotalInterest = 0;
    let monthTotalMinPayments = 0;
    let monthTotalExtraPayments = 0;
    const paidOffThisMonth: string[] = [];

    // Reset per-month tracking
    for (const debt of activeDebts) {
      debt.monthStartBalance = debt.balance;
      debt.monthInterest = 0;
      debt.monthMinPaid = 0;
      debt.monthExtraApplied = 0;
    }

    // --- STEP 1: Accrue interest ---
    for (const debt of activeDebts) {
      if (debt.isPaidOff) continue;
      const interest = round2(debt.balance * (debt.apr / 12));
      debt.balance = round2(debt.balance + interest);
      debt.monthInterest = interest;
      monthTotalInterest += interest;
      cumulativeInterest += interest;
    }

    // --- STEP 2: Apply minimum payments ---
    for (const debt of activeDebts) {
      if (debt.isPaidOff) continue;
      const minPay = round2(Math.min(debt.minPayment, debt.balance));
      debt.balance = round2(debt.balance - minPay);
      debt.monthMinPaid = minPay;
      monthTotalMinPayments += minPay;
      cumulativePaid += minPay;
    }

    // --- STEP 3: Extra payment pool (user extra + freed minimums from prior payoffs) ---
    const userExtra = extraByMonth.get(month) ?? 0;
    let extraPool = userExtra + freedMinimums;

    // --- STEP 4: Apply extra payments per strategy ---
    const sorted = sortByStrategy(activeDebts, settings.method);
    for (const debt of sorted) {
      if (debt.isPaidOff || extraPool <= 0) continue;
      const extraApplied = round2(Math.min(extraPool, debt.balance));
      debt.balance = round2(debt.balance - extraApplied);
      debt.monthExtraApplied += extraApplied;
      extraPool = round2(extraPool - extraApplied);
      monthTotalExtraPayments += extraApplied;
      cumulativePaid += extraApplied;
    }

    // --- STEP 5: Mark payoffs & free minimums ---
    for (const debt of activeDebts) {
      if (debt.isPaidOff) continue;
      if (debt.balance <= 0.005) {
        debt.balance = 0;
        debt.isPaidOff = true;
        debt.paidOffMonth = month;
        freedMinimums = round2(freedMinimums + debt.minPayment);
        paidOffThisMonth.push(debt.id);
        payoffOrder.push({
          debtId: debt.id,
          creditorName: debt.creditorName,
          monthNumber: month,
        });
      }
    }

    // --- STEP 6: Record snapshots ---
    let monthTotalPrincipal = 0;

    for (const debt of activeDebts) {
      // Skip debts already paid off in a prior month (no duplicates)
      if (debt.isPaidOff && debt.paidOffMonth !== month) continue;

      const totalPaid = round2(debt.monthMinPaid + debt.monthExtraApplied);
      const principalPaid = round2(totalPaid - debt.monthInterest);
      monthTotalPrincipal += Math.max(0, principalPaid);

      allSnapshots.push({
        monthNumber: month,
        debtId: debt.id,
        creditorName: debt.creditorName,
        startingBalance: debt.monthStartBalance,
        interestAccrued: debt.monthInterest,
        principalPaid: Math.max(0, principalPaid),
        minPaid: debt.monthMinPaid,
        extraApplied: debt.monthExtraApplied,
        paymentApplied: totalPaid,
        endingBalance: debt.balance,
        isPaidOff: debt.isPaidOff,
      });
    }

    const totalStartingDebt = round2(
      activeDebts.reduce((sum, d) => sum + (d.isPaidOff && d.paidOffMonth !== month ? 0 : d.monthStartBalance), 0)
    );
    const monthTotalPaid = round2(monthTotalMinPayments + monthTotalExtraPayments);
    const totalEndingDebt = round2(
      activeDebts.filter((d) => !d.isPaidOff).reduce((sum, d) => sum + d.balance, 0)
    );

    allSummaries.push({
      monthNumber: month,
      date: monthDate,
      totalStartingDebt,
      totalInterest: round2(monthTotalInterest),
      totalPrincipal: round2(monthTotalPrincipal),
      totalMinimumPayments: round2(monthTotalMinPayments),
      totalExtraPayments: round2(monthTotalExtraPayments),
      totalPaid: monthTotalPaid,
      totalEndingDebt,
      debtsPaidOffThisMonth: paidOffThisMonth,
    });
  }

  // --- Final result ---
  const remainingBalance = round2(
    activeDebts.reduce((sum, d) => sum + (d.isPaidOff ? 0 : d.balance), 0)
  );
  const allPaidOff = activeDebts.every((d) => d.isPaidOff);
  const lastPayoff = payoffOrder.length > 0
    ? Math.max(...payoffOrder.map((p) => p.monthNumber))
    : null;

  return {
    monthlySummaries: allSummaries,
    debtSnapshots: allSnapshots,
    payoffOrder,
    totalInterestPaid: round2(cumulativeInterest),
    totalPaid: round2(cumulativePaid),
    payoffMonth: allPaidOff ? lastPayoff : null,
    remainingBalance,
    completionStatus: allPaidOff ? 'complete' : 'incomplete',
  };
}
