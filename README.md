# Debt Navigator Quest (Finityo)

Debt payoff planning app using snowball and avalanche strategies.
Includes Plaid integration, extra payments, and scenario comparison.

## Stack

- **Vite + React + TypeScript**
- **Tailwind CSS + ShadCN/ui**
- **Zustand** (state management)
- **React Query** (async data)
- **Supabase** (auth + edge functions)
- **Plaid** (liabilities import)

## Core Features

- Debt dashboard with KPI cards and charts
- Plan comparison (snowball vs avalanche)
- Timeline view with payoff milestones
- Extra payment scheduling & sensitivity analysis
- Side-by-side scenario comparison
- CSV import/export
- Plaid liabilities import
- Persistence + hydration via Zustand

## Data Flow

All inputs follow a single pipeline:

```
Manual / CSV / Plaid
  → normalizeDebtInput()
  → computeDebtPlan() (adapter)
  → runEngine() (core logic)
  → Zustand store
  → UI
```

The **engine is the single source of truth** for all financial calculations.

## Architecture

| Layer | Responsibility |
|-------|---------------|
| **Engine** (`runEngine`) | Deterministic financial math. No side effects. |
| **Adapter** (`computeDebtPlan`) | Bridges legacy UI types ↔ engine types. |
| **Normalizer** (`normalizeDebtInput`) | Sanitizes all input sources into engine-ready format. |
| **Store** (`useDebtStore`) | State management only. No calculations. |
| **UI** | Display only. No financial logic. |

## Setup

```bash
bun install
```

Create `.env`:

```
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
PLAID_CLIENT_ID=<your-plaid-client-id>
PLAID_SECRET=<your-plaid-secret>
PLAID_ENV=sandbox
```

> Plaid secrets are configured as Supabase edge function secrets, not in `.env`.

## Commands

```bash
bun dev        # Start dev server
bun test       # Run test suite
bun build      # Production build
bun preview    # Preview production build
```

## Docs

- [Engine Contract](docs/engine-contract.md) — Math rules, types, validation
- [Setup Guide](docs/setup.md) — Local dev, Supabase, Plaid configuration
- [Release Checklist](docs/release-checklist.md) — Pre-release verification steps
