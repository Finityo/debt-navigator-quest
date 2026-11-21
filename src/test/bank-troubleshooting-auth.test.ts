import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { describe, expect, it, vi } from 'vitest';
import { validateProblem, gatewayFailure } from '../../supabase/functions/bank-troubleshoot/safety';

function load(valid: boolean, blocked = false) {
  let handler: ((req: Request) => Promise<Response>) | undefined;
  const model = vi.fn(() => ({ result: { fullStream: (async function* () { yield { type: 'text-delta', text: '1. Retry from Debts.' }; })() }, gateway: { getRunId: () => 'gateway-fixture' } }));
  const db = { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: blocked ? { blocked_status: 403 } : null, error: null }) }) }), upsert: async () => ({ error: null }) };
  const createClient = () => ({ auth: { getClaims: async () => ({ data: valid ? { claims: { sub: 'fixture-user' } } : null, error: null }) }, from: () => db });
  const source = readFileSync('supabase/functions/bank-troubleshoot/index.ts', 'utf8').replace(/^import .*;\n/gm, '');
  const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } }).outputText;
  new Function('Deno', 'createClient', 'corsHeaders', 'createResponsesCall', 'validateProblem', 'gatewayFailure', 'getLovableAiGatewayResponseHeaders', compiled)(
    { env: { get: () => 'fixture' }, serve: (value: typeof handler) => { handler = value; } }, createClient, {}, model, validateProblem, gatewayFailure, (_: unknown, headers: HeadersInit) => new Headers(headers),
  );
  if (!handler) throw new Error('Handler not registered');
  return { handler, model };
}
const request = (problem: string, auth = true) => new Request('https://example.test', { method: 'POST', headers: auth ? { Authorization: 'Bearer fixture' } : {}, body: JSON.stringify({ problem }) });
describe('AI troubleshooting boundary', () => {
  it('rejects signed-out requests before AI', async () => {
    const { handler, model } = load(false);
    expect((await handler(request('The connection window closes.', false))).status).toBe(401);
    expect(model).not.toHaveBeenCalled();
  });
  it('rejects invalid sessions before AI', async () => {
    const { handler, model } = load(false);
    expect((await handler(request('The connection window closes.'))).status).toBe(401);
    expect(model).not.toHaveBeenCalled();
  });
  it('rejects credentials before AI', async () => {
    const { handler, model } = load(true);
    expect((await handler(request('My password: private-value'))).status).toBe(400);
    expect(model).not.toHaveBeenCalled();
  });
  it('does not call the model while access is paused', async () => {
    const { handler, model } = load(true, true);
    expect((await handler(request('The connection window closes.'))).status).toBe(403);
    expect(model).not.toHaveBeenCalled();
  });
  it('streams guidance for an authenticated safe description', async () => {
    const { handler, model } = load(true);
    const response = await handler(request('The connection window closes.'));
    expect(response.status).toBe(200);
    expect(await response.text()).toContain('1. Retry from Debts.');
    expect(model).toHaveBeenCalledTimes(1);
  });
});