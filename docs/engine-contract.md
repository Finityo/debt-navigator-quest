# Engine Contract

> Canonical reference for the debt payoff engine (`runEngine`).

## Input: `EnginDebt`

| Field | Type | Constraint |
|-------|------|-----------|
| `id` | `string` | Required |
| `name` | `string` | Required |
| `balance` | `number` | >= 0, rounded to 2 decimals |
| `apr` | `number` | **Percentage** (e.g. `20` = 20%). >= 0 |
| `minimum` | `number` | >= 0, rounded to 2 decimals |
| `dueDay` | `number` | 1–31 |

> **APR is always a percentage, never a decimal.** The normalizer converts `0.20` → `20`.

## Output: `EnginePlanResult`

| Field | Type | Description |
|-------|------|-------------|
| `monthlySummaries` | `MonthlySummary[]` | Month-by-month breakdown |
| `totalInterestPaid` | `number` | Cumulative interest over plan |
| `payoffDate` | `string` | ISO date of final payoff (empty if incomplete) |

### `MonthlySummary`

| Field | Type |
|-------|------|
| `month` | `string` (ISO date) |
| `debtSnapshots` | `DebtSnapshot[]` |
| `totalInterest` | `number` |
| `totalPrincipal` | `number` |
| `totalPaid` | `number` |
| `remainingBalance` | `number` |

### `DebtSnapshot`

| Field | Type |
|-------|------|
| `debtId` | `string` |
| `startingBalance` | `number` |
| `interestAccrued` | `number` |
| `paymentApplied` | `number` |
| `principalPaid` | `number` |
| `minPaid` | `number` |
| `extraApplied` | `number` |
| `endingBalance` | `number` |

## Core Math Rules

| Rule | Formula |
|------|---------|
| R1 | `monthlyInterest = balance × (apr / 100 / 12)` |
| R2 | `principalPaid = paymentApplied − interestAccrued` (clamped >= 0) |
| R3 | `endingBalance = startingBalance + interestAccrued − paymentApplied` |
| R4 | All monetary values rounded to 2 decimals at every step |

## Snowball Strategy (R5)

1. Pay minimums on all debts.
2. Apply extra to the **smallest balance** first.
3. When a debt is paid off, its freed minimum rolls over to the **next month** (not the same month).

## Avalanche Strategy

Same as snowball, but extra is applied to the **highest APR** first.

## Runtime Validation

- `paymentApplied ≈ interestAccrued + principalPaid` (tolerance ±0.01)
- No negative balances (throws if `balance < -0.01`)
- Balance consistency check: `actual endingBalance ≈ expected endingBalance` (±0.01)
- Overpay prevention: payment clamped to `balance + interest`

## Normalization Requirement

All inputs **must** pass through `normalizeDebtInput()` before reaching the engine. Raw user input is never accepted directly.
