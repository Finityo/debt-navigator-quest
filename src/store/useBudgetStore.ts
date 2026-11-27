import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Debt, PlanSettings } from '@/types/debt';
import type { MonthChain } from '@/types/budget';
import { sampleIncomeLines, sampleExpenseLines } from '@/data/sampleBudget';
import {
  liveDebtOpenings,
  runRollover,
  seedChain,
  syncForecastDerived,
  todayMonthKey,
} from '@/lib/monthChain';

// ============================================
// Finityo — Rolling month budget store
// ============================================
//
// Owns the month chain (Current / Forecast / Closed). Debt
// definitions stay in useDebtStore; this store calls into the
// month-chain lib with the live debts and settings whenever the
// chain is ensured, rolled over, or corrected.

interface BudgetStore {
  chain: MonthChain | null;
  selectedKey: string | null;
  /** Current key before the latest rollover, while its banner is up. */
  pendingTransitionFrom: string | null;
  _hasHydrated: boolean;

  /** Seed if needed, roll forward to today, sync derived figures. */
  ensureChain: (debts: Debt[], settings: PlanSettings) => void;
  selectMonth: (key: string) => void;
  updateLineAmount: (
    monthKey: string,
    section: 'income' | 'expense',
    lineId: string,
    amount: number,
    debts: Debt[],
    settings: PlanSettings
  ) => void;
  addLine: (
    monthKey: string,
    section: 'income' | 'expense',
    name: string,
    debts: Debt[],
    settings: PlanSettings
  ) => void;
  removeLine: (
    monthKey: string,
    section: 'income' | 'expense',
    lineId: string,
    debts: Debt[],
    settings: PlanSettings
  ) => void;
  dismissTransition: () => void;
  reviewTransition: () => void;
}

function withMonth(
  chain: MonthChain,
  key: string,
  update: (m: MonthChain['months'][string]) => MonthChain['months'][string]
): MonthChain {
  const rec = chain.months[key];
  if (!rec) return chain;
  return { ...chain, months: { ...chain.months, [key]: update(rec) } };
}

export const useBudgetStore = create<BudgetStore>()(
  persist(
    (set, get) => ({
      chain: null,
      selectedKey: null,
      pendingTransitionFrom: null,
      _hasHydrated: false,

      ensureChain: (debts, settings) => {
        const today = todayMonthKey();
        let chain = get().chain;
        let rolledFrom: string | null = null;

        if (!chain) {
          chain = seedChain(sampleIncomeLines, sampleExpenseLines, debts, settings, today);
        } else {
          const result = runRollover(chain, debts, settings, today);
          chain = result.chain;
          rolledFrom = result.rolledFrom;
        }

        // The Current month's openings always mirror the live debts.
        const current = chain.months[chain.currentKey];
        if (current) {
          chain = withMonth(chain, current.key, (m) => ({
            ...m,
            debtOpenings: liveDebtOpenings(debts),
          }));
        }
        chain = syncForecastDerived(chain, debts, settings);

        set((s) => ({
          chain,
          selectedKey:
            s.selectedKey && chain!.months[s.selectedKey] ? s.selectedKey : chain!.currentKey,
          pendingTransitionFrom: rolledFrom ?? s.pendingTransitionFrom,
        }));
      },

      selectMonth: (key) => {
        if (get().chain?.months[key]) set({ selectedKey: key });
      },

      updateLineAmount: (monthKey, section, lineId, amount, debts, settings) => {
        const chain = get().chain;
        if (!chain) return;
        const rec = chain.months[monthKey];
        if (!rec || rec.status === 'closed') return;
        const field = section === 'income' ? 'incomeLines' : 'expenseLines';
        let next = withMonth(chain, monthKey, (m) => ({
          ...m,
          editedLines: true,
          [field]: m[field].map((l) => (l.id === lineId ? { ...l, amount } : l)),
        }));
        // Corrections to the Current month flow into the Forecast.
        if (monthKey === next.currentKey) {
          next = syncForecastDerived(next, debts, settings);
        }
        set({ chain: next });
      },

      addLine: (monthKey, section, name, debts, settings) => {
        const chain = get().chain;
        if (!chain) return;
        const rec = chain.months[monthKey];
        if (!rec || rec.status === 'closed') return;
        const field = section === 'income' ? 'incomeLines' : 'expenseLines';
        const line = {
          id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: name.trim() || 'New line',
          amount: 0,
        };
        let next = withMonth(chain, monthKey, (m) => ({
          ...m,
          editedLines: true,
          [field]: [...m[field], line],
        }));
        if (monthKey === next.currentKey) {
          next = syncForecastDerived(next, debts, settings);
        }
        set({ chain: next });
      },

      removeLine: (monthKey, section, lineId, debts, settings) => {
        const chain = get().chain;
        if (!chain) return;
        const rec = chain.months[monthKey];
        if (!rec || rec.status === 'closed') return;
        const field = section === 'income' ? 'incomeLines' : 'expenseLines';
        let next = withMonth(chain, monthKey, (m) => ({
          ...m,
          editedLines: true,
          [field]: m[field].filter((l) => l.id !== lineId),
        }));
        if (monthKey === next.currentKey) {
          next = syncForecastDerived(next, debts, settings);
        }
        set({ chain: next });
      },

      dismissTransition: () => {
        const chain = get().chain;
        if (!chain) return;
        set({
          chain: { ...chain, transitionNoticeFor: chain.currentKey },
          pendingTransitionFrom: null,
        });
      },

      reviewTransition: () => {
        const chain = get().chain;
        if (!chain) return;
        set({
          chain: { ...chain, transitionNoticeFor: chain.currentKey },
          pendingTransitionFrom: null,
          selectedKey: chain.currentKey,
        });
      },
    }),
    {
      name: 'finityo-budget-chain',
      version: 1,
      partialize: (state) => ({
        chain: state.chain,
        selectedKey: state.selectedKey,
        pendingTransitionFrom: state.pendingTransitionFrom,
      }),
      onRehydrateStorage: () => () => {
        useBudgetStore.setState({ _hasHydrated: true });
      },
    }
  )
);
