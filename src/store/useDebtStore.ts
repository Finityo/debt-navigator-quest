import { create } from 'zustand';
import type { Debt, ExtraPayment, PlanSettings, PlanResult, PaymentRecord } from '@/types/debt';
import { computeDebtPlan } from '@/lib/computeDebtPlan';
import { sampleDebts, sampleSettings, sampleExtraPayments } from '@/data/sampleData';

interface DebtStore {
  // Inputs
  debts: Debt[];
  settings: PlanSettings;
  extraPayments: ExtraPayment[];
  paymentRecords: PaymentRecord[];

  // Computed result
  planResult: PlanResult | null;

  // Actions — Debts
  addDebt: (debt: Debt) => void;
  updateDebt: (id: string, updates: Partial<Debt>) => void;
  removeDebt: (id: string) => void;

  // Actions — Settings
  updateSettings: (updates: Partial<PlanSettings>) => void;

  // Actions — Extra Payments
  setExtraPayments: (payments: ExtraPayment[]) => void;
  addExtraPayment: (payment: ExtraPayment) => void;
  removeExtraPayment: (monthNumber: number) => void;

  // Actions — Payment Records
  addPaymentRecord: (record: PaymentRecord) => void;

  // Actions — Compute
  computePlan: () => void;
}

export const useDebtStore = create<DebtStore>((set, get) => ({
  debts: sampleDebts,
  settings: sampleSettings,
  extraPayments: sampleExtraPayments,
  paymentRecords: [],
  planResult: null,

  addDebt: (debt) => set((s) => ({ debts: [...s.debts, debt] })),
  updateDebt: (id, updates) =>
    set((s) => ({
      debts: s.debts.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    })),
  removeDebt: (id) => set((s) => ({ debts: s.debts.filter((d) => d.id !== id) })),

  updateSettings: (updates) =>
    set((s) => ({ settings: { ...s.settings, ...updates } })),

  setExtraPayments: (payments) => set({ extraPayments: payments }),
  addExtraPayment: (payment) =>
    set((s) => ({ extraPayments: [...s.extraPayments, payment] })),
  removeExtraPayment: (monthNumber) =>
    set((s) => ({
      extraPayments: s.extraPayments.filter((p) => p.monthNumber !== monthNumber),
    })),

  addPaymentRecord: (record) =>
    set((s) => ({ paymentRecords: [...s.paymentRecords, record] })),

  computePlan: () => {
    const { debts, settings, extraPayments } = get();
    const result = computeDebtPlan(debts, settings, extraPayments);
    set({ planResult: result });
  },
}));
