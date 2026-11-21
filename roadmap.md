# Bank connection repair

## Temporary auth-page pause
- [x] Redirect /auth to /debts and hide sign-in entry points without changing hosted auth, sessions, or engine math.
- [x] Six targeted tests pass; /auth redirects and planning navigation verified at 1280px and 390px with no runtime errors; build clean.
- [x] Reviewed all sign-in entry points and account/email code; new guide downloads reflect the pause without changing previously downloaded files or sent emails.
- [x] Restore existing-account password sign-in and all entry points; remove signup from /auth and pause new signups in Cloud Auth.
- [x] Eight tests pass, including signed-in redirect and rejected credentials; homepage and bank sign-in entry verified at 1280px and 390px.
- [ ] Verify real existing-account password login (no matching managed preview session available; user must sign in normally).

- [x] Confirm production credentials; preserve production environment.
- [x] Fix hook order and make initialization retry reachable.
- [x] Require authentication for token exchange.
- [x] Eight targeted tests pass; desktop and 390px bank sign-in navigation verified without crashes; build clean; deployed exchange rejects invalid authentication with 401.
- [ ] Verify real signed-in Plaid initialization and import (separate bank-import check; not exercised by this sign-in restoration).
## AI bank troubleshooting
- [x] Add signed-in, credential-safe Finityo troubleshooting in bank import.
- [x] Deployed; real signed-in AI guidance returned; signed-out requests rejected; mobile sensitive input rejected without a model call.
- [x] Preserve all debt math, Plaid configuration, signup pause, and email sending settings.

## Password reset
- [x] Recovery link requested; delivery log confirms sent at 2026-11-21 00:19:14 UTC.
- [x] Add password recovery form and Forgot password action; mobile form verified without changing the owner's password.
- [ ] Complete password change (owner must open the emailed link and choose a private new password).
