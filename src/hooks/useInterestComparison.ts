import { useMemo } from 'react';
import { computeDebtPlan } from '@/lib/computeDebtPlan';
import type { Debt, PlanSettings, ExtraPayment } from '@/types/debt';

export function useInterestComparison(
  debts: Debt[],
  settings: PlanSettings,
  extraPayments: ExtraPayment[]
) {
  return useMemo(() => {
    if (!debts.length) {
      return {
        interestSaved: 0,
        monthsSaved: 0,
        baselineInterest: 0,
        planInterest: 0,
        baselineMonths: 0,
        planMonths: 0,
      };
    }

    const userPlan = computeDebtPlan(debts, settings, extraPayments);
    const baselinePlan = computeDebtPlan(debts, settings, []);

    const interestSaved = baselinePlan.totalInterestPaid - userPlan.totalInterestPaid;
    const monthsSaved = (baselinePlan.payoffMonth ?? 0) - (userPlan.payoffMonth ?? 0);

    return {
      interestSaved: Math.max(0, interestSaved),
      monthsSaved: Math.max(0, monthsSaved),
      baselineInterest: baselinePlan.totalInterestPaid,
      planInterest: userPlan.totalInterestPaid,
      baselineMonths: baselinePlan.payoffMonth ?? 0,
      planMonths: userPlan.payoffMonth ?? 0,
    };
  }, [debts, settings, extraPayments]);
}
