# Release Checklist

## Pre-Release

- [ ] `bun test` — all tests pass
- [ ] Engine locked (Milestone 1) — no math changes without re-verification
- [ ] Input normalization complete (Milestone 2) — all paths use `normalizeDebtInput`
- [ ] Stability verified (Milestone 3) — hydration, store↔engine parity, scenarios

## Web Release

- [ ] `bun build` succeeds with no errors
- [ ] Environment variables configured in hosting platform
- [ ] Deploy to Lovable / Vercel / Netlify
- [ ] Smoke test: add debt → view plan → verify payoff date
- [ ] Smoke test: CSV import → plan renders correctly
- [ ] Smoke test: Plaid connect (sandbox) → debts populate

## Post-Deploy

- [ ] Verify edge functions respond (create-link-token, exchange-and-fetch)
- [ ] Check browser console for errors on all pages
- [ ] Confirm snowball/avalanche switching produces different results

## Native (Future Phase)

- [ ] Capacitor wrapper configured
- [ ] WebView tested on iOS Safari & Android Chrome
- [ ] iOS build succeeds (Xcode)
- [ ] Android build succeeds (Android Studio)
- [ ] App Store / Play Store listing prepared (see `docs/APP_STORE_LISTING.md`)
