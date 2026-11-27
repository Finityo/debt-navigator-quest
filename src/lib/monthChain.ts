// ============================================
// Finityo — Rolling Month Chain
// ============================================
//
// Ported from the Finityo Budget Planner's month chain (Nov 27, 2026),
// adapted to this app's payoff engine (computeDebtPlan, rules R1–R6).
//
// The chain always holds a Current month, a Forecast month ahead of
// it, and every earlier month frozen as Closed. When a new calendar
// month begins, the rollover runs on open: the old Current freezes as
// Closed (read-only, history never rewrites itself), the Forecast
// promotes to Current, and a new Forecast is generated from it.
//
// Generation copies income and expense lines forward, steps each debt
// one month through the payoff engine (interest, minimums, the prior
// month's surplus cascading as extra in strategy order), and sets the
// new month's starting extra to the prior month's surplus. Vehicle
// (auto) and mortgage debts are line items only: their regular
// payments are reserved, but they are never ranked in the
// snowball/avalanche order and never receive extra payments.

import type { Debt, PlanSettings } from '@/types/debt';
import type { BudgetLine, BudgetMonth, MonthChain } from '@/types/budget';
import { computeDebtPlan } from '@/lib/computeDebtPlan';

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// --- Month keys ("YYYY-MM") ---

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function monthKeyOf(year: number, monthIndex0: number): string {
  return `${year}-${pad2(monthIndex0 + 1)}`;
}

export function todayMonthKey(now: Date = new Date()): string {
  return monthKeyOf(now.getFullYear(), now.getMonth());
}

export function addMonthKey(key: string, delta: number): string {
  const y = Number(key.slice(0, 4));
  const m = Number(key.slice(5, 7));
  const total = y * 12 + (m - 1) + delta;
  return `${Math.floor(total / 12)}-${pad2((total % 12) + 1)}`;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function monthLabelOf(key: string): string {
  const y = Number(key.slice(0, 4));
  const m = Number(key.slice(5, 7));
  return `${MONTH_NAMES[m - 1]} ${y}`;
}

/** ISO date (first of month) for a month key, for the payoff engine. */
export function monthStartISO(key: string): string {
  return `${key}-01`;
}

// --- Debt classification ---

/** Vehicle and mortgage debts are reserved line items, never ranked. */
export function isPayoffExcluded(debt: Debt): boolean {
  return debt.type === 'auto_loan' || debt.type === 'mortgage';
}

// --- Month math ---

export function sumLines(lines: BudgetLine[]): number {
  return round2(lines.reduce((s, r) => s + (Number(r.amount) || 0), 0));
}

/**
 * A month's surplus: income − expenses − the minimums of every debt
 * with a balance that month. This is the amount the payoff cascade
 * can spend as extra, and what the next month carries in as its
 * starting extra.
 */
export function monthSurplus(month: BudgetMonth, debts: Debt[]): number {
  const minimums = debts.reduce((s, d) => {
    const opening = month.debtOpenings[d.id];
    return opening != null && opening > 0 ? s + d.minPayment : s;
  }, 0);
  return round2(sumLines(month.incomeLines) - sumLines(month.expenseLines) - minimums);
}

/**
 * Step every debt one month forward from a month's openings, using
 * the payoff engine (R1–R6) for the ranked debts with the month's
 * surplus as the extra pool. Excluded debts (vehicle / mortgage) get
 * interest and their minimum only — never ranked, never extra.
 * Returns opening balances for the next month; paid-off debts drop
 * out (no entry).
 */
export function stepDebtOpenings(
  month: BudgetMonth,
  debts: Debt[],
  settings: PlanSettings
): Record<string, number> {
  const active = debts.filter((d) => (month.debtOpenings[d.id] ?? 0) > 0);
  const next: Record<string, number> = {};
  if (active.length === 0) return next;

  const surplus = Math.max(0, monthSurplus(month, debts));
  const startISO = monthStartISO(month.key);

  const ranked = active.filter((d) => !isPayoffExcluded(d));
  if (ranked.length > 0) {
    const stepped = ranked.map((d) => ({ ...d, balance: month.debtOpenings[d.id] }));
    const result = computeDebtPlan(
      stepped,
      { method: settings.method, startDate: startISO, monthsHorizon: 1 },
      surplus > 0
        ? [{ monthNumber: 1, date: startISO, extraAmount: surplus }]
        : []
    );
    for (const snap of result.debtSnapshots) {
      if (snap.monthNumber === 1 && snap.endingBalance > 0) {
        next[snap.debtId] = snap.endingBalance;
      }
    }
  }

  for (const d of active) {
    if (!isPayoffExcluded(d)) continue;
    const balance = month.debtOpenings[d.id];
    const interest = round2(balance * (d.apr / 12));
    const due = round2(balance + interest);
    const paid = Math.min(round2(d.minPayment), due);
    const ending = round2(due - paid);
    if (ending > 0) next[d.id] = ending;
  }

  return next;
}

// --- Chain construction ---

function cloneLines(lines: BudgetLine[]): BudgetLine[] {
  return lines.map((l) => ({ ...l }));
}

export function liveDebtOpenings(debts: Debt[]): Record<string, number> {
  const openings: Record<string, number> = {};
  for (const d of debts) {
    if (d.balance > 0) openings[d.id] = round2(d.balance);
  }
  return openings;
}

/** Generate the Forecast month that follows `prev`. */
export function generateForecastMonth(
  prev: BudgetMonth,
  debts: Debt[],
  settings: PlanSettings
): BudgetMonth {
  return {
    key: addMonthKey(prev.key, 1),
    status: 'forecast',
    incomeLines: cloneLines(prev.incomeLines),
    expenseLines: cloneLines(prev.expenseLines),
    debtOpenings: stepDebtOpenings(prev, debts, settings),
    startingExtra: round2(Math.max(0, monthSurplus(prev, debts))),
    editedLines: false,
    generatedFrom: prev.key,
  };
}

/** Seed a fresh chain: Current = today's month, Forecast = next. */
export function seedChain(
  incomeLines: BudgetLine[],
  expenseLines: BudgetLine[],
  debts: Debt[],
  settings: PlanSettings,
  todayKey: string
): MonthChain {
  const current: BudgetMonth = {
    key: todayKey,
    status: 'current',
    incomeLines: cloneLines(incomeLines),
    expenseLines: cloneLines(expenseLines),
    debtOpenings: liveDebtOpenings(debts),
    startingExtra: 0,
    editedLines: false,
  };
  const forecast = generateForecastMonth(current, debts, settings);
  return {
    version: 1,
    currentKey: todayKey,
    forecastKey: forecast.key,
    months: { [current.key]: current, [forecast.key]: forecast },
  };
}

// --- Rollover ---

export interface RolloverResult {
  chain: MonthChain;
  /** Previous Current key when a rollover moved the chain, else null. */
  rolledFrom: string | null;
  closedKeys: string[];
}

/**
 * Advance the chain to `todayKey`. Each step freezes the Current
 * month as Closed, promotes the Forecast, and generates a new
 * Forecast — repeating until the chain catches up, however many
 * months the user was away.
 */
export function runRollover(
  input: MonthChain,
  debts: Debt[],
  settings: PlanSettings,
  todayKey: string
): RolloverResult {
  const chain: MonthChain = {
    ...input,
    months: { ...input.months },
  };
  const prevCurrentKey = chain.currentKey;
  const closedKeys: string[] = [];
  let guard = 0;

  while (chain.currentKey < todayKey && guard++ < 240) {
    const curKey = chain.currentKey;
    const fcKey = chain.forecastKey;
    const cur = chain.months[curKey];
    if (cur) {
      chain.months[curKey] = { ...cur, status: 'closed' };
      closedKeys.push(curKey);
    }
    let fc = chain.months[fcKey];
    if (!fc) {
      fc = generateForecastMonth(chain.months[curKey], debts, settings);
    }
    chain.months[fcKey] = { ...fc, status: 'current' };
    chain.currentKey = fcKey;
    const nf = generateForecastMonth(chain.months[fcKey], debts, settings);
    chain.months[nf.key] = nf;
    chain.forecastKey = nf.key;
  }

  if (!chain.months[chain.forecastKey]) {
    const nf = generateForecastMonth(chain.months[chain.currentKey], debts, settings);
    chain.months[nf.key] = nf;
    chain.forecastKey = nf.key;
  }

  return {
    chain,
    rolledFrom: chain.currentKey !== prevCurrentKey ? prevCurrentKey : null,
    closedKeys,
  };
}

// --- Corrections flow forward ---

/**
 * Recompute the Forecast month's derived figures (debt openings and
 * starting extra) from the month before it, after that month changed.
 * Income and expense lines the user edited inside the Forecast are
 * preserved; untouched lines refresh from the prior month.
 */
export function syncForecastDerived(
  input: MonthChain,
  debts: Debt[],
  settings: PlanSettings
): MonthChain {
  const rec = input.months[input.forecastKey];
  if (!rec || rec.status === 'closed') return input;
  const prevKey = addMonthKey(input.forecastKey, -1);
  const prev = input.months[prevKey];
  if (!prev) return input;

  const gen = generateForecastMonth(prev, debts, settings);
  const next: BudgetMonth = {
    ...rec,
    debtOpenings: gen.debtOpenings,
    startingExtra: gen.startingExtra,
    generatedFrom: prevKey,
  };
  if (!rec.editedLines) {
    next.incomeLines = gen.incomeLines;
    next.expenseLines = gen.expenseLines;
  }
  return { ...input, months: { ...input.months, [rec.key]: next } };
}
