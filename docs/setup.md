# Setup Guide

## Local Development

### Prerequisites

- [Bun](https://bun.sh/) (or Node.js 18+)
- Supabase project (provided via Lovable Cloud)

### Install

```bash
bun install
```

### Environment

The `.env` file is auto-managed by Lovable Cloud:

```
VITE_SUPABASE_URL=<auto>
VITE_SUPABASE_PUBLISHABLE_KEY=<auto>
VITE_SUPABASE_PROJECT_ID=<auto>
```

### Run

```bash
bun dev
```

## Supabase Edge Functions

Edge functions are deployed automatically. Two functions exist:

| Function | Purpose |
|----------|---------|
| `create-link-token` | Creates a Plaid Link token for the frontend |
| `exchange-and-fetch` | Exchanges Plaid public token and fetches liabilities |

### Plaid Secrets

Configure as Supabase edge function secrets (not in `.env`):

| Secret | Description |
|--------|-------------|
| `PLAID_CLIENT_ID` | Plaid API client ID |
| `PLAID_SECRET` | Plaid API secret |
| `PLAID_ENV` | `sandbox`, `development`, or `production` |

## Data Flows

### Plaid Import

```
User clicks "Connect Bank"
  → create-link-token (edge function)
  → Plaid Link opens
  → User authenticates
  → exchange-and-fetch (edge function)
  → normalizeDebtInput()
  → store.setDebts()
```

### CSV Import

```
User uploads CSV
  → parse rows
  → normalizeDebtInput()
  → store.setDebts()
```

### Manual Entry

```
User fills form
  → normalizeDebtInput()
  → store.setDebts()
```

All three paths converge at `normalizeDebtInput()` — the single sanitization gate.
