# Bank connection repair

## Temporary auth-page pause
- [x] Redirect /auth to /debts and hide sign-in entry points without changing hosted auth, sessions, or engine math.
- [x] Six targeted tests pass; /auth redirects and planning navigation verified at 1280px and 390px with no runtime errors; build clean.

- [x] Confirm production credentials; preserve production environment.
- [x] Fix hook order and make initialization retry reachable.
- [x] Require authentication for token exchange.
- [x] Eight targeted tests pass; desktop and 390px bank sign-in navigation verified without crashes; build clean; deployed exchange rejects invalid authentication with 401.
- [ ] Verify real signed-in Plaid initialization and import (blocked while Cloud auth/database is unreachable).