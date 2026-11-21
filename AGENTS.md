# Integration rules

- Call the Plaid Link hook unconditionally before authentication or loading returns; authentication changes must not change React hook order.
- Require a validated signed-in JWT in both Plaid functions before calling Plaid; token exchange must not fall back to anonymous access.
- Keep temporary auth-page availability in one presentation-only flag used by the route and sign-in controls; never bypass backend authentication to pause the page.