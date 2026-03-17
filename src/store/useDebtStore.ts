import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Debt, ExtraPayment, PlanSettings, PlanResult, PaymentRecord } from '@/types/debt';
import { computeDebtPlan } from '@/lib/computeDebtPlan';
import { sampleDebts, sampleSettings, sampleExtraPayments } from '@/data/sampleData';

// --- Validation ---

export interface ValidationErrors {
  debts: Record<string, string[]>;
  settings: string[];
  extraPayments: string[];
}

export type ComputeStatus = 'idle' | 'ready' | 'computed' | 'stale';

function emptyValidation(): ValidationErrors {
  return { debts: {}, settings: [], extraPayments: [] };
}

function validateDebts(debts: Debt[]): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  for (const d of debts) {
    const e: string[] = [];
    if (!d.creditorName.trim()) e.push('Creditor name is required');
    if (d.balance <= 0) e.push('Balance must be greater than 0');
    if (d.apr < 0 || d.apr > 1) e.push('APR must be between 0% and 100%');
    if (d.minPayment <= 0) e.push('Minimum payment must be greater than 0');
    if (e.length > 0) errors[d.id] = e;
  }
  return errors;
}

function validateSettings(settings: PlanSettings): string[] {
  const errors: string[] = [];
  if (!settings.startDate) errors.push('Start date is required');
  if (settings.monthsHorizon < 1) errors.push('Horizon must be at least 1 month');
  if (settings.monthsHorizon > 360) errors.push('Horizon cannot exceed 360 months');
  return errors;
}

function validateExtraPayments(payments: ExtraPayment[]): string[] {
  const errors: string[] = [];
  for (const p of payments) {
    if (p.monthNumber < 1) errors.push(`Month number must be >= 1 (got ${p.monthNumber})`);
    if (p.extraAmount <= 0) errors.push(`Extra amount must be > 0 for month ${p.monthNumber}`);
  }
  return errors;
}

// --- Store ---

interface DebtStore {
  debts: Debt[];
  settings: PlanSettings;
  extraPayments: ExtraPayment[];
  paymentRecords: PaymentRecord[];
  planResult: PlanResult | null;
  validationErrors: ValidationErrors;
  computeStatus: ComputeStatus;

  addDebt: (debt: Debt) => void;
  updateDebt: (id: string, updates: Partial<Debt>) => void;
  removeDebt: (id: string) => void;
  updateSettings: (updates: Partial<PlanSettings>) => void;
  setExtraPayments: (payments: ExtraPayment[]) => void;
  addExtraPayment: (payment: ExtraPayment) => void;
  updateExtraPayment: (monthNumber: number, updates: Partial<ExtraPayment>) => void;
  removeExtraPayment: (monthNumber: number) => void;
  addPaymentRecord: (record: PaymentRecord) => void;
  validate: () => boolean;
  computePlan: () => void;
  clearPlan: () => void;
}

function markStale(set: (fn: (s: DebtStore) => Partial<DebtStore>) => void) {
  set((s) => ({
    computeStatus: s.computeStatus === 'computed' ? 'stale' : s.computeStatus,
  }));
}

export const useDebtStore = create<DebtStore>()(
  persist(
    (set, get) => ({
      debts: sampleDebts,
      settings: sampleSettings,
      extraPayments: sampleExtraPayments,
      paymentRecords: [],
      planResult: null,
      validationErrors: emptyValidation(),
      computeStatus: 'idle',

      addDebt: (debt) => {
        set((s) => ({ debts: [...s.debts, debt] }));
        markStale(set);
      },
      updateDebt: (id, updates) => {
        set((s) => ({
          debts: s.debts.map((d) => (d.id === id ? { ...d, ...updates } : d)),
        }));
        markStale(set);
      },
      removeDebt: (id) => {
        set((s) => ({ debts: s.debts.filter((d) => d.id !== id) }));
        markStale(set);
      },

      updateSettings: (updates) => {
        set((s) => ({ settings: { ...s.settings, ...updates } }));
        markStale(set);
      },

      setExtraPayments: (payments) => {
        set({ extraPayments: payments });
        markStale(set);
      },
      addExtraPayment: (payment) => {
        set((s) => ({ extraPayments: [...s.extraPayments, payment] }));
        markStale(set);
      },
      updateExtraPayment: (monthNumber, updates) => {
        set((s) => ({
          extraPayments: s.extraPayments.map((p) =>
            p.monthNumber === monthNumber ? { ...p, ...updates } : p
          ),
        }));
        markStale(set);
      },
      removeExtraPayment: (monthNumber) => {
        set((s) => ({
          extraPayments: s.extraPayments.filter((p) => p.monthNumber !== monthNumber),
        }));
        markStale(set);
      },

      addPaymentRecord: (record) =>
        set((s) => ({ paymentRecords: [...s.paymentRecords, record] })),

      validate: () => {
        const { debts, settings, extraPayments } = get();
        const errors: ValidationErrors = {
          debts: validateDebts(debts),
          settings: validateSettings(settings),
          extraPayments: validateExtraPayments(extraPayments),
        };
        const isValid =
          Object.keys(errors.debts).length === 0 &&
          errors.settings.length === 0 &&
          errors.extraPayments.length === 0;
        set({
          validationErrors: errors,
          computeStatus: isValid ? 'ready' : get().computeStatus,
        });
        return isValid;
      },

      computePlan: () => {
        const store = get();
        const isValid = store.validate();
        if (!isValid) return;
        const result = computeDebtPlan(store.debts, store.settings, store.extraPayments);
        set({ planResult: result, computeStatus: 'computed' });
      },

      clearPlan: () => set({ planResult: null, computeStatus: 'idle' }),
    }),
    {
      name: 'finityo-store',
      partialize: (state) => ({
        debts: state.debts,
        settings: state.settings,
        extraPayments: state.extraPayments,
        paymentRecords: state.paymentRecords,
        planResult: state.planResult,
        computeStatus: state.computeStatus,
      }),
    }
  )
);
