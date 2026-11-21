# Integration rules

- Call the Plaid Link hook unconditionally before authentication or loading returns; authentication changes must not change React hook order.
- Require a validated signed-in JWT in both Plaid functions before calling Plaid; token exchange must not fall back to anonymous access.
- Keep sign-in availability in one presentation-only flag shared by the route and sign-in controls; pause signup in Cloud Auth as well as removing its form, without bypassing bank authentication.
- Bank AI troubleshooting is JWT-gated and server-prompted through Responses; reject sensitive input, never call Plaid or read debts, and persist AI access pauses in a server-only service-state table.
- Password recovery emails return to /reset-password; use the authenticated recovery session to update passwords, never administrative overrides or auto-confirmation.