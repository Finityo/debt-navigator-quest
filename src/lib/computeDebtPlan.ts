// ============================================
// Finityo — Core Debt Payoff Engine (Milestone 1)
// ============================================
//
// SINGLE SOURCE OF TRUTH for all debt payoff calculations.
//
// Internal types: src/types/plan.ts (EnginDebt, DebtSnapshot, etc.)
// External API:   Accepts legacy Debt/PlanSettings/ExtraPayment from debt.ts
//                 Returns legacy PlanResult from debt.ts
//
// Math Rules (enforced):
//   R1: monthlyInterest = balance * (apr / 100 / 12)
//   R2: principalPaid = paymentApplied - interestAccrued
//   R3: endingBalance = startingBalance + interestAccrued - paymentApplied
//   R4: ALL monetary values rounded to 2 decimals at each step
//   R5: Snowball — minimums on all, extra to smallest balance,
//       freed minimums roll over NEXT month (not same month)
//
// Runtime Validation:
//   - Payment breakdown identity check (R2 ↔ paymentApplied)
//   - No negative balances
//   - Overpay prevention (payment clamped to balance + interest)

import type {
  EnginDebt,
  DebtSnapshot,
  MonthlySummary,
  EnginePlanResult,
} from '@/types/plan';

import type {
  Debt,
  ExtraPayment,
  PlanSettings,
  PlanResult,
  MonthlyDebtSnapshot,
  MonthlyPlanSummary,
} from '@/types/debt';

import { normalizeDebtInput } from './normalizeDebtInput';

// ─── Helpers ───────────────────────────────────────────

function round2(n: number): number {
  return Math.round(n * 100) / 100;
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

// ─── Internal Working State ───────────────────────────

interface ActiveDebt {
  id: string;
  name: string;
  balance: number;
  apr: number;          // percentage (e.g. 21.9)
  minimum: number;
  isPaidOff: boolean;
  paidOffMonth: number | null;
  // Per-month tracking (reset each iteration)
  monthStartBalance: number;
  monthInterest: number;
  monthMinPaid: number;
  monthExtraApplied: number;
}

function sortByStrategy(debts: ActiveDebt[], method: 'snowball' | 'avalanche'): ActiveDebt[] {
  return [...debts].sort((a, b) => {
    if (a.isPaidOff !== b.isPaidOff) return a.isPaidOff ? 1 : -1;
    if (method === 'snowball') return a.balance - b.balance;
    return b.apr - a.apr;
  });
}

// ─── Core Engine (uses plan.ts types internally) ──────

export function runEngine(
  debts: EnginDebt[],
  method: 'snowball' | 'avalanche',
  startDate: string,
  monthsHorizon: number,
  extraByMonth: Map<number, number> = new Map(),
): EnginePlanResult {
  if (debts.length === 0) {
    return { monthlySummaries: [], payoffDate: '', totalInterestPaid: 0 };
  }

  const horizon = Math.min(monthsHorizon, MAX_MONTHS);

  const activeDebts: ActiveDebt[] = debts.map((d) => ({
    id: d.id,
    name: d.name,
    balance: round2(d.balance),
    apr: d.apr,
    minimum: round2(d.minimum),
    isPaidOff: false,
    paidOffMonth: null,
    monthStartBalance: 0,
    monthInterest: 0,
    monthMinPaid: 0,
    monthExtraApplied: 0,
  }));

  const allSummaries: MonthlySummary[] = [];
  let cumulativeInterest = 0;
  let freedMinimums = 0;
  let newlyFreedThisMonth = 0; // track freed mins to defer to next month
  const currentDate = parseStartDate(startDate);

  for (let month = 1; month <= horizon; month++) {
    if (activeDebts.every((d) => d.isPaidOff)) break;

    const monthDate = formatDateISO(currentDate);
    currentDate.setMonth(currentDate.getMonth() + 1);

    // Reset per-month tracking
    for (const debt of activeDebts) {
      debt.monthStartBalance = debt.balance;
      debt.monthInterest = 0;
      debt.monthMinPaid = 0;
      debt.monthExtraApplied = 0;
    }

    // Roll in freed minimums from PREVIOUS month's payoffs (Rule 5)
    freedMinimums = round2(freedMinimums + newlyFreedThisMonth);
    newlyFreedThisMonth = 0;

    // ── STEP 1: Accrue interest (Rule 1) ──
    for (const debt of activeDebts) {
      if (debt.isPaidOff) continue;
      // R1: monthlyInterest = balance * (apr / 100 / 12)
      const interest = round2(debt.balance * (debt.apr / 100 / 12));
      debt.balance = round2(debt.balance + interest);
      debt.monthInterest = interest;
      cumulativeInterest += interest;
    }

    // ── STEP 2: Apply minimum payments ──
    for (const debt of activeDebts) {
      if (debt.isPaidOff) continue;
      // Overpay prevention (Task 4): clamp to balance
      const maxPayable = round2(debt.balance);
      const minPay = round2(Math.min(debt.minimum, maxPayable));
      debt.balance = round2(debt.balance - minPay);
      debt.monthMinPaid = minPay;
    }

    // ── STEP 3: Extra payment pool ──
    const userExtra = extraByMonth.get(month) ?? 0;
    let extraPool = round2(userExtra + freedMinimums);

    // ── STEP 4: Apply extra payments per strategy ──
    const sorted = sortByStrategy(activeDebts, method);
    for (const debt of sorted) {
      if (debt.isPaidOff || extraPool <= 0) continue;
      // Overpay prevention (Task 4)
      const extraApplied = round2(Math.min(extraPool, debt.balance));
      debt.balance = round2(debt.balance - extraApplied);
      debt.monthExtraApplied += extraApplied;
      extraPool = round2(extraPool - extraApplied);
    }

    // ── STEP 5: Mark payoffs, defer freed minimums to next month ──
    for (const debt of activeDebts) {
      if (debt.isPaidOff) continue;
      if (debt.balance <= 0.005) {
        debt.balance = 0;
        debt.isPaidOff = true;
        debt.paidOffMonth = month;
        // Freed minimum deferred to NEXT month (Rule 5)
        newlyFreedThisMonth = round2(newlyFreedThisMonth + debt.minimum);
      }
    }

    // ── STEP 6: Build snapshots with validation ──
    const snapshots: DebtSnapshot[] = [];
    let monthTotalInterest = 0;
    let monthTotalPrincipal = 0;
    let monthTotalPaid = 0;

    for (const debt of activeDebts) {
      // Only include debts that were active this month
      // keep all debts for consistent reporting

      const paymentApplied = round2(debt.monthMinPaid + debt.monthExtraApplied);

      // R2: principalPaid = paymentApplied - interestAccrued
      const rawPrincipal = round2(paymentApplied - debt.monthInterest);
      // Prevent negative principal (negative amortization case)
      const principalPaid = round2(Math.max(0, rawPrincipal));

      if (rawPrincipal < -0.01) {
        // negative amortization case (allowed but tracked)
      }

      // R3: endingBalance = startingBalance + interestAccrued - paymentApplied
      const expectedEnding = round2(debt.monthStartBalance + debt.monthInterest - paymentApplied);

      // ── Runtime Validation (Task 3) ──
      if (Math.abs(paymentApplied - (debt.monthInterest + principalPaid)) > 0.01) {
        throw new Error(
          `INVALID PAYMENT BREAKDOWN: debt=${debt.id} month=${month} ` +
          `payment=${paymentApplied} interest=${debt.monthInterest} principal=${principalPaid}`
        );
      }

      if (debt.balance < -0.01) {
        throw new Error(
          `NEGATIVE BALANCE DETECTED: debt=${debt.id} month=${month} balance=${debt.balance}`
        );
      }

      // Verify R3 consistency
      if (Math.abs(debt.balance - expectedEnding) > 0.01 && debt.balance !== 0) {
        throw new Error(
          `BALANCE MISMATCH: debt=${debt.id} month=${month} ` +
          `actual=${debt.balance} expected=${expectedEnding}`
        );
      }

      monthTotalInterest += debt.monthInterest;
      monthTotalPrincipal += principalPaid;
      monthTotalPaid += paymentApplied;

      snapshots.push({
        debtId: debt.id,
        startingBalance: debt.monthStartBalance,
        interestAccrued: debt.monthInterest,
        paymentApplied,
        principalPaid,
        minPaid: debt.monthMinPaid,
        extraApplied: debt.monthExtraApplied,
        endingBalance: debt.balance,
      });
    }

    const remainingBalance = round2(
      activeDebts.filter((d) => !d.isPaidOff).reduce((sum, d) => sum + d.balance, 0)
    );

    allSummaries.push({
      month: monthDate,
      debtSnapshots: snapshots,
      totalInterest: round2(monthTotalInterest),
      totalPrincipal: round2(monthTotalPrincipal),
      totalPaid: round2(monthTotalPaid),
      remainingBalance,
    });
  }

  const allPaidOff = activeDebts.every((d) => d.isPaidOff);
  const lastSummary = allSummaries[allSummaries.length - 1];

  return {
    monthlySummaries: allSummaries,
    payoffDate: allPaidOff ? (lastSummary?.month ?? '') : '',
    totalInterestPaid: round2(cumulativeInterest),
  };
}

// ─── Adapter: Legacy API → Engine → Legacy Result ─────
//
// Converts old Debt/PlanSettings/ExtraPayment into engine types,
// runs the engine, then maps back to the old PlanResult shape
// so the UI/store continues to work unchanged.

// legacyDebtToEngine removed — normalizeDebtInput handles all conversion

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

  // Build extra payment lookup
  const extraByMonth = new Map<number, number>();
  for (const ep of extraPayments) {
    extraByMonth.set(ep.monthNumber, (extraByMonth.get(ep.monthNumber) ?? 0) + ep.extraAmount);
  }

  // Convert & run
  const engineDebts = normalizeDebtInput(debts);
  const engineResult = runEngine(
    engineDebts,
    settings.method,
    settings.startDate,
    settings.monthsHorizon,
    extraByMonth,
  );

  // ── Map engine result back to legacy shape ──

  const allSnapshots: MonthlyDebtSnapshot[] = [];
  const allSummaries: MonthlyPlanSummary[] = [];
  const payoffOrder: { debtId: string; creditorName: string; monthNumber: number }[] = [];
  const paidOffDebts = new Set<string>();
  let totalPaid = 0;

  for (let i = 0; i < engineResult.monthlySummaries.length; i++) {
    const ms = engineResult.monthlySummaries[i];
    const monthNumber = i + 1;
    const paidOffThisMonth: string[] = [];

    // Compute totalStartingDebt from snapshots
    const totalStartingDebt = round2(
      ms.debtSnapshots.reduce((sum, s) => sum + s.startingBalance, 0)
    );

    for (const snap of ms.debtSnapshots) {
      const originalDebt = debts.find((d) => d.id === snap.debtId);
      const creditorName = originalDebt?.creditorName ?? snap.debtId;

      allSnapshots.push({
        monthNumber,
        debtId: snap.debtId,
        creditorName,
        startingBalance: snap.startingBalance,
        interestAccrued: snap.interestAccrued,
        principalPaid: snap.principalPaid,
        minPaid: snap.minPaid,
        extraApplied: snap.extraApplied,
        paymentApplied: snap.paymentApplied,
        endingBalance: snap.endingBalance,
        isPaidOff: snap.endingBalance === 0,
      });

      if (snap.endingBalance === 0 && !paidOffDebts.has(snap.debtId)) {
        paidOffDebts.add(snap.debtId);
        paidOffThisMonth.push(snap.debtId);
        payoffOrder.push({ debtId: snap.debtId, creditorName, monthNumber });
      }
    }

    totalPaid += ms.totalPaid;

    allSummaries.push({
      monthNumber,
      date: ms.month,
      totalStartingDebt,
      totalInterest: ms.totalInterest,
      totalPrincipal: ms.totalPrincipal,
      totalMinimumPayments: round2(
        ms.debtSnapshots.reduce((sum, s) => sum + s.minPaid, 0)
      ),
      totalExtraPayments: round2(
        ms.debtSnapshots.reduce((sum, s) => sum + s.extraApplied, 0)
      ),
      totalPaid: ms.totalPaid,
      totalEndingDebt: ms.remainingBalance,
      debtsPaidOffThisMonth: paidOffThisMonth,
    });
  }

  const allPaidOff = debts.length > 0 && paidOffDebts.size === debts.length;
  const lastPayoff = payoffOrder.length > 0
    ? Math.max(...payoffOrder.map((p) => p.monthNumber))
    : null;
  const remainingBalance = allSummaries.length > 0
    ? allSummaries[allSummaries.length - 1].totalEndingDebt
    : debts.reduce((s, d) => s + d.balance, 0);

  return {
    monthlySummaries: allSummaries,
    debtSnapshots: allSnapshots,
    payoffOrder,
    totalInterestPaid: engineResult.totalInterestPaid,
    totalPaid: round2(totalPaid),
    payoffMonth: allPaidOff ? lastPayoff : null,
    remainingBalance,
    completionStatus: allPaidOff ? 'complete' : 'incomplete',
  };
}
