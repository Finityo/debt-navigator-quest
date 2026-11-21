# Integration rules

- Call the Plaid Link hook unconditionally before authentication or loading returns; authentication changes must not change React hook order.
- Require a validated signed-in JWT in both Plaid functions before calling Plaid; token exchange must not fall back to anonymous access.
- Keep sign-in availability in one presentation-only flag shared by the route and sign-in controls; pause signup in Cloud Auth as well as removing its form, without bypassing bank authentication.