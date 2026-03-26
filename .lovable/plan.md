

# Scenario Compare — Implementation Plan

## Analysis

The requested feature **already exists** as `src/components/plan/MethodComparison.tsx`. It:
- Runs `computeDebtPlan` twice (snowball + avalanche) via `useMemo`
- Shows side-by-side cards with winner badges
- Has a winner banner ("Avalanche saves you $X")
- Has a details table tab
- Is currently used only on PlanPage

The current ScenariosPage only has a manual "Run Scenario" flow — it lacks the automatic snowball vs avalanche comparison.

## Plan

### 1. Add `MethodComparison` to `ScenariosPage.tsx`
- Import and render