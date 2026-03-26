

# Interest Saved Feature — Implementation Plan

## Summary
Create a comparison hook that runs the engine twice (baseline vs user plan), then surface "Interest Saved" and "Time Saved" KPIs on Dashboard and a motivational banner on Plan page. Engine code is untouched.

## Changes

### 1. New file: `src/hooks/useInterestComparison.ts`
- Hook wraps two `computeDebtPlan` calls in `useMemo` keyed on `[debts, settings, extraPayments]`
- Call 1: user plan (with extra payments)
- Call 2: baseline (empty extra payments array)
- Returns: `interestSaved`, `monthsSaved`, `baselineInterest`, `planInterest`, `baselineMonths`, `planMonths`
- All deltas clamped to `Math.max(0, ...)`

### 2. Update: `src/pages/DashboardPage.tsx`
- Import `useInterestComparison` and `extraPayments` from the store
- Add two new KPI cards to the existing grid:
  - **Interest Saved** — `Piggy Bank` icon, `formatCurrency(interestSaved)`, subtext showing months saved, accent `primary`
  - **Time Saved** — `Clock` icon, `${monthsSaved} months faster` or "No time saved yet"
- Only show these cards when `interestSaved > 0` or `extraPayments.length > 0`

### 3. Update: `src/pages/PlanPage.tsx`
- Import `useInterestComparison`
- Add a motivational banner card below the header when `interestSaved > 0`:
  - "You're saving **{formatCurrency(interestSaved)}** and finishing **{monthsSaved} months** sooner"
  - Styled with `bg-primary/5 border-primary/20`

### Files NOT modified
- `src/lib/computeDebtPlan.ts` — engine untouched
- `src/store/useDebtStore.ts` — no store changes
- `src/types/debt.ts` — no type changes

