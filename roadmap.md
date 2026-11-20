# Bank connection repair

- [x] Confirm production credentials; preserve production environment.
- [x] Fix hook order and make initialization retry reachable.
- [x] Require authentication for token exchange.
- [x] Eight targeted tests pass; desktop and 390px bank sign-in navigation verified without crashes; build clean; deployed exchange rejects invalid authentication with 401.
- [ ] Verify real signed-in Plaid initialization and import (blocked while Cloud auth/database is unreachable).