import { describe, expect, it } from 'vitest';
import { validateProblem, gatewayFailure } from '../../supabase/functions/bank-troubleshoot/safety';

describe('safe bank troubleshooting', () => {
  it('accepts a sanitized bank problem', () => expect(validateProblem('The bank window closes before accounts appear.')).toBe('The bank window closes before accounts appear.'));
  it.each(['password: private-value', 'secret=abcdef123456abcdef123456', 'My account number is 1234567890', 'Contact me at user@example.test', 'access-sandbox-test-token'])('rejects sensitive input before AI: %s', value => expect(() => validateProblem(value)).toThrow());
  it('rejects empty input', () => expect(() => validateProblem('')).toThrow());
  it('preserves an upstream access denial', () => expect(gatewayFailure({ statusCode: 403, responseBody: '{"message":"Access denied","type":"provider_denied"}' })).toEqual({ status: 403, type: 'provider_denied', message: 'Access denied' }));
});