/// <reference types="node" />
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { describe, expect, it, vi } from 'vitest';

type Handler = (req: Request) => Promise<Response>;

function loadHandler(name: string, valid: boolean) {
  let handler: Handler | undefined;
  const source = readFileSync(`supabase/functions/${name}/index.ts`, 'utf8')
    .replace(/^import .*;\n/gm, '');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
  }).outputText;
  const fetch = vi.fn();
  const createClient = () => ({ auth: { getClaims: async () => valid
    ? { data: { claims: { sub: 'test-user' } }, error: null }
    : { data: null, error: new Error('invalid') } } });
  const getPlaidConfig = () => ({ env: 'sandbox', clientId: 'test-fixture', secret: 'test-fixture' });
  new Function('serve', 'createClient', 'Deno', 'fetch', 'getPlaidConfig', compiled)(
    (value: Handler) => { handler = value; }, createClient,
    { env: { get: () => 'test-fixture' } }, fetch, getPlaidConfig,
  );
  if (!handler) throw new Error('Handler was not registered');
  return { handler, fetch };
}

describe('Plaid authentication boundary', () => {
  for (const name of ['create-link-token', 'exchange-and-fetch']) {
    it(`${name} rejects missing authentication before calling Plaid`, async () => {
      const { handler, fetch } = loadHandler(name, false);
      const response = await handler(new Request('https://example.test', { method: 'POST' }));
      expect(response.status).toBe(401);
      expect(fetch).not.toHaveBeenCalled();
    });
    it(`${name} rejects invalid authentication before calling Plaid`, async () => {
      const { handler, fetch } = loadHandler(name, false);
      const response = await handler(new Request('https://example.test', {
        method: 'POST', headers: { Authorization: 'Bearer invalid-test-fixture' },
      }));
      expect(response.status).toBe(401);
      expect(fetch).not.toHaveBeenCalled();
    });
  }
  it('signed-in exchange rejects missing public token before calling Plaid', async () => {
    const { handler, fetch } = loadHandler('exchange-and-fetch', true);
    const response = await handler(new Request('https://example.test', {
      method: 'POST', headers: { Authorization: 'Bearer test-fixture' }, body: '{}',
    }));
    expect(response.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });
});