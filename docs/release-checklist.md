# Release Checklist

## Pre-Release

- [x] `bun test` — all tests pass
- [x] Engine locked (Milestone 1) — no math changes without re-verification
- [x] Input normalization complete (Milestone 2) — all paths use `normalizeDebtInput`
- [x] Stability verified (Milestone 3) — hydration, store↔engine parity, scenarios

## Phase 1 — Flow & Integration Lock

- [x] Hero CTAs route correctly (`/debts`, `/auth`)
- [x] All `/dashboard` references removed (code, nav, redirects)
- [x] Auto-compute enforced — no manual compute button required
- [x] ComputeBanner shows validation errors only, never blocks valid plans
- [x] Flow guards active: `/plan`, `/timeline`, `/scenarios`, `/sensitivity` → redirect to `/debts` when no debts
- [x] Desktop flow validated (Hero → Debts → Add/Edit/Delete → Plan → Strategy Toggle → Scenarios)
- [x] Mobile flow validated at 390px (Hero → Debts → Plan → Strategy Toggle)
- [x] Strategy toggle validated — Avalanche vs Snowball updates interest, savings, and progress instantly
- [x] Payoff date, total interest, progress bar reflect live engine output
- [x] No stale data, no dead routes, no blank screens
- [ ] Input/form hardening for debt edit fields (remaining risk — Phase 2)

## Web Release

- [x] `bun build` succeeds with no errors
- [ ] Environment variables configured in hosting platform
- [ ] Deploy to Lovable / Vercel / Netlify
- [x] Smoke test: add debt → view plan → verify payoff date
- [ ] Smoke test: CSV import → plan renders correctly
- [ ] Smoke test: Plaid connect (sandbox) → debts populate

## Post-Deploy

- [ ] Verify edge functions respond (create-link-token, exchange-and-fetch)
- [ ] Check browser console for errors on all pages
- [x] Confirm snowball/avalanche switching produces different results

## Native (Future Phase)

- [ ] Capacitor wrapper configured
- [ ] WebView tested on iOS Safari & Android Chrome
- [ ] iOS build succeeds (Xcode)
- [ ] Android build succeeds (Android Studio)
- [ ] App Store / Play Store listing prepared (see `docs/APP_STORE_LISTING.md`)
